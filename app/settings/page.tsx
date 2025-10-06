"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

export default function SettingsPage() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [announcement, setAnnouncement] = useState("");
  const [isActive, setIsActive] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function checkAdminAndLoadAnnouncement() {
      try {
        // Check admin status
        console.log("[Settings] Fetching admin status...");
        const statusRes = await fetch("/api/admin/status", {
          credentials: "include",
          cache: "no-store",
        });
        const statusData = await statusRes.json();
        console.log("[Settings] Admin status response:", statusData);
        setIsAdmin(statusData.isAdmin);

        // Load current announcement if admin
        if (statusData.isAdmin) {
          console.log("[Settings] User is admin, loading announcement...");
          const announcementRes = await fetch("/api/announcements", {
            credentials: "include",
            cache: "no-store",
          });
          const announcementData = await announcementRes.json();
          setAnnouncement(announcementData.message || "");
          setIsActive(announcementData.isActive || false);
        } else {
          console.log("[Settings] User is not admin");
        }
      } catch (error) {
        console.error("Failed to load settings:", error);
      } finally {
        setLoading(false);
      }
    }

    checkAdminAndLoadAnnouncement();
  }, []);

  const handleSaveAnnouncement = async () => {
    setSaving(true);
    setMessage("");

    try {
      const response = await fetch("/api/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ message: announcement, isActive }),
      });

      if (!response.ok) {
        throw new Error("Failed to save announcement");
      }

      setMessage("Announcement saved successfully!");
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      console.error("Failed to save announcement:", error);
      setMessage("Failed to save announcement. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-semibold">Settings</h1>
      <p className="text-sm text-slate-300">
        Configure account security, notification preferences, and connected
        services from this settings hub.
      </p>

      <div className="space-y-6 rounded-2xl border border-slate-800/60 bg-slate-900/40 p-6 shadow-lg shadow-slate-900/30">
        <div className="space-y-4">
          <div className="rounded-lg border border-slate-700/50 bg-slate-800/30 p-4">
            <h2 className="text-sm font-medium text-slate-200">Profile Settings</h2>
            <p className="mt-2 text-xs text-slate-400">
              Timezone and other profile settings are now managed in your Profile page.
            </p>
            <Link
              href="/profile"
              className="mt-3 inline-block rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-sky-700"
            >
              Go to Profile
            </Link>
          </div>
          
          {loading ? (
            <div className="rounded-lg border border-slate-700/50 bg-slate-800/30 p-4">
              <p className="text-sm text-slate-400">Loading...</p>
            </div>
          ) : isAdmin ? (
            <div className="rounded-lg border border-amber-700/50 bg-amber-900/20 p-4">
              <h2 className="text-sm font-medium text-amber-200">
                Admin: Site Announcement
              </h2>
              <p className="mt-2 text-xs text-slate-400">
                Create an announcement that will be displayed to users when they first visit the site.
              </p>
              
              <div className="mt-4 space-y-3">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="h-5 w-5 rounded border-slate-700 bg-slate-950/60 text-amber-500 outline-none transition focus:ring-2 focus:ring-amber-500/40"
                  />
                  <span className="text-sm text-slate-200">
                    Show announcement to users
                  </span>
                </label>

                <textarea
                  value={announcement}
                  onChange={(e) => setAnnouncement(e.target.value)}
                  placeholder="Enter announcement message..."
                  rows={4}
                  className="w-full rounded-md border border-slate-700 bg-slate-950/60 px-3 py-2 text-sm text-slate-100 outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-500/40"
                />

                <button
                  onClick={handleSaveAnnouncement}
                  disabled={saving}
                  className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save Announcement"}
                </button>

                {message && (
                  <p className={`text-sm ${message.includes("success") ? "text-emerald-400" : "text-rose-400"}`}>
                    {message}
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="rounded-lg border border-slate-700/50 bg-slate-800/30 p-4">
              <p className="text-sm text-slate-400">
                Additional settings will be available here in the future.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
