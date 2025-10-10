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

export async function POST(request: Request) {
	try {
		const body = await request.json();
		const { campaignId, playerIds } = body;

		if (!campaignId) {
			return NextResponse.json(
				{ error: "Campaign ID is required" },
				{ status: 400 }
			);
		}

		if (!playerIds || !Array.isArray(playerIds)) {
			return NextResponse.json(
				{ error: "Player IDs array is required" },
				{ status: 400 }
			);
		}

		// Verify the requesting user is authenticated
		const cookieStore = await cookies();
		const userId = cookieStore.get("userId")?.value;

		if (!userId) {
			return NextResponse.json(
				{ error: "Authentication required" },
				{ status: 401 }
			);
		}

		// If Stripe is not configured, return all players as not having subscriptions
		if (!process.env.STRIPE_SECRET_KEY) {
			const result: Record<string, boolean> = {};
			playerIds.forEach((playerId: string) => {
				result[playerId] = false;
			});
			return NextResponse.json(result);
		}

		const stripe = getStripe();
		const result: Record<string, boolean> = {};

		// Check subscription status for each player
		for (const playerId of playerIds) {
			try {
				// Get the player's Stripe customer ID
				const customerId = await getStripeCustomerId(playerId);

				if (!customerId) {
					result[playerId] = false;
					continue;
				}

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

				result[playerId] = !!campaignSubscription;
			} catch (error) {
				console.error(`Error checking subscription for player ${playerId}:`, error);
				result[playerId] = false;
			}
		}

		return NextResponse.json(result);
	} catch (error) {
		console.error("Error checking player subscriptions:", error);
		return NextResponse.json(
			{ error: "Failed to check player subscriptions" },
			{ status: 500 }
		);
	}
}
