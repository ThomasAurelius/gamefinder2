"use client";

import { useState, FormEvent } from "react";
import { GAME_OPTIONS, TIME_SLOTS, TIME_SLOT_GROUPS, ROLE_OPTIONS, DAYS_OF_WEEK, MEETING_FREQUENCY_OPTIONS } from "@/lib/constants";
import CityAutocomplete from "@/components/CityAutocomplete";
import ShareToFacebook from "@/components/ShareToFacebook";

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

export default function PostCampaignPage() {
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
	const [postedCampaignId, setPostedCampaignId] = useState<string | null>(null);
	
	// Campaign-specific state
	const [sessionsLeft, setSessionsLeft] = useState<number | ''>('');
	const [classesNeeded, setClassesNeeded] = useState<string[]>([]);
	const [costPerSession, setCostPerSession] = useState<number | ''>('');
	const [meetingFrequency, setMeetingFrequency] = useState("");
	const [daysOfWeek, setDaysOfWeek] = useState<string[]>([]);

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
			formData.append("type", "campaign");

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

			const response = await fetch("/api/games", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					game: gameName,
					date: selectedDate,
					times: selectedTimes,
					description: description,
					maxPlayers: typeof maxPlayers === 'number' ? maxPlayers : parseInt(String(maxPlayers)) || 1,
					imageUrl: imageUrl,
					location: location,
					zipCode: zipCode,
				}),
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
					Post a Campaign
				</h1>
				<p className="mt-2 text-sm text-slate-400">
					Create a new campaign and invite players to join.
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

page.tsx page.tsx page.tsx <div className="space-y-2">
page.tsx page.tsx page.tsx page.tsx <label
page.tsx page.tsx page.tsx page.tsx page.tsx htmlFor="sessionsLeft"
page.tsx page.tsx page.tsx page.tsx page.tsx className="block text-sm font-medium text-slate-200"
page.tsx page.tsx page.tsx page.tsx >
page.tsx page.tsx page.tsx page.tsx page.tsx Approximate Sessions Left
page.tsx page.tsx page.tsx page.tsx </label>
page.tsx page.tsx page.tsx page.tsx <input
page.tsx page.tsx page.tsx page.tsx page.tsx id="sessionsLeft"
page.tsx page.tsx page.tsx page.tsx page.tsx type="number"
page.tsx page.tsx page.tsx page.tsx page.tsx min="1"
page.tsx page.tsx page.tsx page.tsx page.tsx value={sessionsLeft}
page.tsx page.tsx page.tsx page.tsx page.tsx onChange={(e) => {
page.tsx page.tsx page.tsx page.tsx page.tsx page.tsx const value = e.target.value;
page.tsx page.tsx page.tsx page.tsx page.tsx page.tsx setSessionsLeft(value === '' ? '' : parseInt(value));
page.tsx page.tsx page.tsx page.tsx page.tsx }}
page.tsx page.tsx page.tsx page.tsx page.tsx placeholder="e.g., 10"
page.tsx page.tsx page.tsx page.tsx page.tsx className="w-full rounded-xl border border-slate-800 bg-slate-950/80 px-4 py-3 text-sm text-slate-100 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
page.tsx page.tsx page.tsx page.tsx />
page.tsx page.tsx page.tsx page.tsx <p className="text-xs text-slate-500">
page.tsx page.tsx page.tsx page.tsx page.tsx How many sessions do you expect this campaign to run?
page.tsx page.tsx page.tsx page.tsx </p>
page.tsx page.tsx page.tsx </div>

page.tsx page.tsx page.tsx <div className="space-y-2">
page.tsx page.tsx page.tsx page.tsx <label className="block text-sm font-medium text-slate-200">
page.tsx page.tsx page.tsx page.tsx page.tsx Classes/Roles Needed
page.tsx page.tsx page.tsx page.tsx </label>
page.tsx page.tsx page.tsx page.tsx <p className="text-xs text-slate-400 mb-2">
page.tsx page.tsx page.tsx page.tsx page.tsx Select the character classes or roles you're looking for
page.tsx page.tsx page.tsx page.tsx </p>
page.tsx page.tsx page.tsx page.tsx <div className="flex flex-wrap gap-2">
page.tsx page.tsx page.tsx page.tsx page.tsx {ROLE_OPTIONS.map((role) => (
page.tsx page.tsx page.tsx page.tsx page.tsx page.tsx <button
page.tsx page.tsx page.tsx page.tsx page.tsx page.tsx page.tsx key={role}
page.tsx page.tsx page.tsx page.tsx page.tsx page.tsx page.tsx type="button"
page.tsx page.tsx page.tsx page.tsx page.tsx page.tsx page.tsx onClick={() => {
page.tsx page.tsx page.tsx page.tsx page.tsx page.tsx page.tsx page.tsx setClassesNeeded((prev) =>
page.tsx page.tsx page.tsx page.tsx page.tsx page.tsx page.tsx page.tsx page.tsx prev.includes(role)
page.tsx page.tsx page.tsx page.tsx page.tsx page.tsx page.tsx page.tsx page.tsx page.tsx ? prev.filter((r) => r !== role)
page.tsx page.tsx page.tsx page.tsx page.tsx page.tsx page.tsx page.tsx page.tsx page.tsx : [...prev, role]
page.tsx page.tsx page.tsx page.tsx page.tsx page.tsx page.tsx page.tsx );
page.tsx page.tsx page.tsx page.tsx page.tsx page.tsx page.tsx }}
page.tsx page.tsx page.tsx page.tsx page.tsx page.tsx page.tsx className={tagButtonClasses(classesNeeded.includes(role))}
page.tsx page.tsx page.tsx page.tsx page.tsx page.tsx >
page.tsx page.tsx page.tsx page.tsx page.tsx page.tsx page.tsx {role}
page.tsx page.tsx page.tsx page.tsx page.tsx page.tsx </button>
page.tsx page.tsx page.tsx page.tsx page.tsx ))}
page.tsx page.tsx page.tsx page.tsx </div>
page.tsx page.tsx page.tsx page.tsx <p className="text-xs text-slate-500">
page.tsx page.tsx page.tsx page.tsx page.tsx {classesNeeded.length} class(es) selected
page.tsx page.tsx page.tsx page.tsx </p>
page.tsx page.tsx page.tsx </div>

page.tsx page.tsx page.tsx <div className="space-y-2">
page.tsx page.tsx page.tsx page.tsx <label
page.tsx page.tsx page.tsx page.tsx page.tsx htmlFor="costPerSession"
page.tsx page.tsx page.tsx page.tsx page.tsx className="block text-sm font-medium text-slate-200"
page.tsx page.tsx page.tsx page.tsx >
page.tsx page.tsx page.tsx page.tsx page.tsx Cost per Session
page.tsx page.tsx page.tsx page.tsx </label>
page.tsx page.tsx page.tsx page.tsx <input
page.tsx page.tsx page.tsx page.tsx page.tsx id="costPerSession"
page.tsx page.tsx page.tsx page.tsx page.tsx type="number"
page.tsx page.tsx page.tsx page.tsx page.tsx min="0"
page.tsx page.tsx page.tsx page.tsx page.tsx step="0.01"
page.tsx page.tsx page.tsx page.tsx page.tsx value={costPerSession}
page.tsx page.tsx page.tsx page.tsx page.tsx onChange={(e) => {
page.tsx page.tsx page.tsx page.tsx page.tsx page.tsx const value = e.target.value;
page.tsx page.tsx page.tsx page.tsx page.tsx page.tsx setCostPerSession(value === '' ? '' : parseFloat(value));
page.tsx page.tsx page.tsx page.tsx page.tsx }}
page.tsx page.tsx page.tsx page.tsx page.tsx placeholder="e.g., 0 for free, 5.00 for paid"
page.tsx page.tsx page.tsx page.tsx page.tsx className="w-full rounded-xl border border-slate-800 bg-slate-950/80 px-4 py-3 text-sm text-slate-100 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
page.tsx page.tsx page.tsx page.tsx />
page.tsx page.tsx page.tsx page.tsx <p className="text-xs text-slate-500">
page.tsx page.tsx page.tsx page.tsx page.tsx The cost per session in dollars (0 for free campaigns)
page.tsx page.tsx page.tsx page.tsx </p>
page.tsx page.tsx page.tsx </div>

page.tsx page.tsx page.tsx <div className="space-y-2">
page.tsx page.tsx page.tsx page.tsx <label
page.tsx page.tsx page.tsx page.tsx page.tsx htmlFor="meetingFrequency"
page.tsx page.tsx page.tsx page.tsx page.tsx className="block text-sm font-medium text-slate-200"
page.tsx page.tsx page.tsx page.tsx >
page.tsx page.tsx page.tsx page.tsx page.tsx Meeting Frequency
page.tsx page.tsx page.tsx page.tsx </label>
page.tsx page.tsx page.tsx page.tsx <select
page.tsx page.tsx page.tsx page.tsx page.tsx id="meetingFrequency"
page.tsx page.tsx page.tsx page.tsx page.tsx value={meetingFrequency}
page.tsx page.tsx page.tsx page.tsx page.tsx onChange={(e) => setMeetingFrequency(e.target.value)}
page.tsx page.tsx page.tsx page.tsx page.tsx className="w-full rounded-xl border border-slate-800 bg-slate-950/80 px-4 py-3 text-sm text-slate-100 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
page.tsx page.tsx page.tsx page.tsx >
page.tsx page.tsx page.tsx page.tsx page.tsx <option value="">Select frequency...</option>
page.tsx page.tsx page.tsx page.tsx page.tsx {MEETING_FREQUENCY_OPTIONS.map((freq) => (
page.tsx page.tsx page.tsx page.tsx page.tsx page.tsx <option key={freq} value={freq}>
page.tsx page.tsx page.tsx page.tsx page.tsx page.tsx page.tsx {freq}
page.tsx page.tsx page.tsx page.tsx page.tsx page.tsx </option>
page.tsx page.tsx page.tsx page.tsx page.tsx ))}
page.tsx page.tsx page.tsx page.tsx </select>
page.tsx page.tsx page.tsx page.tsx <p className="text-xs text-slate-500">
page.tsx page.tsx page.tsx page.tsx page.tsx How often does this campaign meet?
page.tsx page.tsx page.tsx page.tsx </p>
page.tsx page.tsx page.tsx </div>

page.tsx page.tsx page.tsx <div className="space-y-2">
page.tsx page.tsx page.tsx page.tsx <label className="block text-sm font-medium text-slate-200">
page.tsx page.tsx page.tsx page.tsx page.tsx Days of the Week
page.tsx page.tsx page.tsx page.tsx </label>
page.tsx page.tsx page.tsx page.tsx <p className="text-xs text-slate-400 mb-2">
page.tsx page.tsx page.tsx page.tsx page.tsx Select which days the campaign typically meets
page.tsx page.tsx page.tsx page.tsx </p>
page.tsx page.tsx page.tsx page.tsx <div className="flex flex-wrap gap-2">
page.tsx page.tsx page.tsx page.tsx page.tsx {DAYS_OF_WEEK.map((day) => (
page.tsx page.tsx page.tsx page.tsx page.tsx page.tsx <button
page.tsx page.tsx page.tsx page.tsx page.tsx page.tsx page.tsx key={day}
page.tsx page.tsx page.tsx page.tsx page.tsx page.tsx page.tsx type="button"
page.tsx page.tsx page.tsx page.tsx page.tsx page.tsx page.tsx onClick={() => {
page.tsx page.tsx page.tsx page.tsx page.tsx page.tsx page.tsx page.tsx setDaysOfWeek((prev) =>
page.tsx page.tsx page.tsx page.tsx page.tsx page.tsx page.tsx page.tsx page.tsx prev.includes(day)
page.tsx page.tsx page.tsx page.tsx page.tsx page.tsx page.tsx page.tsx page.tsx page.tsx ? prev.filter((d) => d !== day)
page.tsx page.tsx page.tsx page.tsx page.tsx page.tsx page.tsx page.tsx page.tsx page.tsx : [...prev, day]
page.tsx page.tsx page.tsx page.tsx page.tsx page.tsx page.tsx page.tsx );
page.tsx page.tsx page.tsx page.tsx page.tsx page.tsx page.tsx }}
page.tsx page.tsx page.tsx page.tsx page.tsx page.tsx page.tsx className={tagButtonClasses(daysOfWeek.includes(day))}
page.tsx page.tsx page.tsx page.tsx page.tsx page.tsx >
page.tsx page.tsx page.tsx page.tsx page.tsx page.tsx page.tsx {day}
page.tsx page.tsx page.tsx page.tsx page.tsx page.tsx </button>
page.tsx page.tsx page.tsx page.tsx page.tsx ))}
page.tsx page.tsx page.tsx page.tsx </div>
page.tsx page.tsx page.tsx page.tsx <p className="text-xs text-slate-500">
page.tsx page.tsx page.tsx page.tsx page.tsx {daysOfWeek.length} day(s) selected
page.tsx page.tsx page.tsx page.tsx </p>
page.tsx page.tsx page.tsx </div>

				<div className="space-y-2">
					<label
						htmlFor="game-image"
						className="block text-sm font-medium text-slate-200"
					>
						Campaign Image
					</label>
					<div className="space-y-3">
						{imageUrl && (
							<div className="relative">
								<img
									src={imageUrl}
									alt="Campaign"
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
					{isSubmitting ? "Posting..." : "Post Campaign Session"}
				</button>

				{error && (
					<div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
						{error}
					</div>
				)}

				{submitted && (
					<div className="rounded-xl border border-green-500/20 bg-green-500/10 px-4 py-3 space-y-3">
						<p className="text-sm text-green-400">
							Campaign posted successfully!
						</p>
						{postedGameId && (
							<div className="flex gap-3">
								<ShareToFacebook
									url={`${typeof window !== 'undefined' ? window.location.origin : ''}/games/${postedGameId}`}
									quote={`Join me for ${selectedGame === "Other" && customGameName ? customGameName : selectedGame} on ${selectedDate ? new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' }) : 'TBD'}!`}
								/>
							</div>
						)}
					</div>
				)}
			</form>
		</section>
	);
}
