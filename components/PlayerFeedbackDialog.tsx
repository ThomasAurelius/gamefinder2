"use client";

import { useState } from "react";

type PlayerFeedbackDialogProps = {
  playerId: string;
  playerName: string;
  sessionId: string;
  sessionType: "game" | "campaign";
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
};

export default function PlayerFeedbackDialog({
  playerId,
  playerName,
  sessionId,
  sessionType,
  isOpen,
  onClose,
  onSubmit,
}: PlayerFeedbackDialogProps) {
  const [rating, setRating] = useState<1 | 2 | 3 | 4 | 5 | null>(null);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!rating) {
      setError("Please select a rating");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const response = await fetch("/api/player-feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          playerId,
          sessionId,
          sessionType,
          rating,
          comment: comment.trim() || undefined,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to submit feedback");
      }

      onSubmit();
    } catch (err) {
      console.error("Failed to submit feedback:", err);
      setError(err instanceof Error ? err.message : "Failed to submit feedback");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const ratingOptions = [
    { value: 5, label: "5 Stars", description: "Perfectly amazing!", emoji: "⭐⭐⭐⭐⭐" },
    { value: 4, label: "4 Stars", description: "Great player", emoji: "⭐⭐⭐⭐" },
    { value: 3, label: "3 Stars", description: "Good player", emoji: "⭐⭐⭐" },
    { value: 2, label: "2 Stars", description: "Could improve", emoji: "⭐⭐" },
    { value: 1, label: "1 Star", description: "Horribly bad", emoji: "⭐" },
  ] as const;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-md rounded-xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
        <h2 className="text-xl font-semibold text-slate-100">
          Rate Player: {playerName}
        </h2>
        <p className="mt-2 text-sm text-slate-400">
          How would you rate this player?
        </p>

        <div className="mt-4 space-y-2">
          {ratingOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setRating(option.value)}
              className={`w-full rounded-lg border px-4 py-3 text-left transition ${
                rating === option.value
                  ? "border-sky-500 bg-sky-500/20 text-sky-100"
                  : "border-slate-700 bg-slate-800/40 text-slate-300 hover:border-slate-600"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-xl">{option.emoji}</span>
                  <div>
                    <div className="font-medium">{option.label}</div>
                    <div className="text-xs text-slate-400">{option.description}</div>
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-slate-300">
            Comments (optional)
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your experience with this player..."
            rows={3}
            className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-800/40 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
          />
          <p className="mt-1 text-xs text-slate-500">
            Only the player and admins can see your comments
          </p>
        </div>

        {error && (
          <p className="mt-3 text-sm text-red-400">{error}</p>
        )}

        <div className="mt-6 flex gap-3">
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || !rating}
            className="flex-1 rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? "Submitting..." : "Submit"}
          </button>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="flex-1 rounded-lg bg-slate-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
