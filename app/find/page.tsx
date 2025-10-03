"use client";

import { useState } from "react";
import { GAME_OPTIONS, TIME_SLOTS } from "@/lib/constants";

export default function FindGamesPage() {
  const [selectedGame, setSelectedGame] = useState("");
  const [selectedTime, setSelectedTime] = useState("");

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
          <label htmlFor="time-select" className="block text-sm font-medium text-slate-200">
            Preferred Time
          </label>
          <select
            id="time-select"
            value={selectedTime}
            onChange={(e) => setSelectedTime(e.target.value)}
            className="w-full rounded-xl border border-slate-800 bg-slate-950/80 px-4 py-3 text-sm text-slate-100 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
          >
            <option value="">Choose a time...</option>
            {TIME_SLOTS.map((slot) => (
              <option key={slot} value={slot}>
                {slot}
              </option>
            ))}
          </select>
        </div>

        <button
          type="button"
          className="mt-4 w-full rounded-xl bg-sky-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
          disabled={!selectedGame || !selectedTime}
        >
          Search Games
        </button>
      </div>

      {selectedGame && selectedTime && (
        <div className="rounded-xl border border-slate-800/60 bg-slate-900/40 p-6">
          <h2 className="text-lg font-semibold text-slate-100">Search Results</h2>
          <p className="mt-2 text-sm text-slate-400">
            Searching for <span className="text-sky-400">{selectedGame}</span> games at{" "}
            <span className="text-sky-400">{selectedTime}</span>...
          </p>
          <p className="mt-4 text-sm text-slate-500">
            No games found. Try adjusting your search criteria.
          </p>
        </div>
      )}
    </section>
  );
}
