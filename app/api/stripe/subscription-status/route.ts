import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import Stripe from "stripe";
import { getStripeCustomerId } from "@/lib/users";

const getStripe = () => {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("STRIPE_SECRET_KEY is not configured");
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2025-09-30.clover",
  });
};

/**
 * GET /api/stripe/subscription-status - Check if user has any active subscription
 * This is a general subscription check (not campaign-specific)
 */
export async function GET() {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("userId")?.value;

    if (!userId) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // If Stripe is not configured, assume no subscriptions
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json({
        hasActiveSubscription: false,
      });
    }

    // Check if user has a Stripe customer ID
    const customerId = await getStripeCustomerId(userId);

    if (!customerId) {
      // User doesn't have a customer ID, so they don't have any subscriptions
      return NextResponse.json({
        hasActiveSubscription: false,
      });
    }

    const stripe = getStripe();

    // Fetch all active subscriptions for this customer
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: "active",
      limit: 100,
    });

    // Check if user has any active subscription
    const hasActiveSubscription = subscriptions.data.length > 0;

    return NextResponse.json({
      hasActiveSubscription,
      subscriptionCount: subscriptions.data.length,
    });
  } catch (error) {
    console.error("Error checking subscription status:", error);
    return NextResponse.json(
      { error: "Failed to check subscription status" },
      { status: 500 }
    );
  }
}
