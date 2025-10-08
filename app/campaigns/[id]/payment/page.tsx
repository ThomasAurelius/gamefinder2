"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import StripePaymentForm from "@/components/StripePaymentForm";
import { STRIPE_PUBLISHABLE_KEY } from "@/lib/stripe-config";
import { STRIPE_NOT_CONFIGURED_MESSAGE } from "@/lib/stripe-messages";

interface Campaign {
  id: string;
  game: string;
  description?: string;
  costPerSession?: number;
  sessionsLeft?: number;
}

type PaymentMode = "payment" | "subscription";

export default function CampaignPaymentPage() {
  const params = useParams();
  const router = useRouter();
  const campaignId = params.id as string;

  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitializingPayment, setIsInitializingPayment] = useState(false);
  const [paymentComplete, setPaymentComplete] = useState(false);
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false);
  const [isCheckingSubscription, setIsCheckingSubscription] = useState(false);

  const paymentMode: PaymentMode = useMemo(() => {
    if (!campaign || typeof campaign.sessionsLeft !== "number") {
      return "payment";
    }

    return campaign.sessionsLeft > 1 ? "subscription" : "payment";
  }, [campaign]);

  useEffect(() => {
    const fetchCampaign = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/campaigns/${campaignId}`);
        if (!response.ok) {
          if (response.status === 404) {
            router.push("/find-campaigns");
            return;
          }
          throw new Error("Failed to load campaign details");
        }

        const campaignData = (await response.json()) as Campaign;
        setCampaign(campaignData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load campaign");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCampaign();
  }, [campaignId, router]);

  useEffect(() => {
    const checkSubscriptionStatus = async () => {
      if (!campaign || paymentMode !== "subscription") {
        return;
      }

      try {
        setIsCheckingSubscription(true);
        const response = await fetch(
          `/api/stripe/check-subscription?campaignId=${campaignId}`
        );
        
        if (response.ok) {
          const data = await response.json();
          setHasActiveSubscription(data.hasActiveSubscription || false);
        }
      } catch (err) {
        console.error("Failed to check subscription status:", err);
        // Don't show error to user, just assume no subscription
        setHasActiveSubscription(false);
      } finally {
        setIsCheckingSubscription(false);
      }
    };

    checkSubscriptionStatus();
  }, [campaign, campaignId, paymentMode]);

  useEffect(() => {
    const initializePayment = async () => {
      if (!STRIPE_PUBLISHABLE_KEY) {
        setError(STRIPE_NOT_CONFIGURED_MESSAGE);
        setClientSecret(null);
        return;
      }

      if (!campaign?.costPerSession || campaign.costPerSession <= 0) {
        return;
      }

      // Skip payment initialization if user has an active subscription
      if (hasActiveSubscription) {
        return;
      }

      try {
        setIsInitializingPayment(true);
        const response = await fetch("/api/stripe/create-payment-intent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amount: campaign.costPerSession,
            campaignId,
            campaignName: campaign.game,
            paymentType: paymentMode === "subscription" ? "subscription" : "one_time",
          }),
        });

        let data: unknown;

        try {
          data = await response.json();
        } catch (parseError) {
          if (!response.ok) {
            throw new Error("Failed to initialize payment");
          }
          throw parseError;
        }

        if (!response.ok) {
          if (response.status === 503) {
            throw new Error(STRIPE_NOT_CONFIGURED_MESSAGE);
          }

          const message =
            data && typeof data === "object" && "error" in data && data.error
              ? String((data as { error: unknown }).error)
              : "Failed to initialize payment";
          throw new Error(message);
        }

        if (
          !data ||
          typeof data !== "object" ||
          !("clientSecret" in data) ||
          typeof data.clientSecret !== "string"
        ) {
          throw new Error("Payment configuration is incomplete. Please try again later.");
        }

        const clientSecret = (data as { clientSecret: string }).clientSecret;
        setClientSecret(clientSecret);
        setError(null);
      } catch (err) {
        setClientSecret(null);
        setError(err instanceof Error ? err.message : "Failed to initialize payment");
      } finally {
        setIsInitializingPayment(false);
      }
    };

    if (campaign && !isCheckingSubscription) {
      initializePayment();
    }
  }, [campaign, campaignId, paymentMode, hasActiveSubscription, isCheckingSubscription]);

  if (isLoading) {
    return (
      <div className="mx-auto mt-10 max-w-2xl rounded-xl border border-slate-800 bg-slate-950/40 p-8 text-slate-300">
        Loading campaign details...
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto mt-10 max-w-2xl rounded-xl border border-red-500/40 bg-red-500/10 p-8 text-sm text-red-200">
        {error}
      </div>
    );
  }

  if (!campaign) {
    return null;
  }

  if (!campaign.costPerSession || campaign.costPerSession <= 0) {
    return (
      <div className="mx-auto mt-10 max-w-2xl space-y-4">
        <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-8 text-slate-200">
          <h1 className="text-xl font-semibold text-slate-100">{campaign.game}</h1>
          <p className="mt-2 text-sm text-slate-400">
            This campaign does not require payment.
          </p>
        </div>
        <Link
          href={`/campaigns/${campaignId}`}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-sky-500 hover:text-sky-400"
        >
          ← Back to campaign details
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto mt-10 max-w-2xl space-y-6">
      <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-8">
        <div className="mb-6 space-y-2">
          <h1 className="text-xl font-semibold text-slate-100">
            {paymentMode === "subscription" ? "Subscribe to" : "Pay for"} {campaign.game}
          </h1>
          <p className="text-sm text-slate-400">
            {paymentMode === "subscription"
              ? "This campaign runs for multiple sessions. Subscribe to keep your seat reserved."
              : "This campaign only runs for a single session. Complete your one-time payment to confirm your spot."}
          </p>
          <p className="text-sm text-slate-300">
            Amount due: <span className="font-semibold text-slate-100">${campaign.costPerSession.toFixed(2)}</span>
          </p>
          {typeof campaign.sessionsLeft === "number" && (
            <p className="text-xs text-slate-500">
              Sessions: {campaign.sessionsLeft} {campaign.sessionsLeft === 1 ? "session" : "sessions"}
            </p>
          )}
        </div>

        {paymentComplete && (
          <div className="mb-6 rounded-xl border border-green-500/20 bg-green-500/10 px-4 py-3 text-sm text-green-400">
            {paymentMode === "subscription"
              ? "Your subscription is active."
              : "Your payment was successful."}
          </div>
        )}

        {hasActiveSubscription ? (
          <div className="space-y-4">
            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-400">
              You have an active subscription for this campaign.
            </div>
            <a
              href="https://billing.stripe.com/p/login/00w4gy3Jmad7bDT6k273G00"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-sky-700"
            >
              Manage Subscription (Stripe Dashboard)
            </a>
          </div>
        ) : isInitializingPayment && !clientSecret ? (
          <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-6 text-sm text-slate-400">
            Initializing payment...
          </div>
        ) : clientSecret ? (
          <StripePaymentForm
            clientSecret={clientSecret}
            paymentMode={paymentMode}
            onSuccess={() => setPaymentComplete(true)}
            onError={(errMsg) => setError(errMsg)}
          />
        ) : (
          <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-6 text-sm text-red-200">
            Unable to load the payment form. Please try again later.
          </div>
        )}
      </div>

      <Link
        href={`/campaigns/${campaignId}`}
        className="inline-flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-sky-500 hover:text-sky-400"
      >
        ← Back to campaign details
      </Link>
    </div>
  );
}
