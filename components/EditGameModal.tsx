"use client";

import { useState, FormEvent } from "react";
import { StoredGameSession } from "@/lib/games/types";
import { TIME_SLOTS } from "@/lib/constants";

interface EditGameModalProps {
  session: StoredGameSession;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EditGameModal({
  session,
  onClose,
  onSuccess,
}: EditGameModalProps) {
  const [game, setGame] = useState(session.game);
  const [date, setDate] = useState(session.date);
  const [times, setTimes] = useState<string[]>(session.times);
  const [description, setDescription] = useState(session.description);
  const [maxPlayers, setMaxPlayers] = useState(session.maxPlayers);
  const [imageUrl, setImageUrl] = useState(session.imageUrl || "");
  const [location, setLocation] = useState(session.location || "");
  const [zipCode, setZipCode] = useState(session.zipCode || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [lastClickedSlot, setLastClickedSlot] = useState<string>("");

  const handleTimeToggle = (time: string, shiftKey: boolean = false) => {
    setTimes((prev) => {
      // Handle range selection with shift key
      if (shiftKey && lastClickedSlot) {
        const startIdx = TIME_SLOTS.indexOf(lastClickedSlot);
        const endIdx = TIME_SLOTS.indexOf(time);

        if (startIdx !== -1 && endIdx !== -1) {
          const [minIdx, maxIdx] = [
            Math.min(startIdx, endIdx),
            Math.max(startIdx, endIdx),
          ];
          const slotsInRange = TIME_SLOTS.slice(minIdx, maxIdx + 1);

          // Check if all slots in range are already selected
          const allSelected = slotsInRange.every((s) => prev.includes(s));

          if (allSelected) {
            // Deselect all slots in range
            return prev.filter((s) => !slotsInRange.includes(s));
          } else {
            // Select all slots in range
            const newSlots = [...prev];
            slotsInRange.forEach((s) => {
              if (!newSlots.includes(s)) {
                newSlots.push(s);
              }
            });
            return newSlots;
          }
        }
      }

      // Normal toggle behavior
      setLastClickedSlot(time);
      return prev.includes(time) ? prev.filter((t) => t !== time) : [...prev, time];
    });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/games/${session.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          game,
          date,
          times,
          description,
          maxPlayers,
          imageUrl: imageUrl || undefined,
          location: location || undefined,
          zipCode: zipCode || undefined,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update game session");
      }

      onSuccess();
    } catch (err) {
      console.error("Failed to update game session", err);
      setError(err instanceof Error ? err.message : "Failed to update game session");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl border border-slate-800 bg-slate-950 p-6">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-100">Edit Game Session</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-100"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="game" className="block text-sm font-medium text-slate-200">
              Game Name
            </label>
            <input
              id="game"
              type="text"
              value={game}
              onChange={(e) => setGame(e.target.value)}
              required
              className="w-full rounded-xl border border-slate-800 bg-slate-950/80 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="date" className="block text-sm font-medium text-slate-200">
              Date
            </label>
            <input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className="w-full rounded-xl border border-slate-800 bg-slate-950/80 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-200">
              Time Slots
            </label>
            <p className="text-xs text-slate-400">
              Click to select individual times or hold Shift and click to select a range.
            </p>
            <div className="flex flex-wrap gap-2">
              {TIME_SLOTS.map((slot) => (
                <button
                  key={slot}
                  type="button"
                  onClick={(e) => handleTimeToggle(slot, e.shiftKey)}
                  className={`rounded-full border px-3 py-1.5 text-xs transition-colors ${
                    times.includes(slot)
                      ? "border-sky-400 bg-sky-500/20 text-sky-100"
                      : "border-slate-700 bg-slate-900 text-slate-200 hover:border-slate-500"
                  }`}
                >
                  {slot}
                </button>
              ))}
            </div>
            <p className="text-xs text-slate-500">
              {times.length} time slot(s) selected
            </p>
          </div>

          <div className="space-y-2">
            <label htmlFor="maxPlayers" className="block text-sm font-medium text-slate-200">
              Max Players
            </label>
            <input
              id="maxPlayers"
              type="number"
              value={maxPlayers}
              onChange={(e) => setMaxPlayers(parseInt(e.target.value))}
              min="1"
              max="20"
              required
              className="w-full rounded-xl border border-slate-800 bg-slate-950/80 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="description" className="block text-sm font-medium text-slate-200">
              Game Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              placeholder="Describe your game session..."
              className="w-full resize-y rounded-xl border border-slate-800 bg-slate-950/80 px-4 py-3 text-sm leading-relaxed text-slate-100 placeholder:text-slate-500 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="imageUrl" className="block text-sm font-medium text-slate-200">
              Image URL (Optional)
            </label>
            <input
              id="imageUrl"
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://example.com/image.jpg"
              className="w-full rounded-xl border border-slate-800 bg-slate-950/80 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="location" className="block text-sm font-medium text-slate-200">
              Location (Optional)
            </label>
            <input
              id="location"
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="City, State"
              className="w-full rounded-xl border border-slate-800 bg-slate-950/80 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="zipCode" className="block text-sm font-medium text-slate-200">
              Zip Code (Optional)
            </label>
            <input
              id="zipCode"
              type="text"
              value={zipCode}
              onChange={(e) => setZipCode(e.target.value)}
              placeholder="12345"
              className="w-full rounded-xl border border-slate-800 bg-slate-950/80 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
            />
          </div>

          {error && (
            <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm font-medium text-slate-300 transition hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || times.length === 0}
              className="flex-1 rounded-xl bg-sky-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
