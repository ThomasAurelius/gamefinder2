"use client";

import { ChangeEvent, useRef, useState } from "react";

interface MultiImageUploadFieldProps {
  label: string;
  images: string[];
  onChange: (images: string[]) => void;
  type: string;
  helpText?: string;
  disabled?: boolean;
}

export default function MultiImageUploadField({
  label,
  images,
  onChange,
  type,
  helpText,
  disabled = false,
}: MultiImageUploadFieldProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [urlInput, setUrlInput] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", type);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to upload image");
      }

      const { url } = await response.json();
      // Add the new URL to the existing images
      onChange([...images, url]);
      setUploadError(null);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to upload image";
      setUploadError(errorMessage);
    } finally {
      setUploading(false);
      // Reset the input so the same file can be uploaded again if needed
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleAddUrl = () => {
    const trimmed = urlInput.trim();
    if (trimmed && !images.includes(trimmed)) {
      onChange([...images, trimmed]);
      setUrlInput("");
    }
  };

  const handleRemoveImage = (index: number) => {
    onChange(images.filter((_, i) => i !== index));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddUrl();
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium text-slate-200">
        {label}
      </label>
      <div className="mt-1 space-y-2">
        <div className="flex gap-2">
          <input
            type="url"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
            placeholder="Enter image URL or upload below"
            disabled={disabled || uploading}
          />
          <button
            type="button"
            onClick={handleAddUrl}
            disabled={disabled || uploading || !urlInput.trim()}
            className="rounded-lg border border-slate-600 bg-slate-700/20 px-4 py-2 text-sm font-medium text-slate-300 transition hover:bg-slate-600/30 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Add URL
          </button>
          <button
            type="button"
            onClick={handleButtonClick}
            disabled={disabled || uploading}
            className="rounded-lg border border-sky-600 bg-sky-700/20 px-4 py-2 text-sm font-medium text-sky-300 transition hover:bg-sky-600/30 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {uploading ? "Uploading..." : "Upload"}
          </button>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          onChange={handleFileChange}
          disabled={disabled || uploading}
          className="hidden"
        />
        {helpText && (
          <p className="text-xs text-slate-500">{helpText}</p>
        )}
        {uploadError && (
          <p className="text-xs text-rose-400">{uploadError}</p>
        )}
        {images.length > 0 && (
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {images.map((imageUrl, index) => (
              <div key={index} className="group relative">
                <img
                  src={imageUrl}
                  alt={`Gallery ${index + 1}`}
                  className="h-24 w-full rounded-lg border border-slate-700 object-cover"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveImage(index)}
                  className="absolute -right-2 -top-2 rounded-full bg-rose-600 p-1 text-white opacity-0 transition hover:bg-rose-700 group-hover:opacity-100"
                  title="Remove image"
                >
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
