"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { GAME_OPTIONS, TIME_SLOTS } from "@/lib/constants";
import { formatDateInTimezone, DEFAULT_TIMEZONE } from "@/lib/timezone";
import CityAutocomplete from "@/components/CityAutocomplete";

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
}: {
  session: GameSession;
  userTimezone: string;
  joiningSessionId: string | null;
  onJoin: (sessionId: string) => void;
}) {
  const availableSlots = session.maxPlayers - session.signedUpPlayers.length;
  const isFull = availableSlots <= 0;

  return (
    <div
      key={session.id}
      className="rounded-lg border border-slate-800 bg-slate-950/40 p-4"
    >
      <div className="flex items-start justify-between gap-4">
        {session.imageUrl && (
          <div className="flex-shrink-0">
            <Link href={`/games/${session.id}`}>
              <img
                src={session.imageUrl}
                alt={session.game}
                className="h-24 w-24 rounded-lg border border-slate-700 object-cover"
              />
            </Link>
          </div>
        )}
        <div className="flex-1">
          <Link href={`/games/${session.id}`} className="hover:text-sky-300 transition-colors">
            <h3 className="font-medium text-slate-100">{session.game}</h3>
          </Link>
          <div className="mt-2 space-y-1 text-sm text-slate-400">
            <p>
              <span className="text-slate-500">Date:</span>{" "}
              {formatDateInTimezone(session.date, userTimezone)}
            </p>
            <p>
              <span className="text-slate-500">Times:</span>{" "}
              {session.times.join(", ")}
            </p>
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
              <span className={isFull ? "text-orange-400" : "text-green-400"}>
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
                <span className="text-yellow-400">{session.waitlist.length}</span>
              </p>
            )}
            {session.description && (
              <p className="mt-2 text-slate-300">{session.description}</p>
            )}
          </div>
        </div>
        <div className="flex-shrink-0">
          <button
            onClick={() => onJoin(session.id)}
            disabled={joiningSessionId === session.id}
            className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 focus:ring-offset-slate-950 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {joiningSessionId === session.id ? "Joining..." : "Join Game"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function FindGamesPage() {
  const [selectedGame, setSelectedGame] = useState("");
  const [selectedTimes, setSelectedTimes] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [gameSessions, setGameSessions] = useState<GameSession[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [joiningSessionId, setJoiningSessionId] = useState<string | null>(null);
  const [joinError, setJoinError] = useState<string | null>(null);
  const [userTimezone, setUserTimezone] = useState<string>(DEFAULT_TIMEZONE);
  const [isSearchFormOpen, setIsSearchFormOpen] = useState(true);
  const [allEvents, setAllEvents] = useState<GameSession[]>([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState(false);
  const [lastClickedSlot, setLastClickedSlot] = useState<string>("");
  const [locationSearch, setLocationSearch] = useState("");
  const [radiusMiles, setRadiusMiles] = useState("25");

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

    const fetchUserProfile = async () => {
      try {
        const response = await fetch("/api/profile");
        if (response.ok) {
          const profile = await response.json();
          // Auto-populate location with user's zip code
          if (profile.zipCode) {
            setLocationSearch(profile.zipCode);
          }
        }
      } catch (error) {
        console.error("Failed to fetch user profile:", error);
      }
    };

    const fetchAllEvents = async () => {
      setIsLoadingEvents(true);
      try {
        const response = await fetch("/api/games");
        if (response.ok) {
          const events = await response.json();
          setAllEvents(events);
        }
      } catch (error) {
        console.error("Failed to fetch events:", error);
      } finally {
        setIsLoadingEvents(false);
      }
    };

    fetchTimezone();
    fetchUserProfile();
    fetchAllEvents();
  }, []);

  const toggleTime = (slot: string, shiftKey: boolean = false) => {
    setSelectedTimes((prev) => {
      // Handle range selection with shift key
      if (shiftKey && lastClickedSlot) {
        const startIdx = TIME_SLOTS.indexOf(lastClickedSlot);
        const endIdx = TIME_SLOTS.indexOf(slot);
        
        if (startIdx !== -1 && endIdx !== -1) {
          const [minIdx, maxIdx] = [Math.min(startIdx, endIdx), Math.max(startIdx, endIdx)];
          const slotsInRange = TIME_SLOTS.slice(minIdx, maxIdx + 1);
          
          // Check if all slots in range are already selected
          const allSelected = slotsInRange.every(s => prev.includes(s));
          
          if (allSelected) {
            // Deselect all slots in range
            return prev.filter(s => !slotsInRange.includes(s));
          } else {
            // Select all slots in range
            const newSlots = [...prev];
            slotsInRange.forEach(s => {
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
      if (selectedGame) params.append("game", selectedGame);
      if (selectedDate) params.append("date", selectedDate);
      if (selectedTimes.length > 0) params.append("times", selectedTimes.join(","));
      if (locationSearch) {
        params.append("location", locationSearch);
        params.append("radius", radiusMiles);
      }

      const response = await fetch(`/api/games?${params.toString()}`);
      if (!response.ok) {
        throw new Error("Failed to fetch game sessions");
      }

      const sessions = await response.json();
      setGameSessions(sessions);
    } catch (error) {
      console.error("Failed to fetch game sessions", error);
      setGameSessions([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoin = async (sessionId: string) => {
    setJoiningSessionId(sessionId);
    setJoinError(null);

    try {
      const response = await fetch(`/api/games/${sessionId}/join`, {
        method: "POST",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to join game session");
      }

      const updatedSession = await response.json();
      
      // Update the session in the search results list
      setGameSessions(prevSessions =>
        prevSessions.map(session =>
          session.id === sessionId ? updatedSession : session
        )
      );
      
      // Update the session in the all events list
      setAllEvents(prevEvents =>
        prevEvents.map(event =>
          event.id === sessionId ? updatedSession : event
        )
      );
    } catch (error) {
      setJoinError(error instanceof Error ? error.message : "Failed to join game session");
    } finally {
      setJoiningSessionId(null);
    }
  };

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-100">Find Games</h1>
        <p className="mt-2 text-sm text-slate-400">
          Search for available game sessions by game, date, time, or any combination.
        </p>
      </div>

      <div className="rounded-lg border border-slate-800 bg-slate-950/60">
        <button
          type="button"
          onClick={() => setIsSearchFormOpen(!isSearchFormOpen)}
          className="flex w-full items-center justify-between gap-2 bg-slate-900/50 px-4 py-3 text-left text-sm font-semibold text-slate-100 transition hover:bg-slate-900/80"
        >
          <span>
            {isSearchFormOpen ? "Hide search filters" : "Show search filters"}
          </span>
          <span className="text-xs uppercase tracking-wide text-slate-400">
            {isSearchFormOpen ? "Collapse" : "Expand"}
          </span>
        </button>
        {isSearchFormOpen && (
          <div className="space-y-4 border-t border-slate-800 p-6">
            <p className="text-xs text-slate-400">
              Select any combination of filters to search. All filters are optional.
            </p>
            <div className="space-y-2">
              <label htmlFor="game-select" className="block text-sm font-medium text-slate-200">
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

            <div className="space-y-2">
              <label htmlFor="date-select" className="block text-sm font-medium text-slate-200">
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
              <label htmlFor="location-search" className="block text-sm font-medium text-slate-200">
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
                  <label htmlFor="radius-select" className="block text-sm font-medium text-slate-200">
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
                Click to select individual times or hold Shift and click to select a range.
              </p>
              <div className="flex flex-wrap gap-2">
                {TIME_SLOTS.map((slot) => {
                  const active = selectedTimes.includes(slot);
                  return (
                    <button
                      key={slot}
                      type="button"
                      onClick={(e) => toggleTime(slot, e.shiftKey)}
                      className={tagButtonClasses(active, { size: "sm" })}
                    >
                      {slot}
                    </button>
                  );
                })}
              </div>
              <p className="text-xs text-slate-500">
                {selectedTimes.length} time slot(s) selected
              </p>
            </div>

            <button
              type="button"
              onClick={handleSearch}
              className="mt-4 w-full rounded-xl bg-sky-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={(!selectedGame && !selectedDate && selectedTimes.length === 0 && !locationSearch) || isLoading}
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
          <h2 className="text-lg font-semibold text-slate-100">Search Results</h2>
          <p className="mt-2 text-sm text-slate-400">
            {(selectedGame || selectedDate || selectedTimes.length > 0 || locationSearch) ? (
              <>
                Showing games
                {selectedGame && (
                  <>
                    {" "}for <span className="text-sky-400">{selectedGame}</span>
                  </>
                )}
                {selectedDate && (
                  <>
                    {" "}on <span className="text-sky-400">{formatDateInTimezone(selectedDate, userTimezone)}</span>
                  </>
                )}
                {selectedTimes.length > 0 && (
                  <>
                    {" "}at <span className="text-sky-400">{selectedTimes.join(", ")}</span>
                  </>
                )}
                {locationSearch && (
                  <>
                    {" "}near <span className="text-sky-400">{locationSearch}</span>
                    {" "}(within {radiusMiles} miles)
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
            <div className="mt-4 space-y-3">
              {gameSessions.map((session) => (
                <GameSessionCard
                  key={session.id}
                  session={session}
                  userTimezone={userTimezone}
                  joiningSessionId={joiningSessionId}
                  onJoin={handleJoin}
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
      <div className="rounded-xl border border-slate-800/60 bg-slate-900/40 p-6">
        <h2 className="text-lg font-semibold text-slate-100">All Upcoming Events</h2>
        <p className="mt-2 text-sm text-slate-400">
          Browse all game sessions in chronological order
        </p>

        {isLoadingEvents ? (
          <p className="mt-4 text-sm text-slate-500">Loading events...</p>
        ) : allEvents.length > 0 ? (
          <div className="mt-4 space-y-3">
            {allEvents.map((event) => (
              <GameSessionCard
                key={event.id}
                session={event}
                userTimezone={userTimezone}
                joiningSessionId={joiningSessionId}
                onJoin={handleJoin}
              />
            ))}
          </div>
        ) : (
          <p className="mt-4 text-sm text-slate-500">
            No upcoming events available.
          </p>
        )}
      </div>
    </section>
  );
}
