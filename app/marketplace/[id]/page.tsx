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
  const [isAdmin, setIsAdmin] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  useEffect(() => {
    const fetchListing = async () => {
      try {
        const response = await fetch(`/api/marketplace/${params.id}`);
        if (!response.ok) {
          throw new Error("Failed to fetch listing");
        }
        const data = await response.json();
        setListing(data);

        // Fetch current user ID and admin status
        const userResponse = await fetch("/api/user/me");
        if (userResponse.ok) {
          const userData = await userResponse.json();
          setCurrentUserId(userData.userId);
          setIsAdmin(userData.isAdmin || false);
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

  const handleDeleteClick = () => {
    setDeleteError("");
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    setIsDeleting(true);
    setDeleteError("");
    try {
      const response = await fetch(`/api/marketplace/${params.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete listing");
      }

      // Redirect to marketplace page after successful deletion
      router.push("/marketplace");
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : "Failed to delete listing");
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteConfirm(false);
    setDeleteError("");
  };

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
  const canEdit = currentUserId && (currentUserId === listing.userId || isAdmin);

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

      {/* Edit and Delete buttons */}
      {canEdit && (
        <div className="flex gap-3">
          <Link
            href={`/marketplace/${params.id}/edit`}
            className="inline-flex items-center gap-2 rounded-xl border border-sky-600 bg-sky-600/10 px-4 py-2 text-sm font-medium text-sky-400 transition hover:bg-sky-600/20"
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
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
            Edit Listing
          </Link>
          <button
            onClick={handleDeleteClick}
            disabled={isDeleting}
            className="inline-flex items-center gap-2 rounded-xl border border-red-600 bg-red-600/10 px-4 py-2 text-sm font-medium text-red-400 transition hover:bg-red-600/20 disabled:opacity-50"
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
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
            {isDeleting ? "Deleting..." : "Delete Listing"}
          </button>
        </div>
      )}

      {/* Delete error message */}
      {deleteError && (
        <div className="rounded-xl border border-red-900/50 bg-red-950/30 p-4 text-sm text-red-400">
          {deleteError}
        </div>
      )}

      {/* Delete confirmation modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-slate-100">Delete Listing</h3>
            <p className="mt-2 text-sm text-slate-400">
              Are you sure you want to delete this listing? This action cannot be undone.
            </p>
            <div className="mt-6 flex gap-3">
              <button
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
                className="flex-1 rounded-xl bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700 disabled:opacity-50"
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
              <button
                onClick={handleDeleteCancel}
                disabled={isDeleting}
                className="flex-1 rounded-xl border border-slate-700 bg-slate-900/40 px-4 py-2 text-sm font-medium text-slate-300 transition hover:bg-slate-900/60 disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

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
