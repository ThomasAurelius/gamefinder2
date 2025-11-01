"use client";

import { useEffect, useState, useCallback } from "react";
import { use } from "react";

type StoredPlayerFeedback = {
  id: string;
  hostId: string;
  playerId: string;
  sessionId: string;
  sessionType: "game" | "campaign";
  rating: 1 | 2 | 3 | 4 | 5;
  comment?: string;
  createdAt: string;
  isFlagged?: boolean;
};

type PlayerFeedbackStats = {
  playerId: string;
  totalRatings: number;
  averageRating: number;
  ratings: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
  feedback?: StoredPlayerFeedback[];
};

export default function PlayerFeedbackPage({
  params,
}: {
  params: Promise<{ playerId: string }>;
}) {
  const { playerId } = use(params);
  const [stats, setStats] = useState<PlayerFeedbackStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [flaggingId, setFlaggingId] = useState<string | null>(null);
  const [flagReason, setFlagReason] = useState("");
  const [showFlagDialog, setShowFlagDialog] = useState<string | null>(null);

  const fetchFeedback = useCallback(async () => {
    try {
      const response = await fetch(`/api/player-feedback/stats/${playerId}`);
      if (!response.ok) {
        throw new Error("Failed to load feedback");
      }
      const data = await response.json();
      setStats(data);
    } catch (err) {
      console.error("Failed to fetch feedback:", err);
      setError("Failed to load feedback");
    } finally {
      setIsLoading(false);
    }
  }, [playerId]);

  useEffect(() => {
    fetchFeedback();
  }, [fetchFeedback]);

  const handleFlag = async (feedbackId: string) => {
    if (!flagReason.trim()) {
      alert("Please provide a reason for flagging this feedback");
      return;
    }

    setFlaggingId(feedbackId);
    try {
      const response = await fetch("/api/player-feedback/flag", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ feedbackId, flagReason }),
      });

      if (!response.ok) {
        throw new Error("Failed to flag feedback");
      }

      // Refresh the feedback list
      await fetchFeedback();
      setShowFlagDialog(null);
      setFlagReason("");
    } catch (err) {
      console.error("Failed to flag feedback:", err);
      alert("Failed to flag feedback");
    } finally {
      setFlaggingId(null);
    }
  };

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

  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8">
        <h1 className="text-3xl font-bold text-slate-100">Player Feedback</h1>
        <p className="mt-4 text-slate-400">Loading...</p>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8">
        <h1 className="text-3xl font-bold text-slate-100">Player Feedback</h1>
        <p className="mt-4 text-red-400">{error || "Failed to load feedback"}</p>
      </div>
    );
  }

  const feedbackWithComments = stats.feedback?.filter((f) => f.comment) || [];

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-100">Player Feedback</h1>
        <p className="mt-2 text-slate-400">
          View all feedback and ratings for this player
        </p>
      </div>

      {/* Stats Overview */}
      <div className="rounded-xl border border-amber-500/50 bg-gradient-to-br from-amber-600/20 via-purple-600/20 to-indigo-600/20 p-6 mb-8">
        <h2 className="text-xl font-semibold text-slate-100">Overall Rating</h2>

        <div className="mt-4 flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-3xl">🎮</span>
            <span className="text-3xl font-bold text-amber-400">
              {stats.averageRating.toFixed(1)}
            </span>
          </div>
          <div className="text-sm text-slate-400">
            <div className="text-lg text-amber-400/80">
              {displayStars(stats.averageRating)}
            </div>
            <div>{stats.totalRatings} total rating{stats.totalRatings !== 1 ? "s" : ""}</div>
            <div className="flex gap-3 mt-1">
              <span>5⭐: {stats.ratings[5]}</span>
              <span>4⭐: {stats.ratings[4]}</span>
              <span>3⭐: {stats.ratings[3]}</span>
              <span>2⭐: {stats.ratings[2]}</span>
              <span>1⭐: {stats.ratings[1]}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Feedback Comments */}
      {feedbackWithComments.length === 0 ? (
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-8 text-center">
          <p className="text-slate-400">No feedback comments yet</p>
        </div>
      ) : (
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold text-slate-100">
            Feedback Comments ({feedbackWithComments.length})
          </h2>
          {feedbackWithComments.map((feedback) => (
            <div
              key={feedback.id}
              className={`rounded-xl border p-6 ${
                feedback.isFlagged
                  ? "border-orange-500/30 bg-orange-500/10"
                  : "border-slate-800 bg-slate-900/60"
              }`}
            >
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl text-amber-400">
                    {"⭐".repeat(feedback.rating)}
                  </span>
                  <span className="text-sm text-slate-500">
                    {new Date(feedback.createdAt).toLocaleDateString()}
                  </span>
                </div>
                {!feedback.isFlagged && (
                  <button
                    onClick={() => setShowFlagDialog(feedback.id)}
                    className="text-sm text-slate-500 hover:text-red-400 transition-colors"
                  >
                    🚩 Flag
                  </button>
                )}
                {feedback.isFlagged && (
                  <span className="text-sm text-orange-400">
                    ⏳ Flagged - Under Review
                  </span>
                )}
              </div>

              <p className="text-slate-300">{feedback.comment}</p>

              <div className="mt-3 text-xs text-slate-500">
                Session: {feedback.sessionId} ({feedback.sessionType})
              </div>

              {showFlagDialog === feedback.id && (
                <div className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 p-4">
                  <label className="block text-sm font-medium text-red-300 mb-2">
                    Why are you flagging this feedback?
                  </label>
                  <textarea
                    value={flagReason}
                    onChange={(e) => setFlagReason(e.target.value)}
                    placeholder="Please explain why this feedback is inappropriate..."
                    rows={3}
                    className="w-full rounded-lg border border-red-500/30 bg-slate-800/40 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
                  />
                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={() => handleFlag(feedback.id)}
                      disabled={flaggingId === feedback.id || !flagReason.trim()}
                      className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {flaggingId === feedback.id ? "Flagging..." : "Submit Flag"}
                    </button>
                    <button
                      onClick={() => {
                        setShowFlagDialog(null);
                        setFlagReason("");
                      }}
                      disabled={flaggingId === feedback.id}
                      className="rounded-lg bg-slate-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-600 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="mt-8 rounded-lg border border-slate-700 bg-slate-800/50 p-4">
        <p className="text-sm text-slate-400">
          💡 <strong>Note:</strong> Only you and admins can see feedback comments. 
          Flagged feedback is reviewed by admins who can accept or remove it.
        </p>
      </div>
    </div>
  );
}
