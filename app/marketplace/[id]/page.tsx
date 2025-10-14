"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import ShareButtons from "@/components/ShareButtons";

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
  createdAt: string;
  updatedAt: string;
  hostName?: string;
  hostAvatarUrl?: string;
};

export default function MarketplaceListingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [listing, setListing] = useState<MarketplaceListing | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    const fetchListing = async () => {
      try {
        const response = await fetch(`/api/marketplace/${params.id}`);
        if (!response.ok) {
          throw new Error("Failed to fetch listing");
        }
        const data = await response.json();
        setListing(data);

        // Fetch current user ID
        const userResponse = await fetch("/api/auth/user");
        if (userResponse.ok) {
          const userData = await userResponse.json();
          setCurrentUserId(userData.userId);
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

  if (isLoading) {
    return (
      <div className="py-12 text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-sky-600 border-r-transparent"></div>
        <p className="mt-4 text-sm text-slate-400">Loading listing...</p>
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="rounded-xl border border-red-900/50 bg-red-950/30 p-8 text-center">
        <p className="text-red-400">{error || "Listing not found"}</p>
        <Link
          href="/marketplace"
          className="mt-4 inline-block text-sky-400 hover:underline"
        >
          Back to marketplace
        </Link>
      </div>
    );
  }

  const images = listing.imageUrls && listing.imageUrls.length > 0 ? listing.imageUrls : [];
  const listingUrl = `${process.env.NEXT_PUBLIC_APP_URL || "https://thegatheringcall.com"}/marketplace/${params.id}`;
  const isOwner = currentUserId === listing.userId;

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-sm text-slate-400 transition hover:text-slate-200"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back
        </button>
        <div className="flex items-center gap-2">
          <span
            className={`rounded-full px-3 py-1 text-xs font-medium ${
              listing.listingType === "sell"
                ? "bg-green-600/20 text-green-400"
                : "bg-amber-600/20 text-amber-400"
            }`}
          >
            {listing.listingType === "sell" ? "For Sale" : "Want Ad"}
          </span>
        </div>
      </div>

      {/* Share buttons */}
      <div className="mt-4">
        <ShareButtons 
          url={listingUrl}
          title={listing.title}
          description={`${listing.description.substring(0, 100)}${listing.description.length > 100 ? "..." : ""}`}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Images */}
        <div className="space-y-4">
          {images.length > 0 ? (
            <>
              <div className="aspect-video w-full overflow-hidden rounded-xl border border-slate-800 bg-slate-950">
                <img
                  src={images[currentImageIndex]}
                  alt={listing.title}
                  className="h-full w-full object-contain"
                />
              </div>
              {images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto">
                  {images.map((url, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`aspect-video w-24 shrink-0 overflow-hidden rounded-lg border-2 transition ${
                        currentImageIndex === index
                          ? "border-sky-500"
                          : "border-slate-800 hover:border-slate-600"
                      }`}
                    >
                      <img
                        src={url}
                        alt={`${listing.title} ${index + 1}`}
                        className="h-full w-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="flex aspect-video w-full items-center justify-center rounded-xl border border-slate-800 bg-slate-950">
              <svg
                className="h-24 w-24 text-slate-700"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
          )}
        </div>

        {/* Details */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-100">{listing.title}</h1>
            {listing.price !== undefined && (
              <p className="mt-2 text-2xl font-semibold text-sky-400">
                ${listing.price.toFixed(2)}
              </p>
            )}
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900/20 p-4 space-y-3">
            {listing.gameSystem && (
              <div>
                <p className="text-xs text-slate-500">Game System</p>
                <p className="text-sm text-slate-200">{listing.gameSystem}</p>
              </div>
            )}

            {listing.condition && (
              <div>
                <p className="text-xs text-slate-500">Condition</p>
                <p className="text-sm text-slate-200">
                  {listing.condition.charAt(0).toUpperCase() + 
                   listing.condition.slice(1).replace("-", " ")}
                </p>
              </div>
            )}

            {listing.location && (
              <div>
                <p className="text-xs text-slate-500">Location</p>
                <p className="text-sm text-slate-200">{listing.location}</p>
              </div>
            )}

            {listing.tags.length > 0 && (
              <div>
                <p className="text-xs text-slate-500 mb-2">Tags</p>
                <div className="flex flex-wrap gap-2">
                  {listing.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-slate-700 bg-slate-950/40 px-2 py-1 text-xs text-slate-400"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900/20 p-4">
            <h2 className="text-sm font-medium text-slate-200 mb-2">Description</h2>
            <p className="text-sm text-slate-300 whitespace-pre-wrap">
              {listing.description}
            </p>
          </div>

          {listing.contactInfo && (
            <div className="rounded-xl border border-sky-900/50 bg-sky-950/20 p-4">
              <h2 className="text-sm font-medium text-sky-200 mb-2">Contact Information</h2>
              <p className="text-sm text-slate-300 whitespace-pre-wrap">
                {listing.contactInfo}
              </p>
              <p className="mt-2 text-xs text-slate-500">
                Payment is handled off-site. Please contact the seller directly.
              </p>
            </div>
          )}

          <div className="rounded-xl border border-slate-800 bg-slate-900/20 p-4">
            <h2 className="text-sm font-medium text-slate-200 mb-3">
              Listed by
            </h2>
            <div className="flex items-center gap-3">
              {listing.hostAvatarUrl ? (
                <img
                  src={listing.hostAvatarUrl}
                  alt={listing.hostName}
                  className="h-10 w-10 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-800 text-sm font-semibold text-slate-300">
                  {listing.hostName?.charAt(0).toUpperCase() || "?"}
                </div>
              )}
              <div>
                <p className="text-sm font-medium text-slate-200">
                  {listing.hostName}
                </p>
                <p className="text-xs text-slate-500">
                  Listed {new Date(listing.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
