"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { GAME_OPTIONS, TIME_SLOTS, TIME_SLOT_GROUPS } from "@/lib/constants";
import { TIMEZONE_OPTIONS, DEFAULT_TIMEZONE } from "@/lib/timezone";
import AvatarCropper from "@/components/AvatarCropper";
import CityAutocomplete from "@/components/CityAutocomplete";
import { AuthGuard } from "@/components/auth-guard";

const ROLE_OPTIONS = [
	"Healer",
	"Damage",
	"Caster",
	"Support",
	"DM",
	"Other",
] as const;

type RoleOption = (typeof ROLE_OPTIONS)[number];

const DAYS_OF_WEEK = [
	"Monday",
	"Tuesday",
	"Wednesday",
	"Thursday",
	"Friday",
	"Saturday",
	"Sunday",
];

const createDefaultAvailability = () =>
	DAYS_OF_WEEK.reduce(
		(acc, day) => {
			acc[day] = [];
			return acc;
		},
		{} as Record<string, string[]>
	);

const tagButtonClasses = (
	active: boolean,
	options?: { disabled?: boolean; size?: "sm" | "md" }
) => {
	const sizeClasses =
		options?.size === "sm" ? "px-2 py-1 text-xs" : "px-3 py-1.5 text-sm";
	const baseClasses = "rounded-full border transition-colors";
	const activeClasses = active
		? "border-sky-400 bg-sky-500/20 text-sky-100"
		: "border-slate-700 bg-slate-900 text-slate-200 hover:border-slate-500";
	const disabledClasses = options?.disabled
		? "cursor-not-allowed opacity-40 hover:border-slate-700"
		: "";

	return [sizeClasses, baseClasses, activeClasses, disabledClasses].join(" ");
};

type ProfilePayload = {
	name: string;
	commonName: string;
	location: string;
	zipCode: string;
	bio: string;
	games: string[];
	favoriteGames: string[];
	availability: Record<string, string[]>;
	primaryRole: RoleOption | "";
	timezone?: string;
	avatarUrl?: string;
	phoneNumber?: string;
	bggUsername?: string;
};

const sortAvailabilitySlots = (slots: string[]) =>
	[...new Set(slots)].sort(
		(a, b) => TIME_SLOTS.indexOf(a) - TIME_SLOTS.indexOf(b)
	);

export default function ProfilePage() {
	const [name, setName] = useState("");
	const [commonName, setCommonName] = useState("");
	const [location, setLocation] = useState("");
	const [zipCode, setZipCode] = useState("");
	const [phoneNumber, setPhoneNumber] = useState("");
	const [bio, setBio] = useState("");
	const [selectedGames, setSelectedGames] = useState<string[]>([]);
	const [customGames, setCustomGames] = useState<string[]>([]);
	const [customGameInput, setCustomGameInput] = useState("");
	const [favoriteGames, setFavoriteGames] = useState<string[]>([]);
	const [availability, setAvailability] = useState<Record<string, string[]>>(
		() => createDefaultAvailability()
	);
	const [timezone, setTimezone] = useState<string>(DEFAULT_TIMEZONE);
	const [avatarUrl, setAvatarUrl] = useState("");
	const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
	const [imageToCrop, setImageToCrop] = useState<string | null>(null);
	const [bggUsername, setBggUsername] = useState("");

	const [primaryRole, setPrimaryRole] = useState<RoleOption | "">("");
	const [isSaving, setIsSaving] = useState(false);
	const [saveError, setSaveError] = useState<string | null>(null);
	const [saveSuccess, setSaveSuccess] = useState(false);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		const fetchProfile = async () => {
			try {
				const response = await fetch("/api/profile");
				if (!response.ok) {
					throw new Error("Failed to load profile");
				}

				const profile: ProfilePayload = await response.json();
				const normalizedAvailability = createDefaultAvailability();

				Object.entries(profile.availability ?? {}).forEach(
					([day, slots]) => {
						if (Array.isArray(slots)) {
							normalizedAvailability[day] = sortAvailabilitySlots(slots);
						}
					}
				);

				setName(profile.name ?? "");
				setCommonName(profile.commonName ?? "");
				setLocation(profile.location ?? "");
				setZipCode(profile.zipCode ?? "");
				setPhoneNumber(profile.phoneNumber ?? "");
				setBio(profile.bio ?? "");
				const normalizedGames = profile.games ?? [];
				// Separate preset games from custom games
				const presetGames = normalizedGames.filter((game) =>
					GAME_OPTIONS.includes(game)
				);
				const customGames = normalizedGames.filter(
					(game) => !GAME_OPTIONS.includes(game)
				);
				setSelectedGames(presetGames);
				setCustomGames(customGames);
				setTimezone(profile.timezone ?? DEFAULT_TIMEZONE);
				setAvatarUrl(profile.avatarUrl ?? "");
				setBggUsername(profile.bggUsername ?? "");
				setFavoriteGames(
					(profile.favoriteGames ?? []).filter((game) =>
						normalizedGames.includes(game)
					)
				);
				setAvailability(normalizedAvailability);
				const normalizedRole = ROLE_OPTIONS.includes(
					profile.primaryRole as RoleOption
				)
					? (profile.primaryRole as RoleOption)
					: "";
				setPrimaryRole(normalizedRole);
			} catch (error) {
				console.error(error);
				setSaveError("Unable to load profile data.");
			} finally {
				setIsLoading(false);
			}
		};

		fetchProfile();
	}, []);

	const remainingBioCharacters = 2000 - bio.length;

	const toggleGame = (game: string) => {
		setSelectedGames((prev) => {
			const exists = prev.includes(game);
			const next = exists
				? prev.filter((item) => item !== game)
				: [...prev, game];

			// Clean up favorites when deselecting a game
			const allGames = [...next, ...customGames];
			setFavoriteGames((favorites) =>
				favorites.filter((favoriteGame) => allGames.includes(favoriteGame))
			);

			return next;
		});
	};

	const addCustomGame = () => {
		const trimmedGame = customGameInput.trim();
		if (
			trimmedGame &&
			!customGames.includes(trimmedGame) &&
			!GAME_OPTIONS.includes(trimmedGame)
		) {
			setCustomGames((prev) => [...prev, trimmedGame]);
			setCustomGameInput("");
		}
	};

	const removeCustomGame = (game: string) => {
		setCustomGames((prev) => prev.filter((item) => item !== game));
		// Also remove from favorites if it was favorited
		setFavoriteGames((prev) => prev.filter((item) => item !== game));
	};

	const toggleFavoriteGame = (game: string) => {
		const allGames = [...selectedGames, ...customGames];
		if (!allGames.includes(game)) {
			return;
		}

		setFavoriteGames((prev) =>
			prev.includes(game)
				? prev.filter((item) => item !== game)
				: [...prev, game]
		);
	};

	const handleAvatarUpload = async (
		event: React.ChangeEvent<HTMLInputElement>
	) => {
		const file = event.target.files?.[0];
		if (!file) return;

		// Read the file and set it for cropping
		const reader = new FileReader();
		reader.onload = () => {
			setImageToCrop(reader.result as string);
		};
		reader.readAsDataURL(file);

		// Clear the input so the same file can be selected again
		event.target.value = "";
	};

	const handleCropComplete = async (croppedImageBlob: Blob) => {
		setIsUploadingAvatar(true);
		setSaveError(null);
		setImageToCrop(null);

		try {
			const formData = new FormData();
			formData.append("file", croppedImageBlob, "avatar.jpg");
			formData.append("type", "avatar");

			const response = await fetch("/api/upload", {
				method: "POST",
				body: formData,
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.error || "Failed to upload image");
			}

			const { url } = await response.json();

			// Save the avatar URL to the user's profile in the database
			const allGames = [...selectedGames, ...customGames];
			const profilePayload: ProfilePayload = {
				name,
				commonName,
				location,
				zipCode,
				bio,
				games: allGames,
				favoriteGames,
				availability,
				primaryRole,
				timezone,
				avatarUrl: url,
				phoneNumber,
				bggUsername,
			};

			const saveResponse = await fetch("/api/profile", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(profilePayload),
			});

			if (!saveResponse.ok) {
				const message = await saveResponse.text();
				throw new Error(message || "Failed to save avatar to profile");
			}

			// Only update the UI state after successful save to DB
			setAvatarUrl(url);
		} catch (error) {
			setSaveError(
				error instanceof Error ? error.message : "Failed to upload avatar"
			);
		} finally {
			setIsUploadingAvatar(false);
		}
	};

	const handleCropCancel = () => {
		setImageToCrop(null);
	};

	const [lastClickedSlot, setLastClickedSlot] = useState<
		Record<string, string>
	>({});

	const toggleAvailability = (
		day: string,
		timeSlot: string,
		shiftKey: boolean = false
	) => {
		setAvailability((prev) => {
			const daySlots = prev[day] ?? [];

			// Handle range selection with shift key
			if (shiftKey && lastClickedSlot[day]) {
				const startIdx = TIME_SLOTS.indexOf(lastClickedSlot[day]);
				const endIdx = TIME_SLOTS.indexOf(timeSlot);

				if (startIdx !== -1 && endIdx !== -1) {
					const [minIdx, maxIdx] = [
						Math.min(startIdx, endIdx),
						Math.max(startIdx, endIdx),
					];
					const slotsInRange = TIME_SLOTS.slice(minIdx, maxIdx + 1);

					// Check if all slots in range are already selected
					const allSelected = slotsInRange.every((slot) =>
						daySlots.includes(slot)
					);

					let updatedSlots: string[];
					if (allSelected) {
						// Deselect all slots in range
						updatedSlots = daySlots.filter(
							(slot) => !slotsInRange.includes(slot)
						);
					} else {
						// Select all slots in range
						const newSlots = [...daySlots];
						slotsInRange.forEach((slot) => {
							if (!newSlots.includes(slot)) {
								newSlots.push(slot);
							}
						});
						updatedSlots = newSlots;
					}

					return {
						...prev,
						[day]: sortAvailabilitySlots(updatedSlots),
					};
				}
			}

			// Normal toggle behavior
			const exists = daySlots.includes(timeSlot);
			const updatedSlots = exists
				? daySlots.filter((slot) => slot !== timeSlot)
				: [...daySlots, timeSlot];

			// Remember last clicked slot for range selection
			setLastClickedSlot((prev) => ({ ...prev, [day]: timeSlot }));

			return {
				...prev,
				[day]: sortAvailabilitySlots(updatedSlots),
			};
		});
	};

	const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		setIsSaving(true);
		setSaveError(null);
		setSaveSuccess(false);

		// Combine preset and custom games
		const allGames = [...selectedGames, ...customGames];

		const payload: ProfilePayload = {
			name,
			commonName,
			location,
			zipCode,
			bio,
			games: allGames,
			favoriteGames,
			availability,
			primaryRole,
			timezone,
			avatarUrl,
			phoneNumber,
			bggUsername,
		};

		try {
			const response = await fetch("/api/profile", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(payload),
			});

			if (!response.ok) {
				const message = await response.text();
				throw new Error(message || "Failed to save profile");
			}

			setSaveSuccess(true);
		} catch (error) {
			setSaveError(
				error instanceof Error ? error.message : "Unable to save profile"
			);
		} finally {
			setIsSaving(false);
		}
	};

	const isSubmitDisabled = isSaving || isLoading;

	return (
		<AuthGuard>
		<section className="space-y-10">
			{imageToCrop && (
				<AvatarCropper
					imageSrc={imageToCrop}
					onCropComplete={handleCropComplete}
					onCancel={handleCropCancel}
				/>
			)}
			<header className="space-y-2">
				<h1 className="text-3xl font-semibold tracking-tight">Profile</h1>
				<p className="max-w-2xl text-sm text-slate-300">
					Share the essential details about who you are, what you play, and
					when you are available. This form captures everything needed for
					other players and groups to connect with you.
				</p>
			</header>

			<form className="space-y-12" onSubmit={handleSubmit}>
				{/* Avatar Upload Section */}
				<section className="rounded-2xl border-2 border-amber-500/50 bg-gradient-to-br from-amber-600/20 via-purple-600/20 to-indigo-600/20 p-6 shadow-lg shadow-slate-900/30">
					<h2 className="mb-4 text-lg font-semibold text-amber-100">
						Avatar
					</h2>
					<div className="flex items-center gap-6">
						<div className="flex-shrink-0">
							{avatarUrl ? (
								<img
									src={avatarUrl}
									alt="Avatar"
									className="h-24 w-24 rounded-full border-2 border-slate-700 object-cover"
								/>
							) : (
								<div className="flex h-24 w-24 items-center justify-center rounded-full border-2 border-slate-700 bg-slate-800 text-2xl font-semibold text-slate-400">
									{commonName
										? commonName.charAt(0).toUpperCase()
										: "?"}
								</div>
							)}
						</div>
						<div className="flex-1 space-y-2">
							<label
								htmlFor="avatar-upload"
								className="inline-block cursor-pointer rounded-lg bg-gradient-to-r from-amber-500 via-purple-500 to-indigo-500 px-4 py-2 text-sm font-semibold text-white transition hover:from-amber-400 hover:via-purple-400 hover:to-indigo-400"
							>
								{isUploadingAvatar ? "Uploading..." : "Upload Avatar"}
							</label>
							<input
								id="avatar-upload"
								type="file"
								accept="image/jpeg,image/png,image/webp,image/gif"
								onChange={handleAvatarUpload}
								disabled={isUploadingAvatar}
								className="hidden"
							/>
							<p className="text-xs text-slate-400">
								JPG, PNG, WebP or GIF. Max 5MB.
							</p>
						</div>
					</div>
				</section>

				<section className="grid gap-6 rounded-2xl border-2 border-amber-500/50 bg-gradient-to-br from-amber-600/20 via-purple-600/20 to-indigo-600/20 p-6 shadow-lg shadow-slate-900/30 md:grid-cols-2">
					<div className="space-y-2">
						<label
							htmlFor="common-name"
							className="text-sm font-medium text-slate-200"
						>
							Common Name
						</label>
						<input
							id="common-name"
							value={commonName}
							onChange={(event) => setCommonName(event.target.value)}
							placeholder="What your party calls you"
							className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-100 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
						/>
					</div>

					<div className="space-y-2">
						<label
							htmlFor="location"
							className="text-sm font-medium text-slate-200"
						>
							Location
						</label>
						<CityAutocomplete
							id="location"
							value={location}
							onChange={setLocation}
							placeholder="Search for your city..."
							className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-100 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
						/>
					</div>

					<div className="space-y-2">
						<label
							htmlFor="zip"
							className="text-sm font-medium text-slate-200"
						>
							Zip Code
						</label>
						<input
							id="zip"
							value={zipCode}
							onChange={(event) => setZipCode(event.target.value)}
							placeholder="Postal code"
							className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-100 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
						/>
					</div>

					<div className="space-y-2">
						<label
							htmlFor="phoneNumber"
							className="text-sm font-medium text-slate-200"
						>
							Phone Number
						</label>
						<input
							id="phoneNumber"
							type="tel"
							value={phoneNumber}
							onChange={(event) => setPhoneNumber(event.target.value)}
							placeholder="(555) 123-4567"
							className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-100 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
						/>
						<p className="text-xs text-slate-400">
							Optional. Used for SMS notifications from campaign hosts.
							For privacy, your phone number is never displayed after
							saving.{" "}
							<Link
								href="/sms-consent"
								className="text-sky-400 hover:text-sky-300 underline"
							>
								Learn more about SMS notifications
							</Link>
						</p>
					</div>

					<div className="space-y-2">
						<label
							htmlFor="timezone"
							className="text-sm font-medium text-slate-200"
						>
							Timezone
						</label>
						<select
							id="timezone"
							value={timezone}
							onChange={(event) => setTimezone(event.target.value)}
							className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-100 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
						>
							{TIMEZONE_OPTIONS.map((tz) => (
								<option key={tz.value} value={tz.value}>
									{tz.label}
								</option>
							))}
						</select>
						<p className="text-xs text-slate-400">
							Select your timezone to ensure dates are displayed
							correctly.
						</p>
					</div>

					<div className="space-y-2">
						<label
							htmlFor="bggUsername"
							className="text-sm font-medium text-slate-200"
						>
							BoardGameGeek Username
						</label>
						<input
							id="bggUsername"
							type="text"
							value={bggUsername}
							onChange={(event) => setBggUsername(event.target.value)}
							placeholder="Your BGG username"
							className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-100 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
						/>
						{bggUsername && (
							<div className="flex items-center gap-3">
								<div className="flex items-center gap-2 text-x text-slate-400">
									<a
										href={`https://boardgamegeek.com/user/${encodeURIComponent(bggUsername)}`}
										target="_blank"
										rel="noopener noreferrer"
										className="text-sky-400 hover:text-sky-300 underline"
									>
										View BGG Profile
									</a>
									<span>•</span>
									<a
										href={`https://boardgamegeek.com/collection/user/${encodeURIComponent(bggUsername)}`}
										target="_blank"
										rel="noopener noreferrer"
										className="text-sky-400 hover:text-sky-300 underline"
									>
										View Collection
									</a>
								</div>
								<div className="bg-white/50 p-0.5 rounded-md">
									<img
										src="/powered_by_BGG_02_MED.png"
										alt="Powered by BoardGameGeek"
										className="h-[30px] w-[100px]"
										title="Powered by BoardGameGeek"
									/>
								</div>
							</div>
						)}
						<p className="text-xs text-slate-400">
							Optional. Link your BoardGameGeek profile and game
							collection.
						</p>
					</div>
				</section>

				<section className="space-y-3 rounded-2xl border-2 border-amber-500/50 bg-gradient-to-br from-amber-600/20 via-purple-600/20 to-indigo-600/20 p-6 shadow-lg shadow-slate-900/30">
					<div className="flex items-center justify-between gap-4">
						<div>
							<h2 className="text-lg font-semibold text-amber-100">
								Bio
							</h2>
							<p className="text-sm text-slate-400">
								Tell other players about yourself. Markdown formatting
								is supported for headings, emphasis, and lists.
							</p>
						</div>
						<span className="text-xs text-slate-500">
							{remainingBioCharacters} characters remaining
						</span>
					</div>

					<textarea
						id="bio"
						maxLength={2000}
						value={bio}
						onChange={(event) => setBio(event.target.value)}
						rows={8}
						placeholder="Share your story, experience level, and what you're looking for at the table."
						className="w-full resize-y rounded-xl border border-slate-800 bg-slate-950/80 px-4 py-3 text-sm leading-relaxed text-slate-100 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
					/>
				</section>

				<section className="space-y-6 rounded-2xl border-2 border-amber-500/50 bg-gradient-to-br from-amber-600/20 via-purple-600/20 to-indigo-600/20 p-6 shadow-lg shadow-slate-900/30">
					<div className="space-y-1">
						<h2 className="text-lg font-semibold text-amber-100">
							Games
						</h2>
						<p className="text-sm text-slate-400">
							Select every game system you play or would like to play.
							These tags will help match you with the right parties.
						</p>
					</div>

					<div className="flex flex-wrap gap-2">
						{GAME_OPTIONS.map((game) => {
							const active = selectedGames.includes(game);
							return (
								<button
									key={game}
									type="button"
									onClick={() => toggleGame(game)}
									className={tagButtonClasses(active)}
								>
									{game}
								</button>
							);
						})}
					</div>

					{selectedGames.includes("Other") && (
						<div className="space-y-3">
							<div className="flex gap-2">
								<input
									type="text"
									value={customGameInput}
									onChange={(e) => setCustomGameInput(e.target.value)}
									onKeyDown={(e) => {
										if (e.key === "Enter") {
											e.preventDefault();
											addCustomGame();
										}
									}}
									placeholder="Enter custom game name"
									className="flex-1 rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-100 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
								/>
								<button
									type="button"
									onClick={addCustomGame}
									className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-300"
								>
									Add
								</button>
							</div>
							{customGames.length > 0 && (
								<div className="flex flex-wrap gap-2">
									{customGames.map((game) => (
										<div
											key={game}
											className="flex items-center gap-1 rounded-full border border-sky-400 bg-sky-500/20 px-3 py-1.5 text-sm text-sky-100"
										>
											<span>{game}</span>
											<button
												type="button"
												onClick={() => removeCustomGame(game)}
												className="ml-1 text-sky-200 hover:text-sky-100"
												aria-label={`Remove ${game}`}
											>
												×
											</button>
										</div>
									))}
								</div>
							)}
						</div>
					)}
				</section>

				<section className="space-y-4 rounded-2xl border-2 border-amber-500/50 bg-gradient-to-br from-amber-600/20 via-purple-600/20 to-indigo-600/20 p-6 shadow-lg shadow-slate-900/30">
					<div className="space-y-1">
						<h2 className="text-lg font-semibold text-amber-100">
							Favorite Games
						</h2>
						<p className="text-sm text-slate-400">
							Choose your go-to systems from the games above. Favorites
							are only available after selecting the base game.
						</p>
					</div>

					<div className="flex flex-wrap gap-2">
						{GAME_OPTIONS.map((game) => {
							const active = favoriteGames.includes(game);
							const disabled = !selectedGames.includes(game);
							return (
								<button
									key={game}
									type="button"
									onClick={() => toggleFavoriteGame(game)}
									disabled={disabled}
									className={tagButtonClasses(active, {
										disabled,
									})}
								>
									{game}
								</button>
							);
						})}
						{customGames.map((game) => {
							const active = favoriteGames.includes(game);
							return (
								<button
									key={game}
									type="button"
									onClick={() => toggleFavoriteGame(game)}
									className={tagButtonClasses(active)}
								>
									{game}
								</button>
							);
						})}
					</div>
				</section>

				<section className="space-y-5 rounded-2xl border-2 border-amber-500/50 bg-gradient-to-br from-amber-600/20 via-purple-600/20 to-indigo-600/20 p-6 shadow-lg shadow-slate-900/30">
					<div className="space-y-1">
						<h2 className="text-lg font-semibold text-amber-100">
							Availability
						</h2>
						<p className="text-sm text-slate-400">
							Toggle the hours you are open to play. Availability is
							tracked per day with one-hour precision so groups can
							coordinate easily.{" "}
							<span className="text-sky-400">
								Tip: Hold Shift and click to select a range of times.
							</span>
						</p>
					</div>

					<div className="space-y-6">
						{DAYS_OF_WEEK.map((day) => (
							<div key={day} className="space-y-3">
								<div className="flex items-center justify-between">
									<h3 className="text-sm font-semibold text-slate-200">
										{day}
									</h3>
									<span className="text-xs text-slate-500">
										{availability[day]?.length ?? 0} hour(s) selected
									</span>
								</div>
								<div className="space-y-3">
									{TIME_SLOT_GROUPS.map((group) => (
										<div key={group.label}>
											<div className="mb-2 text-xs font-medium text-slate-400">
												{group.label}:
											</div>
											<div className="flex flex-wrap gap-2">
												{group.slots.map((slot) => {
													const active =
														availability[day]?.includes(slot);
													return (
														<button
															key={slot}
															type="button"
															onClick={(e) =>
																toggleAvailability(
																	day,
																	slot,
																	e.shiftKey
																)
															}
															className={tagButtonClasses(
																active,
																{
																	size: "sm",
																}
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

				<section className="space-y-4 rounded-2xl border-2 border-amber-500/50 bg-gradient-to-br from-amber-600/20 via-purple-600/20 to-indigo-600/20 p-6 shadow-lg shadow-slate-900/30">
					<div className="space-y-1">
						<h2 className="text-lg font-semibold text-amber-100">
							Primary Role
						</h2>
						<p className="text-sm text-slate-400">
							Highlight the role you fill most often when you join a
							table.
						</p>
					</div>

					<div className="flex flex-wrap gap-2">
						{ROLE_OPTIONS.map((role) => (
							<button
								key={role}
								type="button"
								onClick={() =>
									setPrimaryRole((current) =>
										current === role ? "" : role
									)
								}
								className={tagButtonClasses(primaryRole === role)}
							>
								{role}
							</button>
						))}
					</div>
				</section>

				<div className="flex flex-col items-start gap-3 rounded-2xl border-2 border-amber-500/50 bg-gradient-to-br from-amber-600/20 via-purple-600/20 to-indigo-600/20 p-6 shadow-lg shadow-slate-900/30">
					<button
						type="submit"
						className="rounded-lg bg-gradient-to-r from-amber-500 via-purple-500 to-indigo-500 px-4 py-2 text-sm font-semibold text-white transition hover:from-amber-400 hover:via-purple-400 hover:to-indigo-400"
						disabled={isSubmitDisabled}
					>
						{isLoading
							? "Loading profile..."
							: isSaving
								? "Saving..."
								: "Save Profile"}
					</button>
					<div aria-live="polite" className="text-sm">
						{saveSuccess && !saveError ? (
							<span className="text-emerald-400">
								Profile saved successfully.
							</span>
						) : null}
						{saveError ? (
							<span className="text-rose-400">{saveError}</span>
						) : null}
					</div>
				</div>
			</form>
		</section>
		</AuthGuard>
	);
}
