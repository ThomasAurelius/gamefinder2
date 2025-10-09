import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import Stripe from "stripe";
import { getStripeCustomerId } from "@/lib/users";
import { getCampaign } from "@/lib/campaigns/db";

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
		const cookieStore = await cookies();
		const userId = cookieStore.get("userId")?.value;

		if (!userId) {
			return NextResponse.json(
				{ error: "Authentication required" },
				{ status: 401 }
			);
		}

		// Validate Stripe configuration
		if (!process.env.STRIPE_SECRET_KEY) {
			return NextResponse.json(
				{ payments: [] },
			);
		}

		const { searchParams } = new URL(request.url);
		const campaignId = searchParams.get("campaignId");
		const playerId = searchParams.get("playerId");

		if (!campaignId) {
			return NextResponse.json(
				{ error: "Campaign ID is required" },
				{ status: 400 }
			);
		}

		// Verify the requesting user is the host of the campaign
		const campaign = await getCampaign(campaignId);
		if (!campaign) {
			return NextResponse.json(
				{ error: "Campaign not found" },
				{ status: 404 }
			);
		}

		if (campaign.userId !== userId) {
			return NextResponse.json(
				{ error: "Only the campaign host can view payment details" },
				{ status: 403 }
			);
		}

		const stripe = getStripe();
		const payments = [];

		// If a specific player ID is provided, get their payments
		const playerIds = playerId ? [playerId] : campaign.signedUpPlayers || [];

		for (const pId of playerIds) {
			const playerCustomerId = await getStripeCustomerId(pId);
			if (!playerCustomerId) {
				continue;
			}

			// Get subscriptions for this player and campaign
			const subscriptions = await stripe.subscriptions.list({
				customer: playerCustomerId,
				limit: 100,
			});

			const campaignSubscriptions = subscriptions.data.filter(
				(sub) => sub.metadata.campaignId === campaignId
			);

			for (const sub of campaignSubscriptions) {
				payments.push({
					playerId: pId,
					type: "subscription",
					subscriptionId: sub.id,
					status: sub.status,
					amount: sub.items.data[0]?.price?.unit_amount 
						? sub.items.data[0].price.unit_amount / 100 
						: 0,
					currency: sub.items.data[0]?.price?.currency || "usd",
					created: sub.created,
					cancelAtPeriodEnd: sub.cancel_at_period_end,
				});
			}

			// Get one-time payments for this player and campaign
			const paymentIntents = await stripe.paymentIntents.list({
				customer: playerCustomerId,
				limit: 100,
			});

			const campaignPayments = paymentIntents.data.filter(
				(pi) => pi.metadata.campaignId === campaignId
			);

			for (const payment of campaignPayments) {
				payments.push({
					playerId: pId,
					type: "one_time",
					paymentIntentId: payment.id,
					status: payment.status,
					amount: payment.amount / 100,
					currency: payment.currency,
					created: payment.created,
				});
			}
		}

		return NextResponse.json({
			campaignId,
			payments,
		});
	} catch (error) {
		console.error("Error fetching payment details:", error);
		return NextResponse.json(
			{ error: "Failed to fetch payment details" },
			{ status: 500 }
		);
	}
}
