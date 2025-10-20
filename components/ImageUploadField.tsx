"use client";

import { ChangeEvent, useRef, useState } from "react";

interface ImageUploadFieldProps {
  label: string;
  value: string;
  onChange: (url: string) => void;
  type: string;
  required?: boolean;
  helpText?: string;
  disabled?: boolean;
}

export default function ImageUploadField({
  label,
  value,
  onChange,
  type,
  required = false,
  helpText,
  disabled = false,
}: ImageUploadFieldProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
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
      onChange(url);
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

  const handleUrlChange = (e: ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
    setUploadError(null);
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div>
      <label className="block text-sm font-medium text-slate-200">
        {label}
        {required && <span className="text-rose-400"> *</span>}
      </label>
      <div className="mt-1 space-y-2">
        <div className="flex gap-2">
          <input
            type="url"
            value={value}
            onChange={handleUrlChange}
            className="flex-1 rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
            placeholder="https://example.com/image.jpg or upload below"
            required={required && !value}
            disabled={disabled || uploading}
          />
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
        {value && (
          <div className="mt-2">
            <img
              src={value}
              alt="Preview"
              className="h-24 w-auto rounded-lg border border-slate-700 object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = "none";
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
