"use client";

import { useState } from "react";
import EditTaleModal from "./EditTaleModal";

interface Tale {
  id: string;
  userId: string;
  title: string;
  content: string;
  imageUrls?: string[];
  createdAt: Date;
  authorName: string;
  authorAvatarUrl?: string;
}

interface TaleActionsProps {
  tale: Tale;
  onUpdate: () => void;
}

export default function TaleActions({ tale, onUpdate }: TaleActionsProps) {
  const [showEditModal, setShowEditModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    const confirmation = window.confirm(
      "Are you sure you want to delete this tale? This action cannot be undone."
    );

    if (!confirmation) {
      return;
    }

    setIsDeleting(true);

    try {
      const response = await fetch(`/api/tall-tales/${tale.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete tale");
      }

      // Refresh the tales list
      onUpdate();
    } catch (error) {
      console.error("Failed to delete tale", error);
      alert("Failed to delete the tale. Please try again.");
      setIsDeleting(false);
    }
  };

  const handleEditSuccess = () => {
    setShowEditModal(false);
    onUpdate();
  };

  return (
    <>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setShowEditModal(true)}
          className="rounded-md border border-indigo-500/70 px-3 py-1.5 text-xs font-medium text-indigo-200 transition hover:bg-indigo-500/10"
        >
          Edit
        </button>
        <button
          type="button"
          onClick={handleDelete}
          disabled={isDeleting}
          className="rounded-md border border-rose-600/70 px-3 py-1.5 text-xs font-medium text-rose-200 transition hover:bg-rose-600/10 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isDeleting ? "Deleting..." : "Delete"}
        </button>
      </div>

      {showEditModal && (
        <EditTaleModal
          tale={tale}
          onClose={() => setShowEditModal(false)}
          onSuccess={handleEditSuccess}
        />
      )}
    </>
  );
}
