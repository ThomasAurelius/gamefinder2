"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { formatDateInTimezone, DEFAULT_TIMEZONE } from "@/lib/timezone";
import { sortTimesByChronology } from "@/lib/constants";
import HostFeedbackDialog from "@/components/HostFeedbackDialog";
import HostFeedbackSection from "@/components/HostFeedbackSection";
import PlayerFeedbackSection from "@/components/PlayerFeedbackSection";
import { AuthGuard } from "@/components/auth-guard";
import Advertisement from "@/components/Advertisement";

type GameSession = {
	id: string;
	userId: string;
	game: string;
	date: string;
	times: string[];
	description: string;
	maxPlayers: number;
	signedUpPlayers: string[];
	waitlist: string[];
	createdAt: string;
	updatedAt: string;
	imageUrl?: string;
	location?: string;
	zipCode?: string;
	latitude?: number;
	longitude?: number;
	distance?: number;
	hostName?: string;
	hostAvatarUrl?: string;
	sessionsLeft?: number;
	costPerSession?: number;
	meetingFrequency?: string;
	daysOfWeek?: string[];
	isCampaign?: boolean;
	vendorId?: string;
	vendorName?: string;
	isPrivate?: boolean;
	partyLevel?: number;
};

function GameSessionCard({
	session,
	userTimezone,
	currentUserId,
}: {
	session: GameSession;
	userTimezone: string;
	currentUserId: string | null;
}) {
	const availableSlots = session.maxPlayers - session.signedUpPlayers.length;
	const isFull = availableSlots <= 0;
	const isHost = currentUserId === session.userId;
	const isPlayer =
		currentUserId && session.signedUpPlayers.includes(currentUserId);
	const isWaitlisted =
		currentUserId && session.waitlist.includes(currentUserId);
	const isCampaign = session.isCampaign || false;
	const [showFeedbackDialog, setShowFeedbackDialog] = useState(false);
	const [hasRated, setHasRated] = useState(false);

	// Check if session is in the past
	const sessionDate = new Date(session.date);
	const isPast = sessionDate < new Date();

	let userRole = "";
	if (isHost) {
		userRole = "Hosting";
	} else if (isPlayer) {
		userRole = "Playing";
	} else if (isWaitlisted) {
		userRole = "Waitlisted";
	}

	const detailsLink = isCampaign
		? `/campaigns/${session.id}`
		: `/games/${session.id}`;

	// Check if user has already rated the host
	useEffect(() => {
		if (isPast && isPlayer && currentUserId && session.userId) {
			const checkIfRated = async () => {
				try {
					const response = await fetch(
						`/api/host-feedback/stats/${session.userId}`
					);
					if (response.ok) {
						// For now, we don't have an API to check if specific player rated
						// This would need to be enhanced if we want to prevent duplicate ratings
					}
				} catch (error) {
					console.error("Failed to check rating status", error);
				}
			};
			checkIfRated();
		}
	}, [isPast, isPlayer, currentUserId, session.userId]);

	return (
		<>
			<div
				className={`rounded-lg border overflow-hidden md:flex md:flex-wrap ${
					isHost
						? "border-purple-500/50 bg-purple-950/20"
						: "border-slate-800 bg-slate-950/40"
				}`}
			>
				{session.imageUrl && (
					<Link href={detailsLink} className="md:w-1/2">
						<img
							src={session.imageUrl}
							alt={session.game}
							className="w-full h-auto object-cover"
						/>
					</Link>
				)}
				<div className="p-4 md:w-1/2 md:flex-grow">
					<div className="flex items-center gap-2 flex-wrap">
						<Link
							href={detailsLink}
							className="hover:text-sky-300 transition-colors"
						>
							<h3 className="font-medium text-slate-100">
								{session.game}
							</h3>
						</Link>
						{isCampaign && (
							<span className="text-xs px-2 py-1 rounded-full bg-indigo-500/20 text-indigo-300">
								Campaign
							</span>
						)}
						{isPast && (
							<span className="text-xs px-2 py-1 rounded-full bg-slate-500/20 text-slate-400">
								Past
							</span>
						)}
						{userRole && (
							<span
								className={`text-xs px-2 py-1 rounded-full ${
									isHost
										? "bg-purple-500/20 text-purple-300"
										: isPlayer
											? "bg-green-500/20 text-green-300"
											: "bg-yellow-500/20 text-yellow-300"
								}`}
							>
								{userRole}
							</span>
						)}
					</div>
					<div className="mt-2 space-y-1 text-sm text-slate-400">
						{session.hostName && (
							<p>
								<span className="text-slate-500">Host:</span>{" "}
								<Link
									href={`/user/${session.userId}`}
									className="text-slate-300 hover:text-sky-300 transition-colors"
								>
									{session.hostName}
								</Link>
							</p>
						)}
						{session.vendorId && session.vendorName && (
							<p>
								<span className="text-slate-500">Venue:</span>{" "}
								<Link
									href={`/vendor/${session.vendorId}`}
									className="text-slate-300 hover:text-sky-300 transition-colors"
								>
									{session.vendorName}
								</Link>
							</p>
						)}
						<p>
							<span className="text-slate-500">Date:</span>{" "}
							{formatDateInTimezone(session.date, userTimezone)}
						</p>
						<p>
							<span className="text-slate-500">Times:</span>{" "}
							{sortTimesByChronology(session.times).join(", ")}
						</p>
						{(session.location || session.zipCode) && (
							<p>
								<span className="text-slate-500">Location:</span>{" "}
								{session.location || session.zipCode}
								{session.distance !== undefined && session.distance !== null && (
									<span className="ml-2 text-sky-400">
										({session.distance.toFixed(1)} mi away)
									</span>
								)}
							</p>
						)}
						<p>
							<span className="text-slate-500">Players:</span>{" "}
							<span
								className={
									isFull ? "text-orange-400" : "text-green-400"
								}
							>
								{session.signedUpPlayers.length}/{session.maxPlayers}
							</span>
							{isFull && (
								<span className="ml-2 text-xs text-orange-400">
									(Full)
								</span>
							)}
						</p>
						{session.waitlist.length > 0 && (
							<p>
								<span className="text-slate-500">Waitlist:</span>{" "}
								<span className="text-yellow-400">
									{session.waitlist.length}
								</span>
							</p>
						)}
						{isCampaign && session.sessionsLeft !== undefined && (
							<p>
								<span className="text-slate-500">Sessions:</span>{" "}
								<span className="text-slate-300">
									{session.sessionsLeft}
								</span>
							</p>
						)}
						{session.partyLevel !== undefined && (
							<p>
								<span className="text-slate-500">Party Level:</span>{" "}
								<span className="text-slate-300">
									{session.partyLevel}
								</span>
							</p>
						)}
						{session.costPerSession !== undefined &&
							session.costPerSession > 0 && (
								<p>
									<span className="text-slate-500">Cost:</span>{" "}
									<span className="text-slate-300">
										${session.costPerSession?.toFixed(2) ?? '0.00'}
										{isCampaign ? " per session" : ""}
									</span>
								</p>
							)}
						{session.description && (
							<p className="mt-2 text-slate-300">
								{session.description}
							</p>
						)}
					</div>
					<div className="flex gap-2 mt-4 flex-wrap items-center">
						<Link
							href={detailsLink}
							className="rounded-lg px-4 py-2 text-sm font-medium text-white transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-950 bg-slate-600 hover:bg-slate-700 focus:ring-slate-500"
						>
							Details
						</Link>
						{isPast && isPlayer && !isHost && (
							<button
								onClick={() => setShowFeedbackDialog(true)}
								className="rounded-lg bg-sky-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-sky-700"
							>
								{hasRated ? "Update Rating" : "Rate Host"}
							</button>
						)}
					</div>
				</div>
			</div>

			{showFeedbackDialog && session.hostName && (
				<HostFeedbackDialog
					hostId={session.userId}
					hostName={session.hostName}
					sessionId={session.id}
					sessionType={isCampaign ? "campaign" : "game"}
					isOpen={showFeedbackDialog}
					onClose={() => setShowFeedbackDialog(false)}
					onSubmit={() => {
						setHasRated(true);
						setShowFeedbackDialog(false);
					}}
				/>
			)}
		</>
	);
}

const ITEMS_PER_PAGE = 5;

function getPaginatedItems<T>(items: T[], currentPage: number, itemsPerPage: number) {
	const totalPages = Math.ceil(items.length / itemsPerPage);
	const startIndex = (currentPage - 1) * itemsPerPage;
	const endIndex = startIndex + itemsPerPage;
	const paginatedItems = items.slice(startIndex, endIndex);
	return { paginatedItems, totalPages };
}

function PaginationControls({
	currentPage,
	totalPages,
	onPageChange,
}: {
	currentPage: number;
	totalPages: number;
	onPageChange: (page: number) => void;
}) {
	if (totalPages <= 1) return null;

	return (
		<div className="flex items-center justify-center gap-4 mt-4">
			<button
				onClick={() => onPageChange(currentPage - 1)}
				disabled={currentPage === 1}
				className="px-4 py-2 text-sm font-medium text-white bg-slate-600 rounded-lg hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
			>
				Previous
			</button>
			<span className="text-sm text-slate-300">
				Page {currentPage} of {totalPages}
			</span>
			<button
				onClick={() => onPageChange(currentPage + 1)}
				disabled={currentPage === totalPages}
				className="px-4 py-2 text-sm font-medium text-white bg-slate-600 rounded-lg hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
			>
				Next
			</button>
		</div>
	);
}

export default function DashboardPage() {
	const [gameSessions, setGameSessions] = useState<GameSession[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [userTimezone, setUserTimezone] = useState<string>(DEFAULT_TIMEZONE);
	const [currentUserId, setCurrentUserId] = useState<string | null>(null);
	const [showPastSessions, setShowPastSessions] = useState(false);
	const [upcomingPage, setUpcomingPage] = useState(1);
	const [pastPage, setPastPage] = useState(1);

	const today = new Date();
	const upcomingSessions = gameSessions.filter(
		(session) => new Date(session.date) >= today
	);
	const pastSessions = gameSessions.filter(
		(session) => new Date(session.date) < today
	);

	// Pagination for upcoming sessions
	const { paginatedItems: paginatedUpcomingSessions, totalPages: totalUpcomingPages } = 
		getPaginatedItems(upcomingSessions, upcomingPage, ITEMS_PER_PAGE);

	// Pagination for past sessions
	const { paginatedItems: paginatedPastSessions, totalPages: totalPastPages } = 
		getPaginatedItems(pastSessions, pastPage, ITEMS_PER_PAGE);

	useEffect(() => {
		const fetchData = async () => {
			try {
				// Fetch timezone
				const settingsResponse = await fetch("/api/settings");
				if (settingsResponse.ok) {
					const settingsData = await settingsResponse.json();
					setUserTimezone(settingsData.timezone || DEFAULT_TIMEZONE);
				}

				// Fetch current user ID from profile
				const profileResponse = await fetch("/api/profile");
				if (profileResponse.ok) {
					const profileData = await profileResponse.json();
					setCurrentUserId(profileData.userId);
				}

				// Fetch user's game sessions (one-time games)
				const gamesResponse = await fetch("/api/games/my-games");
				let gameSessions: GameSession[] = [];
				if (gamesResponse.ok) {
					gameSessions = await gamesResponse.json();
					// Mark these as one-time games (not campaigns)
					gameSessions = gameSessions.map((session) => ({
						...session,
						isCampaign: false,
					}));
				}

				// Fetch user's campaign sessions (multi-session campaigns)
				const campaignsResponse = await fetch(
					"/api/campaigns/my-campaigns"
				);
				let campaignSessions: GameSession[] = [];
				if (campaignsResponse.ok) {
					campaignSessions = await campaignsResponse.json();
					// Mark these as campaigns
					campaignSessions = campaignSessions.map((session) => ({
						...session,
						isCampaign: true,
					}));
				}

				// Combine both game sessions and campaign sessions
				const allSessions = [...gameSessions, ...campaignSessions];

				// Sort by date (earliest first)
				allSessions.sort((a, b) => a.date.localeCompare(b.date));

				setGameSessions(allSessions);
			} catch (error) {
				console.error("Failed to fetch dashboard data:", error);
			} finally {
				setIsLoading(false);
			}
		};

		fetchData();
	}, []);

	return (
		<AuthGuard>
		<section className="space-y-6">
			<div>
				<h1 className="text-2xl font-semibold text-slate-100">Dashboard</h1>
				<p className="mt-2 text-sm text-slate-400">
					View your upcoming sessions - one-time games and campaigns
					you&apos;re hosting, playing, or waitlisted for.
				</p>
			</div>

			<Advertisement />

			{/* Quick Actions */}
			<div className="flex flex-wrap gap-3">
				<Link
					href="/post"
					className="inline-flex items-center rounded-lg py-2 px-2 bg-gradient-to-r from-amber-600 via-purple-500 to-indigo-500 font-semibold text-white transition hover:from-amber-500 hover:via-purple-400 hover:to-indigo-400 disabled:cursor-not-allowed disabled:opacity-50"
				>
					Post Game
				</Link>
				<Link
					href="/post-campaign"
					className="inline-flex items-center rounded-lg p-2 bg-gradient-to-r from-amber-600 via-purple-500 to-indigo-500 font-semibold text-white transition hover:from-amber-500 hover:via-purple-400 hover:to-indigo-400 disabled:cursor-not-allowed disabled:opacity-50"
				>
					Post Campaign
				</Link>
				<Link
					href="/tall-tales"
					className="inline-flex items-center rounded-lg p-2 bg-gradient-to-r from-amber-600 via-purple-500 to-indigo-500 font-semibold text-white transition hover:from-amber-500 hover:via-purple-400 hover:to-indigo-400 disabled:cursor-not-allowed disabled:opacity-50"
				>
					Post Tall Tale
				</Link>
			</div>

			{/* My Ratings */}
			{currentUserId && (
				<div className="grid gap-6 md:grid-cols-2">
					<HostFeedbackSection hostId={currentUserId} />
					<PlayerFeedbackSection playerId={currentUserId} />
				</div>
			)}

			<div className="rounded-xl border-2 border-amber-500/50 bg-gradient-to-br from-amber-600/20 via-purple-600/20 to-indigo-600/20 p-6">
				<h2 className="text-lg font-semibold text-amber-100">
					My Upcoming Sessions
				</h2>
				<p className="mt-2 text-sm text-slate-400">
					Your one-time games and multi-session campaigns
				</p>

				{isLoading ? (
					<p className="mt-4 text-sm text-slate-500">
						Loading your sessions...
					</p>
				) : upcomingSessions.length > 0 ? (
					<>
						<div className="mt-4 space-y-3 max-w-3xl">
							{paginatedUpcomingSessions.map((session) => (
								<GameSessionCard
									key={session.id}
									session={session}
									userTimezone={userTimezone}
									currentUserId={currentUserId}
								/>
							))}
						</div>
						<PaginationControls
							currentPage={upcomingPage}
							totalPages={totalUpcomingPages}
							onPageChange={setUpcomingPage}
						/>
					</>
				) : (
					<div className="mt-4 space-y-3">
						<p className="text-sm text-slate-500">
							You don&apos;t have any upcoming sessions yet.
						</p>
						<Link
							href="/find"
							className="inline-block rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-sky-700"
						>
							Find Games
						</Link>
					</div>
				)}
			</div>

			{!isLoading && pastSessions.length > 0 && (
				<div className="rounded-xl border-2 border-amber-500/50 bg-gradient-to-br from-amber-600/20 via-purple-600/20 to-indigo-600/20 p-6">
					<div className="flex items-center justify-between">
						<div>
							<h2 className="text-lg font-semibold text-amber-100">
								Past Sessions
							</h2>
							<p className="mt-2 text-sm text-slate-400">
								Rate your hosts and review past games
							</p>
						</div>
						<button
							onClick={() => setShowPastSessions(!showPastSessions)}
							className="text-sm text-sky-400 hover:text-sky-300 transition-colors"
						>
							{showPastSessions ? "Hide" : "Show"} ({pastSessions.length}
							)
						</button>
					</div>

					{showPastSessions && (
						<>
							<div className="mt-4 space-y-3 max-w-3xl">
								{paginatedPastSessions.map((session) => (
									<GameSessionCard
										key={session.id}
										session={session}
										userTimezone={userTimezone}
										currentUserId={currentUserId}
									/>
								))}
							</div>
							<PaginationControls
								currentPage={pastPage}
								totalPages={totalPastPages}
								onPageChange={setPastPage}
							/>
						</>
					)}
				</div>
			)}
		</section>
		</AuthGuard>
	);
}
