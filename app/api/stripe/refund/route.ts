import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import Stripe from "stripe";
import { getStripeCustomerId } from "@/lib/users";
import { getCampaign } from "@/lib/campaigns/db";

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

		// Validate Stripe configuration
		if (!process.env.STRIPE_SECRET_KEY) {
			return NextResponse.json(
				{ error: "Stripe is not configured" },
				{ status: 503 }
			);
		}

		const stripe = getStripe();

		// Parse request body
		let body;
		try {
			body = await request.json();
		} catch (parseError) {
			console.error("Failed to parse request body:", parseError);
			return NextResponse.json(
				{ error: "Invalid request format" },
				{ status: 400 }
			);
		}

		const { campaignId, playerId, subscriptionId, reason } = body;

		if (!campaignId || !playerId) {
			return NextResponse.json(
				{ error: "Campaign ID and Player ID are required" },
				{ status: 400 }
			);
		}

		// Verify the requesting user is the host of the campaign
		const campaign = await getCampaign(campaignId);
		if (!campaign) {
			return NextResponse.json(
				{ error: "Campaign not found" },
				{ status: 404 }
			);
		}

		if (campaign.userId !== userId) {
			return NextResponse.json(
				{ error: "Only the campaign host can issue refunds" },
				{ status: 403 }
			);
		}

		// Get the player's Stripe customer ID
		const playerCustomerId = await getStripeCustomerId(playerId);
		if (!playerCustomerId) {
			return NextResponse.json(
				{ error: "Player does not have a payment profile" },
				{ status: 404 }
			);
		}

		console.log("Processing refund for:", {
			campaignId,
			playerId,
			subscriptionId,
			hostId: userId,
			reason: reason || "Campaign canceled by host",
		});

		// If a subscription ID is provided, we need to cancel and refund
		if (subscriptionId) {
			try {
				// First, verify the subscription belongs to this player
				const subscription = await stripe.subscriptions.retrieve(subscriptionId);
				
				if (subscription.customer !== playerCustomerId) {
					return NextResponse.json(
						{ error: "Subscription does not belong to this player" },
						{ status: 400 }
					);
				}

				// Cancel the subscription immediately (don't wait for period end)
				const canceledSubscription = await stripe.subscriptions.cancel(
					subscriptionId,
					{
						prorate: true,
					}
				);

				console.log("Subscription canceled:", {
					subscriptionId: canceledSubscription.id,
					status: canceledSubscription.status,
					canceledAt: canceledSubscription.canceled_at,
				});

				// Get the latest invoice for this subscription to refund it
				const invoices = await stripe.invoices.list({
					subscription: subscriptionId,
					limit: 1,
				});

				if (invoices.data.length > 0) {
					const latestInvoice = invoices.data[0];
					
					// Cast to access charge property that exists but isn't in types
					const invoiceWithCharge = latestInvoice as Stripe.Invoice & {
						charge?: string | Stripe.Charge;
					};
					
					// If the invoice has been paid, issue a refund
					if (latestInvoice.status === "paid" && invoiceWithCharge.charge) {
						const chargeId = typeof invoiceWithCharge.charge === "string" 
							? invoiceWithCharge.charge 
							: invoiceWithCharge.charge.id;

						try {
							// Retrieve the charge to check if it used Stripe Connect
							const charge = await stripe.charges.retrieve(chargeId);
							
							// Build refund options
							const refundOptions: Stripe.RefundCreateParams = {
								charge: chargeId,
								reason: "requested_by_customer",
								metadata: {
									campaignId,
									playerId,
									hostId: userId,
									refundReason: reason || "Campaign canceled by host",
								},
							};

							// If the charge has a transfer (used Stripe Connect), 
							// reverse the transfer so refund is split proportionally:
							// - Host pays back 85% (reversed from their Connect account)
							// - Platform pays back 15% (the original application fee)
							// Stripe automatically calculates the correct amounts when reverse_transfer is true
							if (charge.transfer) {
								refundOptions.reverse_transfer = true;
								
								console.log("Refunding with Connect transfer reversal:", {
									chargeAmount: charge.amount,
									transfer: charge.transfer,
									note: "Stripe will automatically reverse 85% from host and 15% from platform",
								});
							}

							const refund = await stripe.refunds.create(refundOptions);

							console.log("Refund issued:", {
								refundId: refund.id,
								amount: refund.amount,
								status: refund.status,
							});

							return NextResponse.json({
								success: true,
								refund: {
									id: refund.id,
									amount: refund.amount / 100,
									status: refund.status,
								},
								subscription: {
									id: canceledSubscription.id,
									status: canceledSubscription.status,
								},
								message: "Subscription canceled and refund issued successfully",
							});
						} catch (refundError) {
							console.error("Failed to create refund:", refundError);
							// Subscription was canceled but refund failed
							return NextResponse.json({
								success: true,
								subscription: {
									id: canceledSubscription.id,
									status: canceledSubscription.status,
								},
								warning: "Subscription canceled but refund failed. Please process manually in Stripe Dashboard.",
								error: refundError instanceof Error ? refundError.message : "Unknown error",
							});
						}
					}
				}

				// If no paid invoice found, just return subscription cancellation
				return NextResponse.json({
					success: true,
					subscription: {
						id: canceledSubscription.id,
						status: canceledSubscription.status,
					},
					message: "Subscription canceled successfully (no payment to refund)",
				});
			} catch (subscriptionError) {
				console.error("Failed to cancel subscription:", subscriptionError);
				return NextResponse.json(
					{ error: "Failed to cancel subscription. Please try again or contact support." },
					{ status: 500 }
				);
			}
		}

		// If no subscription ID provided, look for one-time payments
		// Search for payment intents for this campaign and player
		const paymentIntents = await stripe.paymentIntents.list({
			customer: playerCustomerId,
			limit: 100,
		});

		// Find payment intents for this campaign
		const campaignPayments = paymentIntents.data.filter(
			(pi) => pi.metadata.campaignId === campaignId && pi.status === "succeeded"
		);

		if (campaignPayments.length === 0) {
			return NextResponse.json(
				{ error: "No payments found for this player in this campaign" },
				{ status: 404 }
			);
		}

		// Refund all successful payments for this campaign
		const refunds = [];
		for (const payment of campaignPayments) {
			// Cast to access charges property that exists but isn't in types
			const paymentWithCharges = payment as Stripe.PaymentIntent & {
				charges?: {
					data?: Array<{ id: string }>;
				};
			};
			
			if (paymentWithCharges.charges?.data?.[0]?.id) {
				try {
					const chargeId = paymentWithCharges.charges.data[0].id;
					
					// Retrieve the charge to check if it used Stripe Connect
					const charge = await stripe.charges.retrieve(chargeId);
					
					// Build refund options
					const refundOptions: Stripe.RefundCreateParams = {
						charge: chargeId,
						reason: "requested_by_customer",
						metadata: {
							campaignId,
							playerId,
							hostId: userId,
							refundReason: reason || "Campaign canceled by host",
						},
					};

					// If the charge has a transfer (used Stripe Connect), 
					// reverse the transfer so refund is split proportionally:
					// - Host pays back 85% (reversed from their Connect account)
					// - Platform pays back 15% (the original application fee)
					// Stripe automatically calculates the correct amounts when reverse_transfer is true
					if (charge.transfer) {
						refundOptions.reverse_transfer = true;
						
						console.log("Refunding with Connect transfer reversal:", {
							chargeAmount: charge.amount,
							transfer: charge.transfer,
							note: "Stripe will automatically reverse 85% from host and 15% from platform",
						});
					}

					const refund = await stripe.refunds.create(refundOptions);

					refunds.push({
						id: refund.id,
						amount: refund.amount / 100,
						status: refund.status,
					});

					console.log("Refund issued:", {
						refundId: refund.id,
						amount: refund.amount,
						paymentIntentId: payment.id,
					});
				} catch (refundError) {
					console.error("Failed to refund payment:", {
						paymentIntentId: payment.id,
						error: refundError,
					});
				}
			}
		}

		if (refunds.length > 0) {
			return NextResponse.json({
				success: true,
				refunds,
				message: `Successfully issued ${refunds.length} refund(s)`,
			});
		} else {
			return NextResponse.json(
				{ error: "Failed to process any refunds" },
				{ status: 500 }
			);
		}
	} catch (error) {
		console.error("Error processing refund:", error);
		return NextResponse.json(
			{ 
				error: error instanceof Error ? error.message : "Failed to process refund",
			},
			{ status: 500 }
		);
	}
}
