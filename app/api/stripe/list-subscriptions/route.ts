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

		// If Stripe is not configured, return empty list
		if (!process.env.STRIPE_SECRET_KEY) {
			return NextResponse.json({
				subscriptions: [],
			});
		}

		// Check if user has a Stripe customer ID
		const customerId = await getStripeCustomerId(userId);

		if (!customerId) {
			// User doesn't have a customer ID, so they don't have any subscriptions
			return NextResponse.json({
				subscriptions: [],
			});
		}

		const stripe = getStripe();

		// Fetch all subscriptions for this customer
		const subscriptions = await stripe.subscriptions.list({
			customer: customerId,
			limit: 100,
		});

		// Map subscriptions to a simpler format
		const formattedSubscriptions = subscriptions.data.map((sub: Stripe.Subscription) => ({
			id: sub.id,
			status: sub.status,
			campaignId: sub.metadata?.campaignId,
			campaignName: sub.metadata?.campaignName,
			amount: sub.items.data[0]?.price?.unit_amount ?? null,
			currency: sub.items.data[0]?.price?.currency ?? null,
			interval: sub.items.data[0]?.price?.recurring?.interval ?? null,
		}));

		return NextResponse.json({
			subscriptions: formattedSubscriptions,
		});
	} catch (error) {
		console.error("Error listing subscriptions:", error);
		return NextResponse.json(
			{ error: "Failed to list subscriptions" },
			{ status: 500 }
		);
	}
}
