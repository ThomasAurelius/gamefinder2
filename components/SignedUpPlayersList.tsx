"use client";

import { useState } from "react";
import Link from "next/link";

type Player = {
  id: string;
  name: string;
  characterName?: string;
  characterId?: string;
  characterIsPublic?: boolean;
};

type SignedUpPlayersListProps = {
  sessionId: string;
  sessionType: "game" | "campaign";
  players: Player[];
  maxPlayers: number;
  isHost: boolean;
  onPlayerRemoved?: () => void;
};

export default function SignedUpPlayersList({
  sessionId,
  sessionType,
  players,
  maxPlayers,
  isHost,
  onPlayerRemoved,
}: SignedUpPlayersListProps) {
  const [removingPlayerId, setRemovingPlayerId] = useState<string | null>(null);
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [removeReason, setRemoveReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRemoveClick = (player: Player) => {
    setSelectedPlayer(player);
    setRemoveReason("");
    setError(null);
    setShowRemoveModal(true);
  };

  const handleRemoveConfirm = async () => {
    if (!selectedPlayer || !removeReason.trim()) {
      setError("Please provide a reason for removing this player");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const endpoint = sessionType === "game" 
        ? `/api/games/${sessionId}/remove-player`
        : `/api/campaigns/${sessionId}/remove-player`;

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          playerId: selectedPlayer.id,
          reason: removeReason.trim(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to remove player");
      }

      // Close modal and refresh
      setShowRemoveModal(false);
      setSelectedPlayer(null);
      setRemoveReason("");
      
      if (onPlayerRemoved) {
        onPlayerRemoved();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to remove player");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelRemove = () => {
    setShowRemoveModal(false);
    setSelectedPlayer(null);
    setRemoveReason("");
    setError(null);
  };

  const availableSlots = maxPlayers - players.length;

  return (
    <>
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-100">
            Signed Up Players
          </h2>
          <span className="text-sm text-slate-400">
            {players.length} / {maxPlayers}
          </span>
        </div>

        {players.length > 0 ? (
          <div className="space-y-2">
            {players.map((player, index) => (
              <div
                key={player.id}
                className="rounded-lg border border-slate-800 bg-slate-900/70 px-4 py-3 text-base text-slate-100"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-sky-600 text-sm font-medium">
                      {index + 1}
                    </span>
                    <div className="flex flex-col">
                      <Link
                        href={`/players/${player.id}`}
                        className="hover:text-sky-300 transition-colors"
                      >
                        {player.name}
                      </Link>
                      {player.characterName && (
                        <span className="text-sm text-slate-400">
                          Playing as:{" "}
                          {player.characterIsPublic && player.characterId ? (
                            <Link
                              href={`/players/${player.id}/characters/${player.characterId}`}
                              className="hover:text-sky-300 transition-colors"
                            >
                              {player.characterName}
                            </Link>
                          ) : (
                            player.characterName
                          )}
                        </span>
                      )}
                    </div>
                  </div>
                  {isHost && (
                    <button
                      onClick={() => handleRemoveClick(player)}
                      disabled={removingPlayerId === player.id}
                      className="rounded-md bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="rounded-lg border border-slate-800 bg-slate-900/70 px-4 py-3 text-sm text-slate-400">
            No players signed up yet.
          </p>
        )}

        {availableSlots > 0 && (
          <p className="text-sm text-green-400">
            {availableSlots} {availableSlots === 1 ? "spot" : "spots"}{" "}
            available
          </p>
        )}
      </section>

      {/* Remove Player Modal */}
      {showRemoveModal && selectedPlayer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-lg border border-slate-800 bg-slate-900 p-6">
            <h3 className="text-xl font-semibold text-slate-100 mb-4">
              Remove Player
            </h3>
            <p className="text-slate-300 mb-4">
              You are about to remove <strong>{selectedPlayer.name}</strong> from this {sessionType}.
              Please provide a reason that will be sent to the player.
            </p>

            {error && (
              <div className="mb-4 rounded-lg border border-red-800 bg-red-900/20 px-4 py-3 text-sm text-red-400">
                {error}
              </div>
            )}

            <div className="mb-4">
              <label htmlFor="removeReason" className="block text-sm font-medium text-slate-300 mb-2">
                Reason for removal<span className="text-red-500">*</span>
              </label>
              <textarea
                id="removeReason"
                value={removeReason}
                onChange={(e) => setRemoveReason(e.target.value)}
                placeholder="Please explain why you are removing this player..."
                rows={4}
                className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-slate-100 placeholder-slate-500 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                disabled={isSubmitting}
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleCancelRemove}
                disabled={isSubmitting}
                className="flex-1 rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-sm font-medium text-slate-300 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={handleRemoveConfirm}
                disabled={isSubmitting || !removeReason.trim()}
                className="flex-1 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Removing..." : "Remove Player"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
