"use client";

import { useState, FormEvent, useEffect } from "react";
import { GAME_OPTIONS, TIME_SLOTS, TIME_SLOT_GROUPS } from "@/lib/constants";
import CityAutocomplete from "@/components/CityAutocomplete";
import ShareButtons from "@/components/ShareButtons";
import Link from "next/link";

const tagButtonClasses = (
	active: boolean,
	options?: { size?: "sm" | "md" }
) => {
	const sizeClasses =
		options?.size === "sm" ? "px-2 py-1 text-xs" : "px-3 py-1.5 text-sm";
	const baseClasses = "rounded-full border transition-colors";
	const activeClasses = active
		? "border-sky-400 bg-sky-500/20 text-sky-100"
		: "border-slate-700 bg-slate-900 text-slate-200 hover:border-slate-500";

	return [sizeClasses, baseClasses, activeClasses].join(" ");
};

export default function PostGamePage() {
	const [selectedGame, setSelectedGame] = useState("");
	const [customGameName, setCustomGameName] = useState("");
	const [selectedTimes, setSelectedTimes] = useState<string[]>([]);
	const [selectedDate, setSelectedDate] = useState("");
	const [description, setDescription] = useState("");
	const [maxPlayers, setMaxPlayers] = useState<number | ''>(4);
	const [submitted, setSubmitted] = useState(false);
	const [error, setError] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [imageUrl, setImageUrl] = useState("");
	const [isUploadingImage, setIsUploadingImage] = useState(false);
	const [lastClickedSlot, setLastClickedSlot] = useState<string>("");
	const [location, setLocation] = useState("");
	const [zipCode, setZipCode] = useState("");
	const [postedGameId, setPostedGameId] = useState<string | null>(null);
	
	// Payment-related state
	const [costPerSession, setCostPerSession] = useState<number | ''>('');
	
	// User profile state
	const [canPostPaidGames, setCanPostPaidGames] = useState(false);
	const [isLoadingProfile, setIsLoadingProfile] = useState(true);
	const [hasConnectAccount, setHasConnectAccount] = useState(false);
	const [isCheckingConnect, setIsCheckingConnect] = useState(false);

	useEffect(() => {
		const fetchProfile = async () => {
			try {
				const response = await fetch("/api/profile");
				if (response.ok) {
					const profileData = await response.json();
					setCanPostPaidGames(profileData.canPostPaidGames || false);
				}
			} catch (error) {
				console.error("Failed to load profile:", error);
			} finally {
				setIsLoadingProfile(false);
			}
		};

		fetchProfile();
	}, []);

	// Check Stripe Connect status when user sets a cost
	useEffect(() => {
		const checkConnectStatus = async () => {
			if (typeof costPerSession === 'number' && costPerSession > 0 && !isCheckingConnect) {
				setIsCheckingConnect(true);
				try {
					const response = await fetch("/api/stripe/connect/status");
					if (response.ok) {
						const data = await response.json();
						setHasConnectAccount(data.onboardingComplete || false);
					}
				} catch (error) {
					console.error("Failed to check Connect status:", error);
				} finally {
					setIsCheckingConnect(false);
				}
			}
		};

		checkConnectStatus();
	}, [costPerSession]);

	const toggleTime = (slot: string, shiftKey: boolean = false) => {
		setSelectedTimes((prev) => {
			// Handle range selection with shift key
			if (shiftKey && lastClickedSlot) {
				const startIdx = TIME_SLOTS.indexOf(lastClickedSlot);
				const endIdx = TIME_SLOTS.indexOf(slot);

				if (startIdx !== -1 && endIdx !== -1) {
					const [minIdx, maxIdx] = [
						Math.min(startIdx, endIdx),
						Math.max(startIdx, endIdx),
					];
					const slotsInRange = TIME_SLOTS.slice(minIdx, maxIdx + 1);

					// Check if all slots in range are already selected
					const allSelected = slotsInRange.every((s) => prev.includes(s));

					if (allSelected) {
						// Deselect all slots in range
						return prev.filter((s) => !slotsInRange.includes(s));
					} else {
						// Select all slots in range
						const newSlots = [...prev];
						slotsInRange.forEach((s) => {
							if (!newSlots.includes(s)) {
								newSlots.push(s);
							}
						});
						return newSlots;
					}
				}
			}

			// Normal toggle behavior
			setLastClickedSlot(slot);
			return prev.includes(slot)
				? prev.filter((item) => item !== slot)
				: [...prev, slot];
		});
	};

	const handleImageUpload = async (
		event: React.ChangeEvent<HTMLInputElement>
	) => {
		const file = event.target.files?.[0];
		if (!file) return;

		setIsUploadingImage(true);
		setError("");

		try {
			const formData = new FormData();
			formData.append("file", file);
			formData.append("type", "game");

			const response = await fetch("/api/upload", {
				method: "POST",
				body: formData,
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.error || "Failed to upload image");
			}

			const { url } = await response.json();
			setImageUrl(url);
		} catch (err) {
			setError(
				err instanceof Error ? err.message : "Failed to upload image"
			);
		} finally {
			setIsUploadingImage(false);
		}
	};

	const handleSubmit = async (e: FormEvent) => {
		e.preventDefault();
		setError("");
		setIsSubmitting(true);

		try {
			// Use custom game name if "Other" is selected and a custom name is provided
			const gameName =
				selectedGame === "Other" && customGameName.trim()
					? customGameName.trim()
					: selectedGame;

			const requestBody: {
				game: string;
				date: string;
				times: string[];
				description: string;
				maxPlayers: number;
				imageUrl: string;
				location: string;
				zipCode: string;
				costPerSession?: number;
			} = {
				game: gameName,
				date: selectedDate,
				times: selectedTimes,
				description: description,
				maxPlayers: typeof maxPlayers === 'number' ? maxPlayers : parseInt(String(maxPlayers)) || 1,
				imageUrl: imageUrl,
				location: location,
				zipCode: zipCode,
			};

			// Add costPerSession if it's set and greater than 0
			if (typeof costPerSession === 'number' && costPerSession > 0) {
				requestBody.costPerSession = costPerSession;
			}

			const response = await fetch("/api/games", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(requestBody),
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.error || "Failed to post game session");
			}

			const data = await response.json();
			setPostedGameId(data.id || null);
			setSubmitted(true);
			// Reset form
			setSelectedGame("");
			setCustomGameName("");
			setSelectedTimes([]);
			setSelectedDate("");
			setDescription("");
			setMaxPlayers(4);
			setImageUrl("");
			setLocation("");
			setZipCode("");
			setCostPerSession('');
			setPostedGameId(null);

			setTimeout(() => setSubmitted(false), 5000);
		} catch (err) {
			setError(
				err instanceof Error ? err.message : "Failed to post game session"
			);
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<section className="space-y-6">
			<div>
				<h1 className="text-2xl font-semibold text-slate-100">
					Post a Game
				</h1>
				<p className="mt-2 text-sm text-slate-400">
					Create a single-session game and invite players to join.
				</p>
			</div>

			<form
				onSubmit={handleSubmit}
				className="space-y-4 rounded-2xl border border-slate-800/60 bg-slate-900/40 p-6 shadow-lg shadow-slate-900/30"
			>
				<div className="space-y-2">
					<label
						htmlFor="game-select"
						className="block text-sm font-medium text-slate-200"
					>
						Select Game <span className="text-red-400">*</span>
					</label>
					<select
						id="game-select"
						value={selectedGame}
						onChange={(e) => setSelectedGame(e.target.value)}
						required
						className="w-full rounded-xl border border-slate-800 bg-slate-950/80 px-4 py-3 text-sm text-slate-100 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
					>
						<option value="">Choose a game...</option>
						{GAME_OPTIONS.map((game) => (
							<option key={game} value={game}>
								{game}
							</option>
						))}
					</select>
				</div>

				{selectedGame === "Other" && (
					<div className="space-y-2">
						<label
							htmlFor="custom-game-name"
							className="block text-sm font-medium text-slate-200"
						>
							Game Name <span className="text-red-400">*</span>
						</label>
						<input
							id="custom-game-name"
							type="text"
							value={customGameName}
							onChange={(e) => setCustomGameName(e.target.value)}
							placeholder="Enter the name of the game"
							required
							className="w-full rounded-xl border border-slate-800 bg-slate-950/80 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
						/>
						<p className="text-xs text-slate-500">
							Please enter the specific name of the game you want to
							play.
						</p>
					</div>
				)}

				<div className="space-y-2">
					<label
						htmlFor="date-select"
						className="block text-sm font-medium text-slate-200"
					>
						Game Date <span className="text-red-400">*</span>
					</label>
					<input
						id="date-select"
						type="date"
						value={selectedDate}
						onChange={(e) => setSelectedDate(e.target.value)}
						required
						className="w-full rounded-xl border border-slate-800 bg-slate-950/80 px-4 py-3 text-sm text-slate-100 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
					/>
				</div>

				<div className="space-y-2">
					<label
						htmlFor="location"
						className="block text-sm font-medium text-slate-200"
					>
						Location
					</label>
					<CityAutocomplete
						id="location"
						value={location}
						onChange={setLocation}
						placeholder="Search for a city (e.g., Los Angeles, CA)"
						className="w-full rounded-xl border border-slate-800 bg-slate-950/80 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
					/>
					<p className="text-xs text-slate-500">
						Optional. Helps players find games near them.
					</p>
				</div>

				<div className="space-y-2">
					<label
						htmlFor="zipCode"
						className="block text-sm font-medium text-slate-200"
					>
						Zip Code
					</label>
					<input
						id="zipCode"
						type="text"
						value={zipCode}
						onChange={(e) => setZipCode(e.target.value)}
						placeholder="12345"
						className="w-full rounded-xl border border-slate-800 bg-slate-950/80 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
					/>
					<p className="text-xs text-slate-500">
						Optional. Provides more accurate location than city/state.
					</p>
				</div>

				<div className="space-y-2">
					<label className="block text-sm font-medium text-slate-200">
						Game Time <span className="text-red-400">*</span>
					</label>
					<p className="text-xs text-slate-400">
						Click to select individual times or hold Shift and click to
						select a range.
					</p>
					<div className="space-y-3">
						{TIME_SLOT_GROUPS.map((group) => (
							<div key={group.label}>
								<div className="mb-2 text-xs font-medium text-slate-400">
									{group.label}:
								</div>
								<div className="flex flex-wrap gap-2">
									{group.slots.map((slot) => {
										const active = selectedTimes.includes(slot);
										return (
											<button
												key={slot}
												type="button"
												onClick={(e) => toggleTime(slot, e.shiftKey)}
												className={tagButtonClasses(active, { size: "sm" })}
											>
												{slot}
											</button>
										);
									})}
								</div>
							</div>
						))}
					</div>
					<p className="text-xs text-slate-500">
						{selectedTimes.length} time slot(s) selected
					</p>
				</div>

				<div className="space-y-2">
					<label
						htmlFor="maxPlayers"
						className="block text-sm font-medium text-slate-200"
					>
						Number of Players <span className="text-red-400">*</span>
					</label>
					<input
						id="maxPlayers"
						type="number"
						min="1"
						max="20"
						value={maxPlayers}
						onChange={(e) => {
							const value = e.target.value;
							setMaxPlayers(value === '' ? '' : parseInt(value));
						}}
						required
						className="w-full rounded-xl border border-slate-800 bg-slate-950/80 px-4 py-3 text-sm text-slate-100 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
					/>
					<p className="text-xs text-slate-500">
						Maximum number of players that can join this session
					</p>
				</div>

				{canPostPaidGames && (
					<div className="space-y-2">
						<label
							htmlFor="costPerSession"
							className="block text-sm font-medium text-slate-200"
						>
							Cost for Game
						</label>
						<input
							id="costPerSession"
							type="number"
							min="0"
							step="0.01"
							value={costPerSession}
							onChange={(e) => {
								const value = e.target.value;
								setCostPerSession(value === '' ? '' : parseFloat(value));
							}}
							placeholder="e.g., 0 for free, 5.00 for paid"
							className="w-full rounded-xl border border-slate-800 bg-slate-950/80 px-4 py-3 text-sm text-slate-100 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
						/>
						<p className="text-xs text-slate-500">
							The cost for this single-session game in dollars (0 for free games)
						</p>
					</div>
				)}

				{!canPostPaidGames && (
					<div className="rounded-xl border border-amber-700/50 bg-amber-900/20 p-4">
						<h3 className="text-sm font-medium text-amber-200 mb-2">
							Want to charge for game sessions?
						</h3>
						<p className="text-xs text-slate-400 mb-3">
							Enable paid games to charge players for sessions. The platform will keep 15% of fees.
						</p>
						<Link
							href="/terms-paid-games"
							className="inline-block rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-amber-700"
						>
							Enable Paid Games
						</Link>
					</div>
				)}

				{canPostPaidGames && costPerSession && typeof costPerSession === 'number' && costPerSession > 0 && (
					<div className="rounded-xl border border-slate-800 bg-slate-950/40 p-4">
						<h3 className="text-sm font-medium text-slate-200 mb-2">
							Payment Method
						</h3>
						<p className="text-xs text-slate-500">
							Players will be required to pay ${costPerSession.toFixed(2)} for this single-session game using Stripe when they join.
						</p>
						{!hasConnectAccount && (
							<div className="mt-3 rounded-lg border border-amber-700/50 bg-amber-900/20 p-3">
								<p className="text-xs text-amber-200 mb-2">
									⚠️ Complete Stripe onboarding to receive payments
								</p>
								<Link
									href="/host/onboarding"
									className="inline-block rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-amber-700"
								>
									Complete Onboarding
								</Link>
							</div>
						)}
					</div>
				)}

				<div className="space-y-2">
					<label
						htmlFor="game-image"
						className="block text-sm font-medium text-slate-200"
					>
						Game Image
					</label>
					<div className="space-y-3">
						{imageUrl && (
							<div className="relative">
								<img
									src={imageUrl}
									alt="Game session"
									className="h-66 w-auto rounded-lg border border-slate-800 object-cover"
								/>
								<button
									type="button"
									onClick={() => setImageUrl("")}
									className="absolute right-2 top-2 rounded-lg bg-red-600 px-3 py-1 text-xs font-medium text-white transition hover:bg-red-700"
								>
									Remove
								</button>
							</div>
						)}
						<label
							htmlFor="game-image"
							className="inline-block cursor-pointer rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium text-slate-100 transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
						>
							{isUploadingImage
								? "Uploading..."
								: imageUrl
									? "Change Image"
									: "Upload Image"}
						</label>
						<input
							id="game-image"
							type="file"
							accept="image/jpeg,image/png,image/webp,image/gif"
							onChange={handleImageUpload}
							disabled={isUploadingImage}
							className="hidden"
						/>
						<p className="text-xs text-slate-500">
							JPG, PNG, WebP or GIF. Max 5MB. Optional.
						</p>
					</div>
				</div>

				<div className="space-y-2">
					<label
						htmlFor="description"
						className="block text-sm font-medium text-slate-200"
					>
						Game Description
					</label>
					<textarea
						id="description"
						value={description}
						onChange={(e) => setDescription(e.target.value)}
						rows={4}
						placeholder="Describe your game session, experience level requirements, or any additional details..."
						className="w-full resize-y rounded-xl border border-slate-800 bg-slate-950/80 px-4 py-3 text-sm leading-relaxed text-slate-100 placeholder:text-slate-500 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
					/>
				</div>

				<button
					type="submit"
					className="mt-4 w-full rounded-xl bg-sky-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
					disabled={
						!selectedGame ||
						(selectedGame === "Other" && !customGameName.trim()) ||
						selectedTimes.length === 0 ||
						!selectedDate ||
						isSubmitting
					}
				>
					{isSubmitting ? "Posting..." : "Post Game Session"}
				</button>

				{error && (
					<div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
						{error}
					</div>
				)}

				{submitted && (
					<div className="rounded-xl border border-green-500/20 bg-green-500/10 px-4 py-3 space-y-3">
						<p className="text-sm text-green-400">
							Game session posted successfully!
						</p>
						{postedGameId && (
							<ShareButtons
								url={`${typeof window !== 'undefined' ? window.location.origin : ''}/games/${postedGameId}`}
								title={`${selectedGame === "Other" && customGameName ? customGameName : selectedGame} - Game Session`}
								description={`Join me for ${selectedGame === "Other" && customGameName ? customGameName : selectedGame} on ${selectedDate ? new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' }) : 'TBD'}!`}
							/>
						)}
					</div>
				)}
			</form>
		</section>
	);
}
