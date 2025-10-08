"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { GAME_OPTIONS, TIME_SLOTS, TIME_SLOT_GROUPS, mapGameToSystemKey } from "@/lib/constants";
import { formatDateInTimezone, DEFAULT_TIMEZONE } from "@/lib/timezone";
import CityAutocomplete from "@/components/CityAutocomplete";
import CharacterSelectionDialog from "@/components/CharacterSelectionDialog";
import CommitmentDialog from "@/components/CommitmentDialog";

type Campaign = {
	id: string;
	userId: string;
	game: string;
	date: string;
	times: string[];
	description: string;
	maxPlayers: number;
	signedUpPlayers: string[];
	waitlist: string[];
	pendingPlayers: string[];
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
	classesNeeded?: string[];
	costPerSession?: number;
	meetingFrequency?: string;
	daysOfWeek?: string[];
};

const tagButtonClasses = (
	active: boolean,
	options?: { size?: "sm" | "md" }
) => {
	const sizeClasses =
		options?.size === "sm" ? "px-2 py-1 text-xs" : "px-3 py-1.5 text-sm";
	const baseClasses = "rounded-full border transition-colors";
	const activeClasses = active
		? "border-sky-400 bg-sky-500/20 text-sky-100"
		: "border-slate-700 bg-slate-900 text-slate-200 hover:border-slate-500";

	return [sizeClasses, baseClasses, activeClasses].join(" ");
};

function getRoleBadgeClasses(role: string): string {
	const baseClasses = "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium border";
	
	switch (role) {
		case "Hosting":
			return `${baseClasses} bg-purple-500/20 text-purple-300 border-purple-400`;
		case "Playing":
			return `${baseClasses} bg-green-500/20 text-green-300 border-green-400`;
		case "Waitlisted":
			return `${baseClasses} bg-yellow-500/20 text-yellow-300 border-yellow-400`;
		case "Pending Approval":
			return `${baseClasses} bg-orange-500/20 text-orange-300 border-orange-400`;
		default:
			return baseClasses;
	}
}

function CampaignCard({
	campaign,
	userTimezone,
	joiningCampaignId,
	onJoin,
	currentUserId,
}: {
	campaign: Campaign;
	userTimezone: string;
	joiningCampaignId: string | null;
	onJoin: (campaignId: string) => void;
	currentUserId: string | null;
}) {
	const availableSlots = campaign.maxPlayers - campaign.signedUpPlayers.length;
	const isFull = availableSlots <= 0;

	// Check if the current user is the host
	const isHost = currentUserId === campaign.userId;

	// Check if the current user is signed up (in any list)
	const isUserSignedUp =
		currentUserId &&
		(campaign.signedUpPlayers.includes(currentUserId) ||
			campaign.waitlist.includes(currentUserId) ||
			campaign.pendingPlayers.includes(currentUserId));

	// Determine user's role in the campaign
	const userRole = !currentUserId 
		? ""
		: isHost 
			? "Hosting" 
			: campaign.signedUpPlayers.includes(currentUserId) 
				? "Playing" 
				: campaign.waitlist.includes(currentUserId) 
					? "Waitlisted" 
					: campaign.pendingPlayers.includes(currentUserId) 
						? "Pending Approval" 
						: "";

	return (
		<div
			key={campaign.id}
			className="rounded-lg border border-slate-800 bg-slate-950/40 p-4"
		>
			<div className="flex items-start justify-between gap-4">
				<div className="flex-1">
					<div className="flex items-center gap-2">
						<Link
							href={`/campaigns/${campaign.id}`}
							className="hover:text-sky-300 transition-colors"
						>
							<h3 className="font-medium text-slate-100">{campaign.game}</h3>
						</Link>
						{userRole && (
							<span className={getRoleBadgeClasses(userRole)}>
								{userRole}
							</span>
						)}
					</div>
					<div className="mt-2 space-y-1 text-sm text-slate-400">
						{campaign.hostName && (
							<p>
								<span className="text-slate-500">Host:</span>{" "}
								<Link
									href={`/user/${campaign.userId}`}
									className="text-slate-300 hover:text-sky-300 transition-colors"
								>
									{campaign.hostName}
								</Link>
							</p>
						)}
						<p>
							<span className="text-slate-500">Start Date:</span>{" "}
							{formatDateInTimezone(campaign.date, userTimezone)}
						</p>
						{campaign.meetingFrequency && (
							<p>
								<span className="text-slate-500">Meets:</span>{" "}
								{campaign.meetingFrequency}
							</p>
						)}
						{campaign.daysOfWeek && campaign.daysOfWeek.length > 0 && (
							<p>
								<span className="text-slate-500">Days:</span>{" "}
								{campaign.daysOfWeek.join(", ")}
							</p>
						)}
						<p>
							<span className="text-slate-500">Times:</span>{" "}
							{campaign.times.join(", ")}
						</p>
						{campaign.sessionsLeft && (
							<p>
								<span className="text-slate-500">Sessions Left:</span>{" "}
								<span className="text-green-400">{campaign.sessionsLeft}</span>
							</p>
						)}
						{campaign.classesNeeded && campaign.classesNeeded.length > 0 && (
							<p>
								<span className="text-slate-500">Classes Needed:</span>{" "}
								<span className="flex flex-wrap gap-1 mt-1">
									{campaign.classesNeeded.map((cls) => (
										<span
											key={cls}
											className="inline-flex items-center rounded-full border border-sky-400 bg-sky-500/20 px-2 py-0.5 text-xs text-sky-100"
										>
											{cls}
										</span>
									))}
								</span>
							</p>
						)}
						{campaign.costPerSession !== undefined && (
							<p>
								<span className="text-slate-500">Cost per Session:</span>{" "}
								<span className="text-green-400">
									${campaign.costPerSession}
								</span>
							</p>
						)}
						{(campaign.location || campaign.zipCode) && (
							<p>
								<span className="text-slate-500">Location:</span>{" "}
								{campaign.location || campaign.zipCode}
								{campaign.distance !== undefined && (
									<span className="ml-2 text-sky-400">
										({campaign.distance.toFixed(1)} mi away)
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
								{campaign.signedUpPlayers.length}/{campaign.maxPlayers}
							</span>
							{isFull && (
								<span className="ml-2 text-xs text-orange-400">
									(Full - Joining adds you to waitlist)
								</span>
							)}
						</p>
						{campaign.waitlist.length > 0 && (
							<p>
								<span className="text-slate-500">Waitlist:</span>{" "}
								<span className="text-yellow-400">
									{campaign.waitlist.length}
								</span>
							</p>
						)}
						{campaign.description && (
							<p className="mt-2 text-slate-300">
								{campaign.description}
							</p>
						)}
					</div>
				</div>
				<div className="flex flex-col items-end gap-2 flex-shrink-0">
					{isHost ? (
						<Link
							href={`/campaigns/${campaign.id}`}
							className="rounded-lg px-4 py-2 text-sm font-medium text-white transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-950 bg-purple-600 hover:bg-purple-700 focus:ring-purple-500"
						>
							Manage Campaign
						</Link>
					) : !isUserSignedUp ? (
						<button
							onClick={() => onJoin(campaign.id)}
							disabled={joiningCampaignId === campaign.id}
							className="rounded-lg px-4 py-2 text-sm font-medium text-white transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-950 disabled:cursor-not-allowed disabled:opacity-50 bg-sky-600 hover:bg-sky-700 focus:ring-sky-500"
							title="Request to join"
						>
							{joiningCampaignId === campaign.id
								? "Requesting..."
								: "Request to Join"}
						</button>
					) : null}
					<Link
						href={`/campaigns/${campaign.id}`}
						className="rounded-lg px-4 py-2 text-sm font-medium text-white transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-950 bg-slate-600 hover:bg-slate-700 focus:ring-slate-500"
					>
						Details
					</Link>
					{campaign.imageUrl && (
						<Link href={`/campaigns/${campaign.id}`}>
							<img
								src={campaign.imageUrl}
								alt={campaign.game}
								className="h-36 w-36 md:h-72 md:w-72 rounded-lg border border-slate-700 object-cover"
							/>
						</Link>
					)}
				</div>
			</div>
		</div>
	);
}

export default function MyCampaignsPage() {
	const [selectedGame, setSelectedGame] = useState("");
	const [customGameName, setCustomGameName] = useState("");
	const [selectedTimes, setSelectedTimes] = useState<string[]>([]);
	const [selectedDate, setSelectedDate] = useState("");
	const [campaigns, setCampaigns] = useState<Campaign[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [hasSearched, setHasSearched] = useState(false);
	const [joiningCampaignId, setJoiningCampaignId] = useState<string | null>(
		null
	);
	const [joinError, setJoinError] = useState<string | null>(null);
	const [userTimezone, setUserTimezone] = useState<string>(DEFAULT_TIMEZONE);
	const [isSearchFormOpen, setIsSearchFormOpen] = useState(false);
	const [allEvents, setAllEvents] = useState<Campaign[]>([]);
	const [isLoadingEvents, setIsLoadingEvents] = useState(false);
	const [lastClickedSlot, setLastClickedSlot] = useState<string>("");
	const [locationSearch, setLocationSearch] = useState("");
	const [radiusMiles, setRadiusMiles] = useState("25");
	const [showCharacterDialog, setShowCharacterDialog] = useState(false);
	const [showCommitmentDialog, setShowCommitmentDialog] = useState(false);
	const [campaignToJoin, setCampaignToJoin] = useState<Campaign | null>(null);
	const [currentUserId, setCurrentUserId] = useState<string | null>(null);

	useEffect(() => {
		const fetchTimezone = async () => {
			try {
				const response = await fetch("/api/settings");
				if (response.ok) {
					const data = await response.json();
					setUserTimezone(data.timezone || DEFAULT_TIMEZONE);
				}
			} catch (error) {
				console.error("Failed to fetch timezone:", error);
			}
		};

		const fetchUserProfileAndEvents = async () => {
			// First, fetch user profile to get their userId and zipcode
			try {
				const response = await fetch("/api/profile");
				if (response.ok) {
					const profile = await response.json();
					// Auto-populate location with user's zip code
					if (profile.zipCode) {
						setLocationSearch(profile.zipCode);
					}
					// Set the current user ID
					if (profile.userId) {
						setCurrentUserId(profile.userId);
						
						// Fetch campaigns for this user
						setIsLoadingEvents(true);
						try {
							const campaignsResponse = await fetch(`/api/campaigns?userFilter=${profile.userId}`);
							if (campaignsResponse.ok) {
								const events = await campaignsResponse.json();
								setAllEvents(events);
							}
						} catch (error) {
							console.error("Failed to fetch events:", error);
						} finally {
							setIsLoadingEvents(false);
						}
					}
				}
			} catch (error) {
				console.error("Failed to fetch user profile:", error);
			}
		};

		fetchTimezone();
		fetchUserProfileAndEvents();
	}, []);

	const toggleTime = (slot: string, shiftKey: boolean = false) => {
		setSelectedTimes((prev) => {
			// Handle range selection with shift key
			if (shiftKey && lastClickedSlot) {
				const startIdx = TIME_SLOTS.indexOf(lastClickedSlot);
				const endIdx = TIME_SLOTS.indexOf(slot);

				if (startIdx !== -1 && endIdx !== -1) {
					const [minIdx, maxIdx] = [
						Math.min(startIdx, endIdx),
						Math.max(startIdx, endIdx),
					];
					const slotsInRange = TIME_SLOTS.slice(minIdx, maxIdx + 1);

					// Check if all slots in range are already selected
					const allSelected = slotsInRange.every((s) => prev.includes(s));

					if (allSelected) {
						// Deselect all slots in range
						return prev.filter((s) => !slotsInRange.includes(s));
					} else {
						// Select all slots in range
						const newSlots = [...prev];
						slotsInRange.forEach((s) => {
							if (!newSlots.includes(s)) {
								newSlots.push(s);
							}
						});
						return newSlots;
					}
				}
			}

			// Normal toggle behavior
			setLastClickedSlot(slot);
			return prev.includes(slot)
				? prev.filter((item) => item !== slot)
				: [...prev, slot];
		});
	};

	const handleSearch = async () => {
		if (!currentUserId) {
			return;
		}

		setIsLoading(true);
		setHasSearched(true);

		try {
			const params = new URLSearchParams();
			params.append("userFilter", currentUserId);
			
			// Use custom game name if "Other" is selected and a custom name is provided
			const gameName =
				selectedGame === "Other" && customGameName.trim()
					? customGameName.trim()
					: selectedGame;

			if (gameName) params.append("game", gameName);
			if (selectedDate) params.append("date", selectedDate);
			if (selectedTimes.length > 0)
				params.append("times", selectedTimes.join(","));
			if (locationSearch) {
				params.append("location", locationSearch);
				params.append("radius", radiusMiles);
			}

			const response = await fetch(`/api/campaigns?${params.toString()}`);
			if (!response.ok) {
				throw new Error("Failed to fetch campaigns");
			}

			const campaigns = await response.json();
			setCampaigns(campaigns);
		} catch (error) {
			console.error("Failed to fetch campaigns", error);
			setCampaigns([]);
		} finally {
			setIsLoading(false);
		}
	};

	const handleJoinClick = (campaignId: string) => {
		if (showCharacterDialog || showCommitmentDialog) {
			return;
		}
		// Find the campaign
		const campaign = [...campaigns, ...allEvents].find(
			(c) => c.id === campaignId
		);

		if (!campaign) {
			return;
		}

		// Handle join request - show commitment dialog first
		setCampaignToJoin(campaign);
		setShowCommitmentDialog(true);
	};

	const handleCharacterSelect = async (
		characterId?: string,
		characterName?: string
	) => {
		if (!campaignToJoin) return;

		setShowCharacterDialog(false);
		setJoiningCampaignId(campaignToJoin.id);
		setJoinError(null);

		try {
			const response = await fetch(`/api/campaigns/${campaignToJoin.id}/join`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ characterId, characterName }),
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.error || "Failed to join campaign");
			}

			const updatedSession = await response.json();

			// Update the session in the search results list
			// Preserve the distance field from the original session
			setCampaigns((prevCampaigns) =>
				prevCampaigns.map((campaign) =>
					campaign.id === campaignToJoin.id
						? { ...updatedSession, distance: campaign.distance }
						: campaign
				)
			);

			// Update the session in the all events list
			setAllEvents((prevEvents) =>
				prevEvents.map((event) =>
					event.id === campaignToJoin.id ? updatedSession : event
				)
			);
		} catch (error) {
			setJoinError(
				error instanceof Error
					? error.message
					: "Failed to join campaign"
			);
		} finally {
			setJoiningCampaignId(null);
			setCampaignToJoin(null);
		}
	};

	const handleCharacterCancel = () => {
		setShowCharacterDialog(false);
		setCampaignToJoin(null);
	};

	const handleCommitmentAccept = () => {
		// User accepted commitment, now show character selection
		setShowCommitmentDialog(false);
		setShowCharacterDialog(true);
	};

	const handleCommitmentDecline = () => {
		// User declined commitment, cancel the join process
		setShowCommitmentDialog(false);
		setCampaignToJoin(null);
	};

	return (
		<section className="space-y-6">
			{showCommitmentDialog && campaignToJoin && (
				<CommitmentDialog
					onAccept={handleCommitmentAccept}
					onDecline={handleCommitmentDecline}
					campaignName={campaignToJoin.game}
					costPerSession={campaignToJoin.costPerSession}
				/>
			)}
			{showCharacterDialog && campaignToJoin && (
				<CharacterSelectionDialog
					onSelect={handleCharacterSelect}
					onCancel={handleCharacterCancel}
					isLoading={joiningCampaignId !== null}
					gameSystem={mapGameToSystemKey(campaignToJoin.game)}
				/>
			)}
			<div>
				<h1 className="text-2xl font-semibold text-slate-100">
					My Campaigns
				</h1>
				<p className="mt-2 text-sm text-slate-400">
					View campaigns you are hosting or playing in.
				</p>
			</div>

			<div className="rounded-lg border border-slate-800 bg-slate-950/60">
				<button
					type="button"
					onClick={() => setIsSearchFormOpen(!isSearchFormOpen)}
					className="flex w-full items-center justify-between gap-2 bg-slate-900/50 px-4 py-3 text-left text-sm font-semibold text-slate-100 transition hover:bg-slate-900/80"
				>
					<span>
						{isSearchFormOpen
							? "Hide search filters"
							: "Show search filters"}
					</span>
					<span className="text-xs uppercase tracking-wide text-slate-400">
						{isSearchFormOpen ? "Collapse" : "Expand"}
					</span>
				</button>
				{isSearchFormOpen && (
					<div className="space-y-4 border-t border-slate-800 p-6">
						<p className="text-xs text-slate-400">
							Filter your campaigns by game, date, time, or any
							combination.
						</p>
						<div className="space-y-2">
							<label
								htmlFor="game-select"
								className="block text-sm font-medium text-slate-200"
							>
								Select Game
							</label>
							<select
								id="game-select"
								value={selectedGame}
								onChange={(e) => setSelectedGame(e.target.value)}
								className="w-full rounded-xl border border-slate-800 bg-slate-950/80 px-4 py-3 text-sm text-slate-100 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
							>
								<option value="">Choose a game...</option>
								{GAME_OPTIONS.map((game) => (
									<option key={game} value={game}>
										{game}
									</option>
								))}
							</select>
						</div>

						{selectedGame === "Other" && (
							<div className="space-y-2">
								<label
									htmlFor="custom-game-search"
									className="block text-sm font-medium text-slate-200"
								>
									Game Name
								</label>
								<input
									id="custom-game-search"
									type="text"
									value={customGameName}
									onChange={(e) => setCustomGameName(e.target.value)}
									placeholder="Enter the name of the game to search for"
									className="w-full rounded-xl border border-slate-800 bg-slate-950/80 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
								/>
								<p className="text-xs text-slate-500">
									Search for games by their specific name.
								</p>
							</div>
						)}

						<div className="space-y-2">
							<label
								htmlFor="date-select"
								className="block text-sm font-medium text-slate-200"
							>
								Game Date
							</label>
							<input
								id="date-select"
								type="date"
								value={selectedDate}
								onChange={(e) => setSelectedDate(e.target.value)}
								className="w-full rounded-xl border border-slate-800 bg-slate-950/80 px-4 py-3 text-sm text-slate-100 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
							/>
						</div>

						<div className="space-y-2">
							<label
								htmlFor="location-search"
								className="block text-sm font-medium text-slate-200"
							>
								Location or Zip Code
							</label>
							<CityAutocomplete
								id="location-search"
								value={locationSearch}
								onChange={setLocationSearch}
								placeholder="Search for a city or enter zip code..."
								className="w-full rounded-xl border border-slate-800 bg-slate-950/80 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
							/>
							{locationSearch && (
								<div className="space-y-2">
									<label
										htmlFor="radius-select"
										className="block text-sm font-medium text-slate-200"
									>
										Search Radius
									</label>
									<select
										id="radius-select"
										value={radiusMiles}
										onChange={(e) => setRadiusMiles(e.target.value)}
										className="w-full rounded-xl border border-slate-800 bg-slate-950/80 px-4 py-3 text-sm text-slate-100 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
									>
										<option value="10">10 miles</option>
										<option value="25">25 miles</option>
										<option value="50">50 miles</option>
										<option value="100">100 miles</option>
										<option value="250">250 miles</option>
									</select>
								</div>
							)}
							<p className="text-xs text-slate-500">
								Filter campaigns by location
							</p>
						</div>

						<div className="space-y-2">
							<label className="block text-sm font-medium text-slate-200">
								Preferred Time
							</label>
							<p className="text-xs text-slate-400">
								Click to select individual times or hold Shift and click
								to select a range.
							</p>
							<div className="space-y-3">
								{TIME_SLOT_GROUPS.map((group) => (
									<div key={group.label}>
										<div className="mb-2 text-xs font-medium text-slate-400">
											{group.label}:
										</div>
										<div className="flex flex-wrap gap-2">
											{group.slots.map((slot) => {
												const active = selectedTimes.includes(slot);
												return (
													<button
														key={slot}
														type="button"
														onClick={(e) => toggleTime(slot, e.shiftKey)}
														className={tagButtonClasses(active, {
															size: "sm",
														})}
													>
														{slot}
													</button>
												);
											})}
										</div>
									</div>
								))}
							</div>
							<p className="text-xs text-slate-500">
								{selectedTimes.length} time slot(s) selected
							</p>
						</div>

						<button
							type="button"
							onClick={handleSearch}
							className="mt-4 w-full rounded-xl bg-sky-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
							disabled={isLoading || !currentUserId}
						>
							{isLoading ? "Searching..." : "Search My Campaigns"}
						</button>
					</div>
				)}
			</div>

			{joinError && (
				<div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
					{joinError}
				</div>
			)}

			{hasSearched && (
				<div className="rounded-xl border border-slate-800/60 bg-slate-900/40 p-6">
					<h2 className="text-lg font-semibold text-slate-100">
						Search Results
					</h2>
					<p className="mt-2 text-sm text-slate-400">
						{selectedGame ||
						selectedDate ||
						selectedTimes.length > 0 ||
						locationSearch ? (
							<>
								Showing your campaigns
								{selectedGame && (
									<>
										{" "}
										for{" "}
										<span className="text-sky-400">
											{selectedGame === "Other" &&
											customGameName.trim()
												? customGameName
												: selectedGame}
										</span>
									</>
								)}
								{selectedDate && (
									<>
										{" "}
										on{" "}
										<span className="text-sky-400">
											{formatDateInTimezone(
												selectedDate,
												userTimezone
											)}
										</span>
									</>
								)}
								{selectedTimes.length > 0 && (
									<>
										{" "}
										at{" "}
										<span className="text-sky-400">
											{selectedTimes.join(", ")}
										</span>
									</>
								)}
								{locationSearch && (
									<>
										{" "}
										near{" "}
										<span className="text-sky-400">
											{locationSearch}
										</span>{" "}
										(within {radiusMiles} miles)
									</>
								)}
							</>
						) : (
							<>Showing all your campaigns</>
						)}
					</p>

					{isLoading ? (
						<p className="mt-4 text-sm text-slate-500">Loading...</p>
					) : campaigns.length > 0 ? (
						<div className="mt-4 space-y-3">
							{campaigns.map((event) => (
								<CampaignCard
									key={event.id}
									campaign={event}
									userTimezone={userTimezone}
									joiningCampaignId={joiningCampaignId}
									onJoin={handleJoinClick}
									currentUserId={currentUserId}
								/>
							))}
						</div>
					) : (
						<p className="mt-4 text-sm text-slate-500">
							No campaigns found. Try adjusting your search criteria.
						</p>
					)}
				</div>
			)}

			{/* All User's Campaigns Feed */}
			{!hasSearched && (
				<div className="rounded-xl border border-slate-800/60 bg-slate-900/40 p-6">
					<h2 className="text-lg font-semibold text-slate-100">
						All My Campaigns
					</h2>
					<p className="mt-2 text-sm text-slate-400">
						Campaigns you are hosting or playing in
					</p>

					{isLoadingEvents ? (
						<p className="mt-4 text-sm text-slate-500">Loading campaigns...</p>
					) : allEvents.length > 0 ? (
						<div className="mt-4 space-y-3">
							{allEvents.map((event) => (
								<CampaignCard
									key={event.id}
									campaign={event}
									userTimezone={userTimezone}
									joiningCampaignId={joiningCampaignId}
									onJoin={handleJoinClick}
									currentUserId={currentUserId}
								/>
							))}
						</div>
					) : (
						<p className="mt-4 text-sm text-slate-500">
							You are not currently hosting or playing in any campaigns.
						</p>
					)}
				</div>
			)}
		</section>
	);
}
