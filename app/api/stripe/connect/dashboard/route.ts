import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import Stripe from "stripe";
import { STRIPE_NOT_CONFIGURED_MESSAGE } from "@/lib/stripe-messages";
import { getStripeConnectAccountId } from "@/lib/users";

const getStripe = () => {
	if (!process.env.STRIPE_SECRET_KEY) {
		throw new Error("STRIPE_SECRET_KEY is not configured");
	}
	return new Stripe(process.env.STRIPE_SECRET_KEY, {
		apiVersion: "2025-09-30.clover",
	});
};

/**
 * POST /api/stripe/connect/dashboard
 * Creates a login link to the Stripe Express Dashboard for hosts
 */
export async function POST() {
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
			return NextResponse.json(
				{ error: "No Connect account found. Please complete onboarding first." },
				{ status: 404 }
			);
		}

		// Create a login link to the Express Dashboard
		const loginLink = await stripe.accounts.createLoginLink(accountId);

		console.log("Express Dashboard login link created:", {
			accountId,
			userId,
		});

		return NextResponse.json({
			url: loginLink.url,
		});
	} catch (error) {
		console.error("Error creating Express Dashboard login link:", error);

		const message =
			error instanceof Error && error.message
				? error.message
				: "Failed to create dashboard login link";

		return NextResponse.json({ error: message }, { status: 500 });
	}
}
