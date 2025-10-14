"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { GAME_OPTIONS } from "@/lib/constants";

export default function PostMarketplaceListingPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [listingType, setListingType] = useState<"sell" | "want">("sell");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedGameSystem, setSelectedGameSystem] = useState("");
  const [customGameSystem, setCustomGameSystem] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [customTag, setCustomTag] = useState("");
  const [price, setPrice] = useState("");
  const [condition, setCondition] = useState("");
  const [location, setLocation] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [imageUrls, setImageUrls] = useState<string[]>([""]);
  const [contactInfo, setContactInfo] = useState("");

  const COMMON_TAGS = [
    "Core Rulebooks",
    "Adventure Modules",
    "Dice Sets",
    "Miniatures",
    "Maps",
    "Tokens",
    "Accessories",
    "Digital",
    "Vintage",
    "Signed",
  ];

  const CONDITIONS = ["new", "like-new", "good", "fair", "poor"];

  const toggleTag = (tag: string) => {
    setTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const addCustomTag = () => {
    if (customTag.trim() && !tags.includes(customTag.trim())) {
      setTags([...tags, customTag.trim()]);
      setCustomTag("");
    }
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const addImageUrl = () => {
    setImageUrls([...imageUrls, ""]);
  };

  const updateImageUrl = (index: number, value: string) => {
    const newUrls = [...imageUrls];
    newUrls[index] = value;
    setImageUrls(newUrls);
  };

  const removeImageUrl = (index: number) => {
    setImageUrls(imageUrls.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      if (!title.trim() || !description.trim()) {
        setError("Title and description are required");
        setIsSubmitting(false);
        return;
      }

      const gameSystem =
        selectedGameSystem === "Other"
          ? customGameSystem.trim()
          : selectedGameSystem;

      const filteredImageUrls = imageUrls.filter((url) => url.trim() !== "");

      const requestBody: {
        title: string;
        description: string;
        gameSystem?: string;
        tags: string[];
        price?: number;
        condition?: string;
        location: string;
        zipCode: string;
        imageUrls?: string[];
        listingType: "sell" | "want";
        contactInfo?: string;
      } = {
        title: title.trim(),
        description: description.trim(),
        tags,
        location,
        zipCode,
        listingType,
      };

      if (gameSystem) {
        requestBody.gameSystem = gameSystem;
      }

      if (price && parseFloat(price) > 0) {
        requestBody.price = parseFloat(price);
      }

      if (condition && listingType === "sell") {
        requestBody.condition = condition;
      }

      if (filteredImageUrls.length > 0) {
        requestBody.imageUrls = filteredImageUrls;
      }

      if (contactInfo.trim()) {
        requestBody.contactInfo = contactInfo.trim();
      }

      const response = await fetch("/api/marketplace", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create listing");
      }

      const data = await response.json();
      router.push(`/marketplace/${data.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create listing");
      setIsSubmitting(false);
    }
  };

  return (
    <section className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-100">
          Post a Marketplace Listing
        </h1>
        <p className="mt-2 text-sm text-slate-400">
          List items for sale or post a want ad for items you're looking for.
          Payment is handled off-site.
        </p>
      </div>

      {error && (
        <div className="rounded-xl border border-red-900/50 bg-red-950/30 p-4 text-sm text-red-400">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-xl border border-slate-800 bg-slate-900/20 p-6 space-y-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-200">
              Listing Type
            </label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  value="sell"
                  checked={listingType === "sell"}
                  onChange={(e) => setListingType(e.target.value as "sell" | "want")}
                  className="h-4 w-4 text-sky-600 focus:ring-sky-500"
                />
                <span className="text-sm text-slate-300">For Sale</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  value="want"
                  checked={listingType === "want"}
                  onChange={(e) => setListingType(e.target.value as "sell" | "want")}
                  className="h-4 w-4 text-sky-600 focus:ring-sky-500"
                />
                <span className="text-sm text-slate-300">Want Ad</span>
              </label>
            </div>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="title"
              className="block text-sm font-medium text-slate-200"
            >
              Title <span className="text-red-400">*</span>
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter a descriptive title"
              required
              className="w-full rounded-xl border border-slate-800 bg-slate-950/80 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="description"
              className="block text-sm font-medium text-slate-200"
            >
              Description <span className="text-red-400">*</span>
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide details about the item..."
              required
              rows={6}
              className="w-full rounded-xl border border-slate-800 bg-slate-950/80 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="game-system"
              className="block text-sm font-medium text-slate-200"
            >
              Game System
            </label>
            <select
              id="game-system"
              value={selectedGameSystem}
              onChange={(e) => setSelectedGameSystem(e.target.value)}
              className="w-full rounded-xl border border-slate-800 bg-slate-950/80 px-4 py-3 text-sm text-slate-100 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
            >
              <option value="">Select a game system (optional)</option>
              {GAME_OPTIONS.map((game) => (
                <option key={game} value={game}>
                  {game}
                </option>
              ))}
            </select>
            {selectedGameSystem === "Other" && (
              <input
                type="text"
                value={customGameSystem}
                onChange={(e) => setCustomGameSystem(e.target.value)}
                placeholder="Enter custom game system name"
                className="w-full rounded-xl border border-slate-800 bg-slate-950/80 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
              />
            )}
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-200">
              Tags
            </label>
            <p className="text-xs text-slate-500">
              Select common tags or add your own
            </p>
            <div className="flex flex-wrap gap-2">
              {COMMON_TAGS.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  className={`rounded-full px-3 py-1.5 text-sm transition ${
                    tags.includes(tag)
                      ? "bg-sky-600 text-white"
                      : "border border-slate-700 bg-slate-900/40 text-slate-300 hover:border-sky-500 hover:text-sky-400"
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={customTag}
                onChange={(e) => setCustomTag(e.target.value)}
                placeholder="Add custom tag"
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addCustomTag();
                  }
                }}
                className="flex-1 rounded-xl border border-slate-800 bg-slate-950/80 px-4 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
              />
              <button
                type="button"
                onClick={addCustomTag}
                className="rounded-xl border border-slate-700 bg-slate-900/40 px-4 py-2 text-sm font-medium text-slate-300 transition hover:border-sky-500 hover:text-sky-400"
              >
                Add
              </button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 rounded-full bg-sky-600 px-3 py-1 text-sm text-white"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="hover:text-red-300"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <label
              htmlFor="price"
              className="block text-sm font-medium text-slate-200"
            >
              Price ($)
            </label>
            <input
              id="price"
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="0.00"
              min="0"
              step="0.01"
              className="w-full rounded-xl border border-slate-800 bg-slate-950/80 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
            />
            <p className="text-xs text-slate-500">
              Optional. Leave blank if price is negotiable or for want ads.
            </p>
          </div>

          {listingType === "sell" && (
            <div className="space-y-2">
              <label
                htmlFor="condition"
                className="block text-sm font-medium text-slate-200"
              >
                Condition
              </label>
              <select
                id="condition"
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
                className="w-full rounded-xl border border-slate-800 bg-slate-950/80 px-4 py-3 text-sm text-slate-100 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
              >
                <option value="">Select condition (optional)</option>
                {CONDITIONS.map((cond) => (
                  <option key={cond} value={cond}>
                    {cond.charAt(0).toUpperCase() + cond.slice(1).replace("-", " ")}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="space-y-2">
            <label
              htmlFor="location"
              className="block text-sm font-medium text-slate-200"
            >
              Location
            </label>
            <input
              id="location"
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="City, State"
              className="w-full rounded-xl border border-slate-800 bg-slate-950/80 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
            />
            <p className="text-xs text-slate-500">
              Optional. Helps buyers find items near them.
            </p>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="zipCode"
              className="block text-sm font-medium text-slate-200"
            >
              Zip Code
            </label>
            <input
              id="zipCode"
              type="text"
              value={zipCode}
              onChange={(e) => setZipCode(e.target.value)}
              placeholder="12345"
              className="w-full rounded-xl border border-slate-800 bg-slate-950/80 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
            />
            <p className="text-xs text-slate-500">
              Optional. Provides accurate distance calculation.
            </p>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-200">
              Image URLs
            </label>
            <p className="text-xs text-slate-500">
              Add URLs to images of your item. Multiple images are supported.
            </p>
            {imageUrls.map((url, index) => (
              <div key={index} className="flex gap-2">
                <input
                  type="url"
                  value={url}
                  onChange={(e) => updateImageUrl(index, e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  className="flex-1 rounded-xl border border-slate-800 bg-slate-950/80 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                />
                {imageUrls.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeImageUrl(index)}
                    className="rounded-xl border border-red-700 bg-red-900/40 px-4 py-2 text-sm font-medium text-red-400 transition hover:border-red-600 hover:text-red-300"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addImageUrl}
              className="rounded-xl border border-slate-700 bg-slate-900/40 px-4 py-2 text-sm font-medium text-slate-300 transition hover:border-sky-500 hover:text-sky-400"
            >
              + Add Another Image
            </button>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="contactInfo"
              className="block text-sm font-medium text-slate-200"
            >
              Contact Information
            </label>
            <textarea
              id="contactInfo"
              value={contactInfo}
              onChange={(e) => setContactInfo(e.target.value)}
              placeholder="How should interested buyers contact you? (email, phone, etc.)"
              rows={3}
              className="w-full rounded-xl border border-slate-800 bg-slate-950/80 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
            />
            <p className="text-xs text-slate-500">
              Optional. Payment is handled off-site. You can provide an email, phone number, or other contact method.
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 rounded-xl bg-sky-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? "Creating..." : "Create Listing"}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded-xl border border-slate-700 bg-slate-900/40 px-4 py-3 text-sm font-medium text-slate-300 transition hover:border-sky-500 hover:text-sky-400"
          >
            Cancel
          </button>
        </div>
      </form>
    </section>
  );
}
