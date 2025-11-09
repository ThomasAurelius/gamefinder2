"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import CityAutocomplete from "@/components/CityAutocomplete";
import Advertisement from "@/components/Advertisement";
import PageLoadingFallback from "@/components/PageLoadingFallback";

type Vendor = {
	id: string;
	vendorName: string;
	description: string;
	address1: string;
	address2?: string;
	city: string;
	state: string;
	zip: string;
	phone?: string;
	website?: string;
	primaryImage: string;
	images: string[];
	latitude?: number;
	longitude?: number;
	distance?: number;
	isFeatured: boolean;
};

function VendorCard({ vendor }: { vendor: Vendor }) {
	return (
		<div className="rounded-lg border border-slate-800 bg-slate-950/40 overflow-hidden md:flex md:flex-wrap">
			{vendor.primaryImage && (
				<Link href={`/vendor/${vendor.id}`} className="md:w-1/2">
					<img
						src={vendor.primaryImage}
						alt={vendor.vendorName}
						className="w-full h-auto object-cover"
					/>
				</Link>
			)}
			<div className="p-4 md:w-1/2 md:flex-grow">
				<div className="flex items-center gap-2">
					<Link
						href={`/vendor/${vendor.id}`}
						className="hover:text-sky-300 transition-colors"
					>
						<h3 className="font-medium text-slate-100">
							{vendor.vendorName}
							{vendor.isFeatured && (
								<span className="ml-2 inline-flex items-center rounded-full border border-amber-400 bg-amber-500/20 px-2 py-0.5 text-xs text-amber-100">
									Featured
								</span>
							)}
						</h3>
					</Link>
				</div>
				<div className="mt-2 space-y-1 text-sm text-slate-400">
					<p>
						<span className="text-slate-500">Address:</span>{" "}
						{vendor.address1}
						{vendor.address2 && `, ${vendor.address2}`}
					</p>
					<p>
						<span className="text-slate-500">Location:</span>{" "}
						{vendor.city}, {vendor.state} {vendor.zip}
						{vendor.distance !== undefined && vendor.distance !== null && (
							<span className="ml-2 text-sky-400">
								({vendor.distance.toFixed(1)} mi away)
							</span>
						)}
					</p>
					{vendor.phone && (
						<p>
							<span className="text-slate-500">Phone:</span>{" "}
							<a
								href={`tel:${vendor.phone}`}
								className="text-slate-300 hover:text-sky-300 transition-colors"
							>
								{vendor.phone}
							</a>
						</p>
					)}
					{vendor.website && (
						<p>
							<span className="text-slate-500">Website:</span>{" "}
							<a
								href={vendor.website}
								target="_blank"
								rel="noopener noreferrer"
								className="text-slate-300 hover:text-sky-300 transition-colors"
							>
								Visit Website
							</a>
						</p>
					)}
					{vendor.description && (
						<p className="mt-2 text-slate-300">{vendor.description}</p>
					)}
				</div>
				<div className="flex gap-2 mt-4 flex-wrap">
					<Link
						href={`/vendor/${vendor.id}`}
						className="rounded-lg px-4 py-2 text-sm font-medium text-white transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-950 bg-slate-600 hover:bg-slate-700 focus:ring-slate-500"
					>
						Details
					</Link>
				</div>
			</div>
		</div>
	);
}

function FindVendorsPageContent() {
	const [vendors, setVendors] = useState<Vendor[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [hasSearched, setHasSearched] = useState(false);
	const [isSearchFormOpen, setIsSearchFormOpen] = useState(false);
	const [allVendors, setAllVendors] = useState<Vendor[]>([]);
	const [isLoadingVendors, setIsLoadingVendors] = useState(false);
	const [vendorNameSearch, setVendorNameSearch] = useState("");
	const [locationSearch, setLocationSearch] = useState("");
	const [radiusMiles, setRadiusMiles] = useState("25");
	const [zipCodeSearch, setZipCodeSearch] = useState("");

	useEffect(() => {
		const fetchInitialVendors = async () => {
			setIsLoadingVendors(true);
			try {
				// Fetch all vendors from the API
				const response = await fetch("/api/vendors");
				if (response.ok) {
					const data = await response.json();
					let vendorsList = data.vendors || [];

					// Try to get user's profile to get their zipcode
					try {
						const profileResponse = await fetch("/api/profile");
						if (profileResponse.ok) {
							const profile = await profileResponse.json();
							
							// If user has a zipcode and coordinates, calculate distances
							if (profile.latitude && profile.longitude) {
								vendorsList = vendorsList
									.map((vendor: Vendor) => {
										if (vendor.latitude && vendor.longitude) {
											const distance = calculateDistance(
												profile.latitude,
												profile.longitude,
												vendor.latitude,
												vendor.longitude
											);
											return { ...vendor, distance };
										}
										return vendor;
									})
									.sort((a: Vendor, b: Vendor) => {
										// Featured vendors first
										if (a.isFeatured !== b.isFeatured) {
											return a.isFeatured ? -1 : 1;
										}
										// Then by distance (if available)
										if (a.distance !== undefined && b.distance !== undefined) {
											return a.distance - b.distance;
										}
										// Vendors with distance come before those without
										if (a.distance !== undefined) return -1;
										if (b.distance !== undefined) return 1;
										// Finally alphabetically
										return a.vendorName.localeCompare(b.vendorName);
									});
							} else {
								// No user coordinates, just sort by featured and name
								vendorsList.sort((a: Vendor, b: Vendor) => {
									if (a.isFeatured !== b.isFeatured) {
										return a.isFeatured ? -1 : 1;
									}
									return a.vendorName.localeCompare(b.vendorName);
								});
							}
						}
					} catch (error) {
						console.error("Failed to fetch profile for distance calculation:", error);
					}

					setAllVendors(vendorsList);
				}
			} catch (error) {
				console.error("Failed to fetch vendors:", error);
			} finally {
				setIsLoadingVendors(false);
			}
		};

		fetchInitialVendors();
	}, []);

	const calculateDistance = (
		lat1: number,
		lon1: number,
		lat2: number,
		lon2: number
	): number => {
		const R = 3959; // Earth's radius in miles
		const dLat = ((lat2 - lat1) * Math.PI) / 180;
		const dLon = ((lon2 - lon1) * Math.PI) / 180;
		const a =
			Math.sin(dLat / 2) * Math.sin(dLat / 2) +
			Math.cos((lat1 * Math.PI) / 180) *
				Math.cos((lat2 * Math.PI) / 180) *
				Math.sin(dLon / 2) *
				Math.sin(dLon / 2);
		const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
		return R * c;
	};

	const handleSearch = async () => {
		setIsLoading(true);
		setHasSearched(true);

		try {
			// Start with all vendors
			let filteredVendors = [...allVendors];

			// Filter by vendor name
			if (vendorNameSearch.trim()) {
				const searchLower = vendorNameSearch.toLowerCase().trim();
				filteredVendors = filteredVendors.filter((vendor) =>
					vendor.vendorName.toLowerCase().includes(searchLower)
				);
			}

			// Filter by location/zipcode
			if (locationSearch.trim() || zipCodeSearch.trim()) {
				const searchLocation = locationSearch.trim() || zipCodeSearch.trim();
				
				// Try to geocode the search location
				try {
					const response = await fetch(
						`/api/geocode?location=${encodeURIComponent(searchLocation)}`
					);
					
					if (response.ok) {
						const data = await response.json();
						if (data.latitude && data.longitude) {
							const searchLat = data.latitude;
							const searchLon = data.longitude;
							const radius = parseFloat(radiusMiles);

							// Calculate distances and filter by radius
							filteredVendors = filteredVendors
								.map((vendor) => {
									if (vendor.latitude && vendor.longitude) {
										const distance = calculateDistance(
											searchLat,
											searchLon,
											vendor.latitude,
											vendor.longitude
										);
										return { ...vendor, distance };
									}
									return vendor;
								})
								.filter((vendor) => {
									// Only include vendors with coordinates within radius
									return vendor.distance !== undefined && vendor.distance <= radius;
								});

							// Sort by featured first, then distance
							filteredVendors.sort((a, b) => {
								if (a.isFeatured !== b.isFeatured) {
									return a.isFeatured ? -1 : 1;
								}
								if (a.distance !== undefined && b.distance !== undefined) {
									return a.distance - b.distance;
								}
								return 0;
							});
						}
					}
				} catch (error) {
					console.error("Failed to geocode location:", error);
				}
			}

			setVendors(filteredVendors);
		} catch (error) {
			console.error("Failed to search vendors", error);
			setVendors([]);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<section className="space-y-6">
			<div className="flex flex-col items-start gap-4 sm:flex-row sm:items-start sm:justify-between">
				<div>
					<h1 className="text-2xl font-semibold text-slate-100">
						Find Vendors
					</h1>
					<p className="mt-2 text-sm text-slate-400">
						Search for gaming venues and stores by name, location, or zipcode
					</p>
				</div>
			</div>

			<Advertisement />

			<div className="rounded-lg border-2 border-amber-500/50 bg-gradient-to-br from-amber-600/20 via-purple-600/20 to-indigo-600/20">
				<button
					type="button"
					onClick={() => setIsSearchFormOpen(!isSearchFormOpen)}
					className="flex w-full items-center justify-between gap-2 bg-gradient-to-br from-amber-600/10 via-purple-600/10 to-indigo-600/10 px-4 py-3 text-left text-sm font-semibold text-amber-100 transition hover:from-amber-600/20 hover:via-purple-600/20 hover:to-indigo-600/20"
				>
					<span>
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
							Select any combination of filters to search. All filters
							are optional.
						</p>
						<div className="space-y-2">
							<label
								htmlFor="vendor-name-search"
								className="block text-sm font-medium text-slate-200"
							>
								Vendor Name
							</label>
							<input
								id="vendor-name-search"
								type="text"
								value={vendorNameSearch}
								onChange={(e) => setVendorNameSearch(e.target.value)}
								placeholder="Search for a vendor by name..."
								className="w-full rounded-xl border border-slate-800 bg-slate-950/80 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
							/>
						</div>

						<div className="space-y-2">
							<label
								htmlFor="location-search"
								className="block text-sm font-medium text-slate-200"
							>
								Location or City
							</label>
							<CityAutocomplete
								id="location-search"
								value={locationSearch}
								onChange={setLocationSearch}
								placeholder="Search for a city..."
								className="w-full rounded-xl border border-slate-800 bg-slate-950/80 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
							/>
							<p className="text-xs text-slate-500">
								Find vendors near a specific city
							</p>
						</div>

						<div className="space-y-2">
							<label
								htmlFor="zipcode-search"
								className="block text-sm font-medium text-slate-200"
							>
								Zip Code
							</label>
							<input
								id="zipcode-search"
								type="text"
								value={zipCodeSearch}
								onChange={(e) => setZipCodeSearch(e.target.value)}
								placeholder="Enter zip code..."
								className="w-full rounded-xl border border-slate-800 bg-slate-950/80 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
							/>
							<p className="text-xs text-slate-500">
								Find vendors near a specific zip code
							</p>
						</div>

						{(locationSearch || zipCodeSearch) && (
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

						<button
							type="button"
							onClick={handleSearch}
							className="mt-4 w-full rounded-xl bg-gradient-to-r from-amber-600 via-purple-500 to-indigo-500 font-semibold text-white transition hover:from-amber-500 hover:via-purple-400 hover:to-indigo-400 disabled:cursor-not-allowed disabled:opacity-50 py-3 text-md"
							disabled={
								(!vendorNameSearch.trim() &&
									!locationSearch.trim() &&
									!zipCodeSearch.trim()) ||
								isLoading
							}
						>
							{isLoading ? "Searching..." : "Search Vendors"}
						</button>
					</div>
				)}
			</div>

			{hasSearched && (
				<div className="rounded-xl border border-slate-800/60 bg-slate-900/40 p-6">
					<h2 className="text-lg font-semibold text-slate-100">
						Search Results
					</h2>
					<p className="mt-2 text-sm text-slate-400">
						{vendorNameSearch.trim() ||
						locationSearch.trim() ||
						zipCodeSearch.trim() ? (
							<>
								Showing vendors
								{vendorNameSearch.trim() && (
									<>
										{" "}
										matching{" "}
										<span className="text-sky-400">
											"{vendorNameSearch}"
										</span>
									</>
								)}
								{(locationSearch.trim() || zipCodeSearch.trim()) && (
									<>
										{" "}
										near{" "}
										<span className="text-sky-400">
											{locationSearch.trim() || zipCodeSearch.trim()}
										</span>{" "}
										(within {radiusMiles} miles)
									</>
								)}
							</>
						) : (
							<>Showing all vendors</>
						)}
					</p>

					{isLoading ? (
						<p className="mt-4 text-sm text-slate-500">Loading...</p>
					) : vendors.length > 0 ? (
						<div className="mt-4 space-y-3 max-w-3xl mx-auto">
							{vendors.map((vendor) => (
								<VendorCard key={vendor.id} vendor={vendor} />
							))}
						</div>
					) : (
						<p className="mt-4 text-sm text-slate-500">
							No vendors found. Try adjusting your search criteria.
						</p>
					)}
				</div>
			)}

			{/* All Vendors Feed */}
			{!hasSearched && (
				<div className="rounded-xl border border-slate-800/60 bg-slate-900/40 p-6">
					<h2 className="text-lg font-semibold text-slate-100">
						All Vendors
					</h2>
					<p className="mt-2 text-sm text-slate-400">
						Browse all approved vendors, ordered by distance from your location
					</p>

					{isLoadingVendors ? (
						<p className="mt-4 text-sm text-slate-500">
							Loading vendors...
						</p>
					) : allVendors.length > 0 ? (
						<div className="mt-4 space-y-3 max-w-3xl mx-auto">
							{allVendors.map((vendor) => (
								<VendorCard key={vendor.id} vendor={vendor} />
							))}
						</div>
					) : (
						<p className="mt-4 text-sm text-slate-500">
							No vendors available.
						</p>
					)}
				</div>
			)}
		</section>
	);
}

export default function FindVendorsPage() {
	return (
		<Suspense fallback={<PageLoadingFallback />}>
			<FindVendorsPageContent />
		</Suspense>
	);
}
