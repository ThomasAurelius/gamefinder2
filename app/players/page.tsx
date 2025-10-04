"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { GAME_OPTIONS } from "@/lib/constants";
import CityAutocomplete from "@/components/CityAutocomplete";

type Player = {
  id: string;
  name: string;
  commonName: string;
  location: string;
  primaryRole: string;
  bio: string;
  favoriteGames: string[];
  avatarUrl?: string;
  distance?: number;
};

const ROLE_OPTIONS = ["Healer", "Damage", "Support", "DM", "Other"];

function PlayerCard({ player }: { player: Player }) {
  const displayName = player.commonName || player.name;
  
  return (
    <Link
      href={`/players/${player.id}`}
      className="group block rounded-xl border border-slate-800 bg-slate-900/60 p-6 transition hover:border-sky-500/60 hover:bg-slate-900"
    >
      <div className="flex items-start gap-4">
        {player.avatarUrl ? (
          <img
            src={player.avatarUrl}
            alt={displayName}
            className="h-16 w-16 rounded-full border border-slate-700 object-cover"
          />
        ) : (
          <div className="flex h-16 w-16 items-center justify-center rounded-full border border-slate-700 bg-slate-800 text-xl font-semibold text-slate-400">
            {displayName.charAt(0).toUpperCase()}
          </div>
        )}
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-slate-100 group-hover:text-sky-100">
            {displayName}
          </h3>
          {player.location && (
            <p className="mt-1 text-sm text-slate-400">
              {player.location}
              {player.distance !== undefined && (
                <span className="ml-2 text-sky-400">
                  ({player.distance.toFixed(1)} mi away)
                </span>
              )}
            </p>
          )}
          {player.primaryRole && (
            <p className="mt-1 text-sm text-sky-400">
              <span className="text-slate-500">Role:</span> {player.primaryRole}
            </p>
          )}
          {player.bio && (
            <p className="mt-2 line-clamp-2 text-sm text-slate-300">
              {player.bio}
            </p>
          )}
          {player.favoriteGames.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {player.favoriteGames.slice(0, 3).map((game) => (
                <span
                  key={game}
                  className="rounded-full border border-slate-700 bg-slate-800 px-2 py-1 text-xs text-slate-300"
                >
                  {game}
                </span>
              ))}
              {player.favoriteGames.length > 3 && (
                <span className="rounded-full border border-slate-700 bg-slate-800 px-2 py-1 text-xs text-slate-400">
                  +{player.favoriteGames.length - 3} more
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}

export default function PlayersPage() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [isSearchFormOpen, setIsSearchFormOpen] = useState(true);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [selectedGame, setSelectedGame] = useState("");
  const [locationSearch, setLocationSearch] = useState("");
  const [radiusMiles, setRadiusMiles] = useState("50");

  useEffect(() => {
    // Load all players on initial mount
    const loadInitialPlayers = async () => {
      setIsLoading(true);
      setHasSearched(true);

      try {
        const response = await fetch("/api/players");
        if (!response.ok) {
          throw new Error("Failed to fetch players");
        }

        const data = await response.json();
        setPlayers(data);
      } catch (error) {
        console.error("Failed to fetch players", error);
        setPlayers([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialPlayers();
  }, []);

  const handleSearch = async () => {
    setIsLoading(true);
    setHasSearched(true);

    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append("search", searchQuery);
      if (selectedRole) params.append("role", selectedRole);
      if (selectedGame) params.append("game", selectedGame);
      if (locationSearch) {
        params.append("location", locationSearch);
        params.append("radius", radiusMiles);
      }

      const response = await fetch(`/api/players?${params.toString()}`);
      if (!response.ok) {
        throw new Error("Failed to fetch players");
      }

      const data = await response.json();
      setPlayers(data);
    } catch (error) {
      console.error("Failed to fetch players", error);
      setPlayers([]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-100">Find Players</h1>
        <p className="mt-2 text-sm text-slate-400">
          Search for players by name, location, role, or favorite games. Use zip code or city to find players within a specific radius.
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
              Use the filters below to find players. Leave blank to see all players.
            </p>

            {/* Search Input */}
            <div>
              <label
                htmlFor="search"
                className="mb-2 block text-sm font-medium text-slate-300"
              >
                Search by Name or Location
              </label>
              <input
                type="text"
                id="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Enter name or location..."
                className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-2 text-sm text-slate-100 placeholder-slate-500 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/50"
              />
            </div>

            {/* Location/Zip Code Search */}
            <div>
              <label
                htmlFor="locationSearch"
                className="mb-2 block text-sm font-medium text-slate-300"
              >
                Location or Zip Code
              </label>
              <CityAutocomplete
                id="locationSearch"
                value={locationSearch}
                onChange={setLocationSearch}
                placeholder="Search for a city or enter zip code..."
                className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-2 text-sm text-slate-100 placeholder-slate-500 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/50"
              />
              <p className="mt-1 text-xs text-slate-500">
                Search for players within a radius of this location
              </p>
            </div>

            {/* Radius Selection */}
            {locationSearch && (
              <div>
                <label
                  htmlFor="radius"
                  className="mb-2 block text-sm font-medium text-slate-300"
                >
                  Search Radius
                </label>
                <select
                  id="radius"
                  value={radiusMiles}
                  onChange={(e) => setRadiusMiles(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-2 text-sm text-slate-100 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/50"
                >
                  <option value="10">10 miles</option>
                  <option value="25">25 miles</option>
                  <option value="50">50 miles</option>
                  <option value="100">100 miles</option>
                  <option value="250">250 miles</option>
                </select>
              </div>
            )}

            {/* Role Filter */}
            <div>
              <label
                htmlFor="role"
                className="mb-2 block text-sm font-medium text-slate-300"
              >
                Primary Role
              </label>
              <select
                id="role"
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-2 text-sm text-slate-100 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/50"
              >
                <option value="">All Roles</option>
                {ROLE_OPTIONS.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
            </div>

            {/* Game Filter */}
            <div>
              <label
                htmlFor="game"
                className="mb-2 block text-sm font-medium text-slate-300"
              >
                Favorite Game
              </label>
              <select
                id="game"
                value={selectedGame}
                onChange={(e) => setSelectedGame(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-2 text-sm text-slate-100 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/50"
              >
                <option value="">All Games</option>
                {GAME_OPTIONS.map((game) => (
                  <option key={game} value={game}>
                    {game}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={handleSearch}
              className="mt-4 w-full rounded-xl bg-sky-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={isLoading}
            >
              {isLoading ? "Searching..." : "Search Players"}
            </button>
          </div>
        )}
      </div>

      {hasSearched && (
        <div className="rounded-xl border border-slate-800/60 bg-slate-900/40 p-6">
          <h2 className="text-lg font-semibold text-slate-100">Search Results</h2>
          <p className="mt-2 text-sm text-slate-400">
            {players.length > 0 ? (
              <>
                Found <span className="text-sky-400">{players.length}</span>{" "}
                {players.length === 1 ? "player" : "players"}
                {(searchQuery || selectedRole || selectedGame) && " matching your criteria"}
              </>
            ) : (
              "No players found. Try adjusting your search criteria."
            )}
          </p>

          {players.length > 0 && (
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {players.map((player) => (
                <PlayerCard key={player.id} player={player} />
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
