"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { VendorResponse } from "@/lib/vendor-types";

type AuthInfo = {
	userId: string;
	isAdmin: boolean;
};

export default function VenuesPage() {
	const [vendors, setVendors] = useState<VendorResponse[]>([]);
	const [loading, setLoading] = useState(true);
	const [auth, setAuth] = useState<AuthInfo | null>(null);

	useEffect(() => {
		const fetchAuth = async () => {
			try {
				const response = await fetch("/api/auth/me");
				if (response.ok) {
					const data = await response.json();
					setAuth({ userId: data.userId, isAdmin: data.isAdmin });
				} else {
					setAuth(null);
				}
			} catch (error) {
				console.error("Failed to fetch auth", error);
				setAuth(null);
			}
		};

		fetchAuth();
	}, []);

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
				<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
					<div>
						<h1 className="text-3xl font-semibold text-slate-100">Venues</h1>
						<p className="mt-2 text-sm text-slate-400">
							Explore gaming venues
						</p>
					</div>
					{auth?.isAdmin && (
						<Link
							href="/vendor?new=true"
							className="inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-sky-500 via-indigo-500 to-purple-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-slate-900/40 transition hover:from-sky-400 hover:via-indigo-400 hover:to-purple-400"
						>
							Add Venue
						</Link>
					)}
				</div>
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
										auth={auth}
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
										auth={auth}
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
	auth,
}: {
	vendor: VendorResponse;
	isFeatured: boolean;
	auth: AuthInfo | null;
}) {
	const cardClasses = isFeatured
		? "rounded-2xl border-2 border-amber-500/50 bg-gradient-to-br from-amber-600/20 via-purple-600/20 to-indigo-600/20 p-6 shadow-xl transition hover:border-amber-500/70 hover:shadow-2xl"
		: "rounded-2xl border border-slate-800 bg-slate-950/70 p-6 shadow-lg transition hover:border-slate-700 hover:shadow-xl";

	// Check if user can edit this vendor (is admin or is owner)
	const canEdit = auth && (auth.isAdmin || auth.userId === vendor.ownerUserId);

	return (
		<div className={cardClasses}>
			<Link href={`/vendor/${vendor.id}`} className="block">
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
					{vendor.distance !== undefined && vendor.distance !== null && (
						<span className="text-slate-500">
							{vendor.distance.toFixed(1)} mi
						</span>
					)}
				</div>
			</Link>
			{canEdit && (
				<div className="mt-4 pt-4 border-t border-slate-700">
					<Link
						href={`/vendor?edit=${vendor.id}`}
						className="inline-flex items-center justify-center w-full rounded-lg border border-sky-500 px-3 py-2 text-sm font-medium text-sky-300 transition hover:bg-sky-500/10"
					>
						Edit Venue
					</Link>
				</div>
			)}
		</div>
	);
}
