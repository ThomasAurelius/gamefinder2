"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";

export default function SettingsPage() {
	const [isAdmin, setIsAdmin] = useState(false);
	const [announcement, setAnnouncement] = useState("");
	const [isActive, setIsActive] = useState(false);
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [message, setMessage] = useState("");
	const [canPostPaidGames, setCanPostPaidGames] = useState(false);
	const [isRedirectingToPortal, setIsRedirectingToPortal] = useState(false);
	const [checkingStripeStatus, setCheckingStripeStatus] = useState(false);
	const [stripeOnboardingComplete, setStripeOnboardingComplete] = useState(false);
	const [flags, setFlags] = useState<Array<{
		id: string;
		taleId: string;
		flaggedBy: string;
		flaggerName: string;
		flagReason: string;
		flagComment?: string;
		flaggedAt: Date;
		tale?: {
			id: string;
			title: string;
			content: string;
			userId: string;
		};
	}>>([]);
	const [loadingFlags, setLoadingFlags] = useState(false);
	const [adImageUrl, setAdImageUrl] = useState("");
	const [adIsActive, setAdIsActive] = useState(false);
	const [adZipCode, setAdZipCode] = useState("");
	const [uploadingAd, setUploadingAd] = useState(false);
	const [savingAd, setSavingAd] = useState(false);

	useEffect(() => {
		async function checkAdminAndLoadAnnouncement() {
			try {
				// Check admin status
				const statusRes = await fetch("/api/admin/status");
				const statusData = await statusRes.json();
				setIsAdmin(statusData.isAdmin);

				// Load current announcement if admin
				if (statusData.isAdmin) {
					const announcementRes = await fetch("/api/announcements");
					const announcementData = await announcementRes.json();
					setAnnouncement(announcementData.message || "");
					setIsActive(announcementData.isActive || false);

					// Load advertisement
					const adRes = await fetch("/api/advertisements");
					const adData = await adRes.json();
					setAdImageUrl(adData.imageUrl || "");
					setAdIsActive(adData.isActive || false);

					// Load flags
					loadFlags();
				}

				// Load user profile to check canPostPaidGames
				const profileRes = await fetch("/api/profile");
				if (profileRes.ok) {
					const profileData = await profileRes.json();
					setCanPostPaidGames(profileData.canPostPaidGames || false);
					
					// If user has paid games enabled, check Stripe onboarding status
					if (profileData.canPostPaidGames) {
						setCheckingStripeStatus(true);
						try {
							const stripeRes = await fetch("/api/stripe/connect/status");
							if (stripeRes.ok) {
								const stripeData = await stripeRes.json();
								setStripeOnboardingComplete(stripeData.onboardingComplete || false);
							}
						} catch (err) {
							console.error("Failed to check Stripe status:", err);
						} finally {
							setCheckingStripeStatus(false);
						}
					}
				}
			} catch (error) {
				console.error("Failed to load settings:", error);
			} finally {
				setLoading(false);
			}
		}

		checkAdminAndLoadAnnouncement();
	}, []);

	const handleManageBilling = async () => {
		try {
			setIsRedirectingToPortal(true);
			setMessage("");

			const response = await fetch("/api/stripe/create-portal-session", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					returnUrl: `${window.location.origin}/settings`,
				}),
			});

			if (!response.ok) {
				throw new Error("Failed to create portal session");
			}

			const data = await response.json();
			
			// Redirect to Stripe Customer Portal
			window.location.href = data.url;
		} catch (error) {
			console.error("Failed to open billing portal:", error);
			setMessage("Failed to open billing portal. Please try again.");
			setIsRedirectingToPortal(false);
		}
	};

	const handleSaveAnnouncement = async () => {
		setSaving(true);
		setMessage("");

		try {
			const response = await fetch("/api/announcements", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ message: announcement, isActive }),
			});

			if (!response.ok) {
				throw new Error("Failed to save announcement");
			}

			setMessage("Announcement saved successfully!");
			setTimeout(() => setMessage(""), 3000);
		} catch (error) {
			console.error("Failed to save announcement:", error);
			setMessage("Failed to save announcement. Please try again.");
		} finally {
			setSaving(false);
		}
	};

	const loadFlags = async () => {
		try {
			setLoadingFlags(true);
			const response = await fetch("/api/admin/flags");
			if (response.ok) {
				const data = await response.json();
				setFlags(data);
			}
		} catch (error) {
			console.error("Failed to load flags:", error);
		} finally {
			setLoadingFlags(false);
		}
	};

	const handleFlagAction = async (flagId: string, taleId: string, action: "allow" | "delete") => {
		setMessage("");

		try {
			const response = await fetch("/api/admin/flags", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ flagId, taleId, action }),
			});

			if (!response.ok) {
				throw new Error("Failed to resolve flag");
			}

			setMessage(`Flag ${action === "delete" ? "resolved and content deleted" : "resolved and content allowed"} successfully!`);
			setTimeout(() => setMessage(""), 3000);
			
			// Reload flags
			loadFlags();
		} catch (error) {
			console.error("Failed to resolve flag:", error);
			setMessage("Failed to resolve flag. Please try again.");
		}
	};

	const handleAdImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;

		setUploadingAd(true);
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
			setAdImageUrl(url);
			setMessage("Image uploaded successfully!");
			setTimeout(() => setMessage(""), 3000);
		} catch (err) {
			const errorMessage = err instanceof Error ? err.message : "Failed to upload image";
			setMessage(errorMessage);
		} finally {
			setUploadingAd(false);
		}
	};

	const handleSaveAdvertisement = async () => {
		setSavingAd(true);
		setMessage("");

		try {
			const response = await fetch("/api/advertisements", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ imageUrl: adImageUrl, isActive: adIsActive, zipCode: adZipCode }),
			});

			if (!response.ok) {
				throw new Error("Failed to save advertisement");
			}

			setMessage("Advertisement saved successfully!");
			setTimeout(() => setMessage(""), 3000);
		} catch (error) {
			console.error("Failed to save advertisement:", error);
			setMessage("Failed to save advertisement. Please try again.");
		} finally {
			setSavingAd(false);
		}
	};

	return (
		<section className="space-y-4">
			<h1 className="text-2xl font-semibold">Settings</h1>
			<p className="text-sm text-slate-300">
				Configure account security, notification preferences, and connected
				services from this settings hub.
			</p>

			<div className="space-y-6 rounded-2xl border border-slate-800/60 bg-slate-900/40 p-6 shadow-lg shadow-slate-900/30">
				<div className="space-y-4">
					<div className="rounded-lg border border-slate-700/50 bg-slate-800/30 p-4">
						<h2 className="text-sm font-medium text-slate-200">
							Profile Settings
						</h2>
						<p className="mt-2 text-xs text-slate-400">
							Timezone and other profile settings are now managed in your
							Profile page.
						</p>
						<Link
							href="/profile"
							className="mt-3 inline-block rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-sky-700"
						>
							Go to Profile
						</Link>
					</div>

					<div className="rounded-lg border border-slate-700/50 bg-slate-800/30 p-4">
						<h2 className="text-sm font-medium text-slate-200">
							Subscriptions
						</h2>
						<p className="mt-2 text-xs text-slate-400">
							View and manage your campaign subscriptions.
						</p>
						<Link
							href="/subscriptions"
							className="mt-3 inline-block rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-sky-700"
						>
							View Subscriptions
						</Link>
					</div>

					<div className="rounded-lg border border-slate-700/50 bg-slate-800/30 p-4">
						<h2 className="text-sm font-medium text-slate-200">
							Paid Games
						</h2>
						<p className="mt-2 text-xs text-slate-400">
							Enable the ability to post paid campaigns and charge
							players for game sessions.
						</p>
						{canPostPaidGames ? (
							<div className="mt-3 space-y-3">
								<div className="flex items-center gap-2">
									<span className="text-sm text-emerald-400">
										✓ Paid games enabled
									</span>
								</div>
								<button
									onClick={handleManageBilling}
									disabled={isRedirectingToPortal}
									className="inline-block rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-50"
								>
									{isRedirectingToPortal ? "Opening Portal..." : "Manage Billing"}
								</button>
							</div>
						) : (
							<Link
								href="/terms-paid-games?from=settings"
								className="mt-3 inline-block rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-sky-700"
							>
								Enable Paid Games
							</Link>
						)}
					</div>

					{loading ? (
						<div className="rounded-lg border border-slate-700/50 bg-slate-800/30 p-4">
							<p className="text-sm text-slate-400">Loading...</p>
						</div>
					) : isAdmin ? (
						<div className="rounded-lg border border-amber-700/50 bg-amber-900/20 p-4">
							<h2 className="text-sm font-medium text-amber-200">
								Admin: Site Announcement
							</h2>
							<p className="mt-2 text-xs text-slate-400">
								Create an announcement that will be displayed to users
								when they first visit the site.
							</p>

							<div className="mt-4 space-y-3">
								<label className="flex items-center gap-2">
									<input
										type="checkbox"
										checked={isActive}
										onChange={(e) => setIsActive(e.target.checked)}
										className="h-5 w-5 rounded border-slate-700 bg-slate-950/60 text-amber-500 outline-none transition focus:ring-2 focus:ring-amber-500/40"
									/>
									<span className="text-sm text-slate-200">
										Show announcement to users
									</span>
								</label>

								<textarea
									value={announcement}
									onChange={(e) => setAnnouncement(e.target.value)}
									placeholder="Enter announcement message..."
									rows={10}
									className="w-full max-h-96 resize-y overflow-y-auto rounded-md border border-slate-700 bg-slate-950/60 px-3 py-2 text-sm text-slate-100 outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-500/40"
								/>

								<button
									onClick={handleSaveAnnouncement}
									disabled={saving}
									className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-50"
								>
									{saving ? "Saving..." : "Save Announcement"}
								</button>

								{message && (
									<p
										className={`text-sm ${message.includes("success") ? "text-emerald-400" : "text-rose-400"}`}
									>
										{message}
									</p>
								)}
							</div>
						</div>
					) : (
						<div className="rounded-lg border border-slate-700/50 bg-slate-800/30 p-4">
							<p className="text-sm text-slate-400">
								Additional settings will be available here in the
								future.
							</p>
						</div>
					)}

					{isAdmin && (
						<div className="rounded-lg border border-amber-700/50 bg-amber-900/20 p-4">
							<h2 className="text-sm font-medium text-amber-200">
								Admin: Content Flags
							</h2>
							<p className="mt-2 text-xs text-slate-400">
								Review and manage flagged Tall Tales content.
							</p>

							<div className="mt-4 space-y-3">
								{loadingFlags ? (
									<p className="text-sm text-slate-400">Loading flags...</p>
								) : flags.length === 0 ? (
									<p className="text-sm text-slate-400">No unresolved flags.</p>
								) : (
									<div className="space-y-3">
										{flags.map((flag) => (
											<div
												key={flag.id}
												className="rounded-lg border border-slate-700 bg-slate-950/60 p-3 space-y-2"
											>
												<div className="flex items-start justify-between">
													<div className="flex-1">
														<p className="text-sm font-medium text-slate-200">
															{flag.tale?.title || "Tale not found"}
														</p>
														<p className="text-xs text-slate-400 mt-1">
															Reason: <span className="text-amber-400 capitalize">{flag.flagReason}</span>
														</p>
														<p className="text-xs text-slate-400">
															Reported by: {flag.flaggerName}
														</p>
														{flag.flagComment && (
															<p className="text-xs text-slate-300 mt-1 italic">
																&quot;{flag.flagComment}&quot;
															</p>
														)}
														{flag.tale && (
															<p className="text-xs text-slate-500 mt-2 line-clamp-2">
																{flag.tale.content}
															</p>
														)}
													</div>
												</div>
												<div className="flex gap-2 pt-2">
													<button
														onClick={() => handleFlagAction(flag.id, flag.taleId, "allow")}
														className="flex-1 rounded bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-emerald-700"
													>
														Allow
													</button>
													<button
														onClick={() => handleFlagAction(flag.id, flag.taleId, "delete")}
														className="flex-1 rounded bg-red-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-red-700"
													>
														Delete
													</button>
												</div>
											</div>
										))}
									</div>
								)}
							</div>
						</div>
					)}

					{isAdmin && (
						<div className="rounded-lg border border-amber-700/50 bg-amber-900/20 p-4">
							<h2 className="text-sm font-medium text-amber-200">
								Admin: Advertisement
							</h2>
							<p className="mt-2 text-xs text-slate-400">
								Upload and manage the site advertisement (800x800 image).
								Add a zip code to show the ad only within 100 miles of that location.
							</p>

							<div className="mt-4 space-y-3">
								<label className="flex items-center gap-2">
									<input
										type="checkbox"
										checked={adIsActive}
										onChange={(e) => setAdIsActive(e.target.checked)}
										className="h-5 w-5 rounded border-slate-700 bg-slate-950/60 text-amber-500 outline-none transition focus:ring-2 focus:ring-amber-500/40"
									/>
									<span className="text-sm text-slate-200">
										Display advertisement
									</span>
								</label>

								<div className="space-y-2">
									<label
										htmlFor="ad-zipcode"
										className="block text-sm font-medium text-slate-200"
									>
										Zip Code (optional)
									</label>
									<input
										id="ad-zipcode"
										type="text"
										value={adZipCode}
										onChange={(e) => setAdZipCode(e.target.value)}
										placeholder="12345"
										className="w-full max-w-xs rounded-lg border border-slate-700 bg-slate-950/60 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
									/>
									<p className="text-xs text-slate-500">
										Leave blank to show to all users. If provided, ad will only show within 100 miles.
									</p>
								</div>

								{adImageUrl && (
									<div className="relative w-full max-w-xs aspect-square">
										<Image
											src={adImageUrl}
											alt="Advertisement preview"
											fill
											className="rounded-lg border border-slate-700 object-contain"
										/>
									</div>
								)}

								<div className="space-y-2">
									<label
										htmlFor="ad-upload"
										className="inline-block cursor-pointer rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-sky-700"
									>
										{uploadingAd ? "Uploading..." : "Upload Image (800x800)"}
									</label>
									<input
										id="ad-upload"
										type="file"
										accept="image/jpeg,image/png,image/webp,image/gif"
										onChange={handleAdImageUpload}
										disabled={uploadingAd}
										className="hidden"
									/>
									<p className="text-xs text-slate-500">
										Recommended size: 800x800 pixels. Max file size: 5MB
									</p>
								</div>

								<button
									onClick={handleSaveAdvertisement}
									disabled={savingAd}
									className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-50"
								>
									{savingAd ? "Saving..." : "Save Advertisement"}
								</button>

								{message && (
									<p
										className={`text-sm ${message.includes("success") ? "text-emerald-400" : "text-rose-400"}`}
									>
										{message}
									</p>
								)}
							</div>
						</div>
					)}
				</div>
			</div>
		</section>
	);
}
