"use client";

import { useState, FormEvent } from "react";
import { GAME_OPTIONS, TIME_SLOTS } from "@/lib/constants";

const tagButtonClasses = (
  active: boolean,
  options?: { size?: "sm" | "md" }
) => {
  const sizeClasses =
    options?.size === "sm" ? "px-2 py-1 text-xs" : "px-3 py-1.5 text-sm";
  const baseClasses = "rounded-full border transition-colors";
  const activeClasses = active
    ? "border-sky-400 bg-sky-500/20 text-sky-100"
    : "border-slate-700 bg-slate-900 text-slate-200 hover:border-slate-500";

  return [sizeClasses, baseClasses, activeClasses].join(" ");
};

export default function PostGamePage() {
  const [selectedGame, setSelectedGame] = useState("");
  const [selectedTimes, setSelectedTimes] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [description, setDescription] = useState("");
  const [maxPlayers, setMaxPlayers] = useState(4);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [lastClickedSlot, setLastClickedSlot] = useState<string>("");

  const toggleTime = (slot: string, shiftKey: boolean = false) => {
    setSelectedTimes((prev) => {
      // Handle range selection with shift key
      if (shiftKey && lastClickedSlot) {
        const startIdx = TIME_SLOTS.indexOf(lastClickedSlot);
        const endIdx = TIME_SLOTS.indexOf(slot);
        
        if (startIdx !== -1 && endIdx !== -1) {
          const [minIdx, maxIdx] = [Math.min(startIdx, endIdx), Math.max(startIdx, endIdx)];
          const slotsInRange = TIME_SLOTS.slice(minIdx, maxIdx + 1);
          
          // Check if all slots in range are already selected
          const allSelected = slotsInRange.every(s => prev.includes(s));
          
          if (allSelected) {
            // Deselect all slots in range
            return prev.filter(s => !slotsInRange.includes(s));
          } else {
            // Select all slots in range
            const newSlots = [...prev];
            slotsInRange.forEach(s => {
              if (!newSlots.includes(s)) {
                newSlots.push(s);
              }
            });
            return newSlots;
          }
        }
      }
      
      // Normal toggle behavior
      setLastClickedSlot(slot);
      return prev.includes(slot)
        ? prev.filter((item) => item !== slot)
        : [...prev, slot];
    });
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploadingImage(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", "game");

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to upload image");
      }

      const { url } = await response.json();
      setImageUrl(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload image");
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/games", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          game: selectedGame,
          date: selectedDate,
          times: selectedTimes,
          description: description,
          maxPlayers: maxPlayers,
          imageUrl: imageUrl,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to post game session");
      }

      setSubmitted(true);
      // Reset form
      setSelectedGame("");
      setSelectedTimes([]);
      setSelectedDate("");
      setDescription("");
      setMaxPlayers(4);
      setImageUrl("");
      
      setTimeout(() => setSubmitted(false), 5000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to post game session");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-100">Post a Game</h1>
        <p className="mt-2 text-sm text-slate-400">
          Create a new game session and invite players to join.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-slate-800/60 bg-slate-900/40 p-6 shadow-lg shadow-slate-900/30">
        <div className="space-y-2">
          <label htmlFor="game-select" className="block text-sm font-medium text-slate-200">
            Select Game <span className="text-red-400">*</span>
          </label>
          <select
            id="game-select"
            value={selectedGame}
            onChange={(e) => setSelectedGame(e.target.value)}
            required
            className="w-full rounded-xl border border-slate-800 bg-slate-950/80 px-4 py-3 text-sm text-slate-100 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
          >
            <option value="">Choose a game...</option>
            {GAME_OPTIONS.map((game) => (
              <option key={game} value={game}>
                {game}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label htmlFor="date-select" className="block text-sm font-medium text-slate-200">
            Game Date <span className="text-red-400">*</span>
          </label>
          <input
            id="date-select"
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            required
            className="w-full rounded-xl border border-slate-800 bg-slate-950/80 px-4 py-3 text-sm text-slate-100 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-200">
            Game Time <span className="text-red-400">*</span>
          </label>
          <p className="text-xs text-slate-400">
            Click to select individual times or hold Shift and click to select a range.
          </p>
          <div className="flex flex-wrap gap-2">
            {TIME_SLOTS.map((slot) => {
              const active = selectedTimes.includes(slot);
              return (
                <button
                  key={slot}
                  type="button"
                  onClick={(e) => toggleTime(slot, e.shiftKey)}
                  className={tagButtonClasses(active, { size: "sm" })}
                >
                  {slot}
                </button>
              );
            })}
          </div>
          <p className="text-xs text-slate-500">
            {selectedTimes.length} time slot(s) selected
          </p>
        </div>

        <div className="space-y-2">
          <label htmlFor="maxPlayers" className="block text-sm font-medium text-slate-200">
            Number of Players <span className="text-red-400">*</span>
          </label>
          <input
            id="maxPlayers"
            type="number"
            min="1"
            max="20"
            value={maxPlayers}
            onChange={(e) => setMaxPlayers(parseInt(e.target.value) || 1)}
            required
            className="w-full rounded-xl border border-slate-800 bg-slate-950/80 px-4 py-3 text-sm text-slate-100 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
          />
          <p className="text-xs text-slate-500">
            Maximum number of players that can join this session
          </p>
        </div>

        <div className="space-y-2">
          <label htmlFor="game-image" className="block text-sm font-medium text-slate-200">
            Game Image
          </label>
          <div className="space-y-3">
            {imageUrl && (
              <div className="relative">
                <img
                  src={imageUrl}
                  alt="Game session"
                  className="h-48 w-full rounded-lg border border-slate-800 object-cover"
                />
                <button
                  type="button"
                  onClick={() => setImageUrl("")}
                  className="absolute right-2 top-2 rounded-lg bg-red-600 px-3 py-1 text-xs font-medium text-white transition hover:bg-red-700"
                >
                  Remove
                </button>
              </div>
            )}
            <label
              htmlFor="game-image"
              className="inline-block cursor-pointer rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium text-slate-100 transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isUploadingImage ? "Uploading..." : imageUrl ? "Change Image" : "Upload Image"}
            </label>
            <input
              id="game-image"
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={handleImageUpload}
              disabled={isUploadingImage}
              className="hidden"
            />
            <p className="text-xs text-slate-500">
              JPG, PNG, WebP or GIF. Max 5MB. Optional.
            </p>
          </div>
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
            placeholder="Describe your game session, experience level requirements, or any additional details..."
            className="w-full resize-y rounded-xl border border-slate-800 bg-slate-950/80 px-4 py-3 text-sm leading-relaxed text-slate-100 placeholder:text-slate-500 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
          />
        </div>

        <button
          type="submit"
          className="mt-4 w-full rounded-xl bg-sky-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
          disabled={!selectedGame || selectedTimes.length === 0 || !selectedDate || isSubmitting}
        >
          {isSubmitting ? "Posting..." : "Post Game Session"}
        </button>

        {error && (
          <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        {submitted && (
          <div className="rounded-xl border border-green-500/20 bg-green-500/10 px-4 py-3 text-sm text-green-400">
            Game session posted successfully!
          </div>
        )}
      </form>
    </section>
  );
}
