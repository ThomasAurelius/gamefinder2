"use client";

import { useState, useEffect } from "react";

interface ProfileAdminControlsProps {
  profileUserId: string;
  initialIsHidden: boolean;
}

export default function ProfileAdminControls({ 
  profileUserId, 
  initialIsHidden 
}: ProfileAdminControlsProps) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isHidden, setIsHidden] = useState(initialIsHidden);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function checkAdmin() {
      try {
        const response = await fetch("/api/admin/status");
        const data = await response.json();
        setIsAdmin(data.isAdmin);
      } catch (error) {
        console.error("Failed to check admin status:", error);
      } finally {
        setLoading(false);
      }
    }

    checkAdmin();
  }, []);

  const handleToggleVisibility = async () => {
    setUpdating(true);
    setMessage("");

    try {
      const response = await fetch("/api/admin/profiles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetUserId: profileUserId,
          isHidden: !isHidden,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update profile visibility");
      }

      setIsHidden(!isHidden);
      setMessage(`Profile ${!isHidden ? "hidden" : "shown"} successfully!`);
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      console.error("Failed to update profile visibility:", error);
      setMessage("Failed to update profile visibility");
      setTimeout(() => setMessage(""), 3000);
    } finally {
      setUpdating(false);
    }
  };

  if (loading || !isAdmin) {
    return null;
  }

  return (
    <div className="rounded-lg border border-amber-700/50 bg-amber-900/20 p-4">
      <h3 className="text-sm font-semibold text-amber-200 mb-2">Admin Controls</h3>
      <div className="space-y-2">
        <button
          onClick={handleToggleVisibility}
          disabled={updating}
          className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {updating ? "Updating..." : isHidden ? "Show Profile" : "Hide Profile"}
        </button>
        {message && (
          <p className={`text-sm ${message.includes("success") ? "text-emerald-400" : "text-rose-400"}`}>
            {message}
          </p>
        )}
        {isHidden && (
          <p className="text-xs text-amber-300">
            ⚠️ This profile is currently hidden from search results
          </p>
        )}
      </div>
    </div>
  );
}
