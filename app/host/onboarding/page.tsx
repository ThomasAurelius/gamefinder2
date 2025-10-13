"use client";

import { useState, useEffect } from "react";

export default function HostOnboardingPage() {
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [checkingStatus, setCheckingStatus] = useState(true);
	const [accountStatus, setAccountStatus] = useState<{
		hasAccount: boolean;
		onboardingComplete: boolean;
	} | null>(null);

	// Check onboarding status on page load
	useEffect(() => {
		const checkStatus = async () => {
			try {
				const response = await fetch("/api/stripe/connect/status");
				if (response.ok) {
					const data = await response.json();
					setAccountStatus(data);
					
					// If already complete, redirect to dashboard
					if (data.onboardingComplete) {
						window.location.href = "/host/dashboard";
					}
				}
			} catch (err) {
				console.error("Failed to check onboarding status:", err);
			} finally {
				setCheckingStatus(false);
			}
		};

		checkStatus();
	}, []);

	const handleStartOnboarding = async () => {
		setIsLoading(true);
		setError(null);

		try {
			const response = await fetch("/api/stripe/connect/onboard", {
				method: "POST",
			});

			if (!response.ok) {
				const data = await response.json();
				throw new Error(data.error || "Failed to start onboarding");
			}

			const data = await response.json();
			
			// Redirect to Stripe onboarding
			window.location.href = data.url;
		} catch (err) {
			setError(
				err instanceof Error ? err.message : "Failed to start onboarding"
			);
			setIsLoading(false);
		}
	};

	const handleCancel = () => {
		window.location.href = "/dashboard";
	};

	if (checkingStatus) {
		return (
			<div className="flex min-h-screen items-center justify-center">
				<div className="text-slate-400">Checking onboarding status...</div>
			</div>
		);
	}

	return (
		<div className="mx-auto max-w-3xl px-4 py-12">
			<div className="space-y-6">
				<div>
					<h1 className="text-3xl font-bold text-slate-100">
						Host Onboarding
					</h1>
					<p className="mt-2 text-slate-400">
						Complete your Stripe onboarding to start receiving payments for your campaigns.
					</p>
				</div>

				<div className="rounded-xl border border-slate-800/60 bg-slate-900/40 p-8">
					<div className="space-y-6">
						<div>
							<h2 className="text-xl font-semibold text-slate-100">
								Set Up Payouts
							</h2>
							<p className="mt-2 text-sm text-slate-400">
								To host paid campaigns, you need to set up your payout account with Stripe.
								This is a secure process that allows you to receive payments directly.
							</p>
						</div>

						{accountStatus && !accountStatus.onboardingComplete && (
							<div className="rounded-lg border border-yellow-500/20 bg-yellow-500/10 p-4">
								<h3 className="font-medium text-yellow-400">
									Onboarding Not Complete
								</h3>
								<p className="mt-1 text-sm text-yellow-400/80">
									{accountStatus.hasAccount
										? "You've started the onboarding process but haven't completed it yet. Click below to continue."
										: "You haven't started the onboarding process yet. Click below to get started."}
								</p>
							</div>
						)}

						<div className="space-y-3">
							<h3 className="font-medium text-slate-100">What you&apos;ll need:</h3>
							<ul className="space-y-2 text-sm text-slate-400">
								<li className="flex items-start">
									<span className="mr-2">•</span>
									<span>Business or personal information</span>
								</li>
								<li className="flex items-start">
									<span className="mr-2">•</span>
									<span>Bank account details for receiving payouts</span>
								</li>
								<li className="flex items-start">
									<span className="mr-2">•</span>
									<span>Tax identification information (SSN or EIN)</span>
								</li>
							</ul>
						</div>

						<div className="space-y-3">
							<h3 className="font-medium text-slate-100">Payment Terms:</h3>
							<ul className="space-y-2 text-sm text-slate-400">
								<li className="flex items-start">
									<span className="mr-2">•</span>
									<span>You receive 85%* of subscription payments *minus fees</span>
								</li>
								<li className="flex items-start">
									<span className="mr-2">•</span>
									<span>Platform fee: 15% per subscription</span>
								</li>
								<li className="flex items-start">
									<span className="mr-2">•</span>
									<span>Payouts processed automatically by Stripe</span>
								</li>
							</ul>
						</div>

						{error && (
							<div className="rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
								{error}
							</div>
						)}

						<div className="flex gap-3">
							<button
								onClick={handleStartOnboarding}
								disabled={isLoading}
								className="flex-1 rounded-lg bg-sky-600 px-4 py-3 font-medium text-white transition hover:bg-sky-700 disabled:opacity-50"
							>
								{isLoading
									? "Starting onboarding..."
									: accountStatus?.hasAccount
									? "Continue Onboarding"
									: "Start Onboarding"}
							</button>
							<button
								onClick={handleCancel}
								className="rounded-lg border border-slate-700 px-4 py-3 font-medium text-slate-300 transition hover:bg-slate-800"
							>
								Cancel
							</button>
						</div>

						<p className="text-xs text-slate-500">
							By continuing, you agree to Stripe&apos;s{" "}
							<a
								href="https://stripe.com/connect-account/legal"
								target="_blank"
								rel="noopener noreferrer"
								className="text-sky-400 hover:underline"
							>
								Connected Account Agreement
							</a>
							.
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}
