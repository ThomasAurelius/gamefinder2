"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { formatDateInTimezone, DEFAULT_TIMEZONE } from "@/lib/timezone";
import { sortTimesByChronology } from "@/lib/constants";
import HostFeedbackDialog from "@/components/HostFeedbackDialog";
import PlayerFeedbackDialog from "@/components/PlayerFeedbackDialog";

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

type PlayerInfo = {
  id: string;
  name: string;
  commonName?: string;
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
  const [showHostFeedbackDialog, setShowHostFeedbackDialog] = useState(false);
  const [showPlayerFeedbackDialog, setShowPlayerFeedbackDialog] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<PlayerInfo | null>(null);
  const [playersList, setPlayersList] = useState<PlayerInfo[]>([]);
  const [loadingPlayers, setLoadingPlayers] = useState(false);
  const [hasRatedHost, setHasRatedHost] = useState(false);
  const [ratedPlayers, setRatedPlayers] = useState<Set<string>>(new Set());
  const [checkingRatings, setCheckingRatings] = useState(false);

  // Check if session is in the past
  const sessionDate = new Date(session.date);
  const isPast = sessionDate < new Date();

  // Check if player has rated the host for this session
  useEffect(() => {
    const checkHostRating = async () => {
      if (!isPast || !isPlayer || isHost) return;
      
      setCheckingRatings(true);
      try {
        const response = await fetch("/api/host-feedback/check", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sessionId: session.id,
            sessionType: isCampaign ? "campaign" : "game",
          }),
        });

        if (response.ok) {
          const data = await response.json();
          setHasRatedHost(data.hasRated);
        }
      } catch (error) {
        console.error(`Failed to check host rating status for session ${session.id}:`, error);
      } finally {
        setCheckingRatings(false);
      }
    };

    checkHostRating();
  }, [session.id, isPast, isPlayer, isHost, isCampaign]);

  let userRole = "";
  if (isHost) {
    userRole = "Hosting";
  } else if (isPlayer) {
    userRole = "Playing";
  } else if (isWaitlisted) {
    userRole = "Waitlisted";
  }

  const detailsLink = isCampaign ? `/campaigns/${session.id}` : `/games/${session.id}`;

  // Load players info when needed for rating
  const loadPlayersInfo = async () => {
    if (loadingPlayers || playersList.length > 0) return;

    setLoadingPlayers(true);
    try {
      const players: PlayerInfo[] = [];
      const rated = new Set<string>();
      
      // Fetch all player info and rating status concurrently
      const playerPromises = session.signedUpPlayers
        .filter(playerId => playerId !== currentUserId)
        .map(async (playerId) => {
          try {
            // Fetch player info and rating status in parallel
            const [userResponse, ratingCheckResponse] = await Promise.all([
              fetch(`/api/public/users/${playerId}`),
              fetch("/api/player-feedback/check", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  playerId,
                  sessionId: session.id,
                  sessionType: isCampaign ? "campaign" : "game",
                }),
              }),
            ]);

            // Parse player info
            let playerInfo: PlayerInfo | null = null;
            if (userResponse.ok) {
              try {
                const userData = await userResponse.json();
                playerInfo = {
                  id: playerId,
                  name: userData.name || "Unknown",
                  commonName: userData.commonName,
                };
              } catch (error) {
                console.error(`Failed to parse user data for player ${playerId}:`, error);
              }
            }

            // Parse rating status
            let hasRated = false;
            if (ratingCheckResponse.ok) {
              try {
                const ratingData = await ratingCheckResponse.json();
                hasRated = ratingData.hasRated;
              } catch (error) {
                console.error(`Failed to parse rating data for player ${playerId}:`, error);
              }
            }

            return { playerInfo, hasRated, playerId };
          } catch (error) {
            console.error(`Failed to fetch info for player ${playerId}:`, error);
            return null;
          }
        });

      const results = await Promise.allSettled(playerPromises);
      
      // Process results
      results.forEach(result => {
        if (result.status === 'fulfilled' && result.value?.playerInfo) {
          players.push(result.value.playerInfo);
          if (result.value.hasRated) {
            rated.add(result.value.playerId);
          }
        }
      });

      setPlayersList(players);
      setRatedPlayers(rated);
    } catch (error) {
      console.error("Failed to load players:", error);
    } finally {
      setLoadingPlayers(false);
    }
  };

  const handleRatePlayer = (player: PlayerInfo) => {
    setSelectedPlayer(player);
    setShowPlayerFeedbackDialog(true);
  };

  const handlePlayerRatingSubmit = () => {
    if (selectedPlayer) {
      setRatedPlayers(prev => new Set(prev).add(selectedPlayer.id));
    }
    setShowPlayerFeedbackDialog(false);
    setSelectedPlayer(null);
  };

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
              {sortTimesByChronology(session.times).join(", ")}
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
            {session.costPerSession !== undefined && session.costPerSession > 0 && (
              <p>
                <span className="text-slate-500">Cost:</span>{" "}
                <span className="text-slate-300">
                  ${session.costPerSession.toFixed(2)}{isCampaign ? " per session" : ""}
                </span>
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
                onClick={() => setShowHostFeedbackDialog(true)}
                disabled={hasRatedHost || checkingRatings}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium text-white transition ${
                  hasRatedHost 
                    ? "bg-slate-600 cursor-not-allowed opacity-50" 
                    : "bg-sky-600 hover:bg-sky-700"
                }`}
              >
                {checkingRatings ? "Checking..." : hasRatedHost ? "Host Rated ✓" : "Rate Host"}
              </button>
            )}
            {isPast && isHost && session.signedUpPlayers.length > 0 && (
              <button
                onClick={loadPlayersInfo}
                className="rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-amber-700"
              >
                {loadingPlayers ? "Loading..." : "Rate Players"}
              </button>
            )}
          </div>

          {/* Show players list for rating when expanded */}
          {isPast && isHost && playersList.length > 0 && (
            <div className="mt-3 rounded-lg border border-slate-700 bg-slate-800/30 p-3">
              <p className="text-sm font-medium text-slate-300 mb-2">Rate Players:</p>
              <div className="space-y-2">
                {playersList.map((player) => {
                  const isRated = ratedPlayers.has(player.id);
                  return (
                    <div key={player.id} className="flex items-center justify-between">
                      <Link
                        href={`/user/${player.id}`}
                        className="text-sm text-slate-300 hover:text-sky-300 transition-colors"
                      >
                        {player.commonName || player.name}
                      </Link>
                      <button
                        onClick={() => handleRatePlayer(player)}
                        disabled={isRated}
                        className={`rounded px-3 py-1 text-xs font-medium text-white transition ${
                          isRated
                            ? "bg-slate-600 cursor-not-allowed opacity-50"
                            : "bg-sky-600 hover:bg-sky-700"
                        }`}
                      >
                        {isRated ? "Rated ✓" : "Rate"}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {showHostFeedbackDialog && session.hostName && (
        <HostFeedbackDialog
          hostId={session.userId}
          hostName={session.hostName}
          sessionId={session.id}
          sessionType={isCampaign ? "campaign" : "game"}
          isOpen={showHostFeedbackDialog}
          onClose={() => setShowHostFeedbackDialog(false)}
          onSubmit={() => {
            setHasRatedHost(true);
            setShowHostFeedbackDialog(false);
          }}
        />
      )}

      {showPlayerFeedbackDialog && selectedPlayer && (
        <PlayerFeedbackDialog
          playerId={selectedPlayer.id}
          playerName={selectedPlayer.commonName || selectedPlayer.name}
          sessionId={session.id}
          sessionType={isCampaign ? "campaign" : "game"}
          isOpen={showPlayerFeedbackDialog}
          onClose={() => {
            setShowPlayerFeedbackDialog(false);
            setSelectedPlayer(null);
          }}
          onSubmit={handlePlayerRatingSubmit}
        />
      )}
    </>
  );
}

export default function GamesHistoryPage() {
  const [gameSessions, setGameSessions] = useState<GameSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userTimezone, setUserTimezone] = useState<string>(DEFAULT_TIMEZONE);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const today = new Date();
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
          gameSessions = gameSessions.map(session => ({ ...session, isCampaign: false }));
        }

        // Fetch user's campaign sessions (multi-session campaigns)
        const campaignsResponse = await fetch("/api/campaigns/my-campaigns");
        let campaignSessions: GameSession[] = [];
        if (campaignsResponse.ok) {
          campaignSessions = await campaignsResponse.json();
          campaignSessions = campaignSessions.map(session => ({ ...session, isCampaign: true }));
        }

        // Combine both game sessions and campaign sessions
        const allSessions = [...gameSessions, ...campaignSessions];
        
        // Sort by date (most recent first)
        allSessions.sort((a, b) => b.date.localeCompare(a.date));
        
        setGameSessions(allSessions);
      } catch (error) {
        console.error("Failed to fetch games history data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-100">Games History</h1>
        <p className="mt-2 text-sm text-slate-400">
          View your past game sessions and campaigns. Rate hosts and players to help build the community.
        </p>
      </div>

      <div className="rounded-xl border border-slate-800/60 bg-slate-900/40 p-6">
        <h2 className="text-lg font-semibold text-slate-100">Past Sessions</h2>
        <p className="mt-2 text-sm text-slate-400">
          Sessions you&apos;ve hosted or played in that have already occurred
        </p>

        {isLoading ? (
          <p className="mt-4 text-sm text-slate-500">Loading your history...</p>
        ) : pastSessions.length > 0 ? (
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
        ) : (
          <div className="mt-4 space-y-3">
            <p className="text-sm text-slate-500">
              You don&apos;t have any past sessions yet.
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
