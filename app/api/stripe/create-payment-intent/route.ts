import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import Stripe from "stripe";
import { STRIPE_NOT_CONFIGURED_MESSAGE } from "@/lib/stripe-messages";
import {
	getStripeCustomerId,
	setStripeCustomerId,
	getUserEmail,
	getStripeConnectAccountId,
} from "@/lib/users";
import { getCampaign } from "@/lib/campaigns/db";

type StripeErrorLike = {
	type?: string;
	code?: string;
	message?: string;
};

const isStripeMisconfigurationError = (error: unknown) => {
	if (!error || typeof error !== "object") {
		return false;
	}

	const { type, code, message } = error as StripeErrorLike;

	if (
		type === "StripeAuthenticationError" ||
		code === "authentication_error"
	) {
		return true;
	}

	if (typeof message === "string") {
		const normalizedMessage = message.toLowerCase();
		if (
			normalizedMessage.includes("invalid api key") ||
			normalizedMessage.includes("no api key provided")
		) {
			return true;
		}
	}

	return false;
};

// Initialize Stripe only if the secret key is available
const getStripe = () => {
	if (!process.env.STRIPE_SECRET_KEY) {
		throw new Error("STRIPE_SECRET_KEY is not configured");
	}
	return new Stripe(process.env.STRIPE_SECRET_KEY, {
		// This is a known good API. Do not change.
		apiVersion: "2025-09-30.clover",
	});
};

export async function POST(request: Request) {
	// Validate Stripe configuration
	if (!process.env.STRIPE_SECRET_KEY) {
		console.error(
			"Error creating payment intent: STRIPE_SECRET_KEY is not configured"
		);
		console.error(
			"Please add STRIPE_SECRET_KEY to your .env.local file and restart the server"
		);
		return NextResponse.json(
			{ error: STRIPE_NOT_CONFIGURED_MESSAGE },
			{ status: 503 }
		);
	}

	// Validate key format (test mode check)
	const isTestMode = process.env.STRIPE_SECRET_KEY.startsWith("sk_test_");
	const isLiveMode = process.env.STRIPE_SECRET_KEY.startsWith("sk_live_");

	if (!isTestMode && !isLiveMode) {
		console.error("Error: STRIPE_SECRET_KEY has invalid format");
		console.error(
			"Expected format: sk_test_... (for test mode) or sk_live_... (for live mode)"
		);
		return NextResponse.json(
			{ error: "Stripe configuration error: Invalid API key format" },
			{ status: 503 }
		);
	}

	console.log(
		`Stripe API initialized in ${isTestMode ? "TEST" : "LIVE"} mode`
	);

	try {
		const stripe = getStripe();
		const cookieStore = await cookies();
		const userId = cookieStore.get("userId")?.value;

		if (!userId) {
			return NextResponse.json(
				{ error: "Authentication required" },
				{ status: 401 }
			);
		}

		const body = await request.json();
		const {
			amount,
			campaignId,
			campaignName,
			paymentType = "one_time",
		} = body;

		if (!amount || amount <= 0) {
			return NextResponse.json(
				{ error: "Valid amount is required" },
				{ status: 400 }
			);
		}

		if (paymentType === "subscription") {
			console.log("Creating subscription for:", {
				amount,
				campaignId,
				campaignName,
				userId,
			});

			// Get campaign to retrieve host information
			let hostConnectAccountId: string | null = null;
			if (campaignId) {
				const campaign = await getCampaign(campaignId);
				if (campaign) {
					// Get the host's Connect account ID
					hostConnectAccountId = await getStripeConnectAccountId(campaign.userId);
					console.log("Host Connect account ID:", hostConnectAccountId || "Not set");
				}
			}

			// Check if user already has a Stripe customer ID
			let customerId = await getStripeCustomerId(userId);

			// Check if user already has an active subscription for this campaign
			if (customerId && campaignId) {
				const existingSubscriptions = await stripe.subscriptions.list({
					customer: customerId,
					status: "active",
					limit: 100,
				});

				const campaignSubscription = existingSubscriptions.data.find(
					(sub) => sub.metadata.campaignId === campaignId
				);

				if (campaignSubscription) {
					console.log(
						"User already has an active subscription for this campaign:",
						{
							subscriptionId: campaignSubscription.id,
							campaignId,
							userId,
						}
					);
					return NextResponse.json(
						{
							error: "You already have an active subscription for this campaign",
							hasActiveSubscription: true,
						},
						{ status: 409 }
					);
				}
			}

			if (customerId) {
				console.log("Reusing existing Stripe customer:", customerId);
			} else {
				// Get user email for better customer tracking in Stripe
				const userEmail = await getUserEmail(userId);

				// Create new customer
				const customer = await stripe.customers.create({
					email: userEmail || undefined,
					metadata: {
						userId,
					},
				});

				customerId = customer.id;
				console.log("Customer created:", customerId);

				// Save customer ID to database for future use
				await setStripeCustomerId(userId, customerId);
			}

			// Create product first, then price
			const product = await stripe.products.create({
				name: `${campaignName || "Campaign"} Subscription`,
				metadata: {
					campaignId: campaignId || "",
				},
			});

			console.log("Product created:", {
				productId: product.id,
				name: product.name,
			});

			const price = await stripe.prices.create({
				unit_amount: Math.round(amount * 100),
				currency: "usd",
				recurring: { interval: "week" },
				product: product.id,
			});

			console.log("Price created:", {
				priceId: price.id,
				amount: price.unit_amount,
			});

			// Calculate application fee (20% of the amount)
			const applicationFeeAmount = hostConnectAccountId 
				? Math.round(amount * 100 * 0.20) // 20% platform fee
				: undefined;

			// Build subscription creation options
			const subscriptionOptions: Stripe.SubscriptionCreateParams = {
				customer: customerId,
				items: [{ price: price.id }],
				metadata: {
					campaignId: campaignId || "",
					campaignName: campaignName || "",
					userId,
					hostConnectAccountId: hostConnectAccountId || "",
				},
				payment_behavior: "default_incomplete",
				collection_method: "charge_automatically",
				payment_settings: {
					save_default_payment_method: "on_subscription",
					payment_method_types: ["card"],
				},
				automatic_tax: {
					enabled: false,
				},
				expand: ["latest_invoice.payment_intent"],
			};

			// Add Connect account and application fee if host has completed onboarding
			if (hostConnectAccountId && applicationFeeAmount) {
				subscriptionOptions.application_fee_percent = 20; // Platform takes 20%
				subscriptionOptions.transfer_data = {
					destination: hostConnectAccountId,
				};
				console.log("Subscription will use Stripe Connect:", {
					hostAccount: hostConnectAccountId,
					applicationFeePercent: 20,
				});
			} else {
				console.log("Subscription will use standard payment (no Connect account)");
			}

			const subscription = await stripe.subscriptions.create(subscriptionOptions);

			console.log("Subscription created:", {
				subscriptionId: subscription.id,
				status: subscription.status,
				collectionMethod: subscription.collection_method,
				latestInvoiceType: typeof subscription.latest_invoice,
				usingConnect: !!hostConnectAccountId,
			});

			// Type guard: ensure latest_invoice is expanded to Invoice object, not string
			const latestInvoice = subscription.latest_invoice;
			if (!latestInvoice || typeof latestInvoice === "string") {
				console.error("Invoice retrieval failed:", {
					latestInvoice,
					subscriptionId: subscription.id,
				});
				throw new Error("Failed to retrieve invoice for subscription");
			}

			console.log("Invoice retrieved:", {
				invoiceId: latestInvoice.id,
				status: latestInvoice.status,
				collectionMethod: latestInvoice.collection_method,
				hasPaymentIntent: !!(
					latestInvoice as Stripe.Invoice & {
						payment_intent?: string | Stripe.PaymentIntent;
					}
				).payment_intent,
				paymentIntentType: typeof (
					latestInvoice as Stripe.Invoice & {
						payment_intent?: string | Stripe.PaymentIntent;
					}
				).payment_intent,
			});

			// When using expand, payment_intent is added to the invoice but TypeScript doesn't know about it
			// Use type assertion to access the expanded property
			let paymentIntent = (
				latestInvoice as Stripe.Invoice & {
					payment_intent?: string | Stripe.PaymentIntent;
				}
			).payment_intent;

			if (!paymentIntent) {
				console.error("PaymentIntent is missing from invoice:", {
					invoiceId: latestInvoice.id,
					invoiceStatus: latestInvoice.status,
					subscriptionId: subscription.id,
				});
				console.log(
					"Attempting to manually create PaymentIntent for invoice..."
				);

				// Fallback: Manually create a PaymentIntent for the invoice
				try {
					// Check if invoice is in draft status (can be finalized)
					if (latestInvoice.status === "draft") {
						console.log(
							"Invoice is in draft status, attempting to finalize..."
						);
						// Finalize the invoice to trigger PaymentIntent creation
						const finalizedInvoice =
							await stripe.invoices.finalizeInvoice(latestInvoice.id, {
								expand: ["payment_intent"],
							});

						paymentIntent = (
							finalizedInvoice as Stripe.Invoice & {
								payment_intent?: string | Stripe.PaymentIntent;
							}
						).payment_intent;

						if (paymentIntent) {
							console.log(
								"Successfully created PaymentIntent via invoice finalization:",
								{
									invoiceId: finalizedInvoice.id,
									paymentIntentId:
										typeof paymentIntent === "string"
											? paymentIntent
											: paymentIntent.id,
								}
							);
						}
					} else {
						console.log(
							`Invoice status is '${latestInvoice.status}', not 'draft'. Checking if PaymentIntent exists...`
						);
						// For non-draft invoices, try to retrieve the invoice again with expanded payment_intent
						const retrievedInvoice = await stripe.invoices.retrieve(
							latestInvoice.id,
							{
								expand: ["payment_intent"],
							}
						);

						paymentIntent = (
							retrievedInvoice as Stripe.Invoice & {
								payment_intent?: string | Stripe.PaymentIntent;
							}
						).payment_intent;

						if (paymentIntent) {
							console.log(
								"Found PaymentIntent on invoice after retrieval:",
								{
									invoiceId: retrievedInvoice.id,
									paymentIntentId:
										typeof paymentIntent === "string"
											? paymentIntent
											: paymentIntent.id,
								}
							);
						}
					}
				} catch (finalizeError) {
					console.error(
						"Failed to finalize or retrieve invoice:",
						finalizeError
					);
				}

				// Level 3: Manual PaymentIntent creation as last resort
				if (!paymentIntent) {
					console.log(
						"Attempting to manually create PaymentIntent for the invoice..."
					);
					try {
						const createdPaymentIntent = await stripe.paymentIntents.create({
							amount: latestInvoice.amount_due ?? Math.round(amount * 100),
							currency: latestInvoice.currency ?? "usd",
							customer: customerId,
							payment_method_types: ["card"],
							metadata: {
								invoiceId: latestInvoice.id,
								subscriptionId: subscription.id,
								campaignId: campaignId || "",
								campaignName: campaignName || "",
								userId,
							},
						});

						paymentIntent = createdPaymentIntent;

						console.log(
							"Successfully created PaymentIntent manually:",
							{
								paymentIntentId: createdPaymentIntent.id,
								invoiceId: latestInvoice.id,
								subscriptionId: subscription.id,
								amount: createdPaymentIntent.amount,
							}
						);
					} catch (manualCreateError) {
						console.error(
							"Failed to manually create PaymentIntent:",
							manualCreateError
						);
					}
				}

				// If still no PaymentIntent after all fallback attempts, throw error with detailed diagnostics
				if (!paymentIntent) {
					console.error(
						"PaymentIntent could not be created even after all fallback attempts"
					);
					console.error("Possible causes:");
					console.error(
						"1. Card payments not enabled in Stripe Dashboard"
					);
					console.error("2. Invalid API keys or key mismatch");
					console.error(
						"3. Stripe account restrictions or configuration issues"
					);
					console.error(
						"4. Payment method types mismatch in account settings"
					);
					console.error(
						"See TEST_MODE_VERIFICATION.md for troubleshooting steps"
					);
					throw new Error(
						"Failed to initialize subscription payment: No PaymentIntent created on invoice"
					);
				}
			}

			if (typeof paymentIntent === "string") {
				console.log("Retrieving PaymentIntent by ID:", paymentIntent);
				paymentIntent = await stripe.paymentIntents.retrieve(paymentIntent);
			}

			if (!paymentIntent?.client_secret) {
				console.error("PaymentIntent missing client_secret:", {
					paymentIntentId: paymentIntent?.id,
					paymentIntentStatus: paymentIntent?.status,
				});
				throw new Error(
					"Failed to initialize subscription payment: PaymentIntent missing client_secret"
				);
			}

			console.log("Subscription payment initialized successfully:", {
				subscriptionId: subscription.id,
				paymentIntentId: paymentIntent.id,
				hasClientSecret: !!paymentIntent.client_secret,
			});

			return NextResponse.json({
				clientSecret: paymentIntent.client_secret,
				subscriptionId: subscription.id,
				customerId: customerId,
				priceId: price.id,
				mode: "subscription",
			});
		}

		// Create a PaymentIntent with the order amount and currency
		const paymentIntent = await stripe.paymentIntents.create({
			amount: Math.round(amount * 100), // Convert to cents
			currency: "usd",
			metadata: {
				campaignId: campaignId || "",
				campaignName: campaignName || "",
				userId: userId,
			},
			automatic_payment_methods: {
				enabled: true,
			},
		});

		return NextResponse.json({
			clientSecret: paymentIntent.client_secret,
			paymentIntentId: paymentIntent.id,
			mode: "payment",
		});
	} catch (error) {
		console.error("Error creating payment intent:", error);

		if (isStripeMisconfigurationError(error)) {
			return NextResponse.json(
				{ error: STRIPE_NOT_CONFIGURED_MESSAGE },
				{ status: 503 }
			);
		}

		const message =
			error instanceof Error && error.message
				? error.message
				: "Failed to create payment intent";

		return NextResponse.json({ error: message }, { status: 500 });
	}
}
