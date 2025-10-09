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

export async function DELETE(request: Request) {
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
				{ error: "Stripe is not configured" },
				{ status: 503 }
			);
		}

		const stripe = getStripe();

		// Parse request body
		let body;
		try {
			body = await request.json();
		} catch (parseError) {
			console.error("Failed to parse request body:", parseError);
			return NextResponse.json(
				{ error: "Invalid request format" },
				{ status: 400 }
			);
		}

		const { subscriptionId } = body;

		if (!subscriptionId) {
			return NextResponse.json(
				{ error: "Subscription ID is required" },
				{ status: 400 }
			);
		}

		// Get user's Stripe customer ID
		const customerId = await getStripeCustomerId(userId);
		if (!customerId) {
			return NextResponse.json(
				{ error: "No payment profile found" },
				{ status: 404 }
			);
		}

		// Retrieve the subscription to verify ownership and status
		const subscription = await stripe.subscriptions.retrieve(subscriptionId);

		// Verify the subscription belongs to the user
		if (subscription.customer !== customerId) {
			return NextResponse.json(
				{ error: "You do not have permission to delete this subscription" },
				{ status: 403 }
			);
		}

		// Only allow deletion of incomplete or incomplete_expired subscriptions
		if (subscription.status !== "incomplete" && subscription.status !== "incomplete_expired") {
			return NextResponse.json(
				{ error: "Only incomplete subscriptions can be deleted" },
				{ status: 400 }
			);
		}

		// Delete the subscription
		await stripe.subscriptions.cancel(subscriptionId);

		console.log("Incomplete subscription deleted:", {
			subscriptionId,
			userId,
			customerId,
			status: subscription.status,
		});

		return NextResponse.json({
			success: true,
			message: "Subscription deleted successfully",
		});
	} catch (error) {
		console.error("Error deleting subscription:", error);
		
		if (error instanceof Error && error.message.includes("No such subscription")) {
			return NextResponse.json(
				{ error: "Subscription not found" },
				{ status: 404 }
			);
		}

		return NextResponse.json(
			{ error: "Failed to delete subscription" },
			{ status: 500 }
		);
	}
}
