"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";

export default function SettingsPage() {
  const searchParams = useSearchParams();
  const [isAdmin, setIsAdmin] = useState(false);
  const [announcement, setAnnouncement] = useState("");
  const [isActive, setIsActive] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  
  // Stripe Connect state
  const [stripeLoading, setStripeLoading] = useState(true);
  const [stripeConnecting, setStripeConnecting] = useState(false);
  const [stripeAccount, setStripeAccount] = useState<{
    hasAccount: boolean;
    onboardingComplete?: boolean;
    chargesEnabled?: boolean;
    payoutsEnabled?: boolean;
  }>({ hasAccount: false });
  const [stripeMessage, setStripeMessage] = useState("");

  useEffect(() => {
    async function checkAdminAndLoadAnnouncement() {
      try {
        // Check admin status
        const statusRes = await fetch("/api/admin/status");
        const statusData = await statusRes.json();
        setIsAdmin(statusData.isAdmin);

        // Load current announcement if admin
        if (statusData.isAdmin) {
          const announcementRes = await fetch("/api/announcements");
          const announcementData = await announcementRes.json();
          setAnnouncement(announcementData.message || "");
          setIsActive(announcementData.isActive || false);
        }
      } catch (error) {
        console.error("Failed to load settings:", error);
      } finally {
        setLoading(false);
      }
    }

    async function loadStripeAccount() {
      try {
        const response = await fetch("/api/stripe/connect");
        const data = await response.json();
        setStripeAccount(data);
        
        // Check for return from Stripe onboarding
        const stripeSuccess = searchParams.get("stripe_success");
        const stripeRefresh = searchParams.get("stripe_refresh");
        
        if (stripeSuccess) {
          setStripeMessage("Successfully connected to Stripe! Refreshing status...");
          // Refresh account status
          await refreshStripeStatus();
        } else if (stripeRefresh) {
          setStripeMessage("Please complete the Stripe setup process.");
        }
      } catch (error) {
        console.error("Failed to load Stripe account:", error);
      } finally {
        setStripeLoading(false);
      }
    }

    checkAdminAndLoadAnnouncement();
    loadStripeAccount();
  }, [searchParams]);

  const handleSaveAnnouncement = async () => {
    setSaving(true);
    setMessage("");

    try {
      const response = await fetch("/api/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: announcement, isActive }),
      });

      if (!response.ok) {
        throw new Error("Failed to save announcement");
      }

      setMessage("Announcement saved successfully!");
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      console.error("Failed to save announcement:", error);
      setMessage("Failed to save announcement. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleConnectStripe = async () => {
    setStripeConnecting(true);
    setStripeMessage("");

    try {
      const response = await fetch("/api/stripe/connect", {
        method: "POST",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to connect to Stripe");
      }

      // Redirect to Stripe onboarding
      window.location.href = data.url;
    } catch (error) {
      console.error("Failed to connect Stripe:", error);
      setStripeMessage(error instanceof Error ? error.message : "Failed to connect to Stripe");
      setStripeConnecting(false);
    }
  };

  const refreshStripeStatus = async () => {
    try {
      const response = await fetch("/api/stripe/account-status", {
        method: "POST",
      });

      const data = await response.json();

      if (response.ok) {
        setStripeAccount({
          hasAccount: true,
          onboardingComplete: data.onboardingComplete,
          chargesEnabled: data.chargesEnabled,
          payoutsEnabled: data.payoutsEnabled,
        });
        setStripeMessage("Status refreshed successfully!");
        setTimeout(() => setStripeMessage(""), 3000);
      }
    } catch (error) {
      console.error("Failed to refresh Stripe status:", error);
    }
  };

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-semibold">Settings</h1>
      <p className="text-sm text-slate-300">
        Configure account security, notification preferences, and connected
        services from this settings hub.
      </p>

      <div className="space-y-6 rounded-2xl border border-slate-800/60 bg-slate-900/40 p-6 shadow-lg shadow-slate-900/30">
        <div className="space-y-4">
          <div className="rounded-lg border border-slate-700/50 bg-slate-800/30 p-4">
            <h2 className="text-sm font-medium text-slate-200">Profile Settings</h2>
            <p className="mt-2 text-xs text-slate-400">
              Timezone and other profile settings are now managed in your Profile page.
            </p>
            <Link
              href="/profile"
              className="mt-3 inline-block rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-sky-700"
            >
              Go to Profile
            </Link>
          </div>

          {/* Stripe Connect Section */}
          <div className="rounded-lg border border-emerald-700/50 bg-emerald-900/20 p-4">
            <h2 className="text-sm font-medium text-emerald-200">
              Payment Processing for DMs
            </h2>
            <p className="mt-2 text-xs text-slate-400">
              Connect your Stripe account to receive payments for paid campaigns. We charge a 15% platform fee on the amount after Stripe fees.
            </p>

            {stripeLoading ? (
              <div className="mt-4">
                <p className="text-sm text-slate-400">Loading payment settings...</p>
              </div>
            ) : stripeAccount.hasAccount && stripeAccount.onboardingComplete ? (
              <div className="mt-4 space-y-3">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-emerald-500"></div>
                  <span className="text-sm text-emerald-300">
                    Stripe Connected
                  </span>
                </div>
                
                <div className="space-y-1 text-xs text-slate-400">
                  <div className="flex items-center gap-2">
                    <span>Charges Enabled:</span>
                    <span className={stripeAccount.chargesEnabled ? "text-emerald-400" : "text-amber-400"}>
                      {stripeAccount.chargesEnabled ? "Yes" : "No"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>Payouts Enabled:</span>
                    <span className={stripeAccount.payoutsEnabled ? "text-emerald-400" : "text-amber-400"}>
                      {stripeAccount.payoutsEnabled ? "Yes" : "No"}
                    </span>
                  </div>
                </div>

                <button
                  onClick={refreshStripeStatus}
                  className="rounded-lg border border-emerald-600 bg-emerald-600/10 px-4 py-2 text-sm font-medium text-emerald-300 transition hover:bg-emerald-600/20"
                >
                  Refresh Status
                </button>

                {stripeMessage && (
                  <p className={`text-sm ${stripeMessage.includes("success") ? "text-emerald-400" : "text-amber-400"}`}>
                    {stripeMessage}
                  </p>
                )}
              </div>
            ) : (
              <div className="mt-4 space-y-3">
                {stripeAccount.hasAccount && !stripeAccount.onboardingComplete && (
                  <div className="rounded-md bg-amber-900/20 border border-amber-700/50 p-3">
                    <p className="text-xs text-amber-200">
                      Your Stripe setup is incomplete. Please complete the onboarding process.
                    </p>
                  </div>
                )}

                <button
                  onClick={handleConnectStripe}
                  disabled={stripeConnecting}
                  className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {stripeConnecting ? "Connecting..." : stripeAccount.hasAccount ? "Complete Setup" : "Connect Stripe Account"}
                </button>

                {stripeMessage && (
                  <p className="text-sm text-rose-400">
                    {stripeMessage}
                  </p>
                )}

                <p className="text-xs text-slate-500">
                  By connecting Stripe, you agree to receive payments through the platform. Standard Stripe fees apply, plus a 15% platform fee.
                </p>
              </div>
            )}
          </div>
          
          {loading ? (
            <div className="rounded-lg border border-slate-700/50 bg-slate-800/30 p-4">
              <p className="text-sm text-slate-400">Loading...</p>
            </div>
          ) : isAdmin ? (
            <div className="rounded-lg border border-amber-700/50 bg-amber-900/20 p-4">
              <h2 className="text-sm font-medium text-amber-200">
                Admin: Site Announcement
              </h2>
              <p className="mt-2 text-xs text-slate-400">
                Create an announcement that will be displayed to users when they first visit the site.
              </p>
              
              <div className="mt-4 space-y-3">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="h-5 w-5 rounded border-slate-700 bg-slate-950/60 text-amber-500 outline-none transition focus:ring-2 focus:ring-amber-500/40"
                  />
                  <span className="text-sm text-slate-200">
                    Show announcement to users
                  </span>
                </label>

                <textarea
                  value={announcement}
                  onChange={(e) => setAnnouncement(e.target.value)}
                  placeholder="Enter announcement message..."
                  rows={4}
                  className="w-full rounded-md border border-slate-700 bg-slate-950/60 px-3 py-2 text-sm text-slate-100 outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-500/40"
                />

                <button
                  onClick={handleSaveAnnouncement}
                  disabled={saving}
                  className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save Announcement"}
                </button>

                {message && (
                  <p className={`text-sm ${message.includes("success") ? "text-emerald-400" : "text-rose-400"}`}>
                    {message}
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="rounded-lg border border-slate-700/50 bg-slate-800/30 p-4">
              <p className="text-sm text-slate-400">
                Additional settings will be available here in the future.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
