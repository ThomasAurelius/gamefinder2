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
	const [adUrl, setAdUrl] = useState("");
	const [uploadingAd, setUploadingAd] = useState(false);
	const [savingAd, setSavingAd] = useState(false);

	// Badge management state
	const [badges, setBadges] = useState<Array<{
		id: string;
		name: string;
		description: string;
		imageUrl: string;
		color?: string;
		isSelfAssignable?: boolean;
	}>>([]);
	const [userBadges, setUserBadges] = useState<Array<{
		id: string;
		badgeId: string;
		name: string;
		description: string;
		imageUrl: string;
		color?: string;
		awardedAt: Date;
		isDisplayed: boolean;
	}>>([]);
	const [loadingBadges, setLoadingBadges] = useState(false);
	const [editingBadge, setEditingBadge] = useState<{
		id?: string;
		name: string;
		description: string;
		imageUrl: string;
		color: string;
		isSelfAssignable: boolean;
	} | null>(null);
	const [savingBadge, setSavingBadge] = useState(false);
	const [uploadingBadgeImage, setUploadingBadgeImage] = useState(false);
	const [badgeMessage, setBadgeMessage] = useState("");
	const [searchUsername, setSearchUsername] = useState("");
	const [searchedUser, setSearchedUser] = useState<{
		userId: string;
		name: string;
		commonName: string;
	} | null>(null);
	const [searchingUser, setSearchingUser] = useState(false);
	const [awardingBadge, setAwardingBadge] = useState(false);
	const [assigningSelfBadge, setAssigningSelfBadge] = useState(false);

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
					setAdZipCode(adData.zipCode || "");
					setAdUrl(adData.url || "");

					// Load flags
					loadFlags();
					
					// Load badges for admin
					loadBadges();
				}

				// Load user badges (for all users)
				loadUserBadges();

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
				body: JSON.stringify({ imageUrl: adImageUrl, isActive: adIsActive, zipCode: adZipCode, url: adUrl }),
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

	async function loadBadges() {
		setLoadingBadges(true);
		try {
			const response = await fetch("/api/badges");
			if (response.ok) {
				const data = await response.json();
				setBadges(data);
			}
		} catch (error) {
			console.error("Failed to load badges:", error);
		} finally {
			setLoadingBadges(false);
		}
	}

	async function loadUserBadges() {
		try {
			const response = await fetch("/api/user-badges");
			if (response.ok) {
				const data = await response.json();
				setUserBadges(data);
			}
		} catch (error) {
			console.error("Failed to load user badges:", error);
		}
	}

	const handleBadgeImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;

		setUploadingBadgeImage(true);
		setBadgeMessage("");

		try {
			const formData = new FormData();
			formData.append("file", file);
			formData.append("type", "badge");

			const response = await fetch("/api/upload", {
				method: "POST",
				body: formData,
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.error || "Failed to upload image");
			}

			const { url } = await response.json();
			if (editingBadge) {
				setEditingBadge({ ...editingBadge, imageUrl: url });
			}
			setBadgeMessage("Image uploaded successfully!");
			setTimeout(() => setBadgeMessage(""), 3000);
		} catch (err) {
			const errorMessage = err instanceof Error ? err.message : "Failed to upload image";
			setBadgeMessage(errorMessage);
		} finally {
			setUploadingBadgeImage(false);
		}
	};

	const handleSaveBadge = async () => {
		if (!editingBadge) return;

		setSavingBadge(true);
		setBadgeMessage("");

		try {
			const method = editingBadge.id ? "PUT" : "POST";
			const body = editingBadge.id 
				? { id: editingBadge.id, name: editingBadge.name, description: editingBadge.description, imageUrl: editingBadge.imageUrl, color: editingBadge.color, isSelfAssignable: editingBadge.isSelfAssignable }
				: { name: editingBadge.name, description: editingBadge.description, imageUrl: editingBadge.imageUrl, color: editingBadge.color, isSelfAssignable: editingBadge.isSelfAssignable };

			const response = await fetch("/api/badges", {
				method,
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(body),
			});

			if (!response.ok) {
				throw new Error("Failed to save badge");
			}

			setBadgeMessage("Badge saved successfully!");
			setTimeout(() => setBadgeMessage(""), 3000);
			setEditingBadge(null);
			loadBadges();
		} catch (error) {
			console.error("Failed to save badge:", error);
			setBadgeMessage("Failed to save badge. Please try again.");
		} finally {
			setSavingBadge(false);
		}
	};

	const handleDeleteBadge = async (badgeId: string) => {
		if (!confirm("Are you sure you want to delete this badge? This will remove it from all users.")) {
			return;
		}

		try {
			const response = await fetch(`/api/badges?id=${badgeId}`, {
				method: "DELETE",
			});

			if (!response.ok) {
				throw new Error("Failed to delete badge");
			}

			setBadgeMessage("Badge deleted successfully!");
			setTimeout(() => setBadgeMessage(""), 3000);
			loadBadges();
		} catch (error) {
			console.error("Failed to delete badge:", error);
			setBadgeMessage("Failed to delete badge. Please try again.");
		}
	};

	const handleToggleBadgeDisplay = async (badgeId: string, isDisplayed: boolean) => {
		try {
			const response = await fetch("/api/user-badges", {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ badgeId, isDisplayed }),
			});

			if (!response.ok) {
				throw new Error("Failed to update badge display preference");
			}

			// Update local state
			setUserBadges(prevBadges => 
				prevBadges.map(b => 
					b.badgeId === badgeId ? { ...b, isDisplayed } : b
				)
			);
		} catch (error) {
			console.error("Failed to update badge display:", error);
		}
	};

	const handleSearchUser = async () => {
		if (!searchUsername.trim()) {
			setBadgeMessage("Please enter a username");
			return;
		}

		setSearchingUser(true);
		setBadgeMessage("");

		try {
			const response = await fetch(`/api/public/users/search?username=${encodeURIComponent(searchUsername)}`);
			if (!response.ok) {
				throw new Error("User not found");
			}

			const userData = await response.json();
			setSearchedUser(userData);
		} catch (error) {
			console.error("Failed to search user:", error);
			setBadgeMessage("User not found. Please check the username.");
			setSearchedUser(null);
		} finally {
			setSearchingUser(false);
		}
	};

	const handleAwardBadge = async (badgeId: string) => {
		if (!searchedUser) return;

		setAwardingBadge(true);
		setBadgeMessage("");

		try {
			const response = await fetch("/api/admin/user-badges", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ userId: searchedUser.userId, badgeId }),
			});

			if (!response.ok) {
				throw new Error("Failed to award badge");
			}

			setBadgeMessage(`Badge awarded to ${searchedUser.commonName || searchedUser.name} successfully!`);
			setTimeout(() => setBadgeMessage(""), 3000);
		} catch (error) {
			console.error("Failed to award badge:", error);
			setBadgeMessage("Failed to award badge. User may already have this badge.");
		} finally {
			setAwardingBadge(false);
		}
	};

	const handleSelfAssignBadge = async (badgeId: string) => {
		setAssigningSelfBadge(true);
		setBadgeMessage("");

		try {
			const response = await fetch("/api/user-badges", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ badgeId }),
			});

			if (!response.ok) {
				throw new Error("Failed to assign badge");
			}

			setBadgeMessage("Badge assigned successfully!");
			setTimeout(() => setBadgeMessage(""), 3000);
			// Reload user badges to show the newly assigned badge
			loadUserBadges();
		} catch (error) {
			console.error("Failed to self-assign badge:", error);
			setBadgeMessage("Failed to assign badge. You may already have this badge.");
		} finally {
			setAssigningSelfBadge(false);
		}
	};

	const handleRemoveBadge = async (userId: string, badgeId: string, userName: string) => {
		if (!confirm(`Are you sure you want to remove this badge from ${userName}?`)) {
			return;
		}

		try {
			const response = await fetch(`/api/admin/user-badges?userId=${userId}&badgeId=${badgeId}`, {
				method: "DELETE",
			});

			if (!response.ok) {
				throw new Error("Failed to remove badge");
			}

			setBadgeMessage("Badge removed successfully!");
			setTimeout(() => setBadgeMessage(""), 3000);
		} catch (error) {
			console.error("Failed to remove badge:", error);
			setBadgeMessage("Failed to remove badge. Please try again.");
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
								Add a zip code to show the ad only within 50 miles of that location.
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
										Leave blank to show to all users. If provided, ad will only show within 50 miles.
									</p>
								</div>

								<div className="space-y-2">
									<label
										htmlFor="ad-url"
										className="block text-sm font-medium text-slate-200"
									>
										URL (optional)
									</label>
									<input
										id="ad-url"
										type="url"
										value={adUrl}
										onChange={(e) => setAdUrl(e.target.value)}
										placeholder="https://example.com"
										className="w-full max-w-xs rounded-lg border border-slate-700 bg-slate-950/60 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
									/>
									<p className="text-xs text-slate-500">
										When users click the ad, they will be taken to this URL in a new window.
									</p>
								</div>

								{adImageUrl && (
									<div className="relative w-full max-w-md" style={{ aspectRatio: "2/1" }}>
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
										{uploadingAd ? "Uploading..." : "Upload Image (800x400)"}
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
										Recommended size: 800x400 pixels. Max file size: 5MB
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

					{isAdmin && (
						<div className="rounded-lg border border-amber-700/50 bg-amber-900/20 p-4">
							<h2 className="text-sm font-medium text-amber-200">
								Admin: Badge Management
							</h2>
							<p className="mt-2 text-xs text-slate-400">
								Create and manage badges that can be awarded to users.
							</p>

							<div className="mt-4 space-y-4">
								{/* Badge Creation/Edit Form */}
								{editingBadge && (
									<div className="rounded-lg border border-slate-700 bg-slate-950/60 p-4 space-y-3">
										<h3 className="text-sm font-medium text-slate-200">
											{editingBadge.id ? "Edit Badge" : "Create New Badge"}
										</h3>
										
										<div className="space-y-2">
											<label className="block text-sm font-medium text-slate-200">
												Name
											</label>
											<input
												type="text"
												value={editingBadge.name}
												onChange={(e) => setEditingBadge({ ...editingBadge, name: e.target.value })}
												placeholder="Badge Name"
												className="w-full rounded-lg border border-slate-700 bg-slate-950/60 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
											/>
										</div>

										<div className="space-y-2">
											<label className="block text-sm font-medium text-slate-200">
												Description
											</label>
											<textarea
												value={editingBadge.description}
												onChange={(e) => setEditingBadge({ ...editingBadge, description: e.target.value })}
												placeholder="Badge Description"
												rows={2}
												className="w-full rounded-lg border border-slate-700 bg-slate-950/60 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
											/>
										</div>

										<div className="space-y-2">
											<label className="block text-sm font-medium text-slate-200">
												Color (hex code, optional)
											</label>
											<input
												type="text"
												value={editingBadge.color}
												onChange={(e) => setEditingBadge({ ...editingBadge, color: e.target.value })}
												placeholder="#94a3b8"
												className="w-full max-w-xs rounded-lg border border-slate-700 bg-slate-950/60 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
											/>
										</div>

										<div className="flex items-center gap-2">
											<input
												type="checkbox"
												id="self-assignable"
												checked={editingBadge.isSelfAssignable}
												onChange={(e) => setEditingBadge({ ...editingBadge, isSelfAssignable: e.target.checked })}
												className="h-5 w-5 rounded border-slate-700 bg-slate-950/60 text-amber-500 outline-none transition focus:ring-2 focus:ring-amber-500/40"
											/>
											<label htmlFor="self-assignable" className="text-sm text-slate-300">
												Allow users to self-assign this badge
											</label>
										</div>

										{editingBadge.imageUrl && (
											<div className="flex items-center gap-3">
												<div className="relative h-16 w-16 overflow-hidden rounded-lg border border-slate-700">
													<Image
														src={editingBadge.imageUrl}
														alt="Badge preview"
														fill
														className="object-cover"
													/>
												</div>
											</div>
										)}

										<div className="space-y-2">
											<label
												htmlFor="badge-image-upload"
												className="inline-block cursor-pointer rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-sky-700"
											>
												{uploadingBadgeImage ? "Uploading..." : "Upload Badge Image"}
											</label>
											<input
												id="badge-image-upload"
												type="file"
												accept="image/jpeg,image/png,image/webp,image/gif"
												onChange={handleBadgeImageUpload}
												disabled={uploadingBadgeImage}
												className="hidden"
											/>
											<p className="text-xs text-slate-500">
												Recommended: square image, 64x64 to 256x256 pixels
											</p>
										</div>

										<div className="flex gap-2">
											<button
												onClick={handleSaveBadge}
												disabled={savingBadge || !editingBadge.name || !editingBadge.description || !editingBadge.imageUrl}
												className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-50"
											>
												{savingBadge ? "Saving..." : "Save Badge"}
											</button>
											<button
												onClick={() => setEditingBadge(null)}
												className="rounded-lg bg-slate-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-600"
											>
												Cancel
											</button>
										</div>
									</div>
								)}

								{!editingBadge && (
									<button
										onClick={() => setEditingBadge({ name: "", description: "", imageUrl: "", color: "", isSelfAssignable: false })}
										className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-amber-700"
									>
										Create New Badge
									</button>
								)}

								{/* Badge List */}
								{loadingBadges ? (
									<p className="text-sm text-slate-400">Loading badges...</p>
								) : badges.length === 0 ? (
									<p className="text-sm text-slate-400">No badges created yet.</p>
								) : (
									<div className="space-y-2">
										<h3 className="text-sm font-medium text-slate-200">Existing Badges</h3>
										<div className="grid gap-2">
											{badges.map((badge) => (
												<div
													key={badge.id}
													className="flex items-center justify-between rounded-lg border border-slate-700 bg-slate-950/60 p-3"
												>
													<div className="flex items-center gap-3">
														<div className="relative h-10 w-10 overflow-hidden">
															<Image
																src={badge.imageUrl}
																alt={badge.name}
																fill
																className="object-cover"
															/>
														</div>
														<div>
															<p className="text-sm font-medium text-slate-200">{badge.name}</p>
															<p className="text-xs text-slate-400">{badge.description}</p>
														</div>
													</div>
													<div className="flex gap-2">
														<button
															onClick={() => setEditingBadge({ id: badge.id, name: badge.name, description: badge.description, imageUrl: badge.imageUrl, color: badge.color || "", isSelfAssignable: badge.isSelfAssignable || false })}
															className="rounded bg-sky-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-sky-700"
														>
															Edit
														</button>
														<button
															onClick={() => handleDeleteBadge(badge.id)}
															className="rounded bg-red-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-red-700"
														>
															Delete
														</button>
													</div>
												</div>
											))}
										</div>
									</div>
								)}

								{/* Award Badge to User Section */}
								<div className="mt-6 rounded-lg border border-slate-700 bg-slate-950/60 p-4 space-y-3">
									<h3 className="text-sm font-medium text-slate-200">Award Badge to User</h3>
									
									<div className="flex gap-2">
										<input
											type="text"
											value={searchUsername}
											onChange={(e) => setSearchUsername(e.target.value)}
											placeholder="Enter username"
											className="flex-1 rounded-lg border border-slate-700 bg-slate-950/60 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
											onKeyDown={(e) => {
												if (e.key === "Enter") {
													handleSearchUser();
												}
											}}
										/>
										<button
											onClick={handleSearchUser}
											disabled={searchingUser}
											className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-50"
										>
											{searchingUser ? "Searching..." : "Search"}
										</button>
									</div>

									{searchedUser && (
										<div className="space-y-2">
											<p className="text-sm text-slate-300">
												Found user: <span className="font-medium text-slate-100">{searchedUser.commonName || searchedUser.name}</span>
											</p>
											
											<div className="grid gap-2">
												{badges.map((badge) => (
													<div
														key={badge.id}
														className="flex items-center justify-between rounded border border-slate-700 bg-slate-900/40 p-2"
													>
														<div className="flex items-center gap-2">
															<div className="relative h-8 w-8 overflow-hidden">
																<Image
																	src={badge.imageUrl}
																	alt={badge.name}
																	fill
																	className="object-cover"
																/>
															</div>
															<span className="text-sm text-slate-200">{badge.name}</span>
														</div>
														<button
															onClick={() => handleAwardBadge(badge.id)}
															disabled={awardingBadge}
															className="rounded bg-emerald-600 px-3 py-1 text-xs font-medium text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
														>
															Award
														</button>
													</div>
												))}
											</div>
										</div>
									)}
								</div>

								{badgeMessage && (
									<p
										className={`text-sm ${badgeMessage.includes("success") ? "text-emerald-400" : "text-rose-400"}`}
									>
										{badgeMessage}
									</p>
								)}
							</div>
						</div>
					)}

					{/* User Badge Selection */}
					{userBadges.length > 0 && (
						<div className="rounded-lg border border-sky-700/50 bg-sky-900/20 p-4">
							<h2 className="text-sm font-medium text-sky-200">
								My Badges
							</h2>
							<p className="mt-2 text-xs text-slate-400">
								Select which badges to display on your profile. Unchecked badges will be hidden from other users.
							</p>

							<div className="mt-4 space-y-2">
								{userBadges.map((badge) => (
									<div
										key={badge.id}
										className="flex items-center justify-between rounded-lg border border-slate-700 bg-slate-950/60 p-3"
									>
										<div className="flex items-center gap-3">
											<div className="relative h-10 w-10 overflow-hidden">
												<Image
													src={badge.imageUrl}
													alt={badge.name}
													fill
													className="object-cover"
												/>
											</div>
											<div>
												<p className="text-sm font-medium text-slate-200">{badge.name}</p>
												<p className="text-xs text-slate-400">{badge.description}</p>
											</div>
										</div>
										<label className="flex items-center gap-2 cursor-pointer">
											<input
												type="checkbox"
												checked={badge.isDisplayed}
												onChange={(e) => handleToggleBadgeDisplay(badge.badgeId, e.target.checked)}
												className="h-5 w-5 rounded border-slate-700 bg-slate-950/60 text-sky-500 outline-none transition focus:ring-2 focus:ring-sky-500/40"
											/>
											<span className="text-sm text-slate-300">Display</span>
										</label>
									</div>
								))}
							</div>
						</div>
					)}

					{/* Self-Assignable Badges */}
					{badges.filter(badge => badge.isSelfAssignable && !userBadges.some(ub => ub.badgeId === badge.id)).length > 0 && (
						<div className="rounded-lg border border-emerald-700/50 bg-emerald-900/20 p-4">
							<h2 className="text-sm font-medium text-emerald-200">
								Available Badges
							</h2>
							<p className="mt-2 text-xs text-slate-400">
								These badges can be assigned to yourself to indicate your role or status.
							</p>

							<div className="mt-4 space-y-2">
								{badges
									.filter(badge => badge.isSelfAssignable && !userBadges.some(ub => ub.badgeId === badge.id))
									.map((badge) => (
										<div
											key={badge.id}
											className="flex items-center justify-between rounded-lg border border-slate-700 bg-slate-950/60 p-3"
										>
											<div className="flex items-center gap-3">
												<div className="relative h-10 w-10 overflow-hidden">
													<Image
														src={badge.imageUrl}
														alt={badge.name}
														fill
														className="object-cover"
													/>
												</div>
												<div>
													<p className="text-sm font-medium text-slate-200">{badge.name}</p>
													<p className="text-xs text-slate-400">{badge.description}</p>
												</div>
											</div>
											<button
												onClick={() => handleSelfAssignBadge(badge.id)}
												disabled={assigningSelfBadge}
												className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
											>
												{assigningSelfBadge ? "Assigning..." : "Assign to Me"}
											</button>
										</div>
									))}
							</div>

							{badgeMessage && (
								<p
									className={`mt-2 text-sm ${badgeMessage.includes("success") ? "text-emerald-400" : "text-rose-400"}`}
								>
									{badgeMessage}
								</p>
							)}
						</div>
					)}
				</div>
			</div>
		</section>
	);
}
