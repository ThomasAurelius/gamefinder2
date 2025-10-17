"use client";

import { useEffect, useState } from "react";

type PlayerRatingDisplayProps = {
  playerId: string;
  showDetails?: boolean;
};

type PlayerFeedbackStats = {
  playerId: string;
  totalRatings: number;
  yesCount: number;
  noCount: number;
  skipCount: number;
  score: number;
};

export default function PlayerRatingDisplay({ playerId, showDetails = false }: PlayerRatingDisplayProps) {
  const [stats, setStats] = useState<PlayerFeedbackStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await fetch(`/api/player-feedback/stats/${playerId}`);
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        }
      } catch (error) {
        console.error("Failed to fetch player feedback stats", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchStats();
  }, [playerId]);

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-sm text-slate-400">
        <span>🎮</span>
        <span>Loading...</span>
      </div>
    );
  }

  if (!stats || stats.totalRatings === 0) {
    return (
      <div className="flex items-center gap-2 text-sm text-slate-400">
        <span>🎮</span>
        <span>No player ratings yet</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1.5">
        <span className="text-xl">🎮</span>
        <span className={`text-lg font-semibold ${
          stats.score > 0 ? "text-green-400" : stats.score < 0 ? "text-red-400" : "text-slate-300"
        }`}>
          {stats.score > 0 ? "+" : ""}{stats.score}
        </span>
      </div>
      {showDetails && (
        <div className="text-xs text-slate-400">
          ({stats.yesCount} 👍 / {stats.noCount} 👎 / {stats.skipCount} ⏭️)
        </div>
      )}
    </div>
  );
}
