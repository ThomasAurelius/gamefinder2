import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import Stripe from "stripe";
import { STRIPE_NOT_CONFIGURED_MESSAGE } from "@/lib/stripe-messages";

type StripeErrorLike = {
  type?: string;
  code?: string;
  message?: string;
};

const isStripeMisconfigurationError = (error: unknown) => {
  if (!error || typeof error !== "object") {
    return false;
  }

  const { type, code, message } = error as StripeErrorLike;

  if (type === "StripeAuthenticationError" || code === "authentication_error") {
    return true;
  }

  if (typeof message === "string") {
    const normalizedMessage = message.toLowerCase();
    if (
      normalizedMessage.includes("invalid api key") ||
      normalizedMessage.includes("no api key provided")
    ) {
      return true;
    }
  }

  return false;
};

// Initialize Stripe only if the secret key is available
const getStripe = () => {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("STRIPE_SECRET_KEY is not configured");
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2025-09-30.clover",
  });
};

export async function POST(request: Request) {
  if (!process.env.STRIPE_SECRET_KEY) {
    console.error("Error creating payment intent: STRIPE_SECRET_KEY is not configured");
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

    const body = await request.json();
    const {
      amount,
      campaignId,
      campaignName,
      paymentType = "one_time",
    } = body;

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: "Valid amount is required" },
        { status: 400 }
      );
    }

    if (paymentType === "subscription") {
      const customer = await stripe.customers.create({
        metadata: {
          userId,
        },
      });

      const price = await stripe.prices.create({
        unit_amount: Math.round(amount * 100),
        currency: "usd",
        recurring: { interval: "week" },
        product_data: {
          name: `${campaignName || "Campaign"} Subscription`,
          metadata: {
            campaignId: campaignId || "",
          },
        },
      });

      const subscription = await stripe.subscriptions.create({
        customer: customer.id,
        items: [{ price: price.id }],
        metadata: {
          campaignId: campaignId || "",
          campaignName: campaignName || "",
          userId,
        },
        payment_behavior: "default_incomplete",
        payment_settings: {
          save_default_payment_method: "on_subscription",
        },
        expand: ["latest_invoice.payment_intent"],
      });

      // Type guard: ensure latest_invoice is expanded to Invoice object, not string
      const latestInvoice = subscription.latest_invoice;
      if (!latestInvoice || typeof latestInvoice === "string") {
        throw new Error("Failed to retrieve invoice for subscription");
      }

      // When using expand, payment_intent is added to the invoice but TypeScript doesn't know about it
      // Use type assertion to access the expanded property
      let paymentIntent = (
        latestInvoice as Stripe.Invoice & {
          payment_intent?: string | Stripe.PaymentIntent;
        }
      ).payment_intent;

      if (!paymentIntent) {
        throw new Error("Failed to initialize subscription payment");
      }

      if (typeof paymentIntent === "string") {
        paymentIntent = await stripe.paymentIntents.retrieve(paymentIntent);
      }

      if (!paymentIntent?.client_secret) {
        throw new Error("Failed to initialize subscription payment");
      }

      return NextResponse.json({
        clientSecret: paymentIntent.client_secret,
        subscriptionId: subscription.id,
        customerId: customer.id,
        priceId: price.id,
        mode: "subscription",
      });
    }

    // Create a PaymentIntent with the order amount and currency
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: "usd",
      metadata: {
        campaignId: campaignId || "",
        campaignName: campaignName || "",
        userId: userId,
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      mode: "payment",
    });
  } catch (error) {
    console.error("Error creating payment intent:", error);

    if (isStripeMisconfigurationError(error)) {
      return NextResponse.json(
        { error: STRIPE_NOT_CONFIGURED_MESSAGE },
        { status: 503 }
      );
    }

    const message =
      error instanceof Error && error.message
        ? error.message
        : "Failed to create payment intent";

    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
