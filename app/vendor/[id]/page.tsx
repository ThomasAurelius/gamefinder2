"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";

import { DAYS_OF_WEEK } from "@/lib/constants";
import { createDefaultHours, sortTimeSlots, getOpeningClosingTimes } from "@/lib/vendor-utils";
import type { VendorResponse } from "@/lib/vendor-types";

type AuthInfo = {
	userId: string;
	isAdmin: boolean;
};

type Params = {
	id: string;
};

type HoursDisplay = Record<string, string[]>;

const formatHours = (hours: HoursDisplay) =>
	DAYS_OF_WEEK.map((day) => ({
		day,
		slots: hours[day] && hours[day].length > 0 ? hours[day] : [],
	}));

export default function VendorDetailsPage() {
	const params = useParams<Params>();
	const vendorId = params?.id;

	const [vendor, setVendor] = useState<VendorResponse | null>(null);
	const [hours, setHours] = useState<HoursDisplay>(() => createDefaultHours());
	const [auth, setAuth] = useState<AuthInfo | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [isSaving, setIsSaving] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState<string | null>(null);

	const canEdit = Boolean(
		vendor && auth && (auth.isAdmin || auth.userId === vendor.ownerUserId)
	);
	const canModerate = Boolean(auth?.isAdmin);

	useEffect(() => {
		const fetchAuth = async () => {
			try {
				const response = await fetch("/api/auth/me");
				if (!response.ok) {
					setAuth(null);
					return;
				}

				const data = await response.json();
				setAuth({ userId: data.userId, isAdmin: data.isAdmin });
			} catch (err) {
				console.error(err);
				setAuth(null);
			}
		};

		fetchAuth();
	}, []);

	useEffect(() => {
		if (!vendorId) return;

		const fetchVendor = async () => {
			setIsLoading(true);
			setError(null);
			setSuccess(null);

			try {
				const response = await fetch(`/api/vendors/${vendorId}`);
				if (!response.ok) {
					if (response.status === 404) {
						setError("Vendor not found or unavailable.");
					} else {
						setError("Unable to load vendor details.");
					}
					setVendor(null);
					return;
				}

				const data = await response.json();
				const loadedVendor: VendorResponse | undefined = data.vendor;
				if (loadedVendor) {
					setVendor(loadedVendor);
					const normalized = createDefaultHours();
					Object.entries(loadedVendor.hoursOfOperation ?? {}).forEach(
						([day, slots]) => {
							if (Array.isArray(slots)) {
								normalized[day] = sortTimeSlots(slots);
							}
						}
					);
					setHours(normalized);
				}
			} catch (err) {
				console.error(err);
				setError("Unable to load vendor details.");
				setVendor(null);
			} finally {
				setIsLoading(false);
			}
		};

		fetchVendor();
	}, [vendorId]);

	const handleModerationUpdate = async (updates: Partial<VendorResponse>) => {
		if (!vendor || !canModerate) {
			return;
		}

		setIsSaving(true);
		setError(null);
		setSuccess(null);

		const payload = {
			primaryImage: vendor.primaryImage,
			images: vendor.images,
			vendorName: vendor.vendorName,
			description: vendor.description,
			address1: vendor.address1,
			address2: vendor.address2,
			city: vendor.city,
			state: vendor.state,
			zip: vendor.zip,
			phone: vendor.phone,
			website: vendor.website,
			hoursOfOperation: vendor.hoursOfOperation,
			isApproved: updates.isApproved ?? vendor.isApproved,
			isFeatured: updates.isFeatured ?? vendor.isFeatured,
		};

		try {
			const response = await fetch(`/api/vendors/${vendor.id}`, {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(payload),
			});

			if (!response.ok) {
				const message = await response.text();
				throw new Error(message || "Unable to update vendor");
			}

			const data = await response.json();
			const updated: VendorResponse | undefined = data.vendor;
			if (updated) {
				setVendor(updated);
				const normalized = createDefaultHours();
				Object.entries(updated.hoursOfOperation ?? {}).forEach(
					([day, slots]) => {
						if (Array.isArray(slots)) {
							normalized[day] = sortTimeSlots(slots);
						}
					}
				);
				setHours(normalized);
				setSuccess("Vendor status updated.");
			}
		} catch (err) {
			console.error(err);
			setError(
				err instanceof Error ? err.message : "Unable to update vendor"
			);
		} finally {
			setIsSaving(false);
		}
	};

	const handleDelete = async () => {
		if (!vendor || !canEdit) {
			return;
		}

		if (
			!window.confirm("Are you sure you want to delete this vendor profile?")
		) {
			return;
		}

		setIsSaving(true);
		setError(null);
		setSuccess(null);

		try {
			const response = await fetch(`/api/vendors/${vendor.id}`, {
				method: "DELETE",
			});

			if (!response.ok) {
				const message = await response.text();
				throw new Error(message || "Unable to delete vendor");
			}

			setVendor(null);
			setSuccess("Vendor deleted.");
		} catch (err) {
			console.error(err);
			setError(
				err instanceof Error ? err.message : "Unable to delete vendor"
			);
		} finally {
			setIsSaving(false);
		}
	};

	if (!vendorId) {
		return (
			<main className="rounded-2xl border border-slate-800 bg-slate-950/70 p-6 text-slate-200">
				Invalid vendor identifier.
			</main>
		);
	}

	if (isLoading) {
		return (
			<main className="rounded-2xl border border-slate-800 bg-slate-950/70 p-6 text-slate-200">
				Loading vendor details...
			</main>
		);
	}

	if (!vendor) {
		return (
			<main className="space-y-4">
				<div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-6 text-slate-200">
					{error ?? "Vendor not found."}
				</div>
				<Link
					href="/vendor"
					className="inline-flex items-center rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-200 transition hover:border-slate-500"
				>
					Back to vendor management
				</Link>
			</main>
		);
	}

	const displayHours = formatHours(hours);

	return (
		<main className="space-y-8">
			<header className="rounded-2xl border border-slate-800 bg-slate-950/70 p-6 shadow-lg shadow-slate-900/40">
				<div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
					<div>
						<h1 className="text-2xl font-semibold text-slate-100">
							{vendor.vendorName}
						</h1>
						<p className="mt-2 text-sm text-slate-400">
							Vendor application review
						</p>
						<div className="mt-3 flex flex-wrap gap-3 text-sm text-slate-300">
							<span>
								Status:{" "}
								{vendor.isApproved ? (
									<span className="text-emerald-400">Approved</span>
								) : (
									<span className="text-amber-400">
										Pending Review
									</span>
								)}
							</span>
							{vendor.isFeatured ? (
								<span className="text-sky-400">Featured Vendor</span>
							) : null}
						</div>
					</div>
					{canModerate ? (
						<div className="flex flex-wrap gap-3 text-sm">
							<button
								type="button"
								onClick={() =>
									handleModerationUpdate({
										isApproved: !vendor.isApproved,
									})
								}
								className="rounded-lg bg-gradient-to-r from-emerald-500 to-sky-500 px-4 py-2 font-semibold text-white shadow-lg shadow-slate-900/30 transition hover:from-emerald-400 hover:to-sky-400 disabled:cursor-not-allowed disabled:opacity-60"
								disabled={isSaving}
							>
								{vendor.isApproved
									? "Mark as Pending"
									: "Approve Vendor"}
							</button>
							<button
								type="button"
								onClick={() =>
									handleModerationUpdate({
										isFeatured: !vendor.isFeatured,
									})
								}
								className="rounded-lg border border-sky-500 px-4 py-2 font-medium text-sky-300 transition hover:bg-sky-500/10 disabled:cursor-not-allowed disabled:opacity-60"
								disabled={isSaving}
							>
								{vendor.isFeatured
									? "Remove Featured"
									: "Feature Vendor"}
							</button>
						</div>
					) : null}
				</div>
				<div className="mt-4 text-xs text-slate-500">
					Vendor ID: {vendor.id}
				</div>
			</header>

			{success ? <p className="text-emerald-400">{success}</p> : null}
			{error ? <p className="text-rose-400">{error}</p> : null}

			<section className="grid gap-6 md:grid-cols-[2fr,1fr]">
				<article className="space-y-6 rounded-2xl border border-slate-800 bg-slate-950/70 p-6 shadow-lg shadow-slate-900/40">
					<div className="space-y-4">
						<h2 className="text-lg font-semibold text-slate-100">
							Overview
						</h2>
						<p className="text-sm leading-relaxed text-slate-300 whitespace-pre-line">
							{vendor.description}
						</p>
					</div>

					<div className="space-y-4">
						<h2 className="text-lg font-semibold text-slate-100">
							Location
						</h2>
						<p className="text-sm text-slate-300">
							{vendor.address1}
							{vendor.address2 ? (
								<>
									<br />
									{vendor.address2}
								</>
							) : null}
							<br />
							{vendor.city}, {vendor.state} {vendor.zip}
						</p>
						<p className="text-sm text-slate-300">
							{vendor.phone ? (
								<span className="block">
									Phone:{" "}
									<a
										href={`tel:${vendor.phone}`}
										className="text-sky-400 hover:underline"
									>
										{vendor.phone}
									</a>
								</span>
							) : null}
							{vendor.website ? (
								<span className="block">
									Website:{" "}
									<a
										href={vendor.website}
										className="text-sky-400 hover:underline"
										target="_blank"
										rel="noopener noreferrer"
									>
										{vendor.website}
									</a>
								</span>
							) : null}
						</p>
					</div>

					<div className="space-y-4">
						<h2 className="text-lg font-semibold text-slate-100">
							Hours of Operation
						</h2>
						<dl className="space-y-2 text-sm text-slate-300">
							{displayHours.map(({ day, slots }) => (
								<div
									key={day}
									className="flex flex-wrap justify-between gap-2 border-b border-slate-800 pb-2 last:border-0"
								>
									<dt className="font-medium text-slate-200">{day}</dt>
									<dd className="text-right text-slate-300">
										{getOpeningClosingTimes(slots)}
									</dd>
								</div>
							))}
						</dl>
					</div>
				</article>

				<aside className="space-y-4 rounded-2xl border border-slate-800 bg-slate-950/70 p-6 shadow-lg shadow-slate-900/40">
					<div className="space-y-3">
						<h2 className="text-lg font-semibold text-slate-100">
							Media
						</h2>
						<div className="relative h-100 w-100 overflow-hidden rounded-xl border border-slate-800 bg-slate-900">
							{vendor.primaryImage ? (
								<Image
									src={vendor.primaryImage}
									alt={`${vendor.vendorName} primary image`}
									fill
									className="object-cover"
								/>
							) : (
								<div className="flex h-full items-center justify-center text-sm text-slate-500">
									No primary image provided
								</div>
							)}
						</div>
						{vendor.images && vendor.images.length > 0 ? (
							<ul className="space-y-2 text-sm">
								{vendor.images.map((image) => (
									<li key={image}>
										<a
											href={image}
											target="_blank"
											rel="noopener noreferrer"
											className="text-sky-400 hover:underline"
										>
											{image}
										</a>
									</li>
								))}
							</ul>
						) : (
							<p className="text-sm text-slate-500">
								No additional images supplied.
							</p>
						)}
					</div>

					<div className="space-y-2 text-sm text-slate-300">
						<p>
							Vendor Manager:{" "}
							<Link
								href={`/user/${vendor.ownerUserId}`}
								className="text-sky-400 hover:underline"
							>
								{vendor.ownerUserId}
							</Link>
						</p>
						{canEdit ? (
							<button
								type="button"
								onClick={handleDelete}
								className="inline-flex items-center rounded-lg border border-rose-500 px-4 py-2 font-medium text-rose-300 transition hover:bg-rose-500/10 disabled:cursor-not-allowed disabled:opacity-60"
								disabled={isSaving}
							>
								Delete Vendor
							</button>
						) : null}
						<Link
							href="/vendor"
							className="inline-flex items-center rounded-lg border border-slate-700 px-4 py-2 text-slate-200 transition hover:border-slate-500"
						>
							Manage vendor
						</Link>
					</div>
				</aside>
			</section>
		</main>
	);
}
