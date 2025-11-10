"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";

type Referral = {
	id: string;
	name: string;
	commonName: string;
	avatarUrl: string;
	joinedAt: Date;
};

type ReferrerGroup = {
	referrer: {
		id: string;
		name: string;
		commonName: string;
	};
	referrals: Referral[];
};

export default function ReferralsPage() {
	const router = useRouter();
	const [referralsByReferrer, setReferralsByReferrer] = useState<ReferrerGroup[]>([]);
	const [totalReferrals, setTotalReferrals] = useState(0);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		async function loadReferrals() {
			try {
				const response = await fetch("/api/admin/referrals");
				
				if (response.status === 403) {
					// User is not admin, redirect to settings
					router.push("/settings");
					return;
				}

				if (!response.ok) {
					throw new Error("Failed to fetch referrals");
				}

				const data = await response.json();
				setReferralsByReferrer(data.referralsByReferrer || []);
				setTotalReferrals(data.totalReferrals || 0);
			} catch (err) {
				console.error("Error loading referrals:", err);
				setError("Failed to load referrals. Please try again later.");
			} finally {
				setLoading(false);
			}
		}

		loadReferrals();
	}, [router]);

	const formatDate = (date: Date | string) => {
		const d = new Date(date);
		return d.toLocaleDateString("en-US", {
			year: "numeric",
			month: "long",
			day: "numeric",
		});
	};

	return (
		<section className="space-y-4">
			<div className="flex items-center gap-4">
				<Link
					href="/settings"
					className="rounded-lg bg-slate-800 px-3 py-2 text-sm text-slate-200 hover:bg-slate-700 transition"
				>
					← Back to Settings
				</Link>
			</div>

			<h1 className="text-2xl font-semibold">All Referrals (Admin)</h1>
			<p className="text-sm text-slate-300">
				View all users who have been referred to the platform, grouped by referrer.
			</p>

			<div className="space-y-6 rounded-2xl border border-slate-800/60 bg-slate-900/40 p-6 shadow-lg shadow-slate-900/30">
				{loading ? (
					<div className="rounded-lg border border-slate-700/50 bg-slate-800/30 p-4">
						<p className="text-sm text-slate-400">Loading referrals...</p>
					</div>
				) : error ? (
					<div className="rounded-lg border border-red-700/50 bg-red-900/20 p-4">
						<p className="text-sm text-red-400">{error}</p>
					</div>
				) : (
					<>
						{/* Summary Section */}
						<div className="rounded-lg border border-emerald-700/50 bg-emerald-900/20 p-4">
							<h2 className="text-lg font-medium text-emerald-200">
								Total Referrals: {totalReferrals}
							</h2>
							<p className="mt-2 text-sm text-slate-400">
								{totalReferrals === 0
									? "No referrals found."
									: `${referralsByReferrer.length} ${referralsByReferrer.length === 1 ? "user has" : "users have"} referred ${totalReferrals} ${totalReferrals === 1 ? "person" : "people"}.`}
							</p>
						</div>

						{/* Referrals by Referrer */}
						{referralsByReferrer.length > 0 && (
							<div className="space-y-6">
								{referralsByReferrer.map((group) => (
									<div
										key={group.referrer.id}
										className="rounded-lg border border-slate-700/50 bg-slate-800/30 p-4 space-y-3"
									>
										{/* Referrer Header */}
										<div className="flex items-center justify-between border-b border-slate-700 pb-3">
											<div>
												<h3 className="text-base font-medium text-slate-200">
													{group.referrer.commonName || group.referrer.name}
												</h3>
												<p className="text-xs text-slate-400">
													{group.referrals.length} {group.referrals.length === 1 ? "referral" : "referrals"}
												</p>
											</div>
											<Link
												href={`/user/${group.referrer.id}`}
												className="rounded-lg bg-sky-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-sky-700"
											>
												View Profile
											</Link>
										</div>

										{/* Referred Users */}
										<div className="space-y-2">
											{group.referrals.map((referral) => (
												<div
													key={referral.id}
													className="flex items-center gap-4 rounded-lg border border-slate-700/50 bg-slate-900/50 p-3"
												>
													{/* Avatar */}
													<div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-full border border-slate-700">
														{referral.avatarUrl ? (
															<Image
																src={referral.avatarUrl}
																alt={referral.commonName || referral.name}
																fill
																className="object-cover"
															/>
														) : (
															<div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-amber-500 via-purple-500 to-indigo-500">
																<span className="text-sm font-semibold text-white">
																	{(referral.commonName || referral.name)
																		.charAt(0)
																		.toUpperCase()}
																</span>
															</div>
														)}
													</div>

													{/* User Info */}
													<div className="flex-1">
														<p className="text-sm font-medium text-slate-200">
															{referral.commonName || referral.name}
														</p>
														<p className="text-xs text-slate-400">
															Joined: {formatDate(referral.joinedAt)}
														</p>
													</div>

													{/* View Profile Link */}
													<Link
														href={`/user/${referral.id}`}
														className="rounded-lg bg-sky-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-sky-700"
													>
														View
													</Link>
												</div>
											))}
										</div>
									</div>
								))}
							</div>
						)}
					</>
				)}
			</div>
		</section>
	);
}
