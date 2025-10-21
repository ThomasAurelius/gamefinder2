"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { VendorResponse } from "@/lib/vendor-types";

export default function FeaturedVendorsFeed() {
	const [vendors, setVendors] = useState<VendorResponse[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchVendors = async () => {
			try {
				const response = await fetch("/api/vendors?nearMe=true");
				if (response.ok) {
					const data = await response.json();
					setVendors(data.vendors || []);
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
			<aside className="hidden 3xl:block w-80 ml-8 space-y-4">
				<div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4 shadow-lg">
					<div className="text-sm text-slate-400">Loading venues...</div>
				</div>
			</aside>
		);
	}

	if (vendors.length === 0) {
		return null;
	}

	// Split vendors into featured and non-featured
	const featuredVendors = vendors.filter((v) => v.isFeatured);
	const regularVendors = vendors.filter((v) => !v.isFeatured);

	return (
		<aside className="hidden 3xl:block w-80 ml-8 space-y-4 sticky top-4 self-start max-h-[calc(100vh-2rem)] overflow-y-auto">
			{featuredVendors.length > 0 && (
				<div className="space-y-3">
					<h2 className="text-lg font-semibold text-amber-400 px-2">
						Featured Venues
					</h2>
					{featuredVendors.map((vendor) => (
						<VendorCard key={vendor.id} vendor={vendor} isFeatured />
					))}
				</div>
			)}

			{regularVendors.length > 0 && (
				<div className="space-y-3">
					<h2 className="text-lg font-semibold text-slate-300 px-2">
						Nearby Venues
					</h2>
					{regularVendors.map((vendor) => (
						<VendorCard key={vendor.id} vendor={vendor} isFeatured={false} />
					))}
				</div>
			)}
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

	return (
		<Link href={`/vendor/${vendor.id}`} className="block">
			<div className={cardClasses}>
				{vendor.primaryImage && (
					<img
						src={vendor.primaryImage}
						alt={vendor.vendorName}
						className="w-full h-32 object-cover rounded-lg mb-3"
					/>
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
						<span className="text-slate-500">
							{vendor.distance.toFixed(1)} mi
						</span>
					)}
				</div>
			</div>
		</Link>
	);
}
