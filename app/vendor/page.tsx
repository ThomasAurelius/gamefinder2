"use client";

import { FormEvent, Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { DAYS_OF_WEEK, TIME_SLOT_GROUPS, TIME_SLOTS } from "@/lib/constants";

import type { VendorResponse } from "@/lib/vendor-types";
import { createDefaultHours, sortTimeSlots } from "@/lib/vendor-utils";
import ImageUploadField from "@/components/ImageUploadField";
import MultiImageUploadField from "@/components/MultiImageUploadField";

const tagButtonClasses = (active: boolean) => {
	const base = "rounded-full border px-3 py-1.5 text-sm transition";
	if (active) {
		return `${base} border-sky-400 bg-sky-500/20 text-sky-100`;
	}
	return `${base} border-slate-700 bg-slate-900 text-slate-200 hover:border-slate-500`;
};

// Helper function to populate form state with vendor data
const populateVendorData = (
	vendor: VendorResponse,
	setters: {
		setVendorId: (id: string) => void;
		setPrimaryImage: (img: string) => void;
		setImages: (imgs: string[]) => void;
		setVendorName: (name: string) => void;
		setDescription: (desc: string) => void;
		setAddress1: (addr: string) => void;
		setAddress2: (addr: string) => void;
		setCity: (city: string) => void;
		setState: (state: string) => void;
		setZip: (zip: string) => void;
		setPhone: (phone: string) => void;
		setWebsite: (website: string) => void;
		setHours: (hours: Record<string, string[]>) => void;
		setIsApproved: (approved: boolean) => void;
		setIsFeatured: (featured: boolean) => void;
	}
) => {
	setters.setVendorId(vendor.id);
	setters.setPrimaryImage(vendor.primaryImage || "");
	setters.setImages(vendor.images ?? []);
	setters.setVendorName(vendor.vendorName || "");
	setters.setDescription(vendor.description || "");
	setters.setAddress1(vendor.address1 || "");
	setters.setAddress2(vendor.address2 || "");
	setters.setCity(vendor.city || "");
	setters.setState(vendor.state || "");
	setters.setZip(vendor.zip || "");
	setters.setPhone(vendor.phone || "");
	setters.setWebsite(vendor.website || "");

	const normalizedHours = createDefaultHours();
	Object.entries(vendor.hoursOfOperation ?? {}).forEach(([day, slots]) => {
		if (Array.isArray(slots)) {
			normalizedHours[day] = sortTimeSlots(slots);
		}
	});
	setters.setHours(normalizedHours);

	setters.setIsApproved(vendor.isApproved);
	setters.setIsFeatured(vendor.isFeatured);
};

export default function VendorManagementPage() {
	return (
		<Suspense fallback={<LoadingState />}>
			<VendorManagementContent />
		</Suspense>
	);
}

function LoadingState() {
	return (
		<main className="space-y-8">
			<header className="rounded-2xl border border-slate-800 bg-slate-950/70 p-6 shadow-lg shadow-slate-900/40">
				<h1 className="text-2xl font-semibold text-slate-100">
					Vendor Management
				</h1>
				<p className="mt-2 text-sm text-slate-400">
					Loading...
				</p>
			</header>
		</main>
	);
}

function VendorManagementContent() {
	const searchParams = useSearchParams();
	const editVendorId = searchParams?.get("edit");
	
	const [vendorId, setVendorId] = useState<string | null>(null);
	const [primaryImage, setPrimaryImage] = useState("");
	const [images, setImages] = useState<string[]>([]);
	const [vendorName, setVendorName] = useState("");
	const [description, setDescription] = useState("");
	const [address1, setAddress1] = useState("");
	const [address2, setAddress2] = useState("");
	const [city, setCity] = useState("");
	const [state, setState] = useState("");
	const [zip, setZip] = useState("");
	const [phone, setPhone] = useState("");
	const [website, setWebsite] = useState("");
	const [hours, setHours] = useState<Record<string, string[]>>(() =>
		createDefaultHours()
	);
	const [lastClickedSlot, setLastClickedSlot] = useState<
		Record<string, string>
	>({});
	const [isApproved, setIsApproved] = useState(false);
	const [isFeatured, setIsFeatured] = useState(false);
	const [isLoading, setIsLoading] = useState(true);
	const [isSaving, setIsSaving] = useState(false);
	const [saveSuccess, setSaveSuccess] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [deleteMessage, setDeleteMessage] = useState<string | null>(null);
	const [isAdmin, setIsAdmin] = useState(false);

	useEffect(() => {
		const fetchVendor = async () => {
			setIsLoading(true);
			setError(null);
			try {
				// Check if user is admin
				const authResponse = await fetch("/api/auth/me");
				let userIsAdmin = false;
				let currentUserId = "";
				if (authResponse.ok) {
					const authData = await authResponse.json();
					userIsAdmin = authData.isAdmin;
					currentUserId = authData.userId;
					setIsAdmin(userIsAdmin);
				}

				// If editVendorId is provided in URL, fetch that specific vendor
				if (editVendorId) {
					const response = await fetch(`/api/vendors/${editVendorId}`);
					if (!response.ok) {
						if (response.status === 404) {
							setError("Vendor not found.");
						} else if (response.status === 403) {
							setError("You don't have permission to edit this vendor.");
						} else {
							setError("Unable to load vendor information.");
						}
						return;
					}

					const data = await response.json();
					const vendor: VendorResponse | undefined = data.vendor;

					if (vendor) {
						// Check if user has permission to edit this vendor
						const canEdit = userIsAdmin || vendor.ownerUserId === currentUserId;
						if (!canEdit) {
							setError("You don't have permission to edit this vendor.");
							return;
						}
						
						populateVendorData(vendor, {
							setVendorId,
							setPrimaryImage,
							setImages,
							setVendorName,
							setDescription,
							setAddress1,
							setAddress2,
							setCity,
							setState,
							setZip,
							setPhone,
							setWebsite,
							setHours,
							setIsApproved,
							setIsFeatured,
						});
					}
				} else {
					// Otherwise, fetch the user's own vendor (if any)
					const response = await fetch("/api/vendors?owner=me");
					if (!response.ok) {
						if (response.status === 401) {
							setError("You must be signed in to manage a vendor profile.");
						} else {
							setError("Unable to load vendor information.");
						}
						return;
					}

					const data = await response.json();
					const vendor: VendorResponse | undefined = data.vendors?.[0];

					if (vendor) {
						populateVendorData(vendor, {
							setVendorId,
							setPrimaryImage,
							setImages,
							setVendorName,
							setDescription,
							setAddress1,
							setAddress2,
							setCity,
							setState,
							setZip,
							setPhone,
							setWebsite,
							setHours,
							setIsApproved,
							setIsFeatured,
						});
					}
				}
			} catch (err) {
				console.error(err);
				setError("Unable to load vendor information.");
			} finally {
				setIsLoading(false);
			}
		};

		fetchVendor();
	}, [editVendorId]);

	const totalSelectedHours = useMemo(
		() =>
			DAYS_OF_WEEK.reduce((sum, day) => sum + (hours[day]?.length ?? 0), 0),
		[hours]
	);

	const toggleHour = (day: string, slot: string, shiftKey: boolean) => {
		setHours((prev) => {
			const daySlots = prev[day] ?? [];

			if (shiftKey && lastClickedSlot[day]) {
				const startIdx = TIME_SLOTS.indexOf(lastClickedSlot[day]);
				const endIdx = TIME_SLOTS.indexOf(slot);

				if (startIdx !== -1 && endIdx !== -1) {
					const [minIdx, maxIdx] = [
						Math.min(startIdx, endIdx),
						Math.max(startIdx, endIdx),
					];
					const rangeSlots = TIME_SLOTS.slice(minIdx, maxIdx + 1);
					const allSelected = rangeSlots.every((rangeSlot) =>
						daySlots.includes(rangeSlot)
					);

					const updatedSlots = allSelected
						? daySlots.filter((item) => !rangeSlots.includes(item))
						: sortTimeSlots([...daySlots, ...rangeSlots]);

					return { ...prev, [day]: updatedSlots };
				}
			}

			const exists = daySlots.includes(slot);
			const updatedSlots = exists
				? daySlots.filter((item) => item !== slot)
				: sortTimeSlots([...daySlots, slot]);

			setLastClickedSlot((current) => ({ ...current, [day]: slot }));

			return { ...prev, [day]: updatedSlots };
		});
	};

	const resetForm = () => {
		setVendorId(null);
		setPrimaryImage("");
		setImages([]);
		setVendorName("");
		setDescription("");
		setAddress1("");
		setAddress2("");
		setCity("");
		setState("");
		setZip("");
		setPhone("");
		setWebsite("");
		setHours(createDefaultHours());
		setIsApproved(false);
		setIsFeatured(false);
	};

	const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		setIsSaving(true);
		setSaveSuccess(false);
		setError(null);
		setDeleteMessage(null);

		const payload = {
			primaryImage,
			images,
			vendorName,
			description,
			address1,
			address2,
			city,
			state,
			zip,
			phone,
			website,
			hoursOfOperation: hours,
		};

		try {
			const endpoint = vendorId
				? `/api/vendors/${vendorId}`
				: "/api/vendors";
			const method = vendorId ? "PUT" : "POST";

			const response = await fetch(endpoint, {
				method,
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(payload),
			});

			if (!response.ok) {
				const message = await response.text();
				throw new Error(message || "Unable to save vendor");
			}

			const data = await response.json();
			const vendor: VendorResponse | undefined = data.vendor;

			if (vendor) {
				setVendorId(vendor.id);
				setIsApproved(vendor.isApproved);
				setIsFeatured(vendor.isFeatured);
			}

			setSaveSuccess(true);
		} catch (err) {
			console.error(err);
			setError(err instanceof Error ? err.message : "Unable to save vendor");
		} finally {
			setIsSaving(false);
		}
	};

	const handleDelete = async () => {
		if (!vendorId) return;
		if (
			!window.confirm("Are you sure you want to delete this vendor profile?")
		) {
			return;
		}

		setIsSaving(true);
		setError(null);
		setDeleteMessage(null);

		try {
			const response = await fetch(`/api/vendors/${vendorId}`, {
				method: "DELETE",
			});
			if (!response.ok) {
				const message = await response.text();
				throw new Error(message || "Unable to delete vendor");
			}

			resetForm();
			setDeleteMessage("Vendor profile deleted.");
		} catch (err) {
			console.error(err);
			setError(
				err instanceof Error ? err.message : "Unable to delete vendor"
			);
		} finally {
			setIsSaving(false);
		}
	};

	return (
		<main className="space-y-8">
			<header className="rounded-2xl border border-slate-800 bg-slate-950/70 p-6 shadow-lg shadow-slate-900/40">
				<h1 className="text-2xl font-semibold text-slate-100">
					{editVendorId ? "Edit Vendor" : "Vendor Application"}
				</h1>
				<p className="mt-2 text-sm text-slate-400">
					{editVendorId
						? "Update vendor details. Changes will be saved immediately."
						: "Submit your vendor details for review. Once approved by an administrator, your profile will appear in public listings. You can update your information at any time."}
				</p>
				<div className="mt-4 flex flex-wrap gap-3 text-sm text-slate-300">
					<span>
						Status:{" "}
						{isApproved ? (
							<span className="text-emerald-400">Approved</span>
						) : (
							<span className="text-amber-400">Pending Review</span>
						)}
					</span>
					{isFeatured ? (
						<span className="text-sky-400">Featured Vendor</span>
					) : null}
				</div>
				{vendorId ? (
					<p className="mt-2 text-xs text-slate-500">
						Shareable link:{" "}
						<Link
							href={`/vendor/${vendorId}`}
							className="text-sky-400 hover:underline"
						>
							/vendor/{vendorId}
						</Link>
					</p>
				) : null}
			</header>

			{isLoading ? (
				<div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-6 text-slate-300">
					Loading vendor details...
				</div>
			) : (
				<form
					onSubmit={handleSubmit}
					className="space-y-8 rounded-2xl border border-slate-800 bg-slate-950/70 p-6 shadow-lg shadow-slate-900/40"
				>
					<section className="space-y-4">
						<div>
							<label className="block text-sm font-medium text-slate-200">
								Vendor Name
							</label>
							<input
								type="text"
								value={vendorName}
								onChange={(event) => setVendorName(event.target.value)}
								className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
								required
							/>
						</div>
						<ImageUploadField
							label="Primary Image"
							value={primaryImage}
							onChange={setPrimaryImage}
							type="vendor"
							required
							helpText="Upload an image or enter a URL. Recommended size: 800x600 pixels. Max file size: 5MB."
							disabled={isSaving}
						/>
						<MultiImageUploadField
							label="Additional Images"
							images={images}
							onChange={setImages}
							type="vendor"
							helpText="Upload images or add URLs. You can add multiple gallery images."
							disabled={isSaving}
						/>
						<div>
							<label className="block text-sm font-medium text-slate-200">
								Website
							</label>
							<input
								type="url"
								value={website}
								onChange={(event) => setWebsite(event.target.value)}
								className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
								placeholder="https://your-site.example"
							/>
						</div>
						<div>
							<label className="block text-sm font-medium text-slate-200">
								Phone
							</label>
							<input
								type="tel"
								value={phone}
								onChange={(event) => setPhone(event.target.value)}
								className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
								placeholder="(555) 123-4567"
							/>
						</div>
						<div>
							<label className="block text-sm font-medium text-slate-200">
								Description
							</label>
							<textarea
								value={description}
								onChange={(event) => setDescription(event.target.value)}
								className="mt-1 h-32 w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
								placeholder="Tell us about your store, offerings, or services."
								required
							/>
						</div>
					</section>

					<section className="grid gap-4 md:grid-cols-2">
						<div>
							<label className="block text-sm font-medium text-slate-200">
								Address Line 1
							</label>
							<input
								type="text"
								value={address1}
								onChange={(event) => setAddress1(event.target.value)}
								className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
								required
							/>
						</div>
						<div>
							<label className="block text-sm font-medium text-slate-200">
								Address Line 2
							</label>
							<input
								type="text"
								value={address2}
								onChange={(event) => setAddress2(event.target.value)}
								className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
								placeholder="Suite, Unit, etc."
							/>
						</div>
						<div>
							<label className="block text-sm font-medium text-slate-200">
								City
							</label>
							<input
								type="text"
								value={city}
								onChange={(event) => setCity(event.target.value)}
								className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
								required
							/>
						</div>
						<div className="grid grid-cols-2 gap-4">
							<div>
								<label className="block text-sm font-medium text-slate-200">
									State / Province
								</label>
								<input
									type="text"
									value={state}
									onChange={(event) => setState(event.target.value)}
									className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
									required
								/>
							</div>
							<div>
								<label className="block text-sm font-medium text-slate-200">
									ZIP / Postal Code
								</label>
								<input
									type="text"
									value={zip}
									onChange={(event) => setZip(event.target.value)}
									className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
									required
								/>
							</div>
						</div>
					</section>

					<section className="space-y-4">
						<div className="flex items-center justify-between">
							<div>
								<h2 className="text-lg font-semibold text-slate-100">
									Hours of Operation
								</h2>
								<p className="text-sm text-slate-400">
									Select the hours your business is open. Use Shift +
									Click to select ranges quickly.
								</p>
							</div>
							<span className="text-xs text-slate-500">
								{totalSelectedHours} hour(s) selected
							</span>
						</div>

						<div className="space-y-5">
							{DAYS_OF_WEEK.map((day) => (
								<div key={day} className="space-y-3">
									<div className="flex items-center justify-between">
										<h3 className="text-sm font-medium text-slate-200">
											{day}
										</h3>
										<span className="text-xs text-slate-500">
											{hours[day]?.length ?? 0} hour(s)
										</span>
									</div>
									<div className="space-y-3">
										{TIME_SLOT_GROUPS.map((group) => (
											<div key={group.label}>
												<div className="mb-2 text-xs font-semibold text-slate-500">
													{group.label}
												</div>
												<div className="flex flex-wrap gap-2">
													{group.slots.map((slot) => {
														const active =
															hours[day]?.includes(slot) ??
															false;
														return (
															<button
																key={slot}
																type="button"
																onClick={(event) =>
																	toggleHour(
																		day,
																		slot,
																		event.shiftKey
																	)
																}
																className={tagButtonClasses(
																	active
																)}
															>
																{slot}
															</button>
														);
													})}
												</div>
											</div>
										))}
									</div>
								</div>
							))}
						</div>
					</section>

					<div className="space-y-3 text-sm">
						<button
							type="submit"
							className="rounded-lg bg-gradient-to-r from-sky-500 via-indigo-500 to-purple-500 px-4 py-2 font-semibold text-white shadow-lg shadow-slate-900/40 transition hover:from-sky-400 hover:via-indigo-400 hover:to-purple-400 disabled:cursor-not-allowed disabled:opacity-60"
							disabled={isSaving || isLoading}
						>
							{isSaving
								? "Saving..."
								: vendorId
									? "Update Vendor"
									: "Submit Application"}
						</button>
						{vendorId ? (
							<button
								type="button"
								onClick={handleDelete}
								className="inline-flex items-center rounded-lg border border-rose-500 px-4 py-2 font-medium text-rose-300 transition hover:bg-rose-500/10"
								disabled={isSaving}
							>
								Delete Vendor
							</button>
						) : null}
						{saveSuccess ? (
							<p className="text-emerald-400">
								Vendor information saved successfully.
							</p>
						) : null}
						{deleteMessage ? (
							<p className="text-amber-400">{deleteMessage}</p>
						) : null}
						{error ? <p className="text-rose-400">{error}</p> : null}
					</div>
				</form>
			)}
		</main>
	);
}
