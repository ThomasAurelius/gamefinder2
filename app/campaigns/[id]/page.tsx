"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { formatDateInTimezone, DEFAULT_TIMEZONE } from "@/lib/timezone";

type Campaign = {
  id: string;
  userId: string;
  game: string;
  date: string;
  times: string[];
  description: string;
  maxPlayers: number;
  signedUpPlayers: string[];
  waitlist: string[];
  pendingPlayers: string[];
  createdAt: string;
  updatedAt: string;
  imageUrl?: string;
  location?: string;
  zipCode?: string;
  latitude?: number;
  longitude?: number;
  sessionsLeft?: number;
  classesNeeded?: string[];
  costPerSession?: number;
  meetingFrequency?: string;
  daysOfWeek?: string[];
};

type CampaignNote = {
  id: string;
  campaignId: string;
  userId: string;
  content: string;
  createdAt: string;
  updatedAt: string;
};

export default function CampaignDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [notes, setNotes] = useState<CampaignNote[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"details" | "notes">("details");
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [userTimezone, setUserTimezone] = useState<string>(DEFAULT_TIMEZONE);
  const [newNoteContent, setNewNoteContent] = useState("");
  const [isSubmittingNote, setIsSubmittingNote] = useState(false);
  const [noteError, setNoteError] = useState<string | null>(null);

  const campaignId = params.id as string;

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch timezone
        const settingsResponse = await fetch("/api/settings");
        if (settingsResponse.ok) {
          const settingsData = await settingsResponse.json();
          setUserTimezone(settingsData.timezone || DEFAULT_TIMEZONE);
        }

        // Fetch current user ID
        const profileResponse = await fetch("/api/profile");
        if (profileResponse.ok) {
          const profileData = await profileResponse.json();
          setCurrentUserId(profileData.userId);
        }

        // Fetch campaign
        const campaignResponse = await fetch(`/api/campaigns/${campaignId}`);
        if (!campaignResponse.ok) {
          if (campaignResponse.status === 404) {
            router.push("/find-campaigns");
            return;
          }
          throw new Error("Failed to fetch campaign");
        }
        const campaignData = await campaignResponse.json();
        setCampaign(campaignData);

        // Fetch notes if user is the creator
        if (profileResponse.ok) {
          const profileData = await profileResponse.json();
          if (campaignData.userId === profileData.userId) {
            const notesResponse = await fetch(`/api/campaigns/${campaignId}/notes`);
            if (notesResponse.ok) {
              const notesData = await notesResponse.json();
              setNotes(notesData);
            }
          }
        }
      } catch (error) {
        console.error("Failed to fetch campaign data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [campaignId, router]);

  const isCreator = currentUserId && campaign?.userId === currentUserId;

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteContent.trim() || isSubmittingNote) return;

    setIsSubmittingNote(true);
    setNoteError(null);

    try {
      const response = await fetch(`/api/campaigns/${campaignId}/notes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: newNoteContent.trim() }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to add note");
      }

      const newNote = await response.json();
      setNotes((prev) => [newNote, ...prev]);
      setNewNoteContent("");
    } catch (error) {
      setNoteError(error instanceof Error ? error.message : "Failed to add note");
    } finally {
      setIsSubmittingNote(false);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    if (!confirm("Are you sure you want to delete this note?")) return;

    try {
      const response = await fetch(`/api/campaigns/${campaignId}/notes/${noteId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete note");
      }

      setNotes((prev) => prev.filter((note) => note.id !== noteId));
    } catch (error) {
      console.error("Error deleting note:", error);
      alert("Failed to delete note");
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-slate-400">Loading campaign...</p>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-slate-400">Campaign not found</p>
      </div>
    );
  }

  const availableSlots = campaign.maxPlayers - campaign.signedUpPlayers.length;
  const isFull = availableSlots <= 0;

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-8">
      <Link
        href="/find-campaigns"
        className="inline-block text-sm text-sky-400 hover:text-sky-300"
      >
        ← Back to campaigns
      </Link>

      <div className="rounded-lg border border-slate-800 bg-slate-950/40 p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-slate-100">{campaign.game}</h1>
            <div className="mt-4 space-y-2 text-sm text-slate-400">
              <p>
                <span className="text-slate-500">Date:</span>{" "}
                {formatDateInTimezone(campaign.date, userTimezone)}
              </p>
              <p>
                <span className="text-slate-500">Times:</span>{" "}
                {campaign.times.join(", ")}
              </p>
              {(campaign.location || campaign.zipCode) && (
                <p>
                  <span className="text-slate-500">Location:</span>{" "}
                  {campaign.location || campaign.zipCode}
                </p>
              )}
              <p>
                <span className="text-slate-500">Players:</span>{" "}
                <span className={isFull ? "text-orange-400" : "text-green-400"}>
                  {campaign.signedUpPlayers.length}/{campaign.maxPlayers}
                </span>
              </p>
              {campaign.waitlist.length > 0 && (
                <p>
                  <span className="text-slate-500">Waitlist:</span>{" "}
                  <span className="text-yellow-400">{campaign.waitlist.length}</span>
                </p>
              )}
              {campaign.meetingFrequency && (
                <p>
                  <span className="text-slate-500">Frequency:</span>{" "}
                  {campaign.meetingFrequency}
                </p>
              )}
              {campaign.sessionsLeft && (
                <p>
                  <span className="text-slate-500">Sessions Left:</span>{" "}
                  {campaign.sessionsLeft}
                </p>
              )}
              {campaign.costPerSession && (
                <p>
                  <span className="text-slate-500">Cost per Session:</span> $
                  {campaign.costPerSession}
                </p>
              )}
            </div>
          </div>
          {campaign.imageUrl && (
            <img
              src={campaign.imageUrl}
              alt={campaign.game}
              className="h-32 w-32 rounded-lg border border-slate-700 object-cover"
            />
          )}
        </div>

        {campaign.description && (
          <div className="mt-4 border-t border-slate-800 pt-4">
            <p className="text-slate-300">{campaign.description}</p>
          </div>
        )}
      </div>

      {isCreator && (
        <div className="rounded-lg border border-slate-800 bg-slate-950/40">
          <div className="border-b border-slate-800">
            <div className="flex gap-4 px-6">
              <button
                onClick={() => setActiveTab("details")}
                className={`border-b-2 px-4 py-3 text-sm font-medium transition ${
                  activeTab === "details"
                    ? "border-sky-500 text-sky-400"
                    : "border-transparent text-slate-400 hover:text-slate-300"
                }`}
              >
                Campaign Details
              </button>
              <button
                onClick={() => setActiveTab("notes")}
                className={`border-b-2 px-4 py-3 text-sm font-medium transition ${
                  activeTab === "notes"
                    ? "border-sky-500 text-sky-400"
                    : "border-transparent text-slate-400 hover:text-slate-300"
                }`}
              >
                DM Notes
              </button>
            </div>
          </div>

          <div className="p-6">
            {activeTab === "details" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-slate-100">
                      Campaign Management
                    </h2>
                    <p className="text-sm text-slate-400">
                      Manage your campaign details, players, and settings here.
                    </p>
                  </div>
                  <Link
                    href={`/campaigns/${campaignId}/edit`}
                    className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-sky-700"
                  >
                    Edit Campaign
                  </Link>
                </div>
                {campaign.pendingPlayers.length > 0 && (
                  <div className="rounded-md border border-yellow-500/50 bg-yellow-500/10 p-4">
                    <p className="text-sm text-yellow-400">
                      You have {campaign.pendingPlayers.length} pending player
                      request(s) to review.
                    </p>
                  </div>
                )}
              </div>
            )}

            {activeTab === "notes" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold text-slate-100">DM Notes</h2>
                  <p className="mt-1 text-sm text-slate-400">
                    Private notes visible only to you as the campaign creator.
                  </p>
                </div>

                <form onSubmit={handleAddNote} className="space-y-3">
                  <textarea
                    value={newNoteContent}
                    onChange={(e) => setNewNoteContent(e.target.value)}
                    placeholder="Add a new note..."
                    rows={4}
                    className="w-full rounded-md border border-slate-700 bg-slate-950/60 px-3 py-2 text-sm text-slate-100 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/40"
                  />
                  {noteError && (
                    <p className="text-sm text-red-400">{noteError}</p>
                  )}
                  <button
                    type="submit"
                    disabled={isSubmittingNote || !newNoteContent.trim()}
                    className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isSubmittingNote ? "Adding..." : "Add Note"}
                  </button>
                </form>

                <div className="space-y-3">
                  {notes.length === 0 ? (
                    <p className="text-sm text-slate-500">
                      No notes yet. Add your first note above.
                    </p>
                  ) : (
                    notes.map((note) => (
                      <div
                        key={note.id}
                        className="rounded-md border border-slate-800 bg-slate-950/50 p-4"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <p className="whitespace-pre-wrap text-sm text-slate-300">
                              {note.content}
                            </p>
                            <p className="mt-2 text-xs text-slate-500">
                              {new Date(note.createdAt).toLocaleString()}
                            </p>
                          </div>
                          <button
                            onClick={() => handleDeleteNote(note.id)}
                            className="text-sm text-red-400 hover:text-red-300"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
