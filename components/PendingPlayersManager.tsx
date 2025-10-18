"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type PendingPlayer = {
  id: string;
  name: string;
  avatarUrl?: string;
  characterName?: string;
  characterId?: string;
  characterIsPublic?: boolean;
};

type PendingPlayersManagerProps = {
  sessionId: string;
  pendingPlayers: PendingPlayer[];
};

export default function PendingPlayersManager({
  sessionId,
  pendingPlayers,
}: PendingPlayersManagerProps) {
  const router = useRouter();
  const [processingPlayerId, setProcessingPlayerId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleApprove = async (playerId: string) => {
    setProcessingPlayerId(playerId);
    setError(null);

    try {
      const response = await fetch(`/api/games/${sessionId}/approve`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ playerId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to approve player");
      }

      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to approve player");
    } finally {
      setProcessingPlayerId(null);
    }
  };

  const handleDeny = async (playerId: string) => {
    setProcessingPlayerId(playerId);
    setError(null);

    try {
      const response = await fetch(`/api/games/${sessionId}/deny`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ playerId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to deny player");
      }

      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to deny player");
    } finally {
      setProcessingPlayerId(null);
    }
  };

  if (pendingPlayers.length === 0) {
    return null;
  }

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-100">
          Pending Approval
        </h2>
        <span className="text-sm text-slate-400">
          {pendingPlayers.length}{" "}
          {pendingPlayers.length === 1 ? "player" : "players"}
        </span>
      </div>

      {error && (
        <div className="rounded-lg border border-red-800 bg-red-900/20 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      <div className="space-y-2">
        {pendingPlayers.map((player) => (
          <div
            key={player.id}
            className="rounded-lg border border-yellow-800 bg-yellow-900/20 px-4 py-3"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-yellow-600 text-sm font-medium">
                  ?
                </span>
                <div className="flex flex-col">
                  <span className="text-base text-slate-100">{player.name}</span>
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
              <div className="flex gap-2">
                <button
                  onClick={() => handleApprove(player.id)}
                  disabled={processingPlayerId === player.id}
                  className="rounded-md bg-green-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {processingPlayerId === player.id ? "..." : "Approve"}
                </button>
                <button
                  onClick={() => handleDeny(player.id)}
                  disabled={processingPlayerId === player.id}
                  className="rounded-md bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {processingPlayerId === player.id ? "..." : "Deny"}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <p className="text-sm text-yellow-400">
        Players are waiting for your approval to join this game.
      </p>
    </section>
  );
}
