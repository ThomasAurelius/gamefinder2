"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { VendorResponse } from "@/lib/vendor-types";

export default function VenuesPage() {
	const [vendors, setVendors] = useState<VendorResponse[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchVendors = async () => {
			try {
				// Fetch all approved vendors
				const allResponse = await fetch("/api/vendors");
				if (allResponse.ok) {
					const allData = await allResponse.json();
					setVendors(allData.vendors || []);
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
			<main className="space-y-6">
				<header className="rounded-2xl border border-slate-800 bg-slate-950/70 p-6 shadow-lg">
					<h1 className="text-3xl font-semibold text-slate-100">Venues</h1>
					<p className="mt-2 text-sm text-slate-400">Loading venues...</p>
				</header>
			</main>
		);
	}

	// Split vendors into featured and non-featured
	const featuredVendors = vendors.filter((v) => v.isFeatured);
	const regularVendors = vendors.filter((v) => !v.isFeatured);

	return (
		<main className="space-y-6">
			<header className="rounded-2xl border border-slate-800 bg-slate-950/70 p-6 shadow-lg">
				<h1 className="text-3xl font-semibold text-slate-100">Venues</h1>
				<p className="mt-2 text-sm text-slate-400">
					Explore gaming venues
				</p>
			</header>

			{vendors.length === 0 ? (
				<div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-6 text-center">
					<p className="text-slate-400">No venues found</p>
				</div>
			) : (
				<>
					{featuredVendors.length > 0 && (
						<section className="space-y-4">
							<h2 className="text-2xl font-semibold text-amber-400">
								Featured Venues
							</h2>
							<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
								{featuredVendors.map((vendor) => (
									<VendorCard
										key={vendor.id}
										vendor={vendor}
										isFeatured
									/>
								))}
							</div>
						</section>
					)}

					{regularVendors.length > 0 && (
						<section className="space-y-4">
							<h2 className="text-2xl font-semibold text-slate-300">
								All Venues
							</h2>
							<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
								{regularVendors.map((vendor) => (
									<VendorCard
										key={vendor.id}
										vendor={vendor}
										isFeatured={false}
									/>
								))}
							</div>
						</section>
					)}
				</>
			)}
		</main>
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
		? "rounded-2xl border-2 border-amber-500/50 bg-gradient-to-br from-amber-600/20 via-purple-600/20 to-indigo-600/20 p-6 shadow-xl transition hover:border-amber-500/70 hover:shadow-2xl"
		: "rounded-2xl border border-slate-800 bg-slate-950/70 p-6 shadow-lg transition hover:border-slate-700 hover:shadow-xl";

	return (
		<Link href={`/vendor/${vendor.id}`} className="block">
			<div className={cardClasses}>
				{isFeatured && (
					<span className="inline-block rounded-full bg-amber-500/80 px-3 py-1 text-xs font-semibold text-amber-900 mb-3">
						Featured Venue
					</span>
				)}
				{vendor.primaryImage && (
					<img
						src={vendor.primaryImage}
						alt={vendor.vendorName}
						className="w-full h-48 object-cover rounded-lg mb-4"
					/>
				)}
				<h3 className="text-xl font-semibold text-slate-100 mb-2">
					{vendor.vendorName}
				</h3>
				<p className="text-sm text-slate-400 mb-3 line-clamp-3">
					{vendor.description}
				</p>
				<div className="flex items-center justify-between text-sm">
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
