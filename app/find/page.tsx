"use client";

import { useState, useEffect } from "react";
import { GAME_OPTIONS, TIME_SLOTS } from "@/lib/constants";
import { formatDateInTimezone, DEFAULT_TIMEZONE } from "@/lib/timezone";

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

    fetchTimezone();
  }, []);

  const toggleTime = (slot: string) => {
    setSelectedTimes((prev) =>
      prev.includes(slot)
        ? prev.filter((item) => item !== slot)
        : [...prev, slot]
    );
  };

  const handleSearch = async () => {
    setIsLoading(true);
    setHasSearched(true);

    try {
      const params = new URLSearchParams();
      if (selectedGame) params.append("game", selectedGame);
      if (selectedDate) params.append("date", selectedDate);
      if (selectedTimes.length > 0) params.append("times", selectedTimes.join(","));

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
      
      // Update the session in the list
      setGameSessions(prevSessions =>
        prevSessions.map(session =>
          session.id === sessionId ? updatedSession : session
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
          Search for available game sessions by selecting a game and preferred time.
        </p>
      </div>

      <div className="space-y-4 rounded-2xl border border-slate-800/60 bg-slate-900/40 p-6 shadow-lg shadow-slate-900/30">
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
          <label className="block text-sm font-medium text-slate-200">
            Preferred Time
          </label>
          <div className="flex flex-wrap gap-2">
            {TIME_SLOTS.map((slot) => {
              const active = selectedTimes.includes(slot);
              return (
                <button
                  key={slot}
                  type="button"
                  onClick={() => toggleTime(slot)}
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
          disabled={!selectedGame || selectedTimes.length === 0 || !selectedDate || isLoading}
        >
          {isLoading ? "Searching..." : "Search Games"}
        </button>
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
            {selectedGame && (
              <>
                Showing <span className="text-sky-400">{selectedGame}</span> games
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
              </>
            )}
          </p>

          {isLoading ? (
            <p className="mt-4 text-sm text-slate-500">Loading...</p>
          ) : gameSessions.length > 0 ? (
            <div className="mt-4 space-y-3">
              {gameSessions.map((session) => {
                const availableSlots = session.maxPlayers - session.signedUpPlayers.length;
                const isFull = availableSlots <= 0;
                
                return (
                  <div
                    key={session.id}
                    className="rounded-lg border border-slate-800 bg-slate-950/40 p-4"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="font-medium text-slate-100">{session.game}</h3>
                        <div className="mt-2 space-y-1 text-sm text-slate-400">
                          <p>
                            <span className="text-slate-500">Date:</span>{" "}
                            {formatDateInTimezone(session.date, userTimezone)}
                          </p>
                          <p>
                            <span className="text-slate-500">Times:</span>{" "}
                            {session.times.join(", ")}
                          </p>
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
                          onClick={() => handleJoin(session.id)}
                          disabled={joiningSessionId === session.id}
                          className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 focus:ring-offset-slate-950 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {joiningSessionId === session.id ? "Joining..." : "Join Game"}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="mt-4 text-sm text-slate-500">
              No games found. Try adjusting your search criteria.
            </p>
          )}
        </div>
      )}
    </section>
  );
}
