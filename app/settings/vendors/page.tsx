"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import type { VendorResponse } from "@/lib/vendor-types";
import { getOpeningClosingTimes } from "@/lib/vendor-utils";

export default function VendorsAdminPage() {
	const [vendors, setVendors] = useState<VendorResponse[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [isAdmin, setIsAdmin] = useState(false);
	const [selectedVendor, setSelectedVendor] = useState<VendorResponse | null>(
		null
	);
	const [updating, setUpdating] = useState(false);
	const [message, setMessage] = useState<string | null>(null);
	const [ownerUserId, setOwnerUserId] = useState<string>("");

	useEffect(() => {
		const fetchData = async () => {
			try {
				// Check if user is admin
				const statusRes = await fetch("/api/admin/status");
				const statusData = await statusRes.json();

				if (!statusData.isAdmin) {
					setError("Admin access required");
					setLoading(false);
					return;
				}

				setIsAdmin(true);

				// Fetch all vendors (including unapproved)
				const vendorsRes = await fetch(
					"/api/vendors?includeUnapproved=true"
				);
				if (!vendorsRes.ok) {
					throw new Error("Failed to load vendors");
				}

				const vendorsData = await vendorsRes.json();
				setVendors(vendorsData.vendors || []);
			} catch (err) {
				console.error(err);
				setError(
					err instanceof Error ? err.message : "Failed to load vendors"
				);
			} finally {
				setLoading(false);
			}
		};

		fetchData();
	}, []);

	const handleApprovalChange = async (
		vendorId: string,
		isApproved: boolean
	) => {
		setUpdating(true);
		setMessage(null);

		try {
			const vendor = vendors.find((v) => v.id === vendorId);
			if (!vendor) {
				throw new Error("Vendor not found");
			}

			const response = await fetch(`/api/vendors/${vendorId}`, {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					...vendor,
					isApproved,
				}),
			});

			if (!response.ok) {
				throw new Error("Failed to update vendor");
			}

			const data = await response.json();
			const updatedVendor = data.vendor;

			// Update local state
			setVendors((prev) =>
				prev.map((v) => (v.id === vendorId ? updatedVendor : v))
			);

			if (selectedVendor?.id === vendorId) {
				setSelectedVendor(updatedVendor);
			}

			setMessage(
				`Vendor ${isApproved ? "approved" : "denied"} successfully`
			);
			setTimeout(() => setMessage(null), 3000);
		} catch (err) {
			console.error(err);
			setMessage(
				err instanceof Error ? err.message : "Failed to update vendor"
			);
		} finally {
			setUpdating(false);
		}
	};

	const handleFeatureChange = async (
		vendorId: string,
		isFeatured: boolean
	) => {
		setUpdating(true);
		setMessage(null);

		try {
			const vendor = vendors.find((v) => v.id === vendorId);
			if (!vendor) {
				throw new Error("Vendor not found");
			}

			const response = await fetch(`/api/vendors/${vendorId}`, {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					...vendor,
					isFeatured,
				}),
			});

			if (!response.ok) {
				throw new Error("Failed to update vendor");
			}

			const data = await response.json();
			const updatedVendor = data.vendor;

			// Update local state
			setVendors((prev) =>
				prev.map((v) => (v.id === vendorId ? updatedVendor : v))
			);

			if (selectedVendor?.id === vendorId) {
				setSelectedVendor(updatedVendor);
			}

			setMessage(
				`Vendor ${isFeatured ? "featured" : "unfeatured"} successfully`
			);
			setTimeout(() => setMessage(null), 3000);
		} catch (err) {
			console.error(err);
			setMessage(
				err instanceof Error ? err.message : "Failed to update vendor"
			);
		} finally {
			setUpdating(false);
		}
	};

	const handleOwnershipChange = async (vendorId: string, newOwnerUserId: string) => {
		setUpdating(true);
		setMessage(null);

		try {
			const response = await fetch(`/api/vendors/${vendorId}`, {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					ownerUserId: newOwnerUserId || undefined,
				}),
			});

			if (!response.ok) {
				throw new Error("Failed to update vendor ownership");
			}

			const data = await response.json();
			const updatedVendor = data.vendor;

			// Update local state
			setVendors((prev) =>
				prev.map((v) => (v.id === vendorId ? updatedVendor : v))
			);

			if (selectedVendor?.id === vendorId) {
				setSelectedVendor(updatedVendor);
			}

			setOwnerUserId("");
			setMessage("Vendor ownership updated successfully");
			setTimeout(() => setMessage(null), 3000);
		} catch (err) {
			console.error(err);
			setMessage(
				err instanceof Error ? err.message : "Failed to update vendor ownership"
			);
		} finally {
			setUpdating(false);
		}
	};

	if (loading) {
		return (
			<section className="space-y-4">
				<h1 className="text-2xl font-semibold">Vendors Administration</h1>
				<div className="rounded-2xl border border-slate-800/60 bg-slate-900/40 p-6">
					<p className="text-slate-300">Loading vendors...</p>
				</div>
			</section>
		);
	}

	if (error || !isAdmin) {
		return (
			<section className="space-y-4">
				<h1 className="text-2xl font-semibold">Vendors Administration</h1>
				<div className="rounded-2xl border border-rose-800/60 bg-rose-900/40 p-6">
					<p className="text-rose-300">
						{error || "Admin access required"}
					</p>
					<Link
						href="/settings"
						className="mt-4 inline-block text-sky-400 hover:underline"
					>
						Back to Settings
					</Link>
				</div>
			</section>
		);
	}

	if (selectedVendor) {
		return (
			<section className="space-y-4">
				<div className="flex items-center gap-4">
					<button
						onClick={() => setSelectedVendor(null)}
						className="text-sky-400 hover:underline"
					>
						← Back to list
					</button>
					<h1 className="text-2xl font-semibold">Vendor Details</h1>
				</div>

				<div className="space-y-6 rounded-2xl border border-slate-800/60 bg-slate-900/40 p-6 shadow-lg shadow-slate-900/30">
					{/* Status indicators */}
					<div className="flex flex-wrap gap-3">
						<div
							className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
								selectedVendor.isApproved
									? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
									: "bg-amber-500/20 text-amber-400 border border-amber-500/30"
							}`}
						>
							{selectedVendor.isApproved ? "Approved" : "Pending Review"}
						</div>
						{selectedVendor.isFeatured && (
							<div className="rounded-lg border border-sky-500/30 bg-sky-500/20 px-3 py-1.5 text-sm font-medium text-sky-400">
								Featured
							</div>
						)}
					</div>

					{/* Primary Image */}
					{selectedVendor.primaryImage && (
						<div className="relative aspect-video w-full overflow-hidden rounded-lg">
							<Image
								src={selectedVendor.primaryImage}
								alt={selectedVendor.vendorName}
								fill
								className="object-cover"
							/>
						</div>
					)}

					{/* Basic Information */}
					<div className="space-y-4">
						<div>
							<h2 className="text-xl font-semibold text-slate-100">
								{selectedVendor.vendorName}
							</h2>
							<p className="mt-2 text-slate-300">
								{selectedVendor.description}
							</p>
						</div>

						{/* Contact Information */}
						<div className="grid gap-4 md:grid-cols-2">
							<div>
								<h3 className="text-sm font-medium text-slate-400">
									Address
								</h3>
								<p className="mt-1 text-sm text-slate-200">
									{selectedVendor.address1}
								</p>
								{selectedVendor.address2 && (
									<p className="text-sm text-slate-200">
										{selectedVendor.address2}
									</p>
								)}
								<p className="text-sm text-slate-200">
									{selectedVendor.city}, {selectedVendor.state}{" "}
									{selectedVendor.zip}
								</p>
							</div>

							<div>
								{selectedVendor.phone && (
									<div className="mb-2">
										<h3 className="text-sm font-medium text-slate-400">
											Phone
										</h3>
										<p className="mt-1 text-sm text-slate-200">
											{selectedVendor.phone}
										</p>
									</div>
								)}
								{selectedVendor.website && (
									<div>
										<h3 className="text-sm font-medium text-slate-400">
											Website
										</h3>
										<a
											href={selectedVendor.website}
											target="_blank"
											rel="noopener noreferrer"
											className="mt-1 block text-sm text-sky-400 hover:underline"
										>
											{selectedVendor.website}
										</a>
									</div>
								)}
							</div>
						</div>

						{/* Hours of Operation */}
						{selectedVendor.hoursOfOperation && (
							<div>
								<h3 className="text-sm font-medium text-slate-400">
									Hours of Operation
								</h3>
								<div className="mt-2 grid gap-2 md:grid-cols-2">
									{Object.entries(selectedVendor.hoursOfOperation).map(
										([day, hours]) => {
											const timeDisplay = getOpeningClosingTimes(hours);
											if (timeDisplay === "Closed") return null;
											return (
												<div
													key={day}
													className="rounded bg-slate-800/50 p-2"
												>
													<span className="text-sm font-medium text-slate-300">
														{day}:
													</span>{" "}
													<span className="text-sm text-slate-400">
														{timeDisplay}
													</span>
												</div>
											);
										}
									)}
								</div>
							</div>
						)}

						{/* Additional Images */}
						{selectedVendor.images && selectedVendor.images.length > 0 && (
							<div>
								<h3 className="text-sm font-medium text-slate-400">
									Gallery
								</h3>
								<div className="mt-2 grid grid-cols-2 gap-4 md:grid-cols-3">
									{selectedVendor.images.map((image, index) => (
										<div
											key={index}
											className="relative aspect-video overflow-hidden rounded-lg"
										>
											<Image
												src={image}
												alt={`${selectedVendor.vendorName} gallery ${index + 1}`}
												fill
												className="object-cover"
											/>
										</div>
									))}
								</div>
							</div>
						)}

						{/* Public Link */}
						<div>
							<h3 className="text-sm font-medium text-slate-400">
								Public Link
							</h3>
							<Link
								href={`/vendor/${selectedVendor.id}`}
								target="_blank"
								className="mt-1 block text-sm text-sky-400 hover:underline"
							>
								/vendor/{selectedVendor.id}
							</Link>
						</div>

						{/* Ownership Information */}
						<div>
							<h3 className="text-sm font-medium text-slate-400">
								Owner User ID
							</h3>
							<p className="mt-1 text-sm text-slate-200">
								{selectedVendor.ownerUserId || (
									<span className="text-amber-400">No owner assigned</span>
								)}
							</p>
						</div>
					</div>

					{/* Admin Actions */}
					<div className="space-y-4 border-t border-slate-700 pt-6">
						<h3 className="text-sm font-medium text-amber-200">
							Admin Actions
						</h3>

						{/* Ownership Assignment */}
						<div className="space-y-2">
							<h4 className="text-sm font-medium text-slate-300">
								Assign Ownership
							</h4>
							<p className="text-xs text-slate-400">
								Enter a user ID to assign this vendor to them. Leave empty and submit to remove ownership.
							</p>
							<div className="flex gap-2">
								<input
									type="text"
									value={ownerUserId}
									onChange={(e) => setOwnerUserId(e.target.value)}
									placeholder="Enter user ID"
									className="flex-1 rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
									disabled={updating}
								/>
								<button
									onClick={() => handleOwnershipChange(selectedVendor.id, ownerUserId)}
									disabled={updating}
									className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
								>
									Update Owner
								</button>
							</div>
						</div>

						{/* Approval and Featured Actions */}
						<div className="flex flex-wrap gap-3">
							{!selectedVendor.isApproved && (
								<button
									onClick={() =>
										handleApprovalChange(selectedVendor.id, true)
									}
									disabled={updating}
									className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
								>
									Approve Vendor
								</button>
							)}
							{selectedVendor.isApproved && (
								<button
									onClick={() =>
										handleApprovalChange(selectedVendor.id, false)
									}
									disabled={updating}
									className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-50"
								>
									Revoke Approval
								</button>
							)}
							{!selectedVendor.isFeatured && (
								<button
									onClick={() =>
										handleFeatureChange(selectedVendor.id, true)
									}
									disabled={updating}
									className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-50"
								>
									Mark as Featured
								</button>
							)}
							{selectedVendor.isFeatured && (
								<button
									onClick={() =>
										handleFeatureChange(selectedVendor.id, false)
									}
									disabled={updating}
									className="rounded-lg bg-slate-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
								>
									Remove Featured
								</button>
							)}
						</div>
						{message && (
							<p
								className={`text-sm ${
									message.includes("success")
										? "text-emerald-400"
										: "text-rose-400"
								}`}
							>
								{message}
							</p>
						)}
					</div>
				</div>
			</section>
		);
	}

	return (
		<section className="space-y-4">
			<div className="flex items-center justify-between">
				<h1 className="text-2xl font-semibold">Vendors Administration</h1>
				<Link
					href="/settings"
					className="text-sm text-sky-400 hover:underline"
				>
					Back to Settings
				</Link>
			</div>

			<div className="rounded-2xl border border-slate-800/60 bg-slate-900/40 p-6 shadow-lg shadow-slate-900/30">
				<p className="mb-4 text-sm text-slate-400">
					Review and manage vendor submissions. Click on a vendor to view
					full details and approve or deny their listing.
				</p>

				{vendors.length === 0 ? (
					<p className="text-slate-300">No vendor submissions yet.</p>
				) : (
					<div className="space-y-3">
						{vendors.map((vendor) => (
							<div
								key={vendor.id}
								className="flex items-center gap-4 rounded-lg border border-slate-700 bg-slate-800/50 p-4 transition hover:bg-slate-800/70"
							>
								{vendor.primaryImage && (
									<div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg">
										<Image
											src={vendor.primaryImage}
											alt={vendor.vendorName}
											fill
											className="object-cover"
										/>
									</div>
								)}
								<div className="flex-1">
									<div className="flex items-center gap-2">
										<h3 className="font-medium text-slate-100">
											{vendor.vendorName}
										</h3>
										{vendor.isApproved ? (
											<span className="rounded bg-emerald-500/20 px-2 py-0.5 text-xs text-emerald-400">
												Approved
											</span>
										) : (
											<span className="rounded bg-amber-500/20 px-2 py-0.5 text-xs text-amber-400">
												Pending
											</span>
										)}
										{vendor.isFeatured && (
											<span className="rounded bg-sky-500/20 px-2 py-0.5 text-xs text-sky-400">
												Featured
											</span>
										)}
										{!vendor.ownerUserId && (
											<span className="rounded bg-purple-500/20 px-2 py-0.5 text-xs text-purple-400">
												No Owner
											</span>
										)}
									</div>
									<p className="mt-1 text-sm text-slate-400">
										{vendor.city}, {vendor.state}
									</p>
									<p className="mt-1 line-clamp-2 text-sm text-slate-400">
										{vendor.description}
									</p>
								</div>
								<button
									onClick={() => setSelectedVendor(vendor)}
									className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-sky-700"
								>
									View Details
								</button>
							</div>
						))}
					</div>
				)}
			</div>
		</section>
	);
}
