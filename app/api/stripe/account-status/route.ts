import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { stripe } from "@/lib/stripe";
import { getStripeAccount, upsertStripeAccount } from "@/lib/stripe-accounts";

export async function POST() {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("userId")?.value;

    if (!userId) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const existingAccount = await getStripeAccount(userId);

    if (!existingAccount?.stripeAccountId) {
      return NextResponse.json(
        { error: "No Stripe account found" },
        { status: 404 }
      );
    }

    // Fetch the latest account status from Stripe
    const account = await stripe.accounts.retrieve(existingAccount.stripeAccountId);

    // Update the database with the latest status
    await upsertStripeAccount({
      userId,
      stripeAccountId: existingAccount.stripeAccountId,
      onboardingComplete: account.details_submitted || false,
      chargesEnabled: account.charges_enabled || false,
      payoutsEnabled: account.payouts_enabled || false,
    });

    return NextResponse.json({
      onboardingComplete: account.details_submitted || false,
      chargesEnabled: account.charges_enabled || false,
      payoutsEnabled: account.payouts_enabled || false,
    });
  } catch (error) {
    console.error("Error refreshing account status:", error);
    return NextResponse.json(
      { error: "Failed to refresh account status" },
      { status: 500 }
    );
  }
}
