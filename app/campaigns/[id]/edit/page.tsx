"use client";

import { useState, FormEvent, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { GAME_OPTIONS, TIME_SLOTS, TIME_SLOT_GROUPS, ROLE_OPTIONS, DAYS_OF_WEEK, MEETING_FREQUENCY_OPTIONS, SAFETY_TOOLS_OPTIONS } from "@/lib/constants";
import CityAutocomplete from "@/components/CityAutocomplete";
import VenueSelector from "@/components/VenueSelector";

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

export default function EditCampaignPage() {
	const params = useParams();
	const router = useRouter();
	const campaignId = params.id as string;

	const [selectedGame, setSelectedGame] = useState("");
	const [customGameName, setCustomGameName] = useState("");
	const [selectedTimes, setSelectedTimes] = useState<string[]>([]);
	const [selectedDate, setSelectedDate] = useState("");
	const [description, setDescription] = useState("");
	const [maxPlayers, setMaxPlayers] = useState<number | ''>(4);
	const [error, setError] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [isLoading, setIsLoading] = useState(true);
	const [imageUrl, setImageUrl] = useState("");
	const [isUploadingImage, setIsUploadingImage] = useState(false);
	const [lastClickedSlot, setLastClickedSlot] = useState<string>("");
	const [location, setLocation] = useState("");
	const [zipCode, setZipCode] = useState("");
	const [vendorId, setVendorId] = useState("");
	
	// Campaign-specific state
	const [sessionsLeft, setSessionsLeft] = useState<number | ''>('');
	const [classesNeeded, setClassesNeeded] = useState<string[]>([]);
	const [costPerSession, setCostPerSession] = useState<number | ''>('');
	const [meetingFrequency, setMeetingFrequency] = useState("");
	const [daysOfWeek, setDaysOfWeek] = useState<string[]>([]);
	const [selectedSafetyTools, setSelectedSafetyTools] = useState<string[]>([]);
	const [customSafetyTools, setCustomSafetyTools] = useState<string[]>([]);
	const [customSafetyToolInput, setCustomSafetyToolInput] = useState("");

	// User profile state
	const [canPostPaidGames, setCanPostPaidGames] = useState(false);

	useEffect(() => {
		const fetchCampaign = async () => {
			try {
				const response = await fetch(`/api/campaigns/${campaignId}`);
				if (!response.ok) {
					throw new Error("Failed to fetch campaign");
				}
				const campaign = await response.json();

				// Check if the user is the creator
				const profileResponse = await fetch("/api/profile");
				if (profileResponse.ok) {
					const profileData = await profileResponse.json();
					if (campaign.userId !== profileData.userId) {
						router.push(`/campaigns/${campaignId}`);
						return;
					}
					// Set the canPostPaidGames flag
					setCanPostPaidGames(profileData.canPostPaidGames || false);
				}

				// Populate form with existing campaign data
				const isOtherGame = !GAME_OPTIONS.includes(campaign.game);
				setSelectedGame(isOtherGame ? "Other" : campaign.game);
				if (isOtherGame) {
					setCustomGameName(campaign.game);
				}
				setSelectedTimes(campaign.times || []);
				setSelectedDate(campaign.date || "");
				setDescription(campaign.description || "");
				setMaxPlayers(campaign.maxPlayers || 4);
				setImageUrl(campaign.imageUrl || "");
				setLocation(campaign.location || "");
				setZipCode(campaign.zipCode || "");
				setVendorId(campaign.vendorId || "");
				setSessionsLeft(campaign.sessionsLeft || '');
				setClassesNeeded(campaign.classesNeeded || []);
				setCostPerSession(campaign.costPerSession || '');
				setMeetingFrequency(campaign.meetingFrequency || "");
				setDaysOfWeek(campaign.daysOfWeek || []);
				// Separate preset safety tools from custom safety tools
				const normalizedSafetyTools = campaign.safetyTools ?? [];
				const presetSafetyTools = normalizedSafetyTools.filter((tool: string) =>
					SAFETY_TOOLS_OPTIONS.includes(tool)
				);
				const customSafetyToolsFromCampaign = normalizedSafetyTools.filter(
					(tool: string) => !SAFETY_TOOLS_OPTIONS.includes(tool)
				);
				setSelectedSafetyTools(presetSafetyTools);
				setCustomSafetyTools(customSafetyToolsFromCampaign);
			} catch (err) {
				setError(
					err instanceof Error ? err.message : "Failed to load campaign"
				);
			} finally {
				setIsLoading(false);
			}
		};

		fetchCampaign();
	}, [campaignId, router]);

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

	const toggleSafetyTool = (tool: string) => {
		setSelectedSafetyTools((prev) =>
			prev.includes(tool)
				? prev.filter((item) => item !== tool)
				: [...prev, tool]
		);
	};

	const addCustomSafetyTool = () => {
		const trimmedTool = customSafetyToolInput.trim();
		if (
			trimmedTool &&
			!customSafetyTools.includes(trimmedTool) &&
			!SAFETY_TOOLS_OPTIONS.includes(trimmedTool)
		) {
			setCustomSafetyTools((prev) => [...prev, trimmedTool]);
			setCustomSafetyToolInput("");
		}
	};

	const removeCustomSafetyTool = (tool: string) => {
		setCustomSafetyTools((prev) => prev.filter((item) => item !== tool));
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

			// Combine preset and custom safety tools
			const allSafetyTools = [...selectedSafetyTools, ...customSafetyTools];

			const response = await fetch(`/api/campaigns/${campaignId}`, {
				method: "PUT",
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
					vendorId: vendorId || undefined,
					sessionsLeft: typeof sessionsLeft === 'number' ? sessionsLeft : (sessionsLeft ? parseInt(String(sessionsLeft)) : undefined),
					classesNeeded: classesNeeded.length > 0 ? classesNeeded : undefined,
					costPerSession: typeof costPerSession === 'number' ? costPerSession : (costPerSession ? parseFloat(String(costPerSession)) : undefined),
					requiresPayment: (typeof costPerSession === 'number' && costPerSession > 0) || false,
					meetingFrequency: meetingFrequency || undefined,
					daysOfWeek: daysOfWeek.length > 0 ? daysOfWeek : undefined,
					safetyTools: allSafetyTools.length > 0 ? allSafetyTools : undefined,
				}),
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.error || "Failed to update campaign");
			}

			router.push(`/campaigns/${campaignId}`);
		} catch (err) {
			setError(
				err instanceof Error ? err.message : "Failed to update campaign"
			);
		} finally {
			setIsSubmitting(false);
		}
	};

	if (isLoading) {
		return (
			<div className="flex min-h-screen items-center justify-center">
				<p className="text-slate-400">Loading campaign...</p>
			</div>
		);
	}

	return (
		<section className="space-y-6">
			<div>
				<Link
					href={`/campaigns/${campaignId}`}
					className="inline-block text-sm text-sky-400 hover:text-sky-300"
				>
					← Back to campaign
				</Link>
				<h1 className="mt-4 text-2xl font-semibold text-slate-100">
					Edit Campaign
				</h1>
				<p className="mt-2 text-sm text-slate-400">
					Update your campaign details.
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
					<label
						htmlFor="venue"
						className="block text-sm font-medium text-slate-200"
					>
						Venue
					</label>
					<VenueSelector
						zipCode={zipCode}
						value={vendorId}
						onChange={setVendorId}
						className="w-full rounded-xl border border-slate-800 bg-slate-950/80 px-4 py-3 text-sm text-slate-100 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
					/>
					<p className="text-xs text-slate-500">
						Optional. Select an approved venue for this campaign.
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
						Maximum number of players that can join this campaign
					</p>
				</div>

			<div className="space-y-2">
				<label
					htmlFor="sessionsLeft"
					className="block text-sm font-medium text-slate-200"
				>
					Number of Sessions
				</label>
				<input
					id="sessionsLeft"
					type="number"
					min="1"
					value={sessionsLeft}
					onChange={(e) => {
						const value = e.target.value;
						setSessionsLeft(value === '' ? '' : parseInt(value));
					}}
					placeholder="e.g., 10"
					className="w-full rounded-xl border border-slate-800 bg-slate-950/80 px-4 py-3 text-sm text-slate-100 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
				/>
				<p className="text-xs text-slate-500">
					How many sessions do you expect this campaign to run? Enter 1 for a single-session campaign, or a higher number for a multi-session campaign that requires a subscription.
				</p>
			</div>

			<div className="space-y-2">
				<label className="block text-sm font-medium text-slate-200">
					Classes/Roles Needed
				</label>
				<p className="text-xs text-slate-400 mb-2">
					Select the character classes or roles you&apos;re looking for
				</p>
				<div className="flex flex-wrap gap-2">
					{ROLE_OPTIONS.map((role) => (
						<button
							key={role}
							type="button"
							onClick={() => {
								setClassesNeeded((prev) =>
									prev.includes(role)
										? prev.filter((r) => r !== role)
										: [...prev, role]
								);
							}}
							className={tagButtonClasses(classesNeeded.includes(role))}
						>
							{role}
						</button>
					))}
				</div>
				<p className="text-xs text-slate-500">
					{classesNeeded.length} class(es) selected
				</p>
			</div>

			{canPostPaidGames && (
				<div className="space-y-2">
					<label
						htmlFor="costPerSession"
						className="block text-sm font-medium text-slate-200"
					>
						Cost per Session
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
						The cost per session in dollars (0 for free campaigns)
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
						Players will be required to pay ${costPerSession} {typeof sessionsLeft === 'number' && sessionsLeft > 1 ? 'per session via subscription' : 'as a one-time payment'} using Stripe when they join this campaign.
					</p>
				</div>
			)}

			<div className="space-y-2">
				<label
					htmlFor="meetingFrequency"
					className="block text-sm font-medium text-slate-200"
				>
					Meeting Frequency
				</label>
				<select
					id="meetingFrequency"
					value={meetingFrequency}
					onChange={(e) => setMeetingFrequency(e.target.value)}
					className="w-full rounded-xl border border-slate-800 bg-slate-950/80 px-4 py-3 text-sm text-slate-100 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
				>
					<option value="">Select frequency...</option>
					{MEETING_FREQUENCY_OPTIONS.map((freq) => (
						<option key={freq} value={freq}>
							{freq}
						</option>
					))}
				</select>
				<p className="text-xs text-slate-500">
					How often does this campaign meet?
				</p>
			</div>

			<div className="space-y-2">
				<label className="block text-sm font-medium text-slate-200">
					Days of the Week
				</label>
				<p className="text-xs text-slate-400 mb-2">
					Select which days the campaign typically meets
				</p>
				<div className="flex flex-wrap gap-2">
					{DAYS_OF_WEEK.map((day) => (
						<button
							key={day}
							type="button"
							onClick={() => {
								setDaysOfWeek((prev) =>
									prev.includes(day)
										? prev.filter((d) => d !== day)
										: [...prev, day]
								);
							}}
							className={tagButtonClasses(daysOfWeek.includes(day))}
						>
							{day}
						</button>
					))}
				</div>
				<p className="text-xs text-slate-500">
					{daysOfWeek.length} day(s) selected
				</p>
			</div>

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
						placeholder="Describe your campaign, experience level requirements, or any additional details..."
						className="w-full resize-y rounded-xl border border-slate-800 bg-slate-950/80 px-4 py-3 text-sm leading-relaxed text-slate-100 placeholder:text-slate-500 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
					/>
				</div>

				<div className="space-y-4 rounded-2xl border border-slate-800/60 bg-slate-900/20 p-6">
					<div className="space-y-1">
						<h3 className="text-lg font-semibold text-slate-200">
							Safety Tools
						</h3>
						<p className="text-sm text-slate-400">
							Select the safety tools that will be used in this campaign to ensure a comfortable experience for all players.
						</p>
					</div>

					<div className="flex flex-wrap gap-2">
						{SAFETY_TOOLS_OPTIONS.map((tool) => {
							const active = selectedSafetyTools.includes(tool);
							return (
								<button
									key={tool}
									type="button"
									onClick={() => toggleSafetyTool(tool)}
									className={tagButtonClasses(active)}
								>
									{tool}
								</button>
							);
						})}
					</div>

					{selectedSafetyTools.includes("Other") && (
						<div className="space-y-3">
							<div className="flex gap-2">
								<input
									type="text"
									value={customSafetyToolInput}
									onChange={(e) => setCustomSafetyToolInput(e.target.value)}
									onKeyDown={(e) => {
										if (e.key === "Enter") {
											e.preventDefault();
											addCustomSafetyTool();
										}
									}}
									placeholder="Enter custom safety tool name"
									className="flex-1 rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-100 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
								/>
								<button
									type="button"
									onClick={addCustomSafetyTool}
									className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-300"
								>
									Add
								</button>
							</div>
							{customSafetyTools.length > 0 && (
								<div className="flex flex-wrap gap-2">
									{customSafetyTools.map((tool) => (
										<div
											key={tool}
											className="flex items-center gap-1 rounded-full border border-sky-400 bg-sky-500/20 px-3 py-1.5 text-sm text-sky-100"
										>
											<span>{tool}</span>
											<button
												type="button"
												onClick={() => removeCustomSafetyTool(tool)}
												className="ml-1 text-sky-200 hover:text-sky-100"
												aria-label={`Remove ${tool}`}
											>
												×
											</button>
										</div>
									))}
								</div>
							)}
						</div>
					)}
				</div>

				<div className="flex gap-3">
					<button
						type="submit"
						className="flex-1 rounded-xl bg-sky-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
						disabled={
							!selectedGame ||
							(selectedGame === "Other" && !customGameName.trim()) ||
							selectedTimes.length === 0 ||
							!selectedDate ||
							isSubmitting
						}
					>
						{isSubmitting ? "Saving..." : "Save Changes"}
					</button>
					<Link
						href={`/campaigns/${campaignId}`}
						className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-sm font-medium text-slate-100 transition hover:bg-slate-700"
					>
						Cancel
					</Link>
				</div>

				{error && (
					<div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
						{error}
					</div>
				)}
			</form>
		</section>
	);
}
