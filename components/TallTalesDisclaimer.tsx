"use client";

import { useEffect, useState } from "react";

interface TallTalesDisclaimerProps {
  onClose: () => void;
}

export default function TallTalesDisclaimer({ onClose }: TallTalesDisclaimerProps) {
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    // Check if user has already seen the disclaimer
    const hasSeenDisclaimer = localStorage.getItem("hasSeenTallTalesDisclaimer");
    if (!hasSeenDisclaimer) {
      setShowPopup(true);
    } else {
      onClose();
    }
  }, [onClose]);

  const handleClose = () => {
    localStorage.setItem("hasSeenTallTalesDisclaimer", "true");
    setShowPopup(false);
    onClose();
  };

  if (!showPopup) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="relative max-w-lg w-full rounded-2xl border border-amber-700/50 bg-slate-900 p-6 shadow-2xl">
        <div className="mb-4 flex items-start justify-between">
          <h2 className="text-xl font-semibold text-amber-200">Welcome to Tall Tales</h2>
          <button
            onClick={handleClose}
            className="rounded-md p-1 text-slate-400 transition hover:bg-slate-800 hover:text-slate-200"
            aria-label="Close disclaimer"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="prose prose-invert max-w-none space-y-4">
          <p className="text-sm text-slate-300">
            <strong>Tall Tales</strong> is a space for sharing campaign stories, memorable game moments, 
            and boardgame-related content with the community.
          </p>
          
          <div className="rounded-lg bg-slate-800/50 p-3">
            <p className="text-sm font-semibold text-amber-300 mb-2">Please ensure your posts are:</p>
            <ul className="text-sm text-slate-300 space-y-1 list-disc list-inside">
              <li>Relevant to tabletop gaming or boardgames</li>
              <li>Respectful and appropriate for all audiences</li>
              <li>Original content or properly attributed</li>
              <li>Free from spam or promotional material</li>
            </ul>
          </div>

          <p className="text-xs text-slate-400">
            Posts that don&apos;t follow these guidelines may be removed. Let&apos;s keep this community 
            fun and welcoming for everyone!
          </p>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={handleClose}
            className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-amber-700"
          >
            Got it, let&apos;s share stories!
          </button>
        </div>
      </div>
    </div>
  );
}
