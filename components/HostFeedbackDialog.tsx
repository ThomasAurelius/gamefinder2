"use client";

import { useState } from "react";

type HostFeedbackDialogProps = {
  hostId: string;
  hostName: string;
  sessionId: string;
  sessionType: "game" | "campaign";
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: () => void;
};

export default function HostFeedbackDialog({
  hostId,
  hostName,
  sessionId,
  sessionType,
  isOpen,
  onClose,
  onSubmit,
}: HostFeedbackDialogProps) {
  const [recommend, setRecommend] = useState<"yes" | "no" | "skip" | null>(null);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!recommend) {
      setError("Please select an option");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/host-feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hostId,
          sessionId,
          sessionType,
          recommend,
          comment: comment.trim() || undefined,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to submit feedback");
      }

      // Close dialog and notify parent
      onClose();
      onSubmit?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit feedback");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
        <h2 className="text-xl font-semibold text-slate-100">
          Rate Your Host
        </h2>
        <p className="mt-2 text-sm text-slate-400">
          Would you recommend <span className="font-medium text-slate-200">{hostName}</span> to other players?
        </p>

        <div className="mt-6 space-y-3">
          <button
            onClick={() => setRecommend("yes")}
            className={`w-full rounded-lg border px-4 py-3 text-left transition ${
              recommend === "yes"
                ? "border-green-500 bg-green-500/20 text-green-100"
                : "border-slate-700 bg-slate-800/50 text-slate-300 hover:border-slate-600"
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">👍</span>
              <div>
                <div className="font-medium">Yes</div>
                <div className="text-xs text-slate-400">I'd recommend this host</div>
              </div>
            </div>
          </button>

          <button
            onClick={() => setRecommend("no")}
            className={`w-full rounded-lg border px-4 py-3 text-left transition ${
              recommend === "no"
                ? "border-red-500 bg-red-500/20 text-red-100"
                : "border-slate-700 bg-slate-800/50 text-slate-300 hover:border-slate-600"
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">👎</span>
              <div>
                <div className="font-medium">No</div>
                <div className="text-xs text-slate-400">I wouldn't recommend this host</div>
              </div>
            </div>
          </button>

          <button
            onClick={() => setRecommend("skip")}
            className={`w-full rounded-lg border px-4 py-3 text-left transition ${
              recommend === "skip"
                ? "border-slate-500 bg-slate-500/20 text-slate-100"
                : "border-slate-700 bg-slate-800/50 text-slate-300 hover:border-slate-600"
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">⏭️</span>
              <div>
                <div className="font-medium">Skip</div>
                <div className="text-xs text-slate-400">I prefer not to answer</div>
              </div>
            </div>
          </button>
        </div>

        <div className="mt-6">
          <label className="block text-sm font-medium text-slate-200">
            Comments (Optional)
          </label>
          <p className="mt-1 text-xs text-slate-400">
            Only the host and admins can see your comments
          </p>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
            placeholder="Share your feedback..."
            className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950/80 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
          />
        </div>

        {error && (
          <div className="mt-4 rounded-lg bg-red-500/10 border border-red-500/50 px-4 py-2 text-sm text-red-300">
            {error}
          </div>
        )}

        <div className="mt-6 flex gap-3">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="flex-1 rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-2 text-sm font-medium text-slate-300 transition hover:bg-slate-700/50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || !recommend}
            className="flex-1 rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? "Submitting..." : "Submit Feedback"}
          </button>
        </div>
      </div>
    </div>
  );
}
