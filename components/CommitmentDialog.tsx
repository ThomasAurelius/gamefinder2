"use client";

import { useState } from "react";

interface CommitmentDialogProps {
  onAccept: () => void;
  onDecline: () => void;
  campaignName: string;
  costPerSession?: number;
  isLoading?: boolean;
}

export default function CommitmentDialog({
  onAccept,
  onDecline,
  campaignName,
  costPerSession,
  isLoading = false,
}: CommitmentDialogProps) {
  const [hasReadAll, setHasReadAll] = useState(false);

  const handleBackdropClick = (e: React.MouseEvent) => {
    // Only close if clicking the backdrop itself, not the dialog content
    if (e.target === e.currentTarget && !isLoading) {
      onDecline();
    }
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    // Check if scrolled to the bottom (with small threshold)
    const isAtBottom = target.scrollHeight - target.scrollTop <= target.clientHeight + 10;
    if (isAtBottom && !hasReadAll) {
      setHasReadAll(true);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/80 backdrop-blur-md p-4" 
      onClick={handleBackdropClick}
    >
      <div 
        className="w-full max-w-xl rounded-xl border-2 border-amber-500 bg-slate-900 shadow-2xl shadow-amber-500/20" 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="border-b border-slate-800 px-6 py-4 bg-amber-900/20">
          <h2 className="text-xl font-semibold text-slate-100">
            Campaign Commitment Agreement
          </h2>
          <p className="mt-1 text-sm text-slate-400">
            Please review and accept the following expectations
          </p>
        </div>

        <div 
          className="p-6 space-y-4 max-h-[60vh] overflow-y-auto"
          onScroll={handleScroll}
        >
          <div className="rounded-lg border border-amber-700/30 bg-amber-950/20 p-4">
            <p className="text-sm text-slate-300 mb-2">
              You are about to request to join:
            </p>
            <p className="text-base font-semibold text-amber-200">
              {campaignName}
            </p>
          </div>

          <div className="space-y-3">
            <p className="text-sm text-slate-200 font-medium">
              By joining this campaign, you commit to the following:
            </p>

            <div className="space-y-3">
              <div className="flex gap-3">
                <span className="text-amber-500 text-lg flex-shrink-0">•</span>
                <div>
                  <p className="text-sm text-slate-200 font-medium">
                    Attendance Commitment
                  </p>
                  <p className="text-sm text-slate-400 mt-1">
                    In good faith, you can make <strong className="text-slate-300">most, if not all</strong> of the games (at least 90%) at the specified time. It&apos;s not fair to the other players to have missing players to deal with all the time.
                  </p>
                </div>
              </div>

              {costPerSession !== undefined && costPerSession > 0 && (
                <div className="flex gap-3">
                  <span className="text-amber-500 text-lg flex-shrink-0">•</span>
                  <div>
                    <p className="text-sm text-slate-200 font-medium">
                      Payment Responsibility
                    </p>
                    <p className="text-sm text-slate-400 mt-1">
                      You will pay the cost per session (${costPerSession.toFixed(2)}) <strong className="text-slate-300">prior to each session</strong>. Don&apos;t make us remind you each week.
                    </p>
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <span className="text-amber-500 text-lg flex-shrink-0">•</span>
                <div>
                  <p className="text-sm text-slate-200 font-medium">
                    Seat and Fee Responsibility
                  </p>
                  <p className="text-sm text-slate-400 mt-1">
                    You are <strong className="text-slate-300">still responsible for your seat and {costPerSession !== undefined && costPerSession > 0 ? 'fee' : 'commitment'}</strong> even if you don&apos;t show up. Your absence affects the entire group.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {!hasReadAll && (
            <p className="text-xs text-amber-400 italic text-center py-2">
              Please scroll to read all expectations
            </p>
          )}
        </div>

        <div className="flex justify-end gap-3 border-t border-slate-800 px-6 py-4">
          <button
            type="button"
            onClick={onDecline}
            disabled={isLoading}
            className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium text-slate-300 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onAccept}
            disabled={isLoading || !hasReadAll}
            className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
            title={!hasReadAll ? "Please scroll to read all expectations" : ""}
          >
            {isLoading ? "Processing..." : "I Accept"}
          </button>
        </div>
      </div>
    </div>
  );
}
