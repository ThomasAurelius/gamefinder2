import { NextResponse } from "next/server";
import Stripe from "stripe";

// Initialize Stripe only if the secret key is available
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
		const stripe = getStripe();
		
		const body = await request.json();
		const { paymentIntentId } = body;

		if (!paymentIntentId) {
			return NextResponse.json(
				{ error: "PaymentIntent ID is required" },
				{ status: 400 }
			);
		}

		console.log("Finalizing subscription payment for PaymentIntent:", paymentIntentId);

		// Retrieve the PaymentIntent to get payment method and metadata
		const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

		if (!paymentIntent.metadata?.subscriptionId) {
			console.log("PaymentIntent is not associated with a subscription");
			return NextResponse.json({ success: true, message: "Not a subscription payment" });
		}

		const subscriptionId = paymentIntent.metadata.subscriptionId;
		const invoiceId = paymentIntent.metadata?.invoiceId;

		console.log("PaymentIntent details:", {
			id: paymentIntent.id,
			status: paymentIntent.status,
			subscriptionId,
			invoiceId,
			paymentMethod: paymentIntent.payment_method,
		});

		// Only proceed if payment was successful
		if (paymentIntent.status !== "succeeded") {
			console.log("PaymentIntent has not succeeded yet:", paymentIntent.status);
			return NextResponse.json({ 
				success: false, 
				message: "Payment not yet completed",
				status: paymentIntent.status 
			});
		}

		// Get the payment method from the confirmed PaymentIntent
		const paymentMethodId = paymentIntent.payment_method;
		
		if (!paymentMethodId || typeof paymentMethodId !== "string") {
			console.error("No payment method found on PaymentIntent");
			return NextResponse.json(
				{ error: "Payment method not found" },
				{ status: 400 }
			);
		}

		console.log("Updating subscription with payment method:", paymentMethodId);

		// Update the subscription to use this payment method
		const subscription = await stripe.subscriptions.update(subscriptionId, {
			default_payment_method: paymentMethodId,
		});

		console.log("Subscription updated:", {
			id: subscription.id,
			status: subscription.status,
			default_payment_method: subscription.default_payment_method,
		});

		// If there's an invoice, try to pay it with the payment method
		if (invoiceId) {
			try {
				const invoice = await stripe.invoices.retrieve(invoiceId);
				
				console.log("Invoice status:", {
					id: invoice.id,
					status: invoice.status,
					amount_due: invoice.amount_due,
				});

				// If invoice is still open and has amount due, pay it
				if (invoice.status === "open" && invoice.amount_due && invoice.amount_due > 0) {
					console.log("Paying invoice with payment method...");
					
					const paidInvoice = await stripe.invoices.pay(invoiceId, {
						payment_method: paymentMethodId,
					});

					console.log("Invoice paid successfully:", {
						id: paidInvoice.id,
						status: paidInvoice.status,
						amount_paid: paidInvoice.amount_paid,
					});
				} else {
					console.log("Invoice does not need manual payment:", invoice.status);
				}
			} catch (invoiceError) {
				console.error("Error handling invoice payment:", invoiceError);
				// Don't fail the whole request if invoice payment fails
				// The subscription is already updated with the payment method
			}
		}

		return NextResponse.json({ 
			success: true, 
			subscriptionId,
			subscriptionStatus: subscription.status,
		});

	} catch (error) {
		console.error("Error finalizing subscription payment:", error);
		
		const message =
			error instanceof Error && error.message
				? error.message
				: "Failed to finalize subscription payment";

		return NextResponse.json({ error: message }, { status: 500 });
	}
}
