"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

type UpcomingSession = {
	id: string;
	game: string;
	date: string;
	isCampaign?: boolean;
};

export function DashboardSidebar() {
	const [upcomingSessions, setUpcomingSessions] = useState<UpcomingSession[]>(
		[]
	);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		const fetchUpcomingSessions = async () => {
			try {
				// Fetch user's game sessions
				const gamesResponse = await fetch("/api/games/my-games");
				let gameSessions: UpcomingSession[] = [];
				if (gamesResponse.ok) {
					gameSessions = await gamesResponse.json();
					gameSessions = gameSessions.map((session) => ({
						...session,
						isCampaign: false,
					}));
				}

				// Fetch user's campaign sessions
				const campaignsResponse = await fetch(
					"/api/campaigns/my-campaigns"
				);
				let campaignSessions: UpcomingSession[] = [];
				if (campaignsResponse.ok) {
					campaignSessions = await campaignsResponse.json();
					campaignSessions = campaignSessions.map((session) => ({
						...session,
						isCampaign: true,
					}));
				}

				// Combine and filter for upcoming sessions only
				const allSessions = [...gameSessions, ...campaignSessions];
				const today = new Date();
				const upcoming = allSessions
					.filter((session) => new Date(session.date) >= today)
					.sort((a, b) => a.date.localeCompare(b.date))
					.slice(0, 5); // Show only the next 5 sessions

				setUpcomingSessions(upcoming);
			} catch (error) {
				console.error("Failed to fetch upcoming sessions:", error);
			} finally {
				setIsLoading(false);
			}
		};

		fetchUpcomingSessions();
	}, []);

	const formatDate = (dateString: string) => {
		const date = new Date(dateString);
		const now = new Date();
		const diffDays = Math.floor(
			(date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
		);

		if (diffDays === 0) return "Today";
		if (diffDays === 1) return "Tomorrow";
		if (diffDays < 7)
			return date.toLocaleDateString("en-US", { weekday: "long" });

		return date.toLocaleDateString("en-US", {
			month: "short",
			day: "numeric",
		});
	};

	return (
		<aside className="hidden mt-4 3xl:block w-64 flex-shrink-0">
			<div className="sticky top-4 space-y-6">
				{/* Quick Actions */}
				<div className="rounded-lg border border-amber-500/30 bg-gradient-to-br from-amber-600/10 via-purple-600/10 to-indigo-600/10 p-4">
					<h2 className="mb-3 text-sm font-semibold text-amber-100">
						Quick Actions
					</h2>
					<div className="space-y-2">
						<Link
							href="/post"
							className="block rounded-md bg-gradient-to-r from-amber-500/20 via-purple-500/20 to-indigo-500/20 px-3 py-2 text-sm text-slate-200 transition hover:from-amber-500/30 hover:via-purple-500/30 hover:to-indigo-500/30"
						>
							Post Game
						</Link>
						<Link
							href="/post-campaign"
							className="block rounded-md bg-gradient-to-r from-amber-500/20 via-purple-500/20 to-indigo-500/20 px-3 py-2 text-sm text-slate-200 transition hover:from-amber-500/30 hover:via-purple-500/30 hover:to-indigo-500/30"
						>
							Post Campaign
						</Link>
						<Link
							href="/tall-tales"
							className="block rounded-md bg-gradient-to-r from-amber-500/20 via-purple-500/20 to-indigo-500/20 px-3 py-2 text-sm text-slate-200 transition hover:from-amber-500/30 hover:via-purple-500/30 hover:to-indigo-500/30"
						>
							Post Tall Tale
						</Link>
					</div>
				</div>

				{/* Upcoming Sessions */}
				<div className="rounded-lg border border-amber-500/30 bg-gradient-to-br from-amber-600/10 via-purple-600/10 to-indigo-600/10 p-4">
					<h2 className="mb-3 text-sm font-semibold text-amber-100">
						Upcoming Sessions
					</h2>
					{isLoading ? (
						<p className="text-xs text-slate-400">Loading...</p>
					) : upcomingSessions.length > 0 ? (
						<div className="space-y-2">
							{upcomingSessions.map((session) => (
								<Link
									key={session.id}
									href={
										session.isCampaign
											? `/campaigns/${session.id}`
											: `/games/${session.id}`
									}
									className="block rounded-md border border-slate-700/50 bg-slate-900/40 p-2 transition hover:border-sky-500/50 hover:bg-slate-800/60"
								>
									<div className="flex items-start justify-between gap-2">
										<div className="flex-1 min-w-0">
											<p className="truncate text-xs font-medium text-slate-200">
												{session.game}
											</p>
											<p className="text-xs text-slate-400">
												{formatDate(session.date)}
											</p>
										</div>
										{session.isCampaign && (
											<span className="flex-shrink-0 text-xs rounded-full bg-indigo-500/20 px-2 py-0.5 text-indigo-300">
												Campaign
											</span>
										)}
									</div>
								</Link>
							))}
							<Link
								href="/dashboard"
								className="block text-xs text-sky-400 hover:text-sky-300 transition-colors text-center pt-2"
							>
								View all →
							</Link>
						</div>
					) : (
						<div className="space-y-2">
							<p className="text-xs text-slate-400">
								No upcoming sessions
							</p>
							<Link
								href="/find"
								className="block text-xs text-sky-400 hover:text-sky-300 transition-colors"
							>
								Find games →
							</Link>
						</div>
					)}
				</div>

				{/* Navigation Links */}
				<div className="rounded-lg border border-amber-500/30 bg-gradient-to-br from-amber-600/10 via-purple-600/10 to-indigo-600/10 p-4">
					<h2 className="mb-3 text-sm font-semibold text-amber-100">
						Explore
					</h2>
					<div className="space-y-1">
						<Link
							href="/find"
							className="block rounded-md px-3 py-2 text-sm text-slate-200 transition hover:bg-white/10"
						>
							Find Games
						</Link>
						<Link
							href="/find-campaigns"
							className="block rounded-md px-3 py-2 text-sm text-slate-200 transition hover:bg-white/10"
						>
							Find Campaigns
						</Link>
						<Link
							href="/players"
							className="block rounded-md px-3 py-2 text-sm text-slate-200 transition hover:bg-white/10"
						>
							Players
						</Link>
						<Link
							href="/marketplace"
							className="block rounded-md px-3 py-2 text-sm text-slate-200 transition hover:bg-white/10"
						>
							Marketplace
						</Link>
					</div>
				</div>
			</div>
		</aside>
	);
}
