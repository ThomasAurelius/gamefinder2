"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { GAME_OPTIONS } from "@/lib/constants";

type MarketplaceListing = {
  id: string;
  userId: string;
  title: string;
  description: string;
  gameSystem?: string;
  tags: string[];
  price?: number;
  condition?: string;
  location?: string;
  zipCode?: string;
  imageUrls?: string[];
  listingType: "sell" | "want";
  contactInfo?: string;
  status: string;
};

export default function EditMarketplaceListingPage() {
  const params = useParams();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
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
  const [status, setStatus] = useState<"active" | "sold" | "closed">("active");

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

  useEffect(() => {
    const fetchListing = async () => {
      try {
        const response = await fetch(`/api/marketplace/${params.id}`);
        if (!response.ok) {
          throw new Error("Failed to fetch listing");
        }
        const data: MarketplaceListing = await response.json();

        // Populate form fields
        setListingType(data.listingType);
        setTitle(data.title);
        setDescription(data.description);
        setTags(data.tags || []);
        setPrice(data.price !== undefined ? data.price.toString() : "");
        setCondition(data.condition || "");
        setLocation(data.location || "");
        setZipCode(data.zipCode || "");
        setImageUrls(data.imageUrls && data.imageUrls.length > 0 ? data.imageUrls : [""]);
        setContactInfo(data.contactInfo || "");
        setStatus(data.status as "active" | "sold" | "closed");

        // Handle game system
        if (data.gameSystem) {
          if (GAME_OPTIONS.includes(data.gameSystem)) {
            setSelectedGameSystem(data.gameSystem);
          } else {
            setSelectedGameSystem("Other");
            setCustomGameSystem(data.gameSystem);
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch listing");
      } finally {
        setIsLoading(false);
      }
    };

    if (params.id) {
      fetchListing();
    }
  }, [params.id]);

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
        status: "active" | "sold" | "closed";
      } = {
        title: title.trim(),
        description: description.trim(),
        tags,
        location,
        zipCode,
        listingType,
        status,
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

      const response = await fetch(`/api/marketplace/${params.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update listing");
      }

      const data = await response.json();
      router.push(`/marketplace/${data.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update listing");
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="py-12 text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-sky-600 border-r-transparent"></div>
        <p className="mt-4 text-sm text-slate-400">Loading listing...</p>
      </div>
    );
  }

  return (
    <section className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-100">
          Edit Marketplace Listing
        </h1>
        <p className="mt-2 text-sm text-slate-400">
          Update your listing details.
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
            <label className="block text-sm font-medium text-slate-200">
              Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as "active" | "sold" | "closed")}
              className="w-full rounded-xl border border-slate-800 bg-slate-950/80 px-4 py-3 text-sm text-slate-100 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
            >
              <option value="active">Active</option>
              <option value="sold">Sold</option>
              <option value="closed">Closed</option>
            </select>
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
          </div>

          {selectedGameSystem === "Other" && (
            <div className="space-y-2">
              <label
                htmlFor="custom-game-system"
                className="block text-sm font-medium text-slate-200"
              >
                Custom Game System
              </label>
              <input
                id="custom-game-system"
                type="text"
                value={customGameSystem}
                onChange={(e) => setCustomGameSystem(e.target.value)}
                placeholder="Enter game system name"
                className="w-full rounded-xl border border-slate-800 bg-slate-950/80 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
              />
            </div>
          )}

          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-200">
              Tags
            </label>
            <div className="flex flex-wrap gap-2">
              {COMMON_TAGS.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                    tags.includes(tag)
                      ? "bg-sky-600 text-white"
                      : "border border-slate-700 bg-slate-950/40 text-slate-400 hover:border-slate-500"
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
                onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addCustomTag())}
                className="flex-1 rounded-xl border border-slate-800 bg-slate-950/80 px-4 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
              />
              <button
                type="button"
                onClick={addCustomTag}
                className="rounded-xl border border-sky-600 bg-sky-600/10 px-4 py-2 text-sm font-medium text-sky-400 transition hover:bg-sky-600/20"
              >
                Add Tag
              </button>
            </div>
            {tags.filter((tag) => !COMMON_TAGS.includes(tag)).length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tags
                  .filter((tag) => !COMMON_TAGS.includes(tag))
                  .map((tag) => (
                    <span
                      key={tag}
                      className="flex items-center gap-1 rounded-full bg-sky-600 px-3 py-1 text-xs font-medium text-white"
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

          {listingType === "sell" && (
            <>
              <div className="space-y-2">
                <label
                  htmlFor="price"
                  className="block text-sm font-medium text-slate-200"
                >
                  Price (USD)
                </label>
                <input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="0.00"
                  className="w-full rounded-xl border border-slate-800 bg-slate-950/80 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                />
              </div>

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
                      {cond.charAt(0).toUpperCase() +
                        cond.slice(1).replace("-", " ")}
                    </option>
                  ))}
                </select>
              </div>
            </>
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
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-200">
              Image URLs
            </label>
            <p className="text-xs text-slate-500">
              Provide URLs to images hosted elsewhere
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
                    className="rounded-xl border border-red-600 bg-red-600/10 px-4 py-2 text-sm font-medium text-red-400 transition hover:bg-red-600/20"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addImageUrl}
              className="rounded-xl border border-sky-600 bg-sky-600/10 px-4 py-2 text-sm font-medium text-sky-400 transition hover:bg-sky-600/20"
            >
              Add Another Image
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
              placeholder="Email, phone, or other contact details..."
              rows={3}
              className="w-full rounded-xl border border-slate-800 bg-slate-950/80 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
            />
            <p className="text-xs text-slate-500">
              Payment is handled off-site
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 rounded-xl bg-sky-600 px-6 py-3 text-sm font-medium text-white transition hover:bg-sky-700 disabled:opacity-50"
          >
            {isSubmitting ? "Updating..." : "Update Listing"}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded-xl border border-slate-700 bg-slate-900/40 px-6 py-3 text-sm font-medium text-slate-300 transition hover:bg-slate-900/60"
          >
            Cancel
          </button>
        </div>
      </form>
    </section>
  );
}
