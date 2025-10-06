"use client";

import { useEffect, useState } from "react";

export default function AnnouncementPopup() {
  const [announcement, setAnnouncement] = useState<string | null>(null);
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    async function loadAnnouncement() {
      try {
        const response = await fetch("/api/announcements");
        const data = await response.json();

        if (data.isActive && data.message) {
          // Check if user has already seen this announcement
          const lastSeen = localStorage.getItem("lastAnnouncementSeen");
          const announcementTime = new Date(data.updatedAt).getTime();

          if (!lastSeen || parseInt(lastSeen) < announcementTime) {
            setAnnouncement(data.message);
            setShowPopup(true);
          }
        }
      } catch (error) {
        console.error("Failed to load announcement:", error);
      }
    }

    loadAnnouncement();
  }, []);

  const handleClose = () => {
    if (announcement) {
      // Mark announcement as seen
      localStorage.setItem("lastAnnouncementSeen", Date.now().toString());
    }
    setShowPopup(false);
  };

  if (!showPopup || !announcement) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="relative max-w-lg w-full rounded-2xl border border-amber-700/50 bg-slate-900 p-6 shadow-2xl">
        <div className="mb-4 flex items-start justify-between">
          <h2 className="text-xl font-semibold text-amber-200">Announcement</h2>
          <button
            onClick={handleClose}
            className="rounded-md p-1 text-slate-400 transition hover:bg-slate-800 hover:text-slate-200"
            aria-label="Close announcement"
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

        <div className="prose prose-invert max-w-none">
          <p className="text-sm text-slate-300 whitespace-pre-wrap">{announcement}</p>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={handleClose}
            className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-amber-700"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}
