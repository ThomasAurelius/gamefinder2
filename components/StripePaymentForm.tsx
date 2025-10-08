"use client";

import { useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { STRIPE_PUBLISHABLE_KEY } from "@/lib/stripe-config";
import { STRIPE_NOT_CONFIGURED_MESSAGE } from "@/lib/stripe-messages";

// Load Stripe outside of component to avoid recreating on every render
const stripePromise = STRIPE_PUBLISHABLE_KEY
  ? loadStripe(STRIPE_PUBLISHABLE_KEY)
  : null;

interface PaymentFormProps {
  clientSecret: string;
  paymentMode?: "payment" | "subscription";
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

function CheckoutForm({
  onSuccess,
  onError,
  paymentMode = "payment",
}: Omit<PaymentFormProps, "clientSecret">) {
  const stripe = useStripe();
  const elements = useElements();
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);
    setMessage(null);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/payment/success`,
      },
      redirect: "if_required",
    });

    if (error) {
      setMessage(error.message || "An unexpected error occurred.");
      onError?.(error.message || "An unexpected error occurred.");
    } else {
      setMessage(
        paymentMode === "subscription"
          ? "Subscription started successfully!"
          : "Payment successful!"
      );
      onSuccess?.();
    }

    setIsLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement />
      
      {message && (
        <div
          className={`rounded-xl border px-4 py-3 text-sm ${
            message.includes("successful")
              ? "border-green-500/20 bg-green-500/10 text-green-400"
              : "border-red-500/20 bg-red-500/10 text-red-400"
          }`}
        >
          {message}
        </div>
      )}

      <button
        type="submit"
        disabled={isLoading || !stripe || !elements}
        className="w-full rounded-xl bg-sky-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isLoading
          ? "Processing..."
          : paymentMode === "subscription"
            ? "Subscribe Now"
            : "Pay Now"}
      </button>
    </form>
  );
}

export default function StripePaymentForm({
  clientSecret,
  paymentMode = "payment",
  onSuccess,
  onError,
}: PaymentFormProps) {
  const stripeInstance = stripePromise;
  const [options, setOptions] = useState<{
    clientSecret: string;
    appearance: {
      theme: "night";
      variables: {
        colorPrimary: string;
        colorBackground: string;
        colorText: string;
        colorDanger: string;
        fontFamily: string;
        borderRadius: string;
      };
    };
  } | null>(null);

  useEffect(() => {
    if (clientSecret) {
      setOptions({
        clientSecret,
        appearance: {
          theme: "night",
          variables: {
            colorPrimary: "#0ea5e9",
            colorBackground: "#0f172a",
            colorText: "#e2e8f0",
            colorDanger: "#ef4444",
            fontFamily: "system-ui, sans-serif",
            borderRadius: "12px",
          },
        },
      });
    }
  }, [clientSecret]);

  // Check if Stripe publishable key is missing
  if (!STRIPE_PUBLISHABLE_KEY || !stripeInstance) {
    return (
      <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-6">
        <p className="text-sm text-red-200">{STRIPE_NOT_CONFIGURED_MESSAGE}</p>
      </div>
    );
  }

  if (!options) {
    return (
      <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-10 bg-slate-800 rounded"></div>
          <div className="h-10 bg-slate-800 rounded"></div>
          <div className="h-12 bg-slate-800 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-6">
      <Elements stripe={stripeInstance} options={options}>
        <CheckoutForm
          paymentMode={paymentMode}
          onSuccess={onSuccess}
          onError={onError}
        />
      </Elements>
    </div>
  );
}
