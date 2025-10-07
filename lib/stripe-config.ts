// lib/stripe-config.ts
"use client";

// Export the Stripe publishable key so Next.js inlines NEXT_PUBLIC_* properly in the client bundle
export const STRIPE_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "";

// Runtime validation (client-only)
if (typeof window !== "undefined" && (!STRIPE_PUBLISHABLE_KEY || STRIPE_PUBLISHABLE_KEY === "undefined")) {
  console.warn(
    "[stripe-config] Missing NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY. Check your .env.local and restart dev server."
  );
}
