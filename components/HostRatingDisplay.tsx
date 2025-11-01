"use client";

import { useEffect, useState } from "react";

type HostRatingDisplayProps = {
  hostId: string;
  showDetails?: boolean;
};

type HostFeedbackStats = {
  hostId: string;
  totalRatings: number;
  averageRating: number;
  ratings: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
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

  const displayStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    
    return (
      <>
        {"⭐".repeat(fullStars)}
        {hasHalfStar && "½"}
        {"☆".repeat(emptyStars)}
      </>
    );
  };

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1.5">
        <span className="text-xl">⭐</span>
        <span className="text-lg font-semibold text-amber-400">
          {stats.averageRating.toFixed(1)}
        </span>
        <span className="text-sm text-amber-400/80">
          {displayStars(stats.averageRating)}
        </span>
      </div>
      {showDetails && (
        <div className="text-xs text-slate-400">
          ({stats.totalRatings} rating{stats.totalRatings !== 1 ? "s" : ""})
        </div>
      )}
    </div>
  );
}
