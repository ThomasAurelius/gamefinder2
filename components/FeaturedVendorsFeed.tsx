"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { VendorResponse } from "@/lib/vendor-types";

export default function FeaturedVendorsFeed() {
	const [vendors, setVendors] = useState<VendorResponse[]>([]);
	const [loading, setLoading] = useState(true);
	const [isNearbyVendors, setIsNearbyVendors] = useState(false);

	useEffect(() => {
		const fetchVendors = async () => {
			try {
				// First try to get nearby vendors
				const nearbyResponse = await fetch("/api/vendors?nearMe=true");
				if (nearbyResponse.ok) {
					const nearbyData = await nearbyResponse.json();
					const nearbyVendors = nearbyData.vendors || [];

					// If we have nearby vendors, use them
					if (nearbyVendors.length > 0) {
						setVendors(nearbyVendors);
						setIsNearbyVendors(true);
						return;
					}
				}

				// Fall back to all approved vendors if no nearby vendors found
				const allResponse = await fetch("/api/vendors");
				if (allResponse.ok) {
					const allData = await allResponse.json();
					setVendors(allData.vendors || []);
					setIsNearbyVendors(false);
				}
			} catch (error) {
				console.error("Failed to fetch vendors", error);
			} finally {
				setLoading(false);
			}
		};

		fetchVendors();
	}, []);

	if (loading) {
		return (
			<aside className="hidden 3xl:block w-64 ml-8 space-y-4">
				<div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4 shadow-lg">
					<div className="text-sm text-slate-400">Loading venues...</div>
				</div>
			</aside>
		);
	}

	if (vendors.length === 0) {
		return null;
	}

	// Sort all vendors by distance (if available), keeping featured status for styling
	const sortedVendors = [...vendors].sort((a, b) => {
		// If we have distance data, sort by distance first
		if (a.distance !== undefined && b.distance !== undefined) {
			return a.distance - b.distance;
		}
		// Otherwise, maintain the original order (which sorts featured first, then by name)
		return 0;
	});

	return (
		<aside className="hidden 3xl:block w-64 ml-8 space-y-4 sticky top-4 self-start max-h-[calc(100vh-2rem)] overflow-y-auto">
			<div className="space-y-3">
				<h2 className="text-lg font-semibold text-slate-300 px-2">
					{isNearbyVendors ? "Nearby Venues" : "All Venues"}
				</h2>
				{sortedVendors.map((vendor) => (
					<VendorCard
						key={vendor.id}
						vendor={vendor}
						isFeatured={vendor.isFeatured}
					/>
				))}
			</div>
		</aside>
	);
}

function VendorCard({
	vendor,
	isFeatured,
}: {
	vendor: VendorResponse;
	isFeatured: boolean;
}) {
	const cardClasses = isFeatured
		? "rounded-2xl border-2 border-amber-500/50 bg-gradient-to-br from-amber-600/20 via-purple-600/20 to-indigo-600/20 p-4 shadow-xl transition hover:border-amber-500/70"
		: "rounded-2xl border border-slate-800 bg-slate-950/70 p-4 shadow-lg transition hover:border-slate-700";

	// Image styling: 1:1 aspect ratio, full width for featured, half width centered for non-featured
	const imageWrapperClasses = isFeatured
		? "w-full mb-3"
		: "w-1/2 mx-auto mb-3";

	const imageClasses = "w-full aspect-square object-cover rounded-lg";

	return (
		<Link href={`/vendor/${vendor.id}`} className="block">
			<div className={cardClasses}>
				{isFeatured && (
					<span className="inline-block rounded-full bg-amber-500/80 px-3 py-1 text-xs font-semibold text-amber-900 mb-3">
						Featured Venue
					</span>
				)}
				{vendor.primaryImage && (
					<div className={imageWrapperClasses}>
						<img
							src={vendor.primaryImage}
							alt={vendor.vendorName}
							className={imageClasses}
						/>
					</div>
				)}
				<h3 className="font-semibold text-slate-100 mb-1">
					{vendor.vendorName}
				</h3>
				<p className="text-xs text-slate-400 mb-2 line-clamp-2">
					{vendor.description}
				</p>
				<div className="flex items-center justify-between text-xs">
					<span className="text-slate-500">
						{vendor.city}, {vendor.state}
					</span>
					{vendor.distance !== undefined && (
						<span className="text-slate-500 ml-auto">
							{vendor.distance.toFixed(1)} mi
						</span>
					)}
				</div>
			</div>
		</Link>
	);
}
