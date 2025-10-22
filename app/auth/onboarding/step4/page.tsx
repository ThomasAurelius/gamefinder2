"use client";

import { useRouter } from "next/navigation";
import { AuthGuard } from "@/components/auth-guard";

export default function OnboardingStep4() {
	const router = useRouter();

	const handleComplete = async () => {
		try {
			// Mark onboarding as completed
			await fetch("/api/auth/complete-onboarding", {
				method: "POST",
			});
			
			// Redirect to dashboard
			router.push("/dashboard");
		} catch (error) {
			console.error("Failed to complete onboarding", error);
			// Still redirect even if the API call fails
			router.push("/dashboard");
		}
	};

	return (
		<AuthGuard>
			<div className="mx-auto max-w-5xl space-y-8 py-8">
				{/* Progress Indicator */}
				<div className="flex items-center justify-center gap-2">
					<div className="h-2 w-2 rounded-full bg-emerald-500" />
					<div className="h-2 w-2 rounded-full bg-emerald-500" />
					<div className="h-2 w-2 rounded-full bg-gradient-to-r from-amber-500 via-purple-500 to-indigo-500" />
				</div>

				<div className="mx-auto max-w-3xl space-y-6 rounded-2xl border border-white/10 bg-slate-900/60 p-8">
					<div className="text-center">
						<h1 className="text-3xl font-bold bg-gradient-to-r from-amber-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
							Welcome to The Gathering Call!
						</h1>
						<p className="mt-4 text-slate-300">
							Here&apos;s how to get the most out of your experience
						</p>
					</div>

					<div className="grid gap-6 md:grid-cols-2">
						{/* Games Feature */}
						<div className="rounded-xl border border-white/10 bg-slate-800/50 p-6">
							<div className="mb-4 flex items-center gap-3">
								<div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-amber-500 to-orange-500">
									<svg
										className="h-6 w-6 text-white"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth="2"
											d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
										/>
									</svg>
								</div>
								<h2 className="text-xl font-bold text-amber-400">
									One-Shot Games
								</h2>
							</div>
							<p className="text-sm text-slate-300">
								Find and join single-session games perfect for trying new
								systems, meeting new players, or filling your schedule with
								quick adventures. Great for casual play!
							</p>
							<ul className="mt-4 space-y-2 text-sm text-slate-400">
								<li className="flex items-start gap-2">
									<span className="text-amber-400">✓</span>
									<span>Browse available games near you</span>
								</li>
								<li className="flex items-start gap-2">
									<span className="text-amber-400">✓</span>
									<span>Join sessions that fit your schedule</span>
								</li>
								<li className="flex items-start gap-2">
									<span className="text-amber-400">✓</span>
									<span>Try different game systems</span>
								</li>
							</ul>
						</div>

						{/* Campaigns Feature */}
						<div className="rounded-xl border border-white/10 bg-slate-800/50 p-6">
							<div className="mb-4 flex items-center gap-3">
								<div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-purple-500 to-indigo-500">
									<svg
										className="h-6 w-6 text-white"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth="2"
											d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
										/>
									</svg>
								</div>
								<h2 className="text-xl font-bold text-purple-400">
									Campaigns
								</h2>
							</div>
							<p className="text-sm text-slate-300">
								Discover ongoing campaigns and commit to epic adventures
								with recurring sessions. Build lasting friendships and dive
								deep into immersive storytelling.
							</p>
							<ul className="mt-4 space-y-2 text-sm text-slate-400">
								<li className="flex items-start gap-2">
									<span className="text-purple-400">✓</span>
									<span>Join ongoing epic adventures</span>
								</li>
								<li className="flex items-start gap-2">
									<span className="text-purple-400">✓</span>
									<span>Build lasting groups</span>
								</li>
								<li className="flex items-start gap-2">
									<span className="text-purple-400">✓</span>
									<span>Track character progression</span>
								</li>
							</ul>
						</div>
					</div>

					{/* Additional Features */}
					<div className="rounded-xl border border-white/10 bg-slate-800/50 p-6">
						<h3 className="mb-4 text-lg font-semibold text-slate-100">
							More Ways to Connect
						</h3>
						<div className="grid gap-4 md:grid-cols-3">
							<div className="space-y-2">
								<div className="flex items-center gap-2">
									<svg
										className="h-5 w-5 text-sky-400"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth="2"
											d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
										/>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth="2"
											d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
										/>
									</svg>
									<h4 className="font-medium text-slate-200">
										Find Local Venues
									</h4>
								</div>
								<p className="text-xs text-slate-400">
									Discover game stores and venues near you
								</p>
							</div>
							<div className="space-y-2">
								<div className="flex items-center gap-2">
									<svg
										className="h-5 w-5 text-emerald-400"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth="2"
											d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
										/>
									</svg>
									<h4 className="font-medium text-slate-200">
										Browse Players
									</h4>
								</div>
								<p className="text-xs text-slate-400">
									Connect with fellow gamers in your area
								</p>
							</div>
							<div className="space-y-2">
								<div className="flex items-center gap-2">
									<svg
										className="h-5 w-5 text-rose-400"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth="2"
											d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
										/>
									</svg>
									<h4 className="font-medium text-slate-200">
										Share Stories
									</h4>
								</div>
								<p className="text-xs text-slate-400">
									Post tales from your adventures
								</p>
							</div>
						</div>
					</div>

					<div className="text-center">
						<button
							type="button"
							onClick={handleComplete}
							className="rounded-md bg-gradient-to-r from-amber-500 via-purple-500 to-indigo-500 px-8 py-3 text-base font-semibold text-white transition hover:from-amber-400 hover:via-purple-400 hover:to-indigo-400"
						>
							Get Started
						</button>
					</div>
				</div>
			</div>
		</AuthGuard>
	);
}
