"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { StoredGameSession } from "@/lib/games/types";
import EditGameModal from "./EditGameModal";

interface GameActionsProps {
  session: StoredGameSession;
}

export default function GameActions({ session }: GameActionsProps) {
  const [showEditModal, setShowEditModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    const confirmation = window.confirm(
      "Are you sure you want to delete this game session? This action cannot be undone."
    );

    if (!confirmation) {
      return;
    }

    setIsDeleting(true);

    try {
      const response = await fetch(`/api/games/${session.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete game session");
      }

      // Redirect to find page after successful deletion
      router.push("/find");
      router.refresh();
    } catch (error) {
      console.error("Failed to delete game session", error);
      alert("Failed to delete the game session. Please try again.");
      setIsDeleting(false);
    }
  };

  const handleEditSuccess = () => {
    setShowEditModal(false);
    router.refresh();
  };

  return (
    <>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setShowEditModal(true)}
          className="rounded-md border border-indigo-500/70 px-4 py-2 text-sm font-medium text-indigo-200 transition hover:bg-indigo-500/10"
        >
          Edit
        </button>
        <button
          type="button"
          onClick={handleDelete}
          disabled={isDeleting}
          className="rounded-md border border-rose-600/70 px-4 py-2 text-sm font-medium text-rose-200 transition hover:bg-rose-600/10 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isDeleting ? "Deleting..." : "Delete"}
        </button>
      </div>

      {showEditModal && (
        <EditGameModal
          session={session}
          onClose={() => setShowEditModal(false)}
          onSuccess={handleEditSuccess}
        />
      )}
    </>
  );
}
