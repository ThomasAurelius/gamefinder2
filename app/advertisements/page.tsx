"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

type Advertisement = {
	id: string;
	imageUrl: string;
	isActive: boolean;
	zipCode?: string;
	url?: string;
	clicks: number;
	impressions: number;
	createdAt: Date;
	updatedAt: Date;
};

export default function AdvertisementsPage() {
	const router = useRouter();
	const [isAdmin, setIsAdmin] = useState(false);
	const [loading, setLoading] = useState(true);
	const [advertisements, setAdvertisements] = useState<Advertisement[]>([]);
	const [message, setMessage] = useState("");
	const [editingAd, setEditingAd] = useState<Advertisement | null>(null);
	const [uploadingImage, setUploadingImage] = useState(false);
	const [savingAd, setSavingAd] = useState(false);
	const [deletingAdId, setDeletingAdId] = useState<string | null>(null);

	useEffect(() => {
		async function checkAdminAndLoadAds() {
			try {
				// Check admin status
				const statusRes = await fetch("/api/admin/status");
				const statusData = await statusRes.json();
				
				if (!statusData.isAdmin) {
					// Not admin, redirect to dashboard
					router.push("/dashboard");
					return;
				}
				
				setIsAdmin(true);

				// Load advertisements
				await loadAdvertisements();
			} catch (error) {
				console.error("Failed to load advertisements:", error);
				setMessage("Failed to load advertisements. Please try again.");
			} finally {
				setLoading(false);
			}
		}

		checkAdminAndLoadAds();
	}, [router]);

	const loadAdvertisements = async () => {
		try {
			const response = await fetch("/api/advertisements/list");
			if (response.ok) {
				const ads = await response.json();
				setAdvertisements(ads);
			} else {
				throw new Error("Failed to fetch advertisements");
			}
		} catch (error) {
			console.error("Failed to load advertisements:", error);
			setMessage("Failed to load advertisements. Please try again.");
		}
	};

	const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;

		setUploadingImage(true);
		setMessage("");

		try {
			const formData = new FormData();
			formData.append("file", file);
			formData.append("type", "advertisement");

			const response = await fetch("/api/upload", {
				method: "POST",
				body: formData,
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.error || "Failed to upload image");
			}

			const { url } = await response.json();
			
			if (editingAd) {
				setEditingAd({ ...editingAd, imageUrl: url });
			}
			
			setMessage("Image uploaded successfully!");
			setTimeout(() => setMessage(""), 3000);
		} catch (err) {
			const errorMessage =
				err instanceof Error ? err.message : "Failed to upload image";
			setMessage(errorMessage);
		} finally {
			setUploadingImage(false);
		}
	};

	const handleSaveAdvertisement = async () => {
		if (!editingAd) return;

		setSavingAd(true);
		setMessage("");

		try {
			let response;
			
			if (editingAd.id === "new") {
				// Create new advertisement
				response = await fetch("/api/advertisements", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						imageUrl: editingAd.imageUrl,
						isActive: editingAd.isActive,
						zipCode: editingAd.zipCode,
						url: editingAd.url,
					}),
				});
			} else {
				// Update existing advertisement
				response = await fetch("/api/advertisements/manage", {
					method: "PUT",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						id: editingAd.id,
						imageUrl: editingAd.imageUrl,
						isActive: editingAd.isActive,
						zipCode: editingAd.zipCode,
						url: editingAd.url,
					}),
				});
			}

			if (!response.ok) {
				throw new Error("Failed to save advertisement");
			}

			setMessage("Advertisement saved successfully!");
			setTimeout(() => setMessage(""), 3000);
			setEditingAd(null);
			await loadAdvertisements();
		} catch (error) {
			console.error("Failed to save advertisement:", error);
			setMessage("Failed to save advertisement. Please try again.");
		} finally {
			setSavingAd(false);
		}
	};

	const handleToggleActive = async (ad: Advertisement) => {
		setMessage("");

		try {
			const response = await fetch("/api/advertisements/manage", {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					id: ad.id,
					isActive: !ad.isActive,
				}),
			});

			if (!response.ok) {
				throw new Error("Failed to toggle advertisement");
			}

			setMessage("Advertisement status updated!");
			setTimeout(() => setMessage(""), 3000);
			await loadAdvertisements();
		} catch (error) {
			console.error("Failed to toggle advertisement:", error);
			setMessage("Failed to update advertisement status. Please try again.");
		}
	};

	const handleDeleteAdvertisement = async (id: string) => {
		if (!confirm("Are you sure you want to delete this advertisement? This action cannot be undone.")) {
			return;
		}

		setDeletingAdId(id);
		setMessage("");

		try {
			const response = await fetch(`/api/advertisements/manage?id=${id}`, {
				method: "DELETE",
			});

			if (!response.ok) {
				throw new Error("Failed to delete advertisement");
			}

			setMessage("Advertisement deleted successfully!");
			setTimeout(() => setMessage(""), 3000);
			await loadAdvertisements();
		} catch (error) {
			console.error("Failed to delete advertisement:", error);
			setMessage("Failed to delete advertisement. Please try again.");
		} finally {
			setDeletingAdId(null);
		}
	};

	const startNewAd = () => {
		setEditingAd({
			id: "new",
			imageUrl: "",
			isActive: false,
			zipCode: "",
			url: "",
			clicks: 0,
			impressions: 0,
			createdAt: new Date(),
			updatedAt: new Date(),
		});
	};

	if (loading) {
		return (
			<section className="space-y-4">
				<h1 className="text-2xl font-semibold">Advertisements</h1>
				<p className="text-sm text-slate-300">Loading...</p>
			</section>
		);
	}

	if (!isAdmin) {
		return null; // Will redirect in useEffect
	}

	return (
		<section className="space-y-4">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-semibold">Advertisements</h1>
					<p className="text-sm text-slate-300 mt-2">
						Manage all site advertisements. Create, edit, toggle, and delete ads.
					</p>
				</div>
				<button
					onClick={startNewAd}
					className="rounded-lg bg-gradient-to-r from-amber-500 via-purple-500 to-indigo-500 px-4 py-2 text-sm font-semibold text-white transition hover:from-amber-400 hover:via-purple-400 hover:to-indigo-400"
				>
					Create New Ad
				</button>
			</div>

			{message && (
				<div
					className={`rounded-xl border px-4 py-3 text-sm ${
						message.includes("success") || message.includes("updated") || message.includes("deleted")
							? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
							: "border-red-500/20 bg-red-500/10 text-red-400"
					}`}
				>
					{message}
				</div>
			)}

			{/* Edit Form */}
			{editingAd && (
				<div className="rounded-2xl border border-slate-800/60 bg-slate-900/40 p-6 shadow-lg shadow-slate-900/30">
					<h2 className="text-lg font-semibold text-slate-100 mb-4">
						{editingAd.id === "new" ? "Create New Advertisement" : "Edit Advertisement"}
					</h2>

					<div className="space-y-4">
						<div className="flex items-center gap-2">
							<input
								type="checkbox"
								id="ad-active"
								checked={editingAd.isActive}
								onChange={(e) =>
									setEditingAd({ ...editingAd, isActive: e.target.checked })
								}
								className="h-5 w-5 rounded border-slate-700 bg-slate-950/60 text-amber-500 outline-none transition focus:ring-2 focus:ring-amber-500/40"
							/>
							<label htmlFor="ad-active" className="text-sm text-slate-200">
								Display this advertisement
							</label>
						</div>

						<div className="space-y-2">
							<label htmlFor="ad-zipcode" className="block text-sm font-medium text-slate-200">
								Zip Code (optional)
							</label>
							<input
								id="ad-zipcode"
								type="text"
								value={editingAd.zipCode || ""}
								onChange={(e) =>
									setEditingAd({ ...editingAd, zipCode: e.target.value })
								}
								placeholder="12345"
								className="w-full max-w-xs rounded-lg border border-slate-700 bg-slate-950/60 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
							/>
							<p className="text-xs text-slate-500">
								Leave blank to show to all users. If provided, ad will only show within 50
								miles.
							</p>
						</div>

						<div className="space-y-2">
							<label htmlFor="ad-url" className="block text-sm font-medium text-slate-200">
								URL (optional)
							</label>
							<input
								id="ad-url"
								type="url"
								value={editingAd.url || ""}
								onChange={(e) =>
									setEditingAd({ ...editingAd, url: e.target.value })
								}
								placeholder="https://example.com"
								className="w-full rounded-lg border border-slate-700 bg-slate-950/60 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
							/>
							<p className="text-xs text-slate-500">
								When users click the ad, they will be taken to this URL in a new window.
							</p>
						</div>

						{editingAd.imageUrl && (
							<div className="relative w-full max-w-md" style={{ aspectRatio: "2/1" }}>
								<Image
									src={editingAd.imageUrl}
									alt="Advertisement preview"
									fill
									className="rounded-lg border border-slate-700 object-contain"
								/>
							</div>
						)}

						<div className="space-y-2">
							<label
								htmlFor="ad-image-upload"
								className="inline-block cursor-pointer rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-sky-700"
							>
								{uploadingImage ? "Uploading..." : "Upload Image (800x400)"}
							</label>
							<input
								id="ad-image-upload"
								type="file"
								accept="image/jpeg,image/png,image/webp,image/gif"
								onChange={handleImageUpload}
								disabled={uploadingImage}
								className="hidden"
							/>
							<p className="text-xs text-slate-500">
								Recommended size: 800x400 pixels. Max file size: 5MB
							</p>
						</div>

						<div className="flex gap-2 pt-4">
							<button
								onClick={handleSaveAdvertisement}
								disabled={savingAd || !editingAd.imageUrl}
								className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-50"
							>
								{savingAd ? "Saving..." : "Save Advertisement"}
							</button>
							<button
								onClick={() => setEditingAd(null)}
								className="rounded-lg bg-slate-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-600"
							>
								Cancel
							</button>
						</div>
					</div>
				</div>
			)}

			{/* Advertisements List */}
			<div className="rounded-2xl border border-slate-800/60 bg-slate-900/40 p-6 shadow-lg shadow-slate-900/30">
				<h2 className="text-lg font-semibold text-slate-100 mb-4">All Advertisements</h2>

				{advertisements.length === 0 ? (
					<p className="text-sm text-slate-400">
						No advertisements yet. Click "Create New Ad" to get started.
					</p>
				) : (
					<div className="space-y-3">
						{advertisements.map((ad) => (
							<div
								key={ad.id}
								className="rounded-lg border border-slate-700 bg-slate-950/60 p-4"
							>
								<div className="flex flex-col md:flex-row gap-4">
									{/* Image Preview */}
									{ad.imageUrl && (
										<div className="relative w-full md:w-48 h-24 flex-shrink-0">
											<Image
												src={ad.imageUrl}
												alt="Advertisement"
												fill
												className="rounded-lg object-contain"
											/>
										</div>
									)}

									{/* Details */}
									<div className="flex-1 space-y-2">
										<div className="flex items-center gap-3 flex-wrap">
											<span
												className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
													ad.isActive
														? "bg-green-500/20 text-green-400 border border-green-400/30"
														: "bg-slate-500/20 text-slate-400 border border-slate-400/30"
												}`}
											>
												{ad.isActive ? "Active" : "Inactive"}
											</span>
											{ad.zipCode && (
												<span className="text-xs text-slate-400">
													📍 {ad.zipCode}
												</span>
											)}
										</div>

										{ad.url && (
											<p className="text-xs text-slate-400 break-all">
												🔗 {ad.url}
											</p>
										)}

										<div className="flex gap-4 text-xs text-slate-500">
											<span>👁️ {ad.impressions} impressions</span>
											<span>🖱️ {ad.clicks} clicks</span>
										</div>

										<p className="text-xs text-slate-500">
											Updated: {new Date(ad.updatedAt).toLocaleDateString()}
										</p>
									</div>

									{/* Actions */}
									<div className="flex md:flex-col gap-2 flex-wrap md:flex-nowrap">
										<button
											onClick={() => setEditingAd(ad)}
											className="rounded bg-sky-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-sky-700"
										>
											Edit
										</button>
										<button
											onClick={() => handleToggleActive(ad)}
											className={`rounded px-3 py-1.5 text-xs font-medium text-white transition ${
												ad.isActive
													? "bg-orange-600 hover:bg-orange-700"
													: "bg-green-600 hover:bg-green-700"
											}`}
										>
											{ad.isActive ? "Deactivate" : "Activate"}
										</button>
										<button
											onClick={() => handleDeleteAdvertisement(ad.id)}
											disabled={deletingAdId === ad.id}
											className="rounded bg-red-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
										>
											{deletingAdId === ad.id ? "Deleting..." : "Delete"}
										</button>
									</div>
								</div>
							</div>
						))}
					</div>
				)}
			</div>
		</section>
	);
}
