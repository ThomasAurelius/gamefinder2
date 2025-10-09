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

		// Get or create a portal configuration with subscription cancellation enabled
		// We look for an existing active configuration first to avoid creating duplicates
		let configId: string | undefined;
		
		try {
			// List existing configurations to check if we have one already
			const configurations = await stripe.billingPortal.configurations.list({ 
				limit: 100,
				active: true,
			});
			
			// Look for a configuration with subscription_cancel enabled
			const existingConfig = configurations.data.find(config => 
				config.features?.subscription_cancel?.enabled === true
			);
			
			if (existingConfig) {
				// Reuse existing configuration
				configId = existingConfig.id;
				console.log("Using existing portal configuration:", configId);
			} else {
				// Create a new configuration with all required features
				const configuration = await stripe.billingPortal.configurations.create({
					features: {
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
						subscription_update: {
							enabled: false,
							default_allowed_updates: [],
							products: [],
						},
					},
					business_profile: {
						headline: 'Manage your subscription',
					},
				});
				configId = configuration.id;
				console.log("Created new portal configuration:", configId);
			}
		} catch (configError) {
			console.error("Error managing portal configuration:", configError);
			// Continue without configuration - will use default portal settings
			// This fallback ensures the portal still works even if configuration management fails
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
