"use client";

import { useState, FormEvent } from "react";
import { Tale } from "@/lib/tall-tales/client-types";

interface EditTaleModalProps {
  tale: Tale;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EditTaleModal({
  tale,
  onClose,
  onSuccess,
}: EditTaleModalProps) {
  const [title, setTitle] = useState(tale.title);
  const [content, setContent] = useState(tale.content);
  const [imageUrls, setImageUrls] = useState<string[]>(tale.imageUrls || []);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [error, setError] = useState("");

  const remainingCharacters = 5000 - content.length;

  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (imageUrls.length >= 5) {
      setError("Maximum 5 images allowed per post");
      return;
    }

    setIsUploadingImage(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", "tale");

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to upload image");
      }

      const { url } = await response.json();
      setImageUrls([...imageUrls, url]);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to upload image"
      );
    } finally {
      setIsUploadingImage(false);
    }
  };

  const removeImage = (index: number) => {
    setImageUrls(imageUrls.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      if (!title.trim()) {
        throw new Error("Title is required");
      }

      if (!content.trim()) {
        throw new Error("Content is required");
      }

      if (content.length > 5000) {
        throw new Error("Content must not exceed 5000 characters");
      }

      const response = await fetch(`/api/tall-tales/${tale.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: title.trim(),
          content: content.trim(),
          imageUrls: imageUrls.length > 0 ? imageUrls : undefined,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update tale");
      }

      onSuccess();
    } catch (err) {
      console.error("Failed to update tale", err);
      setError(err instanceof Error ? err.message : "Failed to update tale");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-xl font-semibold text-slate-100">Edit Tale</h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label
              htmlFor="edit-title"
              className="block text-sm font-medium text-slate-200"
            >
              Title
            </label>
            <input
              id="edit-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Give your story a catchy title..."
              maxLength={200}
              className="w-full rounded-xl border border-slate-800 bg-slate-950/80 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label
                htmlFor="edit-content"
                className="block text-sm font-medium text-slate-200"
              >
                Your Story (Markdown supported)
              </label>
              <span className={`text-xs ${remainingCharacters < 0 ? 'text-red-400' : remainingCharacters < 500 ? 'text-amber-400' : 'text-slate-500'}`}>
                {remainingCharacters} characters remaining
              </span>
            </div>
            <textarea
              id="edit-content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={12}
              placeholder="Share your epic tale here..."
              className="w-full resize-y rounded-xl border border-slate-800 bg-slate-950/80 px-4 py-3 text-sm leading-relaxed text-slate-100 placeholder:text-slate-500 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-200">
              Images (Optional, up to 5)
            </label>
            <div className="flex flex-wrap gap-3">
              {imageUrls.map((url, index) => (
                <div key={index} className="relative">
                  <img
                    src={url}
                    alt={`Upload ${index + 1}`}
                    className="h-24 w-24 rounded-lg border border-slate-700 object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute -right-2 -top-2 rounded-full bg-red-600 p-1 text-white hover:bg-red-700"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
              {imageUrls.length < 5 && (
                <label
                  htmlFor="edit-image-upload"
                  className="flex h-24 w-24 cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-slate-700 bg-slate-800/50 transition hover:border-slate-600 hover:bg-slate-800"
                >
                  {isUploadingImage ? (
                    <span className="text-xs text-slate-400">Uploading...</span>
                  ) : (
                    <svg className="h-8 w-8 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  )}
                </label>
              )}
            </div>
            <input
              id="edit-image-upload"
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={handleImageUpload}
              disabled={isUploadingImage || imageUrls.length >= 5}
              className="hidden"
            />
            <p className="text-xs text-slate-500">
              JPG, PNG, WebP or GIF. Max 5MB per image.
            </p>
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
              className="flex-1 rounded-xl border border-slate-700 bg-slate-800 px-6 py-3 font-medium text-slate-200 transition hover:bg-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || content.length > 5000}
              className="flex-1 rounded-xl bg-sky-500 px-6 py-3 font-medium text-white transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? "Updating..." : "Update Tale"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
