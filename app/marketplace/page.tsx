"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

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
	bggGameId?: string;
	externalLink?: string;
};

export default function MarketplacePage() {
	const [listings, setListings] = useState<MarketplaceListing[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [hasSearched, setHasSearched] = useState(false);
	const [isSearchFormOpen, setIsSearchFormOpen] = useState(true);
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

			if (searchQuery) {
				params.append("q", searchQuery);
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
		setSearchQuery("");
	};

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
					Browse games for sale from BoardGameGeek&apos;s marketplace.
				</p>
				<div className="mt-2 flex items-center gap-2">
					<div className="bg-white/50 p-0.5 rounded-md">
						<img
							src="/powered_by_BGG_02_MED.png"
							alt="Powered by BoardGameGeek"
							className="h-[50px] w-[200px]"
							title="Powered by BoardGameGeek"
						/>
					</div>
				</div>
			</div>

			<div className="rounded-xl border-2 border-amber-500/50 bg-gradient-to-br from-amber-600/20 via-purple-600/20 to-indigo-600/20">
				<button
					type="button"
					onClick={() => setIsSearchFormOpen(!isSearchFormOpen)}
					className="flex w-full items-center justify-between p-6 bg-gradient-to-br from-amber-600/10 via-purple-600/10 to-indigo-600/10 transition hover:from-amber-600/20 hover:via-purple-600/20 hover:to-indigo-600/20 rounded-t-xl"
				>
					<span className="text-base font-medium text-amber-100">
						{isSearchFormOpen
							? "Hide search filters"
							: "Show search filters"}
					</span>
					<span className="text-xs uppercase tracking-wide text-amber-400">
						{isSearchFormOpen ? "Collapse" : "Expand"}
					</span>
				</button>
				{isSearchFormOpen && (
					<div className="space-y-4 border-t border-slate-800 p-6">
						<p className="text-xs text-slate-400">
							Search for board games in the BoardGameGeek marketplace.
						</p>

						<div className="space-y-2">
							<label
								htmlFor="search-query"
								className="block text-sm font-medium text-slate-200"
							>
								Search Title or Description
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

						<div className="flex gap-3">
							<button
								type="button"
								onClick={handleSearch}
								className="flex-1 rounded-xl bg-gradient-to-r from-amber-500 via-purple-500 to-indigo-500 px-4 py-3 text-sm font-semibold text-white transition hover:from-amber-400 hover:via-purple-400 hover:to-indigo-400"
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
					<p className="mt-4 text-sm text-slate-400">
						Loading listings...
					</p>
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
							<a
								href={
									listing.externalLink ||
									`https://boardgamegeek.com/market/product/${listing.id}`
								}
								target="_blank"
								rel="noopener noreferrer"
								className="block"
							>
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
											{listing.listingType === "sell"
												? "For Sale"
												: "Want Ad"}
										</span>
									</div>

									<p className="mb-3 text-sm text-slate-400 line-clamp-2">
										{listing.description}
									</p>

									{listing.price !== undefined &&
										listing.price > 0 && (
											<p className="mb-2 text-lg font-semibold text-sky-400">
												${listing.price.toFixed(2)}
											</p>
										)}

									{(!listing.price || listing.price === 0) && (
										<p className="mb-2 text-sm text-slate-400">
											Click to view available listings and prices
										</p>
									)}
									{listing.price !== undefined && (
										<p className="mb-2 text-lg font-semibold text-sky-400">
											${listing.price.toFixed(2)}
										</p>
									)}

									{listing.condition && (
										<p className="mb-2 text-xs text-slate-500">
											Condition:{" "}
											{listing.condition.charAt(0).toUpperCase() +
												listing.condition
													.slice(1)
													.replace("-", " ")}
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
													{listing.hostName
														?.charAt(0)
														.toUpperCase() || "?"}
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
							</a>
						</div>
					))}
				</div>
			)}
		</section>
	);
}
