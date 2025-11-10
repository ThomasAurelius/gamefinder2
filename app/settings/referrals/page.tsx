"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

type Referral = {
	id: string;
	name: string;
	commonName: string;
	avatarUrl: string;
	joinedAt: Date;
};

export default function ReferralsPage() {
	const [referrals, setReferrals] = useState<Referral[]>([]);
	const [count, setCount] = useState(0);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		async function loadReferrals() {
			try {
				const response = await fetch("/api/admin/referrals");
				
				if (!response.ok) {
					throw new Error("Failed to fetch referrals");
				}

				const data = await response.json();
				setReferrals(data.referrals || []);
				setCount(data.count || 0);
			} catch (err) {
				console.error("Error loading referrals:", err);
				setError("Failed to load referrals. Please try again later.");
			} finally {
				setLoading(false);
			}
		}

		loadReferrals();
	}, []);

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

			<h1 className="text-2xl font-semibold">Referrals</h1>
			<p className="text-sm text-slate-300">
				View users who signed up with you as their referrer.
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
								Total Referrals: {count}
							</h2>
							<p className="mt-2 text-sm text-slate-400">
								{count === 0
									? "You haven't referred anyone yet."
									: count === 1
										? "You have referred 1 user."
										: `You have referred ${count} users.`}
							</p>
						</div>

						{/* Referrals List */}
						{referrals.length > 0 && (
							<div className="space-y-3">
								<h3 className="text-sm font-medium text-slate-200">
									Referred Users
								</h3>
								<div className="space-y-2">
									{referrals.map((referral) => (
										<div
											key={referral.id}
											className="flex items-center gap-4 rounded-lg border border-slate-700/50 bg-slate-800/30 p-4"
										>
											{/* Avatar */}
											<div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-full border border-slate-700">
												{referral.avatarUrl ? (
													<Image
														src={referral.avatarUrl}
														alt={referral.commonName || referral.name}
														fill
														className="object-cover"
													/>
												) : (
													<div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-amber-500 via-purple-500 to-indigo-500">
														<span className="text-lg font-semibold text-white">
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
												className="rounded-lg bg-sky-600 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-sky-700"
											>
												View Profile
											</Link>
										</div>
									))}
								</div>
							</div>
						)}
					</>
				)}
			</div>
		</section>
	);
}
