"use client";

import { useState } from "react";
import CharacterSelectionDialog from "@/components/CharacterSelectionDialog";

interface JoinWithdrawButtonProps {
  sessionId: string;
  currentUserId: string | null;
  isUserSignedUp: boolean;
  isHost: boolean;
  onSessionUpdate: () => void;
  gameSystem?: string | null;
}

export default function JoinWithdrawButton({
  sessionId,
  currentUserId,
  isUserSignedUp,
  isHost,
  onSessionUpdate,
  gameSystem = null,
}: JoinWithdrawButtonProps) {
  const [isJoining, setIsJoining] = useState(false);
  const [showCharacterDialog, setShowCharacterDialog] = useState(false);
  const [showCharacterSwitchDialog, setShowCharacterSwitchDialog] = useState(false);
  const [isUpdatingCharacter, setIsUpdatingCharacter] = useState(false);
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

  const handleSwitchCharacter = () => {
    setShowCharacterSwitchDialog(true);
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

      // Update the game session data
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

      // Update the game session data
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

  const handleCharacterSwitch = async (
    characterId?: string,
    characterName?: string
  ) => {
    setShowCharacterSwitchDialog(false);
    setIsUpdatingCharacter(true);
    setError(null);

    try {
      const response = await fetch(`/api/games/${sessionId}/update-character`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ characterId, characterName }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update character");
      }

      // Update the game session data
      onSessionUpdate();
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Failed to update character"
      );
    } finally {
      setIsUpdatingCharacter(false);
    }
  };

  const handleCharacterSwitchCancel = () => {
    setShowCharacterSwitchDialog(false);
  };

  return (
    <>
      <div className="flex flex-col gap-2">
        {isUserSignedUp ? (
          <div className="flex gap-2">
            <button
              onClick={handleSwitchCharacter}
              disabled={isUpdatingCharacter}
              className="flex-1 rounded-lg bg-sky-600 px-6 py-3 text-base font-medium text-white transition hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 focus:ring-offset-slate-950 disabled:cursor-not-allowed disabled:opacity-50"
              title="Switch character for this game"
            >
              {isUpdatingCharacter ? "Updating..." : "Switch Character"}
            </button>
            <button
              onClick={handleJoinClick}
              disabled={isJoining}
              className="flex-1 rounded-lg bg-red-600 px-6 py-3 text-base font-medium text-white transition hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-slate-950 disabled:cursor-not-allowed disabled:opacity-50"
              title="Withdraw from this game"
            >
              {isJoining ? "Withdrawing..." : "Withdraw"}
            </button>
          </div>
        ) : (
          <button
            onClick={handleJoinClick}
            disabled={isJoining}
            className="rounded-lg bg-sky-600 px-6 py-3 text-base font-medium text-white transition hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 focus:ring-offset-slate-950 disabled:cursor-not-allowed disabled:opacity-50"
            title="Request to join"
          >
            {isJoining ? "Requesting..." : "Request to Join"}
          </button>
        )}

        {error && (
          <p className="text-sm text-red-400">{error}</p>
        )}
      </div>

      {showCharacterDialog && (
        <CharacterSelectionDialog
          onSelect={handleCharacterSelect}
          onCancel={handleCharacterCancel}
          isLoading={isJoining}
          gameSystem={gameSystem}
        />
      )}

      {showCharacterSwitchDialog && (
        <CharacterSelectionDialog
          onSelect={handleCharacterSwitch}
          onCancel={handleCharacterSwitchCancel}
          isLoading={isUpdatingCharacter}
          gameSystem={gameSystem}
        />
      )}
    </>
  );
}
