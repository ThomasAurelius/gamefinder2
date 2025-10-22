"use client";

import { useState, type FormEvent, useEffect } from "react";
import { useRouter } from "next/navigation";
import { TIMEZONE_OPTIONS, DEFAULT_TIMEZONE } from "@/lib/timezone";
import SkipConfirmationModal from "@/components/SkipConfirmationModal";
import { AuthGuard } from "@/components/auth-guard";

export default function OnboardingStep2() {
	const router = useRouter();
	const [timezone, setTimezone] = useState<string>(DEFAULT_TIMEZONE);
	const [error, setError] = useState<string | null>(null);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [showSkipModal, setShowSkipModal] = useState(false);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		// Load current profile to check if user already has timezone set
		const loadProfile = async () => {
			try {
				const response = await fetch("/api/profile");
				if (response.ok) {
					const profile = await response.json();
					setTimezone(profile.timezone || DEFAULT_TIMEZONE);
				}
			} catch (error) {
				console.error("Failed to load profile:", error);
			} finally {
				setIsLoading(false);
			}
		};

		loadProfile();
	}, []);

	const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		setError(null);
		setIsSubmitting(true);

		try {
			const response = await fetch("/api/profile", {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					timezone,
				}),
			});

			if (!response.ok) {
				throw new Error("Failed to save timezone");
			}

			// Move to step 3
			router.push("/auth/onboarding/step3");
		} catch (submitError) {
			console.error("Failed to save timezone", submitError);
			setError("Failed to save timezone. Please try again.");
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleSkip = () => {
		setShowSkipModal(true);
	};

	const confirmSkip = () => {
		router.push("/auth/onboarding/step3");
	};

	return (
		<AuthGuard>
			<div className="mx-auto max-w-5xl space-y-8 py-8">
				{/* Progress Indicator */}
				<div className="flex items-center justify-center gap-2">
					<div className="h-2 w-2 rounded-full bg-emerald-500" />
					<div className="h-2 w-2 rounded-full bg-gradient-to-r from-amber-500 via-purple-500 to-indigo-500" />
					<div className="h-2 w-2 rounded-full bg-slate-700" />
					<div className="h-2 w-2 rounded-full bg-slate-700" />
				</div>

				<div className="mx-auto max-w-md space-y-6 rounded-2xl border border-white/10 bg-slate-900/60 p-8">
					<div className="text-center">
						<h1 className="text-3xl font-bold bg-gradient-to-r from-amber-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
							Set Your Timezone
						</h1>
						<p className="mt-4 text-sm text-slate-300">
							This helps us schedule games at the right time for you
						</p>
					</div>

					{isLoading ? (
						<div className="py-12 text-center">
							<p className="text-slate-400">Loading...</p>
						</div>
					) : (
						<form className="space-y-6" onSubmit={handleSubmit}>
							<label className="block text-sm">
								<span className="text-slate-200">Timezone</span>
								<select
									value={timezone}
									onChange={(e) => setTimezone(e.target.value)}
									className="mt-1 w-full rounded-md border border-white/10 bg-slate-950 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
								>
									{TIMEZONE_OPTIONS.map((tz) => (
										<option key={tz.value} value={tz.value}>
											{tz.label}
										</option>
									))}
								</select>
							</label>

							{error ? (
								<p className="text-sm text-rose-400" role="alert">
									{error}
								</p>
							) : null}

							<div className="flex gap-3">
								<button
									type="button"
									onClick={handleSkip}
									className="flex-1 rounded-md border border-white/10 bg-slate-800 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
								>
									Skip
								</button>
								<button
									type="submit"
									disabled={isSubmitting}
									className="flex-1 rounded-md bg-gradient-to-r from-amber-500 via-purple-500 to-indigo-500 px-4 py-3 text-sm font-semibold text-white transition hover:from-amber-400 hover:via-purple-400 hover:to-indigo-400 disabled:cursor-not-allowed disabled:opacity-70"
								>
									{isSubmitting ? "Saving..." : "Continue"}
								</button>
							</div>
						</form>
					)}
				</div>

				<SkipConfirmationModal
					isOpen={showSkipModal}
					onConfirm={confirmSkip}
					onCancel={() => setShowSkipModal(false)}
				/>
			</div>
		</AuthGuard>
	);
}
