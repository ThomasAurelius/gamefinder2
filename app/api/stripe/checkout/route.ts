import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { stripe, PLATFORM_FEE_PERCENTAGE } from "@/lib/stripe";
import { getCampaign } from "@/lib/campaigns/db";
import { getStripeAccountId, hasCompletedStripeOnboarding } from "@/lib/stripe-accounts";

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("userId")?.value;

    if (!userId) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const { campaignId } = await request.json();

    if (!campaignId) {
      return NextResponse.json(
        { error: "Campaign ID is required" },
        { status: 400 }
      );
    }

    // Get campaign details
    const campaign = await getCampaign(campaignId);

    if (!campaign) {
      return NextResponse.json(
        { error: "Campaign not found" },
        { status: 404 }
      );
    }

    // Check if campaign has a cost
    if (!campaign.costPerSession || campaign.costPerSession <= 0) {
      return NextResponse.json(
        { error: "This campaign is free" },
        { status: 400 }
      );
    }

    // Get DM's Stripe account
    const dmStripeAccountId = await getStripeAccountId(campaign.userId);

    if (!dmStripeAccountId) {
      return NextResponse.json(
        { error: "DM has not set up payment processing" },
        { status: 400 }
      );
    }

    // Verify DM has completed onboarding
    const dmOnboardingComplete = await hasCompletedStripeOnboarding(campaign.userId);

    if (!dmOnboardingComplete) {
      return NextResponse.json(
        { error: "DM has not completed payment setup" },
        { status: 400 }
      );
    }

    // Calculate amounts (Stripe uses cents)
    const totalAmount = Math.round(campaign.costPerSession * 100);
    
    // Calculate platform fee after Stripe fees
    // Stripe fee is approximately 2.9% + 30 cents
    const stripeFee = Math.round(totalAmount * 0.029 + 30);
    const amountAfterStripeFee = totalAmount - stripeFee;
    const platformFee = Math.round(amountAfterStripeFee * (PLATFORM_FEE_PERCENTAGE / 100));

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    // Create Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `${campaign.game} - Campaign Session`,
              description: campaign.description,
            },
            unit_amount: totalAmount,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${appUrl}/campaigns/${campaignId}?payment=success`,
      cancel_url: `${appUrl}/campaigns/${campaignId}?payment=cancelled`,
      metadata: {
        campaignId,
        userId,
        dmUserId: campaign.userId,
      },
      payment_intent_data: {
        application_fee_amount: platformFee,
        transfer_data: {
          destination: dmStripeAccountId,
        },
      },
    });

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
    });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
