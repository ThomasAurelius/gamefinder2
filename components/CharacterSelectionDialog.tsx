"use client";

import { useState, useEffect } from "react";
import { StoredCharacter } from "@/lib/characters/types";

interface CharacterSelectionDialogProps {
  onSelect: (characterId?: string, characterName?: string) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export default function CharacterSelectionDialog({
  onSelect,
  onCancel,
  isLoading = false,
}: CharacterSelectionDialogProps) {
  console.log("CharacterSelectionDialog rendered, isLoading:", isLoading);
  const [characters, setCharacters] = useState<StoredCharacter[]>([]);
  const [selectedCharacterId, setSelectedCharacterId] = useState<string>("");
  const [loadingCharacters, setLoadingCharacters] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCharacters = async () => {
      try {
        const response = await fetch("/api/characters");
        if (response.ok) {
          const data = await response.json();
          setCharacters(data);
        } else {
          setError("Failed to load characters");
        }
      } catch (err) {
        console.error("Failed to fetch characters:", err);
        setError("Failed to load characters");
      } finally {
        setLoadingCharacters(false);
      }
    };

    fetchCharacters();
  }, []);

  const handleConfirm = () => {
    if (selectedCharacterId) {
      const character = characters.find((c) => c.id === selectedCharacterId);
      onSelect(selectedCharacterId, character?.name);
    } else {
      // User chose to join without a character
      onSelect(undefined, undefined);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-md p-4" onClick={(e) => e.stopPropagation()}>
      <div className="w-full max-w-md rounded-xl border-2 border-sky-500 bg-slate-900 shadow-2xl shadow-sky-500/20" onClick={(e) => e.stopPropagation()}>
        <div className="border-b border-slate-800 px-6 py-4 bg-sky-900/20">
          <h2 className="text-xl font-semibold text-slate-100">
            Select a Character
          </h2>
          <p className="mt-1 text-sm text-slate-400">
            Choose a character to join with (optional)
          </p>
        </div>

        <div className="p-6 space-y-4">
          {loadingCharacters ? (
            <p className="text-sm text-slate-400">Loading characters...</p>
          ) : error ? (
            <p className="text-sm text-red-400">{error}</p>
          ) : characters.length === 0 ? (
            <p className="text-sm text-slate-400">
              You don&apos;t have any characters yet. You can still join without one.
            </p>
          ) : (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-200">
                Choose a character
              </label>
              <select
                value={selectedCharacterId}
                onChange={(e) => setSelectedCharacterId(e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-950/80 px-4 py-3 text-sm text-slate-100 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
              >
                <option value="">No character (join without one)</option>
                {characters.map((character) => (
                  <option key={character.id} value={character.id}>
                    {character.name}
                    {character.level && ` - Level ${character.level}`}
                    {character.class && ` ${character.class}`}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 border-t border-slate-800 px-6 py-4">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium text-slate-300 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isLoading || loadingCharacters}
            className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoading ? "Joining..." : "Confirm"}
          </button>
        </div>
      </div>
    </div>
  );
}
