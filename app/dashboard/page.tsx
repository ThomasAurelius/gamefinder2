"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { formatDateInTimezone, DEFAULT_TIMEZONE } from "@/lib/timezone";
import HostFeedbackDialog from "@/components/HostFeedbackDialog";

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

  const detailsLink = isCampaign ? `/campaigns/${session.id}` : `/games/${session.id}`;

  // Check if user has already rated the host
  useEffect(() => {
    if (isPast && isPlayer && currentUserId && session.userId) {
      const checkIfRated = async () => {
        try {
          const response = await fetch(`/api/host-feedback/stats/${session.userId}`);
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
      <div className={`rounded-lg border overflow-hidden ${
        isHost 
          ? "border-purple-500/50 bg-purple-950/20" 
          : "border-slate-800 bg-slate-950/40"
      }`}>
        {session.imageUrl && (
          <Link href={detailsLink}>
            <img
              src={session.imageUrl}
              alt={session.game}
              className="w-full h-auto object-cover"
            />
          </Link>
        )}
        <div className="p-4">
          <div className="flex items-center gap-2 flex-wrap">
            <Link href={detailsLink} className="hover:text-sky-300 transition-colors">
              <h3 className="font-medium text-slate-100">{session.game}</h3>
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
            {isCampaign && session.sessionsLeft !== undefined && (
              <p>
                <span className="text-slate-500">Sessions:</span>{" "}
                <span className="text-slate-300">{session.sessionsLeft}</span>
              </p>
            )}
            {isCampaign && session.costPerSession !== undefined && session.costPerSession > 0 && (
              <p>
                <span className="text-slate-500">Cost:</span>{" "}
                <span className="text-slate-300">${session.costPerSession.toFixed(2)} per session</span>
              </p>
            )}
            {session.description && (
              <p className="mt-2 text-slate-300">{session.description}</p>
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

export default function DashboardPage() {
  const [gameSessions, setGameSessions] = useState<GameSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userTimezone, setUserTimezone] = useState<string>(DEFAULT_TIMEZONE);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [showPastSessions, setShowPastSessions] = useState(false);

  const today = new Date();
  const upcomingSessions = gameSessions.filter(session => new Date(session.date) >= today);
  const pastSessions = gameSessions.filter(session => new Date(session.date) < today);

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
          gameSessions = gameSessions.map(session => ({ ...session, isCampaign: false }));
        }

        // Fetch user's campaign sessions (multi-session campaigns)
        const campaignsResponse = await fetch("/api/campaigns/my-campaigns");
        let campaignSessions: GameSession[] = [];
        if (campaignsResponse.ok) {
          campaignSessions = await campaignsResponse.json();
          // Mark these as campaigns
          campaignSessions = campaignSessions.map(session => ({ ...session, isCampaign: true }));
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
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-100">Dashboard</h1>
        <p className="mt-2 text-sm text-slate-400">
          View your upcoming sessions - one-time games and campaigns you&apos;re hosting, playing, or waitlisted for.
        </p>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3">
        <Link
          href="/post"
          className="inline-flex items-center rounded-lg border border-slate-700 bg-slate-800/40 px-4 py-2.5 text-sm font-medium text-slate-200 transition hover:border-sky-600 hover:bg-slate-800 hover:text-sky-300"
        >
          Post Game
        </Link>
        <Link
          href="/post-campaign"
          className="inline-flex items-center rounded-lg border border-slate-700 bg-slate-800/40 px-4 py-2.5 text-sm font-medium text-slate-200 transition hover:border-sky-600 hover:bg-slate-800 hover:text-sky-300"
        >
          Post Campaign
        </Link>
        <Link
          href="/tall-tales"
          className="inline-flex items-center rounded-lg border border-slate-700 bg-slate-800/40 px-4 py-2.5 text-sm font-medium text-slate-200 transition hover:border-sky-600 hover:bg-slate-800 hover:text-sky-300"
        >
          Post Tall Tale
        </Link>
      </div>

      <div className="rounded-xl border border-slate-800/60 bg-slate-900/40 p-6">
        <h2 className="text-lg font-semibold text-slate-100">My Upcoming Sessions</h2>
        <p className="mt-2 text-sm text-slate-400">
          Your one-time games and multi-session campaigns
        </p>

        {isLoading ? (
          <p className="mt-4 text-sm text-slate-500">Loading your sessions...</p>
        ) : upcomingSessions.length > 0 ? (
          <div className="mt-4 space-y-3 max-w-3xl">
            {upcomingSessions.map((session) => (
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
        <div className="rounded-xl border border-slate-800/60 bg-slate-900/40 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-100">Past Sessions</h2>
              <p className="mt-2 text-sm text-slate-400">
                Rate your hosts and review past games
              </p>
            </div>
            <button
              onClick={() => setShowPastSessions(!showPastSessions)}
              className="text-sm text-sky-400 hover:text-sky-300 transition-colors"
            >
              {showPastSessions ? "Hide" : "Show"} ({pastSessions.length})
            </button>
          </div>

          {showPastSessions && (
            <div className="mt-4 space-y-3 max-w-3xl">
              {pastSessions.map((session) => (
                <GameSessionCard
                  key={session.id}
                  session={session}
                  userTimezone={userTimezone}
                  currentUserId={currentUserId}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
