"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function PaidGamesTermsContent() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const [accepted, setAccepted] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [error, setError] = useState("");
	const fromSettings = searchParams.get("from") === "settings";

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

			// Redirect to settings or profile page
			router.push(fromSettings ? "/settings" : "/profile");
		} catch (err) {
			setError(
				err instanceof Error ? err.message : "Failed to enable paid games"
			);
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<section className="space-y-6">
			<div>
				<h1 className="text-2xl font-semibold text-slate-100">
					Paid Games Terms and Conditions
				</h1>
				<p className="mt-2 text-sm text-slate-400">
					Please read and accept these terms to enable posting paid
					campaigns.
				</p>
			</div>

			<div className="space-y-4 rounded-2xl border border-slate-800/60 bg-slate-900/40 p-6 shadow-lg shadow-slate-900/30">
				<div className="space-y-4 text-sm text-slate-300 leading-relaxed">
					<h2 className="text-lg font-semibold text-slate-100">
						Terms of Service for Paid Games
					</h2>

					<div className="space-y-3">
						<h3 className="text-base font-medium text-slate-200">
							1. Payment Processing
						</h3>
						<p>
							All payments for paid game sessions are processed securely
							through Stripe. By enabling paid games, you agree to
							Stripe&apos;s terms of service and authorize us to process
							payments on your behalf.
						</p>
					</div>

					<div className="space-y-3">
						<h3 className="text-base font-medium text-slate-200">
							2. Platform Fee
						</h3>
						<p>
							<strong className="text-slate-100">
								The platform operator will retain 15% of each paid game
								fee.
							</strong>{" "}
							The remaining 85% will be paid to you (the game host) after
							deducting payment processing fees.
						</p>
						<p className="text-slate-400 text-xs">
							Example: If you charge $10 per session, the platform will
							retain $1.50 and you will receive the remainder, minus
							payment processing fees. Stripe&apos;s fee is $0.30 + 2.9%
							per transaction, you would receive approximately $7.91 per
							session.
						</p>
					</div>

					<div className="space-y-3">
						<h3 className="text-base font-medium text-slate-200">
							3. Host Responsibilities
						</h3>
						<ul className="list-disc list-inside space-y-2 ml-2">
							<li>
								You must provide the game sessions as advertised and
								agreed upon with players
							</li>
							<li>
								You are responsible for maintaining professional conduct
								and providing a quality gaming experience
							</li>
							<li>
								You must honor all scheduled sessions or provide
								appropriate refunds
							</li>
							<li>
								You agree to communicate clearly with players about
								session details, requirements, and any changes
							</li>
						</ul>
					</div>

					<div className="space-y-3">
						<h3 className="text-base font-medium text-slate-200">
							4. Refund Policy
						</h3>
						<p>
							Refunds are at the discretion of the game host and must be
							processed through the platform. Hosts are expected to
							provide refunds for canceled or undelivered sessions.
							Repeated refund requests or payment disputes may result in
							suspension of paid game privileges.
						</p>
					</div>

					<div className="space-y-3">
						<h3 className="text-base font-medium text-slate-200">
							5. Compliance and Tax Obligations
						</h3>
						<p>
							You are responsible for complying with all applicable laws
							and regulations, including reporting income and paying
							taxes on earnings from paid game sessions. The platform
							will provide necessary tax documentation as required by
							law.
						</p>
					</div>

					<div className="space-y-3">
						<h3 className="text-base font-medium text-slate-200">
							6. Account Suspension
						</h3>
						<p>
							The platform reserves the right to suspend or revoke paid
							game privileges for violations of these terms, fraud,
							excessive disputes, or conduct that harms the community or
							platform reputation.
						</p>
					</div>

					<div className="space-y-3">
						<h3 className="text-base font-medium text-slate-200">
							7. Changes to Terms
						</h3>
						<p>
							These terms may be updated from time to time. Continued use
							of paid game features after changes constitutes acceptance
							of the updated terms. You will be notified of significant
							changes via email or platform notification.
						</p>
					</div>
				</div>

				<div className="mt-6 pt-6 border-t border-slate-800">
					<label className="flex items-start gap-3 cursor-pointer">
						<input
							type="checkbox"
							checked={accepted}
							onChange={(e) => setAccepted(e.target.checked)}
							className="mt-1 h-5 w-5 rounded border-slate-700 bg-slate-950/60 text-sky-500 focus:ring-2 focus:ring-sky-500/40"
						/>
						<span className="text-sm text-slate-300">
							I have read and agree to the Paid Games Terms and
							Conditions, including the 15% platform fee on all paid game
							sessions.
						</span>
					</label>
				</div>

				{error && (
					<div className="rounded-lg bg-red-900/20 border border-red-800 p-3">
						<p className="text-sm text-red-200">{error}</p>
					</div>
				)}

				<div className="flex gap-3">
					<button
						type="button"
						onClick={handleAccept}
						disabled={!accepted || isSubmitting}
						className="flex-1 rounded-xl bg-sky-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-50"
					>
						{isSubmitting
							? "Processing..."
							: "Accept and Enable Paid Games"}
					</button>
					<Link
						href={fromSettings ? "/settings" : "/profile"}
						className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm font-medium text-slate-200 transition hover:border-slate-500 text-center"
					>
						Cancel
					</Link>
				</div>
			</div>
		</section>
	);
}

export default function PaidGamesTermsPage() {
	return (
		<Suspense
			fallback={
				<section className="space-y-6">
					<div>
						<h1 className="text-2xl font-semibold text-slate-100">
							Paid Games Terms and Conditions
						</h1>
						<p className="mt-2 text-sm text-slate-400">
							Loading terms and conditions...
						</p>
					</div>
				</section>
			}
		>
			<PaidGamesTermsContent />
		</Suspense>
	);
}
