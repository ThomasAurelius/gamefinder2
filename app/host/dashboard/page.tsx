"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

type ConnectStatus = {
	hasAccount: boolean;
	accountId: string | null;
	onboardingComplete: boolean;
	detailsSubmitted: boolean;
	chargesEnabled: boolean;
	payoutsEnabled: boolean;
	requirements: string[];
};

export default function HostDashboardPage() {
	const [status, setStatus] = useState<ConnectStatus | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [isDashboardLoading, setIsDashboardLoading] = useState(false);

	useEffect(() => {
		const fetchStatus = async () => {
			try {
				const response = await fetch("/api/stripe/connect/status");
				if (response.ok) {
					const data = await response.json();
					setStatus(data);
				} else {
					const data = await response.json();
					setError(data.error || "Failed to load status");
				}
			} catch (err) {
				setError(
					err instanceof Error
						? err.message
						: "Failed to load Connect status"
				);
			} finally {
				setIsLoading(false);
			}
		};

		fetchStatus();
	}, []);

	const handleOpenDashboard = async () => {
		setIsDashboardLoading(true);
		setError(null);

		try {
			const response = await fetch("/api/stripe/connect/dashboard", {
				method: "POST",
			});

			if (!response.ok) {
				const data = await response.json();
				throw new Error(data.error || "Failed to open dashboard");
			}

			const data = await response.json();

			// Open Stripe Express Dashboard in new tab
			window.open(data.url, "_blank");
		} catch (err) {
			setError(
				err instanceof Error ? err.message : "Failed to open dashboard"
			);
		} finally {
			setIsDashboardLoading(false);
		}
	};

	if (isLoading) {
		return (
			<div className="flex min-h-screen items-center justify-center">
				<div className="text-slate-400">Loading dashboard...</div>
			</div>
		);
	}

	return (
		<div className="mx-auto max-w-5xl px-4 py-12">
			<div className="space-y-6">
				<div>
					<h1 className="text-3xl font-bold text-slate-100">
						Host Dashboard
					</h1>
					<p className="mt-2 text-slate-400">
						Manage your payout settings and view your earnings
					</p>
				</div>

				{error && (
					<div className="rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
						{error}
					</div>
				)}

				{/* Onboarding Status */}
				<div className="rounded-xl border border-slate-800/60 bg-slate-900/40 p-6">
					<h2 className="text-xl font-semibold text-slate-100">
						Payout Account Status
					</h2>

					{status && !status.onboardingComplete ? (
						<div className="mt-4 space-y-4">
							<div className="rounded-lg border border-yellow-500/20 bg-yellow-500/10 p-4">
								<h3 className="font-medium text-yellow-400">
									Action Required
								</h3>
								<p className="mt-1 text-sm text-yellow-400/80">
									{!status.hasAccount
										? "You need to complete onboarding to start receiving payments from your campaigns."
										: "Your onboarding is incomplete. Please complete the required steps to activate your account."}
								</p>
							</div>

							{status.hasAccount && (
								<div className="space-y-2 text-sm text-slate-400">
									<div className="flex items-center gap-2">
										<div
											className={`h-2 w-2 rounded-full ${
												status.detailsSubmitted
													? "bg-emerald-500"
													: "bg-slate-600"
											}`}
										/>
										<span>Details Submitted</span>
									</div>
									<div className="flex items-center gap-2">
										<div
											className={`h-2 w-2 rounded-full ${
												status.chargesEnabled
													? "bg-emerald-500"
													: "bg-slate-600"
											}`}
										/>
										<span>Charges Enabled</span>
									</div>
									<div className="flex items-center gap-2">
										<div
											className={`h-2 w-2 rounded-full ${
												status.payoutsEnabled
													? "bg-emerald-500"
													: "bg-slate-600"
											}`}
										/>
										<span>Payouts Enabled</span>
									</div>
								</div>
							)}

							<Link
								href="/host/onboarding"
								className="inline-block rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-sky-700"
							>
								{status.hasAccount
									? "Complete Onboarding"
									: "Start Onboarding"}
							</Link>
						</div>
					) : status?.onboardingComplete ? (
						<div className="mt-4 space-y-4">
							<div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-4">
								<div className="flex items-center gap-2">
									<div className="h-2 w-2 rounded-full bg-emerald-500" />
									<h3 className="font-medium text-emerald-400">
										Account Active
									</h3>
								</div>
								<p className="mt-1 text-sm text-emerald-400/80">
									Your payout account is fully set up and ready to
									receive payments.
								</p>
							</div>

							<button
								onClick={handleOpenDashboard}
								disabled={isDashboardLoading}
								className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-sky-700 disabled:opacity-50"
							>
								{isDashboardLoading
									? "Opening Dashboard..."
									: "Open Stripe Dashboard"}
							</button>
						</div>
					) : null}
				</div>

				{/* Payment Terms */}
				<div className="rounded-xl border border-slate-800/60 bg-slate-900/40 p-6">
					<h2 className="text-xl font-semibold text-slate-100">
						Payment Terms
					</h2>
					<div className="mt-4 space-y-3 text-sm text-slate-400">
						<div className="flex items-start gap-3">
							<div className="rounded-full bg-slate-800 p-2 text-sky-400">
								<svg
									className="h-4 w-4"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
									/>
								</svg>
							</div>
							<div>
								<div className="font-medium text-slate-300">
									You Receive: 80%*
								</div>
								<div className="text-slate-500">
									Of each subscription payment *minus fees
								</div>
							</div>
						</div>
						<div className="flex items-start gap-3">
							<div className="rounded-full bg-slate-800 p-2 text-slate-400">
								<svg
									className="h-4 w-4"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
									/>
								</svg>
							</div>
							<div>
								<div className="font-medium text-slate-300">
									Platform Fee: 20%
								</div>
								<div className="text-slate-500">
									Covers hosting, payment processing, and support
								</div>
							</div>
						</div>
						<div className="flex items-start gap-3">
							<div className="rounded-full bg-slate-800 p-2 text-emerald-400">
								<svg
									className="h-4 w-4"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
									/>
								</svg>
							</div>
							<div>
								<div className="font-medium text-slate-300">
									Automatic Payouts
								</div>
								<div className="text-slate-500">
									Processed by Stripe according to your payout schedule
								</div>
							</div>
						</div>
					</div>
				</div>

				{/* Quick Actions */}
				<div className="rounded-xl border border-slate-800/60 bg-slate-900/40 p-6">
					<h2 className="text-xl font-semibold text-slate-100">
						Quick Actions
					</h2>
					<div className="mt-4 grid gap-3 sm:grid-cols-2">
						<Link
							href="/dashboard"
							className="rounded-lg border border-slate-700 p-4 text-sm transition hover:border-slate-600 hover:bg-slate-800/50"
						>
							<div className="font-medium text-slate-300">
								View My Campaigns
							</div>
							<div className="mt-1 text-slate-500">
								See all campaigns you&apos;re hosting or playing
							</div>
						</Link>
						<Link
							href="/create"
							className="rounded-lg border border-slate-700 p-4 text-sm transition hover:border-slate-600 hover:bg-slate-800/50"
						>
							<div className="font-medium text-slate-300">
								Create New Campaign
							</div>
							<div className="mt-1 text-slate-500">
								Start hosting a new game session
							</div>
						</Link>
					</div>
				</div>
			</div>
		</div>
	);
}
