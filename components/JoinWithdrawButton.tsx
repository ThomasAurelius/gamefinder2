"use client";

import { useState } from "react";
import CharacterSelectionDialog from "@/components/CharacterSelectionDialog";

interface JoinWithdrawButtonProps {
  sessionId: string;
  currentUserId: string | null;
  isUserSignedUp: boolean;
  isHost: boolean;
  onSessionUpdate: () => void;
}

export default function JoinWithdrawButton({
  sessionId,
  currentUserId,
  isUserSignedUp,
  isHost,
  onSessionUpdate,
}: JoinWithdrawButtonProps) {
  const [isJoining, setIsJoining] = useState(false);
  const [showCharacterDialog, setShowCharacterDialog] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Don't show button if user is the host or not logged in
  if (isHost || !currentUserId) {
    return null;
  }

  const handleJoinClick = () => {
    if (isUserSignedUp) {
      // Handle withdraw
      handleWithdraw();
    } else {
      // Handle join request
      setShowCharacterDialog(true);
    }
  };

  const handleWithdraw = async () => {
    setIsJoining(true);
    setError(null);

    try {
      const response = await fetch(`/api/games/${sessionId}/leave`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || "Failed to withdraw from game session"
        );
      }

      // Refresh the page to show updated data
      onSessionUpdate();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to withdraw from game session"
      );
    } finally {
      setIsJoining(false);
    }
  };

  const handleCharacterSelect = async (
    characterId?: string,
    characterName?: string
  ) => {
    setShowCharacterDialog(false);
    setIsJoining(true);
    setError(null);

    try {
      const response = await fetch(`/api/games/${sessionId}/join`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ characterId, characterName }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to join game session");
      }

      // Refresh the page to show updated data
      onSessionUpdate();
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Failed to join game session"
      );
    } finally {
      setIsJoining(false);
    }
  };

  const handleCharacterCancel = () => {
    setShowCharacterDialog(false);
  };

  return (
    <>
      <div className="flex flex-col gap-2">
        <button
          onClick={handleJoinClick}
          disabled={isJoining}
          className={`rounded-lg px-6 py-3 text-base font-medium text-white transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-950 disabled:cursor-not-allowed disabled:opacity-50 ${
            isUserSignedUp
              ? "bg-red-600 hover:bg-red-700 focus:ring-red-500"
              : "bg-sky-600 hover:bg-sky-700 focus:ring-sky-500"
          }`}
          title={
            isUserSignedUp ? "Withdraw from this game" : "Request to join"
          }
        >
          {isJoining
            ? isUserSignedUp
              ? "Withdrawing..."
              : "Requesting..."
            : isUserSignedUp
              ? "Withdraw"
              : "Request to Join"}
        </button>

        {error && (
          <p className="text-sm text-red-400">{error}</p>
        )}
      </div>

      {showCharacterDialog && (
        <CharacterSelectionDialog
          onSelect={handleCharacterSelect}
          onCancel={handleCharacterCancel}
          isLoading={isJoining}
        />
      )}
    </>
  );
}
