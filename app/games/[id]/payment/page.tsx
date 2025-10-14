"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import StripePaymentForm from "@/components/StripePaymentForm";
import { STRIPE_PUBLISHABLE_KEY } from "@/lib/stripe-config";
import { STRIPE_NOT_CONFIGURED_MESSAGE } from "@/lib/stripe-messages";

interface GameSession {
  id: string;
  userId: string;
  game: string;
  description?: string;
  costPerSession?: number;
  signedUpPlayers: string[];
  waitlist: string[];
  pendingPlayers: string[];
}

export default function GamePaymentPage() {
  const params = useParams();
  const router = useRouter();
  const gameId = params.id as string;

  const [game, setGame] = useState<GameSession | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitializingPayment, setIsInitializingPayment] = useState(false);
  const [paymentComplete, setPaymentComplete] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    const fetchGame = async () => {
      try {
        setIsLoading(true);
        
        // Fetch current user ID
        const profileResponse = await fetch("/api/profile");
        if (profileResponse.ok) {
          const profileData = await profileResponse.json();
          if (profileData?.userId) {
            setCurrentUserId(profileData.userId);
          }
        }
        
        const response = await fetch(`/api/games/${gameId}`);
        if (!response.ok) {
          if (response.status === 404) {
            router.push("/find");
            return;
          }
          throw new Error("Failed to load game details");
        }

        const gameData = (await response.json()) as GameSession;
        setGame(gameData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load game");
      } finally {
        setIsLoading(false);
      }
    };

    fetchGame();
  }, [gameId, router]);

  useEffect(() => {
    const initializePayment = async () => {
      if (!game || !game.costPerSession || game.costPerSession <= 0) {
        return;
      }

      // Check if user is on waitlist (shouldn't be able to pay)
      if (currentUserId && game.waitlist.includes(currentUserId)) {
        return; // Will show waitlist message
      }

      // Initialize payment only if user is in pendingPlayers (approved but not paid)
      if (currentUserId && game.pendingPlayers.includes(currentUserId)) {
        try {
          setIsInitializingPayment(true);
          const response = await fetch("/api/stripe/create-payment-intent", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              amount: game.costPerSession,
              gameId: game.id,
              gameName: game.game,
              paymentType: "one_time",
            }),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "Failed to initialize payment");
          }

          const data = await response.json();
          setClientSecret(data.clientSecret);
        } catch (err) {
          setError(err instanceof Error ? err.message : "Failed to initialize payment");
        } finally {
          setIsInitializingPayment(false);
        }
      }
    };

    initializePayment();
  }, [game, currentUserId]);

  const handlePaymentSuccess = async () => {
    setPaymentComplete(true);
    
    // Wait a moment before redirecting
    setTimeout(() => {
      router.push(`/games/${gameId}`);
    }, 2000);
  };

  const handlePaymentError = (errorMessage: string) => {
    setError(errorMessage);
  };

  if (isLoading) {
    return (
      <div className="mx-auto mt-10 max-w-2xl text-center">
        <p className="text-slate-400">Loading game details...</p>
      </div>
    );
  }

  if (!game) {
    return (
      <div className="mx-auto mt-10 max-w-2xl text-center">
        <p className="text-slate-400">Game not found</p>
      </div>
    );
  }

  if (!game.costPerSession || game.costPerSession <= 0) {
    return (
      <div className="mx-auto mt-10 max-w-2xl space-y-4">
        <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-8 text-slate-200">
          <h1 className="text-xl font-semibold text-slate-100">{game.game}</h1>
          <p className="mt-2 text-sm text-slate-400">
            This is a free game. No payment is required.
          </p>
        </div>
        <Link
          href={`/games/${gameId}`}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-sky-500 hover:text-sky-400"
        >
          ← Back to game details
        </Link>
      </div>
    );
  }

  // Check if user is on waitlist
  if (currentUserId && game.waitlist.includes(currentUserId)) {
    return (
      <div className="mx-auto mt-10 max-w-2xl space-y-4">
        <div className="rounded-xl border border-yellow-500/40 bg-yellow-500/10 p-8 text-slate-200">
          <h1 className="text-xl font-semibold text-slate-100">{game.game}</h1>
          <p className="mt-2 text-sm text-slate-400">
            You&apos;re currently on the waitlist for this game. You&apos;ll be able to proceed with payment once a spot becomes available and you&apos;re moved to the active players list.
          </p>
        </div>
        <Link
          href={`/games/${gameId}`}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-sky-500 hover:text-sky-400"
        >
          ← Back to game details
        </Link>
      </div>
    );
  }

  // Check if user is already a signed-up player (already paid)
  if (currentUserId && game.signedUpPlayers.includes(currentUserId)) {
    return (
      <div className="mx-auto mt-10 max-w-2xl space-y-4">
        <div className="rounded-xl border border-green-500/40 bg-green-500/10 p-8 text-slate-200">
          <h1 className="text-xl font-semibold text-slate-100">{game.game}</h1>
          <p className="mt-2 text-sm text-slate-400">
            You&apos;ve already completed payment for this game session.
          </p>
        </div>
        <Link
          href={`/games/${gameId}`}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-sky-500 hover:text-sky-400"
        >
          ← Back to game details
        </Link>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto mt-10 max-w-2xl space-y-4">
        <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-8">
          <h2 className="text-lg font-semibold text-red-400">Error</h2>
          <p className="mt-2 text-sm text-slate-300">{error}</p>
          {error === STRIPE_NOT_CONFIGURED_MESSAGE && (
            <p className="mt-3 text-xs text-slate-400">
              Please contact the site administrator to enable payment processing.
            </p>
          )}
        </div>
        <Link
          href={`/games/${gameId}`}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-sky-500 hover:text-sky-400"
        >
          ← Back to game details
        </Link>
      </div>
    );
  }

  if (paymentComplete) {
    return (
      <div className="mx-auto mt-10 max-w-2xl space-y-4">
        <div className="rounded-xl border border-green-500/40 bg-green-500/10 p-8 text-center">
          <div className="text-4xl mb-4">✓</div>
          <h2 className="text-lg font-semibold text-green-400">Payment Complete!</h2>
          <p className="mt-2 text-sm text-slate-300">
            Your payment has been processed successfully. You&apos;re now signed up for this game.
          </p>
          <p className="mt-3 text-xs text-slate-400">
            Redirecting you back to the game details...
          </p>
        </div>
      </div>
    );
  }

  if (isInitializingPayment || !clientSecret) {
    return (
      <div className="mx-auto mt-10 max-w-2xl text-center">
        <p className="text-slate-400">Initializing payment...</p>
      </div>
    );
  }

  if (!STRIPE_PUBLISHABLE_KEY) {
    return (
      <div className="mx-auto mt-10 max-w-2xl space-y-4">
        <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-8">
          <h2 className="text-lg font-semibold text-red-400">Configuration Error</h2>
          <p className="mt-2 text-sm text-slate-300">
            {STRIPE_NOT_CONFIGURED_MESSAGE}
          </p>
        </div>
        <Link
          href={`/games/${gameId}`}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-sky-500 hover:text-sky-400"
        >
          ← Back to game details
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto mt-10 max-w-2xl space-y-6">
      <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-8">
        <div className="mb-6 space-y-2">
          <h1 className="text-xl font-semibold text-slate-100">
            Pay for {game.game}
          </h1>
          <p className="text-sm text-slate-400">
            Complete your one-time payment to confirm your spot.
          </p>
          <p className="text-sm text-slate-300">
            Amount due: <span className="font-semibold text-slate-100">${game.costPerSession.toFixed(2)}</span>
          </p>
        </div>

        <StripePaymentForm
          clientSecret={clientSecret}
          paymentMode="payment"
          onSuccess={handlePaymentSuccess}
          onError={handlePaymentError}
        />
      </div>

      <Link
        href={`/games/${gameId}`}
        className="inline-flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-sky-500 hover:text-sky-400"
      >
        ← Back to game details
      </Link>
    </div>
  );
}
