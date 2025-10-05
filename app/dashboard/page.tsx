"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
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
  imageUrl?: string;
  location?: string;
  zipCode?: string;
  latitude?: number;
  longitude?: number;
  distance?: number;
  hostName?: string;
  hostAvatarUrl?: string;
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
  const isPlayer = currentUserId && session.signedUpPlayers.includes(currentUserId);
  const isWaitlisted = currentUserId && session.waitlist.includes(currentUserId);

  let userRole = "";
  if (isHost) {
    userRole = "Hosting";
  } else if (isPlayer) {
    userRole = "Playing";
  } else if (isWaitlisted) {
    userRole = "Waitlisted";
  }

  return (
    <div className={`rounded-lg border p-4 ${
      isHost 
        ? "border-purple-500/50 bg-purple-950/20" 
        : "border-slate-800 bg-slate-950/40"
    }`}>
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
          <div className="flex items-center gap-2">
            <Link href={`/games/${session.id}`} className="hover:text-sky-300 transition-colors">
              <h3 className="font-medium text-slate-100">{session.game}</h3>
            </Link>
            {userRole && (
              <span className={`text-xs px-2 py-1 rounded-full ${
                isHost ? "bg-purple-500/20 text-purple-300" :
                isPlayer ? "bg-green-500/20 text-green-300" :
                "bg-yellow-500/20 text-yellow-300"
              }`}>
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
                  (Full)
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
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [gameSessions, setGameSessions] = useState<GameSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userTimezone, setUserTimezone] = useState<string>(DEFAULT_TIMEZONE);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

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

        // Fetch user's game sessions
        const gamesResponse = await fetch("/api/games/my-games");
        if (gamesResponse.ok) {
          const sessions = await gamesResponse.json();
          setGameSessions(sessions);
        }
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-100">Dashboard</h1>
        <p className="mt-2 text-sm text-slate-400">
          View your upcoming game sessions - games you&apos;re hosting, playing, or waitlisted for.
        </p>
      </div>

      <div className="rounded-xl border border-slate-800/60 bg-slate-900/40 p-6">
        <h2 className="text-lg font-semibold text-slate-100">My Upcoming Games</h2>
        <p className="mt-2 text-sm text-slate-400">
          Games you&apos;re hosting or participating in
        </p>

        {isLoading ? (
          <p className="mt-4 text-sm text-slate-500">Loading your games...</p>
        ) : gameSessions.length > 0 ? (
          <div className="mt-4 space-y-3">
            {gameSessions.map((session) => (
              <GameSessionCard
                key={session.id}
                session={session}
                userTimezone={userTimezone}
                currentUserId={currentUserId}
              />
            ))}
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            <p className="text-sm text-slate-500">
              You don&apos;t have any upcoming games yet.
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
    </section>
  );
}
