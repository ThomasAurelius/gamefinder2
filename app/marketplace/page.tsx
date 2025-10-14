"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { GAME_OPTIONS } from "@/lib/constants";
import CityAutocomplete from "@/components/CityAutocomplete";

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
  latitude?: number;
  longitude?: number;
  imageUrls?: string[];
  listingType: "sell" | "want";
  contactInfo?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  hostName?: string;
  hostAvatarUrl?: string;
  distance?: number;
};

const tagButtonClasses = (
  active: boolean,
  options?: { size?: "sm" | "md" }
) => {
  const sizeClasses =
    options?.size === "sm" ? "px-2 py-1 text-xs" : "px-3 py-1.5 text-sm";
  return `${sizeClasses} rounded-full transition ${
    active
      ? "bg-sky-600 text-white"
      : "border border-slate-700 bg-slate-900/40 text-slate-300 hover:border-sky-500 hover:text-sky-400"
  }`;
};

export default function MarketplacePage() {
  const [listings, setListings] = useState<MarketplaceListing[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [isSearchFormOpen, setIsSearchFormOpen] = useState(true);

  const [selectedGameSystem, setSelectedGameSystem] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedListingType, setSelectedListingType] = useState<"sell" | "want" | "">("");
  const [selectedCondition, setSelectedCondition] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [locationSearch, setLocationSearch] = useState("");
  const [radiusMiles, setRadiusMiles] = useState("50");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    // Load all listings on initial mount
    const loadInitialListings = async () => {
      setIsLoading(true);
      setHasSearched(true);

      try {
        const response = await fetch("/api/marketplace");
        if (!response.ok) {
          throw new Error("Failed to fetch listings");
        }

        const data = await response.json();
        setListings(data);
      } catch (error) {
        console.error("Failed to fetch listings", error);
        setListings([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialListings();
  }, []);

  const handleSearch = async () => {
    setIsLoading(true);
    setHasSearched(true);

    try {
      const params = new URLSearchParams();
      
      if (selectedGameSystem) {
        params.append("gameSystem", selectedGameSystem);
      }
      
      if (selectedTags.length > 0) {
        params.append("tags", selectedTags.join(","));
      }
      
      if (selectedListingType) {
        params.append("listingType", selectedListingType);
      }

      if (selectedCondition) {
        params.append("condition", selectedCondition);
      }

      if (minPrice) {
        params.append("minPrice", minPrice);
      }

      if (maxPrice) {
        params.append("maxPrice", maxPrice);
      }
      
      if (locationSearch) {
        params.append("location", locationSearch);
        params.append("radius", radiusMiles);
      }

      const response = await fetch(`/api/marketplace?${params}`);
      if (!response.ok) {
        throw new Error("Failed to fetch listings");
      }

      const data = await response.json();
      setListings(data);
    } catch (error) {
      console.error("Failed to search listings", error);
      setListings([]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearFilters = () => {
    setSelectedGameSystem("");
    setSelectedTags([]);
    setSelectedListingType("");
    setSelectedCondition("");
    setMinPrice("");
    setMaxPrice("");
    setLocationSearch("");
    setRadiusMiles("50");
    setSearchQuery("");
  };

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

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

  // Filter by search query (client-side)
  const filteredListings = listings.filter((listing) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      listing.title.toLowerCase().includes(query) ||
      listing.description.toLowerCase().includes(query) ||
      listing.tags.some((tag) => tag.toLowerCase().includes(query))
    );
  });

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-100">
          Game Marketplace
        </h1>
        <p className="mt-2 text-sm text-slate-400">
          Buy and sell games, accessories, and more. Post want ads for items you&apos;re looking for.
        </p>
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-900/20">
        <button
          type="button"
          onClick={() => setIsSearchFormOpen(!isSearchFormOpen)}
          className="flex w-full items-center justify-between p-6"
        >
          <span className="text-base font-medium text-slate-100">
            {isSearchFormOpen
              ? "Hide search filters"
              : "Show search filters"}
          </span>
          <span className="text-xs uppercase tracking-wide text-slate-400">
            {isSearchFormOpen ? "Collapse" : "Expand"}
          </span>
        </button>
        {isSearchFormOpen && (
          <div className="space-y-4 border-t border-slate-800 p-6">
            <p className="text-xs text-slate-400">
              Select any combination of filters to search. All filters
              are optional.
            </p>

            <div className="space-y-2">
              <label
                htmlFor="search-query"
                className="block text-sm font-medium text-slate-200"
              >
                Search Title, Description, or Tags
              </label>
              <input
                id="search-query"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search..."
                className="w-full rounded-xl border border-slate-800 bg-slate-950/80 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="listing-type"
                className="block text-sm font-medium text-slate-200"
              >
                Listing Type
              </label>
              <select
                id="listing-type"
                value={selectedListingType}
                onChange={(e) => setSelectedListingType(e.target.value as "sell" | "want" | "")}
                className="w-full rounded-xl border border-slate-800 bg-slate-950/80 px-4 py-3 text-sm text-slate-100 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
              >
                <option value="">All Listings</option>
                <option value="sell">For Sale</option>
                <option value="want">Want Ads</option>
              </select>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="game-system-select"
                className="block text-sm font-medium text-slate-200"
              >
                Game System
              </label>
              <select
                id="game-system-select"
                value={selectedGameSystem}
                onChange={(e) => setSelectedGameSystem(e.target.value)}
                className="w-full rounded-xl border border-slate-800 bg-slate-950/80 px-4 py-3 text-sm text-slate-100 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
              >
                <option value="">All Game Systems</option>
                {GAME_OPTIONS.map((game) => (
                  <option key={game} value={game}>
                    {game}
                  </option>
                ))}
              </select>
            </div>

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
                    className={tagButtonClasses(selectedTags.includes(tag))}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {selectedListingType !== "want" && (
              <div className="space-y-2">
                <label
                  htmlFor="condition-select"
                  className="block text-sm font-medium text-slate-200"
                >
                  Condition
                </label>
                <select
                  id="condition-select"
                  value={selectedCondition}
                  onChange={(e) => setSelectedCondition(e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950/80 px-4 py-3 text-sm text-slate-100 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                >
                  <option value="">All Conditions</option>
                  {CONDITIONS.map((cond) => (
                    <option key={cond} value={cond}>
                      {cond.charAt(0).toUpperCase() + cond.slice(1).replace("-", " ")}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label
                  htmlFor="min-price"
                  className="block text-sm font-medium text-slate-200"
                >
                  Min Price ($)
                </label>
                <input
                  id="min-price"
                  type="number"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  placeholder="0"
                  min="0"
                  className="w-full rounded-xl border border-slate-800 bg-slate-950/80 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                />
              </div>
              <div className="space-y-2">
                <label
                  htmlFor="max-price"
                  className="block text-sm font-medium text-slate-200"
                >
                  Max Price ($)
                </label>
                <input
                  id="max-price"
                  type="number"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  placeholder="No limit"
                  min="0"
                  className="w-full rounded-xl border border-slate-800 bg-slate-950/80 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="location-search"
                className="block text-sm font-medium text-slate-200"
              >
                Location or Zip Code
              </label>
              <CityAutocomplete
                id="location-search"
                value={locationSearch}
                onChange={setLocationSearch}
                placeholder="Search for a city or enter zip code..."
                className="w-full rounded-xl border border-slate-800 bg-slate-950/80 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
              />
              {locationSearch && (
                <div className="space-y-2">
                  <label
                    htmlFor="radius-select"
                    className="block text-sm font-medium text-slate-200"
                  >
                    Search Radius
                  </label>
                  <select
                    id="radius-select"
                    value={radiusMiles}
                    onChange={(e) => setRadiusMiles(e.target.value)}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950/80 px-4 py-3 text-sm text-slate-100 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                  >
                    <option value="10">10 miles</option>
                    <option value="25">25 miles</option>
                    <option value="50">50 miles</option>
                    <option value="100">100 miles</option>
                    <option value="250">250 miles</option>
                  </select>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleSearch}
                className="flex-1 rounded-xl bg-sky-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-sky-700"
              >
                Search Listings
              </button>
              <button
                type="button"
                onClick={clearFilters}
                className="rounded-xl border border-slate-700 bg-slate-900/40 px-4 py-3 text-sm font-medium text-slate-300 transition hover:border-sky-500 hover:text-sky-400"
              >
                Clear
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-3">
          <Link
            href="/marketplace/post"
            className="inline-flex items-center gap-2 rounded-xl bg-sky-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-sky-700"
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
                d="M12 4v16m8-8H4"
              />
            </svg>
            Post Listing
          </Link>
        </div>
        <p className="text-sm text-slate-400">
          {hasSearched && !isLoading && (
            <>
              Found {filteredListings.length} listing
              {filteredListings.length !== 1 ? "s" : ""}
            </>
          )}
        </p>
      </div>

      {isLoading && (
        <div className="py-12 text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-sky-600 border-r-transparent"></div>
          <p className="mt-4 text-sm text-slate-400">Loading listings...</p>
        </div>
      )}

      {!isLoading && hasSearched && filteredListings.length === 0 && (
        <div className="rounded-xl border border-slate-800 bg-slate-900/20 p-8 text-center">
          <p className="text-slate-400">
            No listings found. Try adjusting your search filters or{" "}
            <Link
              href="/marketplace/post"
              className="text-sky-400 hover:underline"
            >
              post a new listing
            </Link>
            .
          </p>
        </div>
      )}

      {!isLoading && filteredListings.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredListings.map((listing) => (
            <div
              key={listing.id}
              className="group relative overflow-hidden rounded-xl border border-slate-800 bg-slate-900/40 transition hover:border-sky-500"
            >
              <Link href={`/marketplace/${listing.id}`} className="block">
                {listing.imageUrls && listing.imageUrls.length > 0 ? (
                  <div className="aspect-video w-full overflow-hidden">
                    <img
                      src={listing.imageUrls[0]}
                      alt={listing.title}
                      className="h-full w-full object-cover transition group-hover:scale-105"
                    />
                  </div>
                ) : (
                  <div className="flex aspect-video w-full items-center justify-center bg-slate-950/80">
                    <svg
                      className="h-16 w-16 text-slate-700"
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

                <div className="p-4">
                  <div className="mb-2 flex items-start justify-between gap-2">
                    <h3 className="font-medium text-slate-100 line-clamp-1">
                      {listing.title}
                    </h3>
                    <span
                      className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
                        listing.listingType === "sell"
                          ? "bg-green-600/20 text-green-400"
                          : "bg-amber-600/20 text-amber-400"
                      }`}
                    >
                      {listing.listingType === "sell" ? "For Sale" : "Want Ad"}
                    </span>
                  </div>

                  <p className="mb-3 text-sm text-slate-400 line-clamp-2">
                    {listing.description}
                  </p>

                  {listing.price !== undefined && (
                    <p className="mb-2 text-lg font-semibold text-sky-400">
                      ${listing.price.toFixed(2)}
                    </p>
                  )}

                  {listing.condition && (
                    <p className="mb-2 text-xs text-slate-500">
                      Condition: {listing.condition.charAt(0).toUpperCase() + listing.condition.slice(1).replace("-", " ")}
                    </p>
                  )}

                  {listing.tags.length > 0 && (
                    <div className="mb-3 flex flex-wrap gap-1">
                      {listing.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full border border-slate-700 bg-slate-950/40 px-2 py-0.5 text-xs text-slate-400"
                        >
                          {tag}
                        </span>
                      ))}
                      {listing.tags.length > 3 && (
                        <span className="rounded-full border border-slate-700 bg-slate-950/40 px-2 py-0.5 text-xs text-slate-400">
                          +{listing.tags.length - 3}
                        </span>
                      )}
                    </div>
                  )}

                  <div className="flex items-center justify-between border-t border-slate-800 pt-3">
                    <div className="flex items-center gap-2">
                      {listing.hostAvatarUrl ? (
                        <img
                          src={listing.hostAvatarUrl}
                          alt={listing.hostName}
                          className="h-6 w-6 rounded-full object-cover"
                        />
                      ) : (
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-800 text-xs font-semibold text-slate-300">
                          {listing.hostName?.charAt(0).toUpperCase() || "?"}
                        </div>
                      )}
                      <span className="text-xs text-slate-400">
                        {listing.hostName}
                      </span>
                    </div>

                    {listing.distance !== undefined && (
                      <span className="text-xs text-slate-500">
                        {listing.distance.toFixed(1)} mi
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
