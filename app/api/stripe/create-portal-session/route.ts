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

		// First, create or get a portal configuration with subscription cancellation enabled
		// We'll create a configuration if one doesn't exist
		let configId: string | undefined;
		
		try {
			// Try to list existing configurations
			const configurations = await stripe.billingPortal.configurations.list({ limit: 1 });
			
			if (configurations.data.length > 0) {
				// Use the first existing configuration
				configId = configurations.data[0].id;
				
				// Update it to ensure subscription cancellation is enabled
				await stripe.billingPortal.configurations.update(configId, {
					features: {
						subscription_cancel: {
							enabled: true,
							mode: 'at_period_end',
						},
					},
				});
			} else {
				// Create a new configuration with subscription cancellation enabled
				const configuration = await stripe.billingPortal.configurations.create({
					features: {
						subscription_cancel: {
							enabled: true,
							mode: 'at_period_end',
						},
					},
					business_profile: {
						headline: 'Manage your subscription',
					},
				});
				configId = configuration.id;
			}
		} catch (configError) {
			console.warn("Error managing portal configuration:", configError);
			// Continue without configuration - will use default portal settings
		}

		// Create a portal session with subscription cancellation enabled
		const sessionParams: Stripe.BillingPortal.SessionCreateParams = {
			customer: customerId,
			return_url: returnUrl,
		};
		
		// Add configuration if we successfully created/retrieved one
		if (configId) {
			sessionParams.configuration = configId;
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
