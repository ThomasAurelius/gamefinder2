"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
	GAME_OPTIONS,
	TIME_SLOTS,
	TIME_SLOT_GROUPS,
	mapGameToSystemKey,
} from "@/lib/constants";
import { formatDateInTimezone, DEFAULT_TIMEZONE } from "@/lib/timezone";
import CityAutocomplete from "@/components/CityAutocomplete";
import CharacterSelectionDialog from "@/components/CharacterSelectionDialog";
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
	vendorId?: string;
	vendorName?: string;
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

function GameSessionCard({
	session,
	userTimezone,
	joiningSessionId,
	onJoin,
	currentUserId,
}: {
	session: GameSession;
	userTimezone: string;
	joiningSessionId: string | null;
	onJoin: (sessionId: string) => void;
	currentUserId: string | null;
}) {
	const availableSlots = session.maxPlayers - session.signedUpPlayers.length;
	const isFull = availableSlots <= 0;

	// Check if the current user is the host
	const isHost = currentUserId === session.userId;

	// Check if the current user is signed up (in any list)
	const isUserSignedUp =
		currentUserId &&
		(session.signedUpPlayers.includes(currentUserId) ||
			session.waitlist.includes(currentUserId) ||
			session.pendingPlayers.includes(currentUserId));

	return (
		<div
			key={session.id}
			className="rounded-lg border border-slate-800 bg-slate-950/40 overflow-hidden md:flex md:flex-wrap"
		>
			{session.imageUrl && (
				<Link href={`/games/${session.id}`} className="md:w-1/2">
					<img
						src={session.imageUrl}
						alt={session.game}
						className="w-full h-auto object-cover"
					/>
				</Link>
			)}
			<div className="p-4 md:w-1/2 md:flex-grow">
				<div className="flex items-center gap-2">
					<Link
						href={`/games/${session.id}`}
						className="hover:text-sky-300 transition-colors"
					>
						<h3 className="font-medium text-slate-100">{session.game}</h3>
					</Link>
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
					<p>
						<span className="text-slate-500">Date:</span>{" "}
						{formatDateInTimezone(session.date, userTimezone)}
					</p>
					<p>
						<span className="text-slate-500">Times:</span>{" "}
						{session.times.join(", ")}
					</p>
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
					{(session.location || session.zipCode) && (
						<p>
							<span className="text-slate-500">Location:</span>{" "}
							{session.location || session.zipCode}
							{session.distance !== undefined && (
								<span className="ml-2 text-sky-400">
									({session.distance.toFixed(1)} mi away)
								</span>
							)}
						</p>
					)}
					<p>
						<span className="text-slate-500">Players:</span>{" "}
						<span
							className={isFull ? "text-orange-400" : "text-green-400"}
						>
							{session.signedUpPlayers.length}/{session.maxPlayers}
						</span>
						{isFull && (
							<span className="ml-2 text-xs text-orange-400">
								(Full - Joining adds you to waitlist)
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
					{session.description && (
						<p className="mt-2 text-slate-300">{session.description}</p>
					)}
				</div>
				<div className="flex gap-2 mt-4 flex-wrap">
					{isHost ? (
						<Link
							href={`/games/${session.id}`}
							className="rounded-lg px-4 py-2 text-sm font-medium text-white transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-950 bg-purple-600 hover:bg-purple-700 focus:ring-purple-500"
						>
							Hosting this game
						</Link>
					) : (
						<button
							onClick={() => onJoin(session.id)}
							disabled={joiningSessionId === session.id}
							className={`rounded-lg px-4 py-2 text-sm font-medium text-white transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-950 disabled:cursor-not-allowed disabled:opacity-50 ${
								isUserSignedUp
									? "bg-red-600 hover:bg-red-700 focus:ring-red-500"
									: "bg-sky-600 hover:bg-sky-700 focus:ring-sky-500"
							}`}
							title={
								isUserSignedUp
									? "Withdraw from this game"
									: "Request to join"
							}
						>
							{joiningSessionId === session.id
								? isUserSignedUp
									? "Withdrawing..."
									: "Requesting..."
								: isUserSignedUp
									? "Withdraw"
									: "Request to Join"}
						</button>
					)}
					<Link
						href={`/games/${session.id}`}
						className="rounded-lg px-4 py-2 text-sm font-medium text-white transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-950 bg-slate-600 hover:bg-slate-700 focus:ring-slate-500"
					>
						Details
					</Link>
					{isHost && session.pendingPlayers.length > 0 && (
						<span className="inline-flex items-center rounded-full border border-orange-400 bg-orange-500/20 px-2 py-0.5 text-xs text-orange-100">
							{session.pendingPlayers.length} pending approval
							{session.pendingPlayers.length !== 1 ? "s" : ""}
						</span>
					)}
				</div>
			</div>
		</div>
	);
}

export default function FindGamesPage() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const [selectedGame, setSelectedGame] = useState("");
	const [customGameName, setCustomGameName] = useState("");
	const [selectedTimes, setSelectedTimes] = useState<string[]>([]);
	const [selectedDate, setSelectedDate] = useState("");
	const [gameSessions, setGameSessions] = useState<GameSession[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [hasSearched, setHasSearched] = useState(false);
	const [joiningSessionId, setJoiningSessionId] = useState<string | null>(
		null
	);
	const [joinError, setJoinError] = useState<string | null>(null);
	const [userTimezone, setUserTimezone] = useState<string>(DEFAULT_TIMEZONE);
	const [isSearchFormOpen, setIsSearchFormOpen] = useState(false);
	const [allEvents, setAllEvents] = useState<GameSession[]>([]);
	const [isLoadingEvents, setIsLoadingEvents] = useState(false);
	const [lastClickedSlot, setLastClickedSlot] = useState<string>("");
	const [locationSearch, setLocationSearch] = useState("");
	const [radiusMiles, setRadiusMiles] = useState("25");
	const [showCharacterDialog, setShowCharacterDialog] = useState(false);
	const [sessionToJoin, setSessionToJoin] = useState<GameSession | null>(null);
	const [currentUserId, setCurrentUserId] = useState<string | null>(null);
	const [hostSearch, setHostSearch] = useState("");
	const [hostSearchResults, setHostSearchResults] = useState<
		{ id: string; name: string; avatarUrl?: string }[]
	>([]);
	const [selectedHostId, setSelectedHostId] = useState<string>("");
	const [selectedHostName, setSelectedHostName] = useState<string>("");
	const [showHostResults, setShowHostResults] = useState(false);
	const [venueSearch, setVenueSearch] = useState("");
	const [venueSearchResults, setVenueSearchResults] = useState<
		{ id: string; vendorName: string }[]
	>([]);
	const [selectedVenueId, setSelectedVenueId] = useState<string>("");
	const [selectedVenueName, setSelectedVenueName] = useState<string>("");
	const [showVenueResults, setShowVenueResults] = useState(false);

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
			// First, fetch user profile to get their zipcode
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
					}
				}
			} catch (error) {
				console.error("Failed to fetch user profile:", error);
			}

			// Then fetch all events without any filtering
			setIsLoadingEvents(true);
			try {
				const response = await fetch(`/api/games`);
				if (response.ok) {
					const events = await response.json();
					// Fetch vendor information for events with vendorId
					await enrichEventsWithVendorInfo(events);
					setAllEvents(events);
				}
			} catch (error) {
				console.error("Failed to fetch events:", error);
			} finally {
				setIsLoadingEvents(false);
			}
		};

		const initializeFromUrlParams = async () => {
			// Check for vendorId in URL parameters
			const venueIdParam = searchParams.get("vendorId");
			if (venueIdParam) {
				try {
					const response = await fetch(`/api/vendors/${venueIdParam}`);
					if (response.ok) {
						const data = await response.json();
						if (data.vendor) {
							setSelectedVenueId(data.vendor.id);
							setSelectedVenueName(data.vendor.vendorName);
							setIsSearchFormOpen(true);
							// Automatically trigger search
							setTimeout(() => handleSearch(), 100);
						}
					}
				} catch (error) {
					console.error("Failed to fetch vendor from URL:", error);
				}
			}
		};

		fetchTimezone();
		fetchUserProfileAndEvents();
		initializeFromUrlParams();
	}, [searchParams]);

	// Search for hosts as user types
	useEffect(() => {
		const searchHosts = async () => {
			if (!hostSearch || hostSearch.trim().length < 2) {
				setHostSearchResults([]);
				setShowHostResults(false);
				return;
			}

			try {
				const response = await fetch(
					`/api/users/search?name=${encodeURIComponent(hostSearch)}`
				);
				if (response.ok) {
					const users = await response.json();
					setHostSearchResults(users);
					setShowHostResults(true);
				}
			} catch (error) {
				console.error("Failed to search hosts:", error);
			}
		};

		const debounceTimer = setTimeout(searchHosts, 300);
		return () => clearTimeout(debounceTimer);
	}, [hostSearch]);

	// Search for venues as user types
	useEffect(() => {
		const searchVenues = async () => {
			if (!venueSearch || venueSearch.trim().length < 2) {
				setVenueSearchResults([]);
				setShowVenueResults(false);
				return;
			}

			try {
				const response = await fetch("/api/vendors");
				if (response.ok) {
					const data = await response.json();
					const venues = data.vendors || [];
					const filteredVenues = venues.filter((v: { vendorName: string }) =>
						v.vendorName.toLowerCase().includes(venueSearch.toLowerCase())
					);
					setVenueSearchResults(filteredVenues);
					setShowVenueResults(true);
				}
			} catch (error) {
				console.error("Failed to search venues:", error);
			}
		};

		const debounceTimer = setTimeout(searchVenues, 300);
		return () => clearTimeout(debounceTimer);
	}, [venueSearch]);

	// Close host search dropdown when clicking outside
	useEffect(() => {
		const handleClickOutside = (e: MouseEvent) => {
			const target = e.target as HTMLElement;
			const hostSearchInput = document.getElementById("host-search");
			if (
				hostSearchInput &&
				!hostSearchInput.contains(target) &&
				!target.closest(".host-results-dropdown")
			) {
				setShowHostResults(false);
			}
		};

		if (showHostResults) {
			document.addEventListener("mousedown", handleClickOutside);
			return () =>
				document.removeEventListener("mousedown", handleClickOutside);
		}
	}, [showHostResults]);

	// Close venue search dropdown when clicking outside
	useEffect(() => {
		const handleClickOutside = (e: MouseEvent) => {
			const target = e.target as HTMLElement;
			const venueSearchInput = document.getElementById("venue-search");
			if (
				venueSearchInput &&
				!venueSearchInput.contains(target) &&
				!target.closest(".venue-results-dropdown")
			) {
				setShowVenueResults(false);
			}
		};

		if (showVenueResults) {
			document.addEventListener("mousedown", handleClickOutside);
			return () =>
				document.removeEventListener("mousedown", handleClickOutside);
		}
	}, [showVenueResults]);

	const enrichEventsWithVendorInfo = async (events: GameSession[]) => {
		const vendorIds = events
			.map((e) => e.vendorId)
			.filter((id): id is string => !!id);
		const uniqueVendorIds = [...new Set(vendorIds)];

		if (uniqueVendorIds.length > 0) {
			try {
				const vendorPromises = uniqueVendorIds.map((id) =>
					fetch(`/api/vendors/${id}`).then((r) =>
						r.ok ? r.json() : null
					)
				);
				const vendorResponses = await Promise.all(vendorPromises);
				const vendorMap = new Map<string, string>();

				vendorResponses.forEach((data) => {
					if (data?.vendor) {
						vendorMap.set(data.vendor.id, data.vendor.vendorName);
					}
				});

				events.forEach((event) => {
					if (event.vendorId && vendorMap.has(event.vendorId)) {
						event.vendorName = vendorMap.get(event.vendorId);
					}
				});
			} catch (error) {
				console.error("Failed to fetch vendor info:", error);
			}
		}
	};

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
		setIsLoading(true);
		setHasSearched(true);

		try {
			const params = new URLSearchParams();
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
			if (selectedHostId) {
				params.append("hostId", selectedHostId);
			}
			if (selectedVenueId) {
				params.append("vendorId", selectedVenueId);
			}

			const response = await fetch(`/api/games?${params.toString()}`);
			if (!response.ok) {
				throw new Error("Failed to fetch game sessions");
			}

			const sessions = await response.json();
			await enrichEventsWithVendorInfo(sessions);
			setGameSessions(sessions);
		} catch (error) {
			console.error("Failed to fetch game sessions", error);
			setGameSessions([]);
		} finally {
			setIsLoading(false);
		}
	};

	const handleJoinClick = (sessionId: string) => {
		if (showCharacterDialog) {
			return;
		}

		// Check if user is logged in - redirect to login if not
		if (!currentUserId) {
			router.push("/auth/login");
			return;
		}

		// Find the session to check if user is already signed up
		const session = [...gameSessions, ...allEvents].find(
			(s) => s.id === sessionId
		);

		if (!session) {
			return;
		}

		// Check if user is already signed up (pending, signed up, or waitlisted)
		const isUserSignedUp =
			currentUserId &&
			(session.signedUpPlayers.includes(currentUserId) ||
				session.waitlist.includes(currentUserId) ||
				session.pendingPlayers.includes(currentUserId));

		if (isUserSignedUp) {
			// Handle withdraw
			handleWithdraw(sessionId);
		} else {
			// Handle join request
			setSessionToJoin(session);
			setShowCharacterDialog(true);
		}
	};

	const handleWithdraw = async (sessionId: string) => {
		setJoiningSessionId(sessionId);
		setJoinError(null);

		try {
			const response = await fetch(`/api/games/${sessionId}/leave`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(
					errorData.error || "Failed to withdraw from game session"
				);
			}

			const updatedSession = await response.json();

			// Update the session in the search results list
			setGameSessions((prevSessions) =>
				prevSessions.map((session) =>
					session.id === sessionId ? updatedSession : session
				)
			);

			// Update the session in the all events list
			setAllEvents((prevEvents) =>
				prevEvents.map((event) =>
					event.id === sessionId ? updatedSession : event
				)
			);
		} catch (error) {
			setJoinError(
				error instanceof Error
					? error.message
					: "Failed to withdraw from game session"
			);
		} finally {
			setJoiningSessionId(null);
		}
	};

	const handleCharacterSelect = async (
		characterId?: string,
		characterName?: string
	) => {
		if (!sessionToJoin) return;

		setShowCharacterDialog(false);
		setJoiningSessionId(sessionToJoin.id);
		setJoinError(null);

		try {
			const response = await fetch(`/api/games/${sessionToJoin.id}/join`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ characterId, characterName }),
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.error || "Failed to join game session");
			}

			const updatedSession = await response.json();

			// Update the session in the search results list
			// Preserve the distance field from the original session
			setGameSessions((prevSessions) =>
				prevSessions.map((session) =>
					session.id === sessionToJoin.id
						? { ...updatedSession, distance: session.distance }
						: session
				)
			);

			// Update the session in the all events list
			setAllEvents((prevEvents) =>
				prevEvents.map((event) =>
					event.id === sessionToJoin.id ? updatedSession : event
				)
			);
		} catch (error) {
			setJoinError(
				error instanceof Error
					? error.message
					: "Failed to join game session"
			);
		} finally {
			setJoiningSessionId(null);
			setSessionToJoin(null);
		}
	};

	const handleCharacterCancel = () => {
		setShowCharacterDialog(false);
		setSessionToJoin(null);
	};

	return (
		<section className="space-y-6">
			{showCharacterDialog && sessionToJoin && (
				<CharacterSelectionDialog
					onSelect={handleCharacterSelect}
					onCancel={handleCharacterCancel}
					isLoading={joiningSessionId !== null}
					gameSystem={mapGameToSystemKey(sessionToJoin.game)}
				/>
			)}
			<div className="flex flex-col items-start gap-4 sm:flex-row sm:items-start sm:justify-between">
				<div>
					<h1 className="text-2xl font-semibold text-slate-100">
						Find Games
					</h1>
					<p className="mt-2 text-sm text-slate-400">
						Search for available in-person game sessions by game, date,
						time, or any combination.
					</p>
				</div>
				<div className="flex gap-2 flex-shrink-0">
					<Link
						href="/post"
						className="rounded-lg bg-gradient-to-r from-amber-500 via-purple-500 to-indigo-500 px-4 py-2 text-sm font-semibold text-white transition hover:from-amber-400 hover:via-purple-400 hover:to-indigo-400focus:ring-offset-slate-950"
					>
						Post Game
					</Link>
				</div>
			</div>

			<Advertisement />

			<div className="rounded-lg border-2 border-amber-500/50 bg-gradient-to-br from-amber-600/20 via-purple-600/20 to-indigo-600/20">
				<button
					type="button"
					onClick={() => setIsSearchFormOpen(!isSearchFormOpen)}
					className="flex w-full items-center justify-between gap-2 bg-gradient-to-br from-amber-600/10 via-purple-600/10 to-indigo-600/10 px-4 py-3 text-left text-sm font-semibold text-amber-100 transition hover:from-amber-600/20 hover:via-purple-600/20 hover:to-indigo-600/20"
				>
					<span>
						{isSearchFormOpen
							? "Hide search filters"
							: "Show search filters"}
					</span>
					<span className="text-xs uppercase tracking-wide text-amber-400">
						{isSearchFormOpen ? "Collapse" : "Expand"}
					</span>
				</button>
				{isSearchFormOpen && (
					<div className="space-y-4 border-t border-slate-800 p-6">
						<p className="text-xs text-slate-400">
							Select any combination of filters to search. All filters
							are optional.
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

						<div className="space-y-2 relative">
							<label
								htmlFor="host-search"
								className="block text-sm font-medium text-slate-200"
							>
								Host Name
							</label>
							<input
								id="host-search"
								type="text"
								value={selectedHostId ? selectedHostName : hostSearch}
								onChange={(e) => {
									const value = e.target.value;
									setHostSearch(value);
									if (selectedHostId) {
										setSelectedHostId("");
										setSelectedHostName("");
									}
								}}
								onFocus={() => {
									if (hostSearchResults.length > 0) {
										setShowHostResults(true);
									}
								}}
								placeholder="Search for a host by name..."
								className="w-full rounded-xl border border-slate-800 bg-slate-950/80 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
							/>
							{showHostResults && hostSearchResults.length > 0 && (
								<div className="host-results-dropdown absolute z-10 w-full mt-1 rounded-lg border border-slate-700 bg-slate-900 shadow-lg max-h-60 overflow-y-auto">
									{hostSearchResults.map((host) => (
										<button
											key={host.id}
											type="button"
											onClick={() => {
												setSelectedHostId(host.id);
												setSelectedHostName(host.name);
												setHostSearch("");
												setShowHostResults(false);
											}}
											className="w-full px-4 py-2 text-left text-sm text-slate-200 hover:bg-slate-800 transition-colors flex items-center gap-2"
										>
											{host.avatarUrl && (
												<img
													src={host.avatarUrl}
													alt={host.name}
													className="w-6 h-6 rounded-full"
												/>
											)}
											<span>{host.name}</span>
										</button>
									))}
								</div>
							)}
							{selectedHostId && (
								<div className="flex items-center gap-2 mt-2">
									<span className="text-xs text-slate-400">
										Filtering by:{" "}
										<span className="text-sky-400">
											{selectedHostName}
										</span>
									</span>
									<button
										type="button"
										onClick={() => {
											setSelectedHostId("");
											setSelectedHostName("");
											setHostSearch("");
										}}
										className="text-xs text-red-400 hover:text-red-300"
									>
										Clear
									</button>
								</div>
							)}
							<p className="text-xs text-slate-500">
								Find games hosted by a specific person
							</p>
						</div>

						<div className="space-y-2 relative">
							<label
								htmlFor="venue-search"
								className="block text-sm font-medium text-slate-200"
							>
								Venue Name
							</label>
							<input
								id="venue-search"
								type="text"
								value={selectedVenueId ? selectedVenueName : venueSearch}
								onChange={(e) => {
									const value = e.target.value;
									setVenueSearch(value);
									if (selectedVenueId) {
										setSelectedVenueId("");
										setSelectedVenueName("");
									}
								}}
								onFocus={() => {
									if (venueSearchResults.length > 0) {
										setShowVenueResults(true);
									}
								}}
								placeholder="Search for a venue by name..."
								className="w-full rounded-xl border border-slate-800 bg-slate-950/80 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
							/>
							{showVenueResults && venueSearchResults.length > 0 && (
								<div className="venue-results-dropdown absolute z-10 w-full mt-1 rounded-lg border border-slate-700 bg-slate-900 shadow-lg max-h-60 overflow-y-auto">
									{venueSearchResults.map((venue) => (
										<button
											key={venue.id}
											type="button"
											onClick={() => {
												setSelectedVenueId(venue.id);
												setSelectedVenueName(venue.vendorName);
												setVenueSearch("");
												setShowVenueResults(false);
											}}
											className="w-full px-4 py-2 text-left text-sm text-slate-200 hover:bg-slate-800 transition-colors"
										>
											{venue.vendorName}
										</button>
									))}
								</div>
							)}
							{selectedVenueId && (
								<div className="flex items-center gap-2 mt-2">
									<span className="text-xs text-slate-400">
										Filtering by:{" "}
										<span className="text-sky-400">
											{selectedVenueName}
										</span>
									</span>
									<button
										type="button"
										onClick={() => {
											setSelectedVenueId("");
											setSelectedVenueName("");
											setVenueSearch("");
										}}
										className="text-xs text-red-400 hover:text-red-300"
									>
										Clear
									</button>
								</div>
							)}
							<p className="text-xs text-slate-500">
								Find games at a specific venue
							</p>
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
								Find games near a specific location
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
														onClick={(e) =>
															toggleTime(slot, e.shiftKey)
														}
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
							className="mt-4 w-full rounded-xl border-amber-500/50 border-1  w-full items-center justify-between gap-2 bg-gradient-to-br from-amber-600/20 via-purple-600/20 to-indigo-600/20 px-4 py-3 text-left text-sm font-semibold text-slate-100 transition hover:from-amber-600/30 hover:via-purple-600/30 hover:to-indigo-600/30 flex aling-items-center justify-center disabled:cursor-not-allowed disabled:opacity-50"
							disabled={
								(!selectedGame &&
									!selectedDate &&
									selectedTimes.length === 0 &&
									!locationSearch &&
									!selectedHostId &&
									!selectedVenueId) ||
								(selectedGame === "Other" && !customGameName.trim()) ||
								isLoading
							}
						>
							{isLoading ? "Searching..." : "Search Games"}
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
						locationSearch ||
						selectedHostId ||
						selectedVenueId ? (
							<>
								Showing games
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
								{selectedHostId && (
									<>
										{" "}
										hosted by{" "}
										<span className="text-sky-400">
											{selectedHostName}
										</span>
									</>
								)}
								{selectedVenueId && (
									<>
										{" "}
										at{" "}
										<span className="text-sky-400">
											{selectedVenueName}
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
							<>Showing all games</>
						)}
					</p>

					{isLoading ? (
						<p className="mt-4 text-sm text-slate-500">Loading...</p>
					) : gameSessions.length > 0 ? (
						<div className="mt-4 space-y-3 max-w-3xl mx-auto">
							{gameSessions.map((session) => (
								<GameSessionCard
									key={session.id}
									session={session}
									userTimezone={userTimezone}
									joiningSessionId={joiningSessionId}
									onJoin={handleJoinClick}
									currentUserId={currentUserId}
								/>
							))}
						</div>
					) : (
						<p className="mt-4 text-sm text-slate-500">
							No games found. Try adjusting your search criteria.
						</p>
					)}
				</div>
			)}

			{/* All Events Feed */}
			{!hasSearched && (
				<div className="rounded-xl border border-slate-800/60 bg-slate-900/40 p-6">
					<h2 className="text-lg font-semibold text-slate-100">
						All Upcoming Events
					</h2>
					<p className="mt-2 text-sm text-slate-400">
						Browse all game sessions in chronological order
					</p>

					{isLoadingEvents ? (
						<p className="mt-4 text-sm text-slate-500">
							Loading events...
						</p>
					) : allEvents.length > 0 ? (
						<div className="mt-4 space-y-3 max-w-3xl mx-auto">
							{allEvents.map((event) => (
								<GameSessionCard
									key={event.id}
									session={event}
									userTimezone={userTimezone}
									joiningSessionId={joiningSessionId}
									onJoin={handleJoinClick}
									currentUserId={currentUserId}
								/>
							))}
						</div>
					) : (
						<p className="mt-4 text-sm text-slate-500">
							No upcoming events available.
						</p>
					)}
				</div>
			)}
		</section>
	);
}
