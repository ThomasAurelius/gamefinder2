"use client";

import { useEffect, useState } from "react";

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
  flagReason?: string;
  flaggedBy?: string;
  flaggedAt?: string;
};

export default function AdminFeedbackPage() {
  const [flaggedFeedback, setFlaggedFeedback] = useState<StoredPlayerFeedback[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    fetchFlaggedFeedback();
  }, []);

  const fetchFlaggedFeedback = async () => {
    try {
      const response = await fetch("/api/player-feedback/admin");
      if (!response.ok) {
        if (response.status === 403) {
          setError("You do not have permission to view this page.");
        } else {
          setError("Failed to load flagged feedback");
        }
        return;
      }
      const data = await response.json();
      setFlaggedFeedback(data);
    } catch (err) {
      console.error("Failed to fetch flagged feedback:", err);
      setError("Failed to load flagged feedback");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResolve = async (feedbackId: string, action: "accepted" | "deleted") => {
    setProcessingId(feedbackId);
    try {
      const response = await fetch("/api/player-feedback/admin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ feedbackId, action }),
      });

      if (!response.ok) {
        throw new Error("Failed to resolve feedback");
      }

      // Remove from list
      setFlaggedFeedback(flaggedFeedback.filter((f) => f.id !== feedbackId));
    } catch (err) {
      console.error("Failed to resolve feedback:", err);
      setError("Failed to resolve feedback");
    } finally {
      setProcessingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8">
        <h1 className="text-3xl font-bold text-slate-100">Flagged Feedback Review</h1>
        <p className="mt-4 text-slate-400">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8">
        <h1 className="text-3xl font-bold text-slate-100">Flagged Feedback Review</h1>
        <p className="mt-4 text-red-400">{error}</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-3xl font-bold text-slate-100">Flagged Feedback Review</h1>
      <p className="mt-2 text-slate-400">
        Review and resolve flagged feedback from the community
      </p>

      {flaggedFeedback.length === 0 ? (
        <div className="mt-8 rounded-xl border border-slate-800 bg-slate-900/60 p-8 text-center">
          <p className="text-slate-400">No flagged feedback to review</p>
        </div>
      ) : (
        <div className="mt-8 space-y-6">
          {flaggedFeedback.map((feedback) => (
            <div
              key={feedback.id}
              className="rounded-xl border border-red-500/30 bg-slate-900/60 p-6"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl text-amber-400">
                      {"⭐".repeat(feedback.rating)}
                    </span>
                    <span className="text-sm text-slate-500">
                      {new Date(feedback.createdAt).toLocaleString()}
                    </span>
                  </div>

                  <div className="space-y-2 mt-4">
                    <div className="text-sm text-slate-400">
                      <span className="font-medium">Host:</span> {feedback.hostId}
                    </div>
                    <div className="text-sm text-slate-400">
                      <span className="font-medium">Player:</span> {feedback.playerId}
                    </div>
                    <div className="text-sm text-slate-400">
                      <span className="font-medium">Session:</span> {feedback.sessionId} (
                      {feedback.sessionType})
                    </div>
                  </div>

                  {feedback.comment && (
                    <div className="mt-4 rounded-lg border border-slate-700 bg-slate-800/50 p-4">
                      <p className="text-sm font-medium text-slate-300 mb-1">Comment:</p>
                      <p className="text-slate-200">{feedback.comment}</p>
                    </div>
                  )}

                  <div className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 p-4">
                    <p className="text-sm font-medium text-red-300 mb-1">Flag Reason:</p>
                    <p className="text-red-200">{feedback.flagReason}</p>
                    {feedback.flaggedBy && (
                      <p className="text-xs text-red-400 mt-2">
                        Flagged by: {feedback.flaggedBy}
                        {feedback.flaggedAt &&
                          ` on ${new Date(feedback.flaggedAt).toLocaleString()}`}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleResolve(feedback.id, "accepted")}
                    disabled={processingId === feedback.id}
                    className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => handleResolve(feedback.id, "deleted")}
                    disabled={processingId === feedback.id}
                    className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
