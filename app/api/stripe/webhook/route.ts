import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { stripe } from "@/lib/stripe";
import { upsertStripeAccount } from "@/lib/stripe-accounts";

export async function POST(request: Request) {
  try {
    const body = await request.text();
    const headersList = await headers();
    const signature = headersList.get("stripe-signature");

    if (!signature) {
      return NextResponse.json(
        { error: "No signature provided" },
        { status: 400 }
      );
    }

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error("STRIPE_WEBHOOK_SECRET is not set");
      return NextResponse.json(
        { error: "Webhook secret not configured" },
        { status: 500 }
      );
    }

    // Verify the webhook signature
    let event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error("Webhook signature verification failed:", err);
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 400 }
      );
    }

    // Handle the event
    switch (event.type) {
      case 'account.updated': {
        const account = event.data.object;
        
        // Find the user associated with this Stripe account
        // We'll need to query by stripeAccountId
        const db = await import("@/lib/mongodb").then(m => m.getDb());
        const stripeAccountDoc = await db.collection("stripe_accounts").findOne({
          stripeAccountId: account.id,
        });

        if (stripeAccountDoc) {
          await upsertStripeAccount({
            userId: stripeAccountDoc.userId,
            stripeAccountId: account.id,
            onboardingComplete: account.details_submitted || false,
            chargesEnabled: account.charges_enabled || false,
            payoutsEnabled: account.payouts_enabled || false,
          });
        }
        break;
      }

      case 'checkout.session.completed': {
        const session = event.data.object;
        
        // Store payment record
        const db = await import("@/lib/mongodb").then(m => m.getDb());
        await db.collection("payments").insertOne({
          sessionId: session.id,
          campaignId: session.metadata?.campaignId,
          userId: session.metadata?.userId,
          dmUserId: session.metadata?.dmUserId,
          amount: session.amount_total,
          status: session.payment_status,
          createdAt: new Date(),
        });

        // TODO: Automatically add user to campaign if payment successful
        break;
      }

      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object;
        console.log("Payment succeeded:", paymentIntent.id);
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object;
        console.log("Payment failed:", paymentIntent.id);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Error processing webhook:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}
