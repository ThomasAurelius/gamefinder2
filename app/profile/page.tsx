"use client";

import { FormEvent, useEffect, useState } from "react";
import { GAME_OPTIONS, TIME_SLOTS } from "@/lib/constants";
import { TIMEZONE_OPTIONS, DEFAULT_TIMEZONE } from "@/lib/timezone";

const ROLE_OPTIONS = ["Healer", "Damage", "Support", "DM", "Other"] as const;

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
	const [bio, setBio] = useState("");
	const [selectedGames, setSelectedGames] = useState<string[]>([]);
	const [favoriteGames, setFavoriteGames] = useState<string[]>([]);
	const [availability, setAvailability] = useState<Record<string, string[]>>(
		() => createDefaultAvailability()
	);
	const [timezone, setTimezone] = useState<string>(DEFAULT_TIMEZONE);
	const [avatarUrl, setAvatarUrl] = useState("");
	const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

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
				setBio(profile.bio ?? "");
				setSelectedGames(profile.games ?? []);
				setTimezone(profile.timezone ?? DEFAULT_TIMEZONE);
				setAvatarUrl(profile.avatarUrl ?? "");
				const normalizedGames = profile.games ?? [];
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

			setFavoriteGames((favorites) =>
				favorites.filter((favoriteGame) => next.includes(favoriteGame))
			);

			return next;
		});
	};

	const toggleFavoriteGame = (game: string) => {
		if (!selectedGames.includes(game)) {
			return;
		}

		setFavoriteGames((prev) =>
			prev.includes(game)
				? prev.filter((item) => item !== game)
				: [...prev, game]
		);
	};

	const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (!file) return;

		setIsUploadingAvatar(true);
		setSaveError(null);

		try {
			const formData = new FormData();
			formData.append("file", file);
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
			setAvatarUrl(url);

			// Save the avatar URL to the user's profile in the database
			const profilePayload: ProfilePayload = {
				name,
				commonName,
				location,
				zipCode,
				bio,
				games: selectedGames,
				favoriteGames,
				availability,
				primaryRole,
				timezone,
				avatarUrl: url,
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
		} catch (error) {
			setSaveError(error instanceof Error ? error.message : "Failed to upload avatar");
		} finally {
			setIsUploadingAvatar(false);
		}
	};

	const toggleAvailability = (day: string, timeSlot: string) => {
		setAvailability((prev) => {
			const daySlots = prev[day] ?? [];
			const exists = daySlots.includes(timeSlot);
			const updatedSlots = exists
				? daySlots.filter((slot) => slot !== timeSlot)
				: [...daySlots, timeSlot];

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

		const payload: ProfilePayload = {
			name,
			commonName,
			location,
			zipCode,
			bio,
			games: selectedGames,
			favoriteGames,
			availability,
			primaryRole,
			timezone,
			avatarUrl,
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
		<section className="space-y-10">
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
				<section className="rounded-2xl border border-slate-800/60 bg-slate-900/40 p-6 shadow-lg shadow-slate-900/30">
					<h2 className="mb-4 text-lg font-semibold text-slate-100">Avatar</h2>
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
									{commonName ? commonName.charAt(0).toUpperCase() : "?"}
								</div>
							)}
						</div>
						<div className="flex-1 space-y-2">
							<label
								htmlFor="avatar-upload"
								className="inline-block cursor-pointer rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-50"
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

				<section className="grid gap-6 rounded-2xl border border-slate-800/60 bg-slate-900/40 p-6 shadow-lg shadow-slate-900/30 md:grid-cols-2">
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
						<input
							id="location"
							value={location}
							onChange={(event) => setLocation(event.target.value)}
							placeholder="City, State/Province"
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
							Select your timezone to ensure dates are displayed correctly.
						</p>
					</div>
				</section>

				<section className="space-y-3 rounded-2xl border border-slate-800/60 bg-slate-900/40 p-6 shadow-lg shadow-slate-900/30">
					<div className="flex items-center justify-between gap-4">
						<div>
							<h2 className="text-lg font-semibold text-slate-100">
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

				<section className="space-y-6 rounded-2xl border border-slate-800/60 bg-slate-900/40 p-6 shadow-lg shadow-slate-900/30">
					<div className="space-y-1">
						<h2 className="text-lg font-semibold text-slate-100">
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
				</section>

				<section className="space-y-4 rounded-2xl border border-slate-800/60 bg-slate-900/40 p-6 shadow-lg shadow-slate-900/30">
					<div className="space-y-1">
						<h2 className="text-lg font-semibold text-slate-100">
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
					</div>
				</section>

				<section className="space-y-5 rounded-2xl border border-slate-800/60 bg-slate-900/40 p-6 shadow-lg shadow-slate-900/30">
					<div className="space-y-1">
						<h2 className="text-lg font-semibold text-slate-100">
							Availability
						</h2>
						<p className="text-sm text-slate-400">
							Toggle the hours you are open to play. Availability is
							tracked per day with one-hour precision so groups can
							coordinate easily.
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
								<div className="flex flex-wrap gap-2">
									{TIME_SLOTS.map((slot) => {
										const active = availability[day]?.includes(slot);
										return (
											<button
												key={slot}
												type="button"
												onClick={() =>
													toggleAvailability(day, slot)
												}
												className={tagButtonClasses(active, {
													size: "sm",
												})}
											>
												{slot}
											</button>
										);
									})}
								</div>
							</div>
						))}
					</div>
				</section>

				<section className="space-y-4 rounded-2xl border border-slate-800/60 bg-slate-900/40 p-6 shadow-lg shadow-slate-900/30">
					<div className="space-y-1">
						<h2 className="text-lg font-semibold text-slate-100">
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

				<div className="flex flex-col items-start gap-3 rounded-2xl border border-slate-800/60 bg-slate-900/40 p-6 shadow-lg shadow-slate-900/30">
					<button
						type="submit"
						className="rounded-lg bg-sky-500 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-300 disabled:cursor-not-allowed disabled:opacity-60"
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
	);
}
