"use client";

import { useEffect, useState } from "react";

type HostRatingDisplayProps = {
  hostId: string;
  showDetails?: boolean;
};

type HostFeedbackStats = {
  hostId: string;
  totalRatings: number;
  yesCount: number;
  noCount: number;
  skipCount: number;
  score: number;
};

export default function HostRatingDisplay({ hostId, showDetails = false }: HostRatingDisplayProps) {
  const [stats, setStats] = useState<HostFeedbackStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await fetch(`/api/host-feedback/stats/${hostId}`);
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        }
      } catch (error) {
        console.error("Failed to fetch host feedback stats", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchStats();
  }, [hostId]);

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-sm text-slate-400">
        <span>⭐</span>
        <span>Loading...</span>
      </div>
    );
  }

  if (!stats || stats.totalRatings === 0) {
    return (
      <div className="flex items-center gap-2 text-sm text-slate-400">
        <span>⭐</span>
        <span>No ratings yet</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1.5">
        <span className="text-xl">⭐</span>
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
