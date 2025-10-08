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

export async function GET(request: Request) {
	try {
		const { searchParams } = new URL(request.url);
		const campaignId = searchParams.get("campaignId");

		if (!campaignId) {
			return NextResponse.json(
				{ error: "Campaign ID is required" },
				{ status: 400 }
			);
		}

		const cookieStore = await cookies();
		const userId = cookieStore.get("userId")?.value;

		if (!userId) {
			return NextResponse.json(
				{ error: "Authentication required" },
				{ status: 401 }
			);
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

		// Fetch all subscriptions for this customer
		const subscriptions = await stripe.subscriptions.list({
			customer: customerId,
			status: "active",
			limit: 100,
		});

		// Check if any subscription is for this campaign
		const campaignSubscription = subscriptions.data.find(
			(sub) => sub.metadata.campaignId === campaignId
		);

		if (campaignSubscription) {
			return NextResponse.json({
				hasActiveSubscription: true,
				subscriptionId: campaignSubscription.id,
			});
		}

		return NextResponse.json({
			hasActiveSubscription: false,
		});
	} catch (error) {
		console.error("Error checking subscription status:", error);
		return NextResponse.json(
			{ error: "Failed to check subscription status" },
			{ status: 500 }
		);
	}
}
