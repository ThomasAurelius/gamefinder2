import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import Stripe from "stripe";
import { STRIPE_NOT_CONFIGURED_MESSAGE } from "@/lib/stripe-messages";
import {
	getStripeConnectAccountId,
	setStripeConnectOnboardingComplete,
} from "@/lib/users";

const getStripe = () => {
	if (!process.env.STRIPE_SECRET_KEY) {
		throw new Error("STRIPE_SECRET_KEY is not configured");
	}
	return new Stripe(process.env.STRIPE_SECRET_KEY, {
		apiVersion: "2025-09-30.clover",
	});
};

/**
 * GET /api/stripe/connect/status
 * Checks the status of a user's Stripe Connect account
 */
export async function GET() {
	// Validate Stripe configuration
	if (!process.env.STRIPE_SECRET_KEY) {
		console.error("Error: STRIPE_SECRET_KEY is not configured");
		return NextResponse.json(
			{ error: STRIPE_NOT_CONFIGURED_MESSAGE },
			{ status: 503 }
		);
	}

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

		// Get user's Connect account ID
		const accountId = await getStripeConnectAccountId(userId);

		if (!accountId) {
			return NextResponse.json({
				hasAccount: false,
				onboardingComplete: false,
				detailsSubmitted: false,
				chargesEnabled: false,
				payoutsEnabled: false,
			});
		}

		// Retrieve account details from Stripe
		const account = await stripe.accounts.retrieve(accountId);

		// Check if onboarding is complete
		const onboardingComplete =
			account.details_submitted === true &&
			account.charges_enabled === true &&
			account.payouts_enabled === true;

		// Update database if status changed to complete
		if (onboardingComplete) {
			await setStripeConnectOnboardingComplete(userId, true);
		}

		console.log("Connect account status:", {
			accountId,
			userId,
			onboardingComplete,
			detailsSubmitted: account.details_submitted,
			chargesEnabled: account.charges_enabled,
			payoutsEnabled: account.payouts_enabled,
		});

		return NextResponse.json({
			hasAccount: true,
			accountId,
			onboardingComplete,
			detailsSubmitted: account.details_submitted,
			chargesEnabled: account.charges_enabled,
			payoutsEnabled: account.payouts_enabled,
			requirements: account.requirements?.currently_due || [],
		});
	} catch (error) {
		console.error("Error checking Connect account status:", error);

		const message =
			error instanceof Error && error.message
				? error.message
				: "Failed to check account status";

		return NextResponse.json({ error: message }, { status: 500 });
	}
}
