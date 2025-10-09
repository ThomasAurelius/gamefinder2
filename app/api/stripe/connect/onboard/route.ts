import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import Stripe from "stripe";
import { STRIPE_NOT_CONFIGURED_MESSAGE } from "@/lib/stripe-messages";
import {
	getStripeConnectAccountId,
	setStripeConnectAccountId,
	getUserEmail,
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
 * POST /api/stripe/connect/onboard
 * Creates or retrieves a Stripe Connect account and generates an account link for onboarding
 */
export async function POST(request: Request) {
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

		// Get the app URL for redirect
		const { origin } = new URL(request.url);
		const refreshUrl = `${origin}/host/onboarding`;
		const returnUrl = `${origin}/host/dashboard`;

		// Check if user already has a Connect account
		let accountId = await getStripeConnectAccountId(userId);

		if (accountId) {
			console.log("Reusing existing Stripe Connect account:", accountId);
		} else {
			// Get user email for better account tracking
			const userEmail = await getUserEmail(userId);

			// Create a new Connect Express account
			const account = await stripe.accounts.create({
				type: "express",
				email: userEmail || undefined,
				capabilities: {
					card_payments: { requested: true },
					transfers: { requested: true },
				},
				metadata: {
					userId,
				},
			});

			accountId = account.id;
			console.log("Created new Stripe Connect account:", accountId);

			// Save account ID to database
			await setStripeConnectAccountId(userId, accountId);
		}

		// Create an account link for onboarding
		const accountLink = await stripe.accountLinks.create({
			account: accountId,
			refresh_url: refreshUrl,
			return_url: returnUrl,
			type: "account_onboarding",
		});

		console.log("Account link created for onboarding:", {
			accountId,
			userId,
		});

		return NextResponse.json({
			url: accountLink.url,
			accountId,
		});
	} catch (error) {
		console.error("Error creating Connect onboarding link:", error);

		const message =
			error instanceof Error && error.message
				? error.message
				: "Failed to create onboarding link";

		return NextResponse.json({ error: message }, { status: 500 });
	}
}
