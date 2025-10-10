import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import Stripe from "stripe";
import { getStripeCustomerId, getUserEmail, setStripeCustomerId } from "@/lib/users";

const getStripe = () => {
	if (!process.env.STRIPE_SECRET_KEY) {
		throw new Error("STRIPE_SECRET_KEY is not configured");
	}
	return new Stripe(process.env.STRIPE_SECRET_KEY, {
		apiVersion: "2025-09-30.clover",
	});
};

export async function POST(request: Request) {
	try {
		const cookieStore = await cookies();
		const userId = cookieStore.get("userId")?.value;

		if (!userId) {
			return NextResponse.json(
				{ error: "Authentication required" },
				{ status: 401 }
			);
		}

		// If Stripe is not configured, return error
		if (!process.env.STRIPE_SECRET_KEY) {
			return NextResponse.json(
				{ error: "Stripe is not configured" },
				{ status: 503 }
			);
		}

		const stripe = getStripe();

		// Get user's Stripe customer ID
		let customerId = await getStripeCustomerId(userId);

		// If user doesn't have a customer ID yet, create one
		if (!customerId) {
			const userEmail = await getUserEmail(userId);
			if (!userEmail) {
				return NextResponse.json(
					{ error: "User email not found" },
					{ status: 400 }
				);
			}

			const customer = await stripe.customers.create({
				email: userEmail,
				metadata: {
					userId: userId,
				},
			});
			customerId = customer.id;

			// Save the customer ID to the database
			await setStripeCustomerId(userId, customerId);
		}

		// Get the return URL from the request body
		const body = await request.json();
		const returnUrl = body.returnUrl || `${request.headers.get("origin")}/subscriptions`;
		const subscriptionId = body.subscriptionId;

		// Get or create a portal configuration with subscription cancellation enabled
		// We look for an existing active configuration first to avoid creating duplicates
                let configId: string | undefined;
                let configurations: Stripe.ApiList<Stripe.BillingPortal.Configuration> | null = null;

                try {
                        configurations = await stripe.billingPortal.configurations.list({
                                limit: 100,
                                active: true,
                        });
                } catch (listError) {
                        console.error("Failed to list billing portal configurations:", listError);
                }

                const findConfigurationWithCancellation = (
                        configs: Stripe.ApiList<Stripe.BillingPortal.Configuration> | null
                ) =>
                        configs?.data.find(
                                (config) => config.features?.subscription_cancel?.enabled === true
                        );

                const ensureSubscriptionCancelFeature = (
                        features: Stripe.BillingPortal.Configuration.Features | null | undefined
                ): Stripe.BillingPortal.ConfigurationCreateParams.Features => {
                        const mapProductsToCreateParams = (
                                products: Stripe.BillingPortal.Configuration.Features.SubscriptionUpdate.Product[]
                        ): Stripe.BillingPortal.ConfigurationCreateParams.Features.SubscriptionUpdate.Product[] => {
                                return products.map((product) => {
                                        const mapped: Stripe.BillingPortal.ConfigurationCreateParams.Features.SubscriptionUpdate.Product = {
                                                product: product.product,
                                                prices: product.prices ?? [],
                                        };

                                        if (product.adjustable_quantity) {
                                                const { enabled, maximum, minimum } = product.adjustable_quantity;
                                                mapped.adjustable_quantity = {
                                                        enabled,
                                                        maximum: maximum ?? undefined,
                                                        minimum: minimum ?? undefined,
                                                };
                                        }

                                        return mapped;
                                });
                        };

                        const subscriptionUpdateFeature = features?.subscription_update;

                        return {
                                customer_update: {
                                        allowed_updates: ['email', 'address'],
                                        enabled: true,
                                },
                                invoice_history: {
                                        enabled: true,
                                },
                                payment_method_update: {
                                        enabled: true,
                                },
                                subscription_cancel: {
                                        enabled: true,
                                        mode: 'at_period_end',
                                },
                                subscription_update: subscriptionUpdateFeature?.enabled
                                        ? {
                                                  enabled: true,
                                                  default_allowed_updates:
                                                          subscriptionUpdateFeature.default_allowed_updates ?? undefined,
                                                  products: subscriptionUpdateFeature.products
                                                          ? mapProductsToCreateParams(subscriptionUpdateFeature.products)
                                                          : [],
                                          }
                                        : {
                                                  enabled: false,
                                          },
                        } satisfies Stripe.BillingPortal.ConfigurationCreateParams.Features;
                };

                const reuseConfig = findConfigurationWithCancellation(configurations);

                if (reuseConfig) {
                        configId = reuseConfig.id;
                        console.log("Using existing portal configuration:", configId);
                } else {
                        try {
                                const configuration = await stripe.billingPortal.configurations.create({
                                        features: ensureSubscriptionCancelFeature(null),
                                        business_profile: {
                                                headline: 'Manage your subscription',
                                        },
                                });
                                configId = configuration.id;
                                console.log("Created new portal configuration:", configId);
                        } catch (createError) {
                                console.error("Failed to create billing portal configuration:", createError);

                                // Handle configuration limit or permission errors by updating an existing configuration
                                if (!configurations) {
                                        try {
                                                configurations = await stripe.billingPortal.configurations.list({
                                                        limit: 100,
                                                        active: true,
                                                });
                                        } catch (refreshError) {
                                                console.error(
                                                        "Failed to refresh billing portal configurations:",
                                                        refreshError
                                                );
                                        }
                                }

                                const configurationToUpdate = configurations?.data[0];

                                if (configurationToUpdate) {
                                        try {
                                                const updatedConfig = await stripe.billingPortal.configurations.update(
                                                        configurationToUpdate.id,
                                                        {
                                                                features: ensureSubscriptionCancelFeature(
                                                                        configurationToUpdate.features ?? undefined
                                                                ),
                                                        }
                                                );
                                                configId = updatedConfig.id;
                                                console.log(
                                                        "Updated existing portal configuration to enable cancellation:",
                                                        configId
                                                );
                                        } catch (updateError) {
                                                console.error(
                                                        "Failed to update billing portal configuration:",
                                                        updateError
                                                );
                                        }
                                }
                        }
                }

		// Create a portal session
		const sessionParams: Stripe.BillingPortal.SessionCreateParams = {
			customer: customerId,
			return_url: returnUrl,
		};
		
		// Add configuration if we successfully created/retrieved one
		if (configId) {
			sessionParams.configuration = configId;
		}
		
		// If a subscriptionId is provided, use flow_data to navigate directly to that subscription
		if (subscriptionId) {
			sessionParams.flow_data = {
				type: 'subscription_update',
				subscription_update: {
					subscription: subscriptionId,
				},
				after_completion: {
					type: 'redirect',
					redirect: {
						return_url: returnUrl,
					},
				},
			};
		}
		
		const session = await stripe.billingPortal.sessions.create(sessionParams);

		return NextResponse.json({
			url: session.url,
		});
	} catch (error) {
		console.error("Error creating portal session:", error);
		return NextResponse.json(
			{ error: "Failed to create portal session" },
			{ status: 500 }
		);
	}
}
