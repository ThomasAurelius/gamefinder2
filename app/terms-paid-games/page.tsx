"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function CoinIcon({ className }: { className?: string }) {
        return (
                <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className={className}
                        aria-hidden="true"
                >
                        <circle cx="12" cy="12" r="9" />
                        <path d="M8 12h8" />
                        <path d="M12 8v8" />
                </svg>
        );
}

function ContractIcon({ className }: { className?: string }) {
        return (
                <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className={className}
                        aria-hidden="true"
                >
                        <path d="M7 2h10a2 2 0 0 1 2 2v16l-4-3-4 3-4-3-4 3V4a2 2 0 0 1 2-2z" />
                        <path d="M9 7h6" />
                        <path d="M9 11h6" />
                </svg>
        );
}

function SparklesIcon({ className }: { className?: string }) {
        return (
                <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className={className}
                        aria-hidden="true"
                >
                        <path d="M12 3v4" />
                        <path d="M12 17v4" />
                        <path d="M3 12h4" />
                        <path d="M17 12h4" />
                        <path d="m5 5 3 3" />
                        <path d="m16 16 3 3" />
                        <path d="m16 5 3 3" />
                        <path d="m5 16 3 3" />
                </svg>
        );
}

function PaidGamesTermsContent() {
        const router = useRouter();
        const searchParams = useSearchParams();
        const [accepted, setAccepted] = useState(false);
        const [isSubmitting, setIsSubmitting] = useState(false);
        const [error, setError] = useState("");
        const fromSettings = searchParams.get("from") === "settings";
        const fromPostCampaign = searchParams.get("from") === "post-campaign";
        const fromPost = searchParams.get("from") === "post";

        const handleAccept = async () => {
                if (!accepted) {
                        setError("You must accept the terms and conditions to continue");
                        return;
                }

                setIsSubmitting(true);
                setError("");

                try {
                        const response = await fetch("/api/profile/enable-paid-games", {
                                method: "POST",
                                headers: {
                                        "Content-Type": "application/json",
                                },
                        });

                        if (!response.ok) {
                                const errorData = await response.json();
                                throw new Error(errorData.error || "Failed to enable paid games");
                        }

                        // Redirect based on where the user came from
                        if (fromPostCampaign || fromPost) {
                                router.push("/host/dashboard");
                        } else if (fromSettings) {
                                router.push("/settings");
                        } else {
                                router.push("/profile");
                        }
                } catch (err) {
                        setError(
                                err instanceof Error ? err.message : "Failed to enable paid games"
                        );
                } finally {
                        setIsSubmitting(false);
                }
        };

        return (
                <div className="mx-auto max-w-5xl space-y-8 py-8">
                        <div className="rounded-3xl border-2 border-amber-500/50 bg-gradient-to-br from-amber-600/20 via-purple-600/20 to-indigo-600/20 p-8 shadow-2xl">
                                <div className="text-center space-y-4">
                                        <div className="flex justify-center gap-4">
                                                <CoinIcon className="h-8 w-8 text-amber-400" />
                                                <ContractIcon className="h-8 w-8 text-purple-200" />
                                                <SparklesIcon className="h-8 w-8 text-indigo-300" />
                                        </div>
                                        <h1 className="text-4xl font-bold bg-gradient-to-r from-amber-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
                                                Paid Games Terms &amp; Conditions
                                        </h1>
                                        <p className="text-slate-200 max-w-2xl mx-auto">
                                                Understand the program, confirm the expectations, and unlock paid campaigns with confidence.
                                        </p>
                                </div>
                        </div>

                        <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
                                <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-8 shadow-xl">
                                        <div className="space-y-6 text-sm leading-relaxed text-slate-300">
                                                <h2 className="text-2xl font-semibold text-amber-300">Program Overview</h2>
                                                <div className="space-y-4">
                                                        <div>
                                                                <h3 className="text-base font-semibold text-slate-100">1. Payment Processing</h3>
                                                                <p>
                                                                        All payments for paid game sessions are processed securely through Stripe. By enabling paid games, you agree to Stripe&apos;s terms of service and authorize us to process payments on your behalf.
                                                                </p>
                                                        </div>
                                                        <div>
                                                                <h3 className="text-base font-semibold text-slate-100">2. Platform Fee</h3>
                                                                <p>
                                                                        <strong className="text-slate-100">The platform operator will retain 15% of each paid game fee.</strong> The remaining 85% will be paid to you (the game host) after deducting payment processing fees.
                                                                </p>
                                                                <p className="text-xs text-slate-400">
                                                                        Example: Charging $10 per session results in a $1.50 platform fee. After Stripe&apos;s $0.30 + 2.9% processing fee, you receive approximately $7.91.
                                                                </p>
                                                        </div>
                                                        <div>
                                                                <h3 className="text-base font-semibold text-slate-100">3. Host Responsibilities</h3>
                                                                <ul className="list-disc list-inside space-y-2 text-slate-200/80">
                                                                        <li>Provide the game sessions as advertised and agreed upon with players</li>
                                                                        <li>Maintain professional conduct and deliver a quality gaming experience</li>
                                                                        <li>Honor all scheduled sessions or offer appropriate refunds</li>
                                                                        <li>Communicate clearly with players about session details, requirements, and changes</li>
                                                                </ul>
                                                        </div>
                                                        <div>
                                                                <h3 className="text-base font-semibold text-slate-100">4. Refund Policy</h3>
                                                                <p>
                                                                        Refunds are at the discretion of the game host and must be processed through the platform. Hosts are expected to provide refunds for canceled or undelivered sessions. Repeated refund requests or payment disputes may result in suspension of paid game privileges.
                                                                </p>
                                                        </div>
                                                        <div>
                                                                <h3 className="text-base font-semibold text-slate-100">5. Compliance and Tax Obligations</h3>
                                                                <p>
                                                                        You are responsible for complying with all applicable laws and regulations, including reporting income and paying taxes on earnings from paid game sessions. The platform will provide necessary tax documentation as required by law.
                                                                </p>
                                                        </div>
                                                        <div>
                                                                <h3 className="text-base font-semibold text-slate-100">6. Account Suspension</h3>
                                                                <p>
                                                                        The platform reserves the right to suspend or revoke paid game privileges for violations of these terms, fraud, excessive disputes, or conduct that harms the community or platform reputation.
                                                                </p>
                                                        </div>
                                                        <div>
                                                                <h3 className="text-base font-semibold text-slate-100">7. Changes to Terms</h3>
                                                                <p>
                                                                        These terms may be updated from time to time. Continued use of paid game features after changes constitutes acceptance of the updated terms. You will be notified of significant changes via email or platform notification.
                                                                </p>
                                                        </div>
                                                </div>
                                        </div>
                                </div>

                                <div className="space-y-6">
                                        <div className="rounded-2xl border border-indigo-500/40 bg-slate-900/70 p-6 shadow-xl">
                                                <h3 className="text-lg font-semibold text-indigo-200">Enable Paid Games</h3>
                                                <p className="mt-2 text-sm text-slate-300">
                                                        Confirm you understand the program details to unlock zero-hassle payments and promote professional sessions.
                                                </p>
                                                <div className="mt-4 flex items-start gap-3">
                                                        <input
                                                                type="checkbox"
                                                                checked={accepted}
                                                                onChange={(event) => setAccepted(event.target.checked)}
                                                                className="mt-1 h-5 w-5 rounded border-white/20 bg-slate-950 text-indigo-400 focus:ring-2 focus:ring-indigo-400/60"
                                                        />
                                                        <span className="text-sm text-slate-200">
                                                                I have read and agree to the Paid Games Terms and Conditions, including the 15% platform fee on all paid game sessions.
                                                        </span>
                                                </div>
                                                {error ? (
                                                        <div className="mt-4 rounded-lg border border-rose-500/40 bg-rose-500/10 p-3 text-sm text-rose-100">
                                                                {error}
                                                        </div>
                                                ) : null}
                                                <div className="mt-6 flex flex-col gap-3">
                                                        <button
                                                                type="button"
                                                                onClick={handleAccept}
                                                                disabled={!accepted || isSubmitting}
                                                                className="rounded-lg bg-gradient-to-r from-amber-500 via-purple-500 to-indigo-500 px-4 py-3 text-sm font-semibold text-white transition hover:from-amber-400 hover:via-purple-400 hover:to-indigo-400 disabled:cursor-not-allowed disabled:opacity-70"
                                                        >
                                                                {isSubmitting ? "Processing..." : "Accept and Enable Paid Games"}
                                                        </button>
                                                        <Link
                                                                href={fromPostCampaign ? "/post-campaign" : fromPost ? "/post" : fromSettings ? "/settings" : "/profile"}
                                                                className="rounded-lg border border-white/10 px-4 py-3 text-center text-sm font-medium text-slate-200 transition hover:border-white/30"
                                                        >
                                                                Cancel
                                                        </Link>
                                                </div>
                                        </div>

                                        <div className="rounded-2xl border border-amber-500/40 bg-amber-500/10 p-6 shadow-xl">
                                                <h3 className="text-lg font-semibold text-amber-200">Need help first?</h3>
                                                <p className="mt-2 text-sm text-amber-100/80">
                                                        Review best practices in our <Link href="/about-hosting-paid-games" className="text-amber-100 underline decoration-amber-300/60 underline-offset-4 transition hover:text-amber-50">paid hosting guide</Link> or reach out to <Link href="/support" className="text-amber-100 underline decoration-amber-300/60 underline-offset-4 transition hover:text-amber-50">support</Link> before enabling payments.
                                                </p>
                                        </div>
                                </div>
                        </div>
                </div>
        );
}

export default function PaidGamesTermsPage() {
        return (
                <Suspense
                        fallback={
                                <div className="mx-auto max-w-3xl space-y-4 py-8">
                                        <div className="rounded-3xl border-2 border-amber-500/40 bg-gradient-to-r from-amber-500/10 via-purple-500/10 to-indigo-500/10 p-8 text-center shadow-2xl">
                                                <h1 className="text-3xl font-semibold text-slate-100">Paid Games Terms &amp; Conditions</h1>
                                                <p className="mt-3 text-sm text-slate-300">Loading terms and conditions...</p>
                                        </div>
                                </div>
                        }
                >
                        <PaidGamesTermsContent />
                </Suspense>
        );
}
