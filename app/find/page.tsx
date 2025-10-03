"use client";

import { useState } from "react";
import { GAME_OPTIONS, TIME_SLOTS } from "@/lib/constants";

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

  const toggleTime = (slot: string) => {
    setSelectedTimes((prev) =>
      prev.includes(slot)
        ? prev.filter((item) => item !== slot)
        : [...prev, slot]
    );
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
          className="mt-4 w-full rounded-xl bg-sky-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
          disabled={!selectedGame || selectedTimes.length === 0 || !selectedDate}
        >
          Search Games
        </button>
      </div>

      {selectedGame && selectedTimes.length > 0 && selectedDate && (
        <div className="rounded-xl border border-slate-800/60 bg-slate-900/40 p-6">
          <h2 className="text-lg font-semibold text-slate-100">Search Results</h2>
          <p className="mt-2 text-sm text-slate-400">
            Searching for <span className="text-sky-400">{selectedGame}</span> games on{" "}
            <span className="text-sky-400">{new Date(selectedDate).toLocaleDateString()}</span> at{" "}
            <span className="text-sky-400">{selectedTimes.join(", ")}</span>...
          </p>
          <p className="mt-4 text-sm text-slate-500">
            No games found. Try adjusting your search criteria.
          </p>
        </div>
      )}
    </section>
  );
}
