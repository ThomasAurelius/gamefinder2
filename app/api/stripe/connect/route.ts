import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { stripe } from "@/lib/stripe";
import { getStripeAccount, upsertStripeAccount } from "@/lib/stripe-accounts";

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

    // Get existing Stripe account if any
    const existingAccount = await getStripeAccount(userId);

    if (existingAccount?.stripeAccountId) {
      // Return existing account status
      return NextResponse.json({
        hasAccount: true,
        accountId: existingAccount.stripeAccountId,
        onboardingComplete: existingAccount.onboardingComplete,
        chargesEnabled: existingAccount.chargesEnabled,
        payoutsEnabled: existingAccount.payoutsEnabled,
      });
    }

    return NextResponse.json({
      hasAccount: false,
    });
  } catch (error) {
    console.error("Error fetching Stripe account status:", error);
    return NextResponse.json(
      { error: "Failed to fetch account status" },
      { status: 500 }
    );
  }
}

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

    // Check if user already has a Stripe account
    let stripeAccountId: string;
    const existingAccount = await getStripeAccount(userId);

    if (existingAccount?.stripeAccountId) {
      stripeAccountId = existingAccount.stripeAccountId;
    } else {
      // Create a new Stripe Connect account
      const account = await stripe.accounts.create({
        type: 'express',
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
      });

      stripeAccountId = account.id;

      // Save the account ID to database
      await upsertStripeAccount({
        userId,
        stripeAccountId,
        onboardingComplete: false,
        chargesEnabled: false,
        payoutsEnabled: false,
      });
    }

    // Create an account link for onboarding
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const accountLink = await stripe.accountLinks.create({
      account: stripeAccountId,
      refresh_url: `${appUrl}/settings?stripe_refresh=true`,
      return_url: `${appUrl}/settings?stripe_success=true`,
      type: 'account_onboarding',
    });

    return NextResponse.json({
      url: accountLink.url,
    });
  } catch (error) {
    console.error("Error creating Stripe Connect account:", error);
    return NextResponse.json(
      { error: "Failed to create Connect account" },
      { status: 500 }
    );
  }
}
