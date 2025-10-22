"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatDateInTimezone, DEFAULT_TIMEZONE } from "@/lib/timezone";
import { sortTimesByChronology } from "@/lib/constants";
import PendingCampaignPlayersManager from "@/components/PendingCampaignPlayersManager";
import { isPaidCampaign } from "@/lib/campaign-utils";
import ShareButtons from "@/components/ShareButtons";
import CharacterSelectionDialog from "@/components/CharacterSelectionDialog";

type PlayerSignup = {
	userId: string;
	characterId?: string;
	characterName?: string;
};

type Campaign = {
	id: string;
	userId: string;
	game: string;
	date: string;
	times: string[];
	description: string;
	maxPlayers: number;
	signedUpPlayers: string[];
	signedUpPlayersWithCharacters?: PlayerSignup[];
	waitlist: string[];
	waitlistWithCharacters?: PlayerSignup[];
	pendingPlayers: string[];
	pendingPlayersWithCharacters?: PlayerSignup[];
	createdAt: string;
	updatedAt: string;
	imageUrl?: string;
	location?: string;
	zipCode?: string;
	latitude?: number;
	longitude?: number;
	sessionsLeft?: number;
	classesNeeded?: string[];
	costPerSession?: number;
	meetingFrequency?: string;
	daysOfWeek?: string[];
	hostName?: string;
	hostAvatarUrl?: string;
	vendorId?: string;
};

type PendingPlayer = {
	id: string;
	name: string;
	avatarUrl?: string;
	characterName?: string;
	characterId?: string;
	characterIsPublic?: boolean;
	characterAvatarUrl?: string;
};

type PlayerWithInfo = {
	userId: string;
	name: string;
	avatarUrl?: string;
	characterName?: string;
	characterId?: string;
	characterIsPublic?: boolean;
	characterAvatarUrl?: string;
	hasActiveSubscription?: boolean;
};

type Vendor = {
	id: string;
	vendorName: string;
	address1: string;
	city: string;
	state: string;
	zip: string;
};

type CampaignNote = {
	id: string;
	campaignId: string;
	userId: string;
	content: string;
	createdAt: string;
	updatedAt: string;
};

type CampaignDetailProps = {
	campaignId: string;
	campaignUrl: string;
};

export default function CampaignDetail({
	campaignId,
	campaignUrl,
}: CampaignDetailProps) {
	const router = useRouter();
	const [campaign, setCampaign] = useState<Campaign | null>(null);
	const [vendor, setVendor] = useState<Vendor | null>(null);
	const [notes, setNotes] = useState<CampaignNote[]>([]);
	const [pendingPlayersList, setPendingPlayersList] = useState<
		PendingPlayer[]
	>([]);
	const [signedUpPlayersList, setSignedUpPlayersList] = useState<
		PlayerWithInfo[]
	>([]);
	const [waitlistPlayersList, setWaitlistPlayersList] = useState<
		PlayerWithInfo[]
	>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [activeTab, setActiveTab] = useState<"details" | "notes">("details");
	const [currentUserId, setCurrentUserId] = useState<string | null>(null);
	const [userTimezone, setUserTimezone] = useState<string>(DEFAULT_TIMEZONE);
	const [newNoteContent, setNewNoteContent] = useState("");
	const [isSubmittingNote, setIsSubmittingNote] = useState(false);
	const [noteError, setNoteError] = useState<string | null>(null);
	const [isWithdrawing, setIsWithdrawing] = useState(false);
	const [withdrawError, setWithdrawError] = useState<string | null>(null);
	const [hasActiveSubscription, setHasActiveSubscription] = useState(false);
	const [showMessageModal, setShowMessageModal] = useState(false);
	const [messageSubject, setMessageSubject] = useState("");
	const [messageContent, setMessageContent] = useState("");
	const [isSendingMessage, setIsSendingMessage] = useState(false);
	const [messageError, setMessageError] = useState<string | null>(null);
	const [messageSuccess, setMessageSuccess] = useState(false);
	const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);
	const [deleteError, setDeleteError] = useState<string | null>(null);
	const [showRemoveModal, setShowRemoveModal] = useState(false);
	const [selectedPlayer, setSelectedPlayer] = useState<PlayerWithInfo | null>(
		null
	);
	const [removeReason, setRemoveReason] = useState("");
	const [removeError, setRemoveError] = useState<string | null>(null);
	const [isRemovingPlayer, setIsRemovingPlayer] = useState(false);
	const [showCharacterDialog, setShowCharacterDialog] = useState(false);
	const [isJoining, setIsJoining] = useState(false);
	const [showCharacterSwitchDialog, setShowCharacterSwitchDialog] =
		useState(false);
	const [isUpdatingCharacter, setIsUpdatingCharacter] = useState(false);

	useEffect(() => {
		const fetchData = async () => {
			try {
				setIsLoading(true);

				// Fetch campaign data
				const campaignResponse = await fetch(
					`/api/campaigns/${campaignId}`
				);
				if (!campaignResponse.ok) {
					throw new Error("Failed to fetch campaign");
				}
				const campaignData = await campaignResponse.json();
				setCampaign(campaignData);

				// Fetch vendor information if vendorId is present
				if (campaignData.vendorId) {
					try {
						const vendorResponse = await fetch(
							`/api/vendors/${campaignData.vendorId}`
						);
						if (vendorResponse.ok) {
							const vendorData = await vendorResponse.json();
							setVendor(vendorData);
						}
					} catch (vendorError) {
						console.error("Error fetching vendor:", vendorError);
						// Continue without vendor data
					}
				}

				// Fetch current user
				const userResponse = await fetch("/api/auth/user");
				if (userResponse.ok) {
					const userData = await userResponse.json();
					setCurrentUserId(userData.userId);
					setUserTimezone(userData.timezone || DEFAULT_TIMEZONE);

					// Fetch user's subscription status
					const subscriptionResponse = await fetch(
						"/api/stripe/subscription-status"
					);
					if (subscriptionResponse.ok) {
						const subscriptionData = await subscriptionResponse.json();
						setHasActiveSubscription(
							subscriptionData.hasActiveSubscription
						);
					}
				}

				// Fetch enriched player data
				const enrichedResponse = await fetch(
					`/api/campaigns/${campaignId}/enriched`
				);
				if (enrichedResponse.ok) {
					const enrichedData = await enrichedResponse.json();
					setPendingPlayersList(enrichedData.pendingPlayers || []);
					setSignedUpPlayersList(enrichedData.signedUpPlayers || []);
					setWaitlistPlayersList(enrichedData.waitlistPlayers || []);
				}

				// Fetch notes
				const notesResponse = await fetch(
					`/api/campaigns/${campaignId}/notes`
				);
				if (notesResponse.ok) {
					const notesData = await notesResponse.json();
					setNotes(notesData);
				}
			} catch (error) {
				console.error("Error fetching data:", error);
			} finally {
				setIsLoading(false);
			}
		};

		fetchData();
	}, [campaignId]);

	const handlePlayerApproved = (player: PendingPlayer) => {
		setPendingPlayersList((prev) => prev.filter((p) => p.id !== player.id));

		// Refresh campaign data to get updated player lists
		fetch(`/api/campaigns/${campaignId}`)
			.then((response) => response.json())
			.then((data) => setCampaign(data))
			.catch((error) => console.error("Error refreshing campaign:", error));

		fetch(`/api/campaigns/${campaignId}/enriched`)
			.then((response) => response.json())
			.then((data) => {
				setSignedUpPlayersList(data.signedUpPlayers || []);
				setWaitlistPlayersList(data.waitlistPlayers || []);
			})
			.catch((error) =>
				console.error("Error refreshing enriched data:", error)
			);
	};

	const handlePlayerDenied = (playerId: string) => {
		setPendingPlayersList((prev) =>
			prev.filter((player) => player.id !== playerId)
		);
	};

	const handleJoinCampaign = () => {
		if (!currentUserId) {
			router.push("/login");
			return;
		}

		// Show character selection dialog
		setShowCharacterDialog(true);
	};

	const handleCharacterSelect = async (
		characterId?: string,
		characterName?: string
	) => {
		setShowCharacterDialog(false);
		setIsJoining(true);

		try {
			const response = await fetch(`/api/campaigns/${campaignId}/join`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ characterId, characterName }),
			});

			if (response.ok) {
				// Refresh campaign data
				const campaignResponse = await fetch(
					`/api/campaigns/${campaignId}`
				);
				if (campaignResponse.ok) {
					const campaignData = await campaignResponse.json();
					setCampaign(campaignData);
				}

				// Refresh enriched data
				const enrichedResponse = await fetch(
					`/api/campaigns/${campaignId}/enriched`
				);
				if (enrichedResponse.ok) {
					const enrichedData = await enrichedResponse.json();
					setPendingPlayersList(enrichedData.pendingPlayers || []);
					setSignedUpPlayersList(enrichedData.signedUpPlayers || []);
					setWaitlistPlayersList(enrichedData.waitlistPlayers || []);
				}
			} else {
				const error = await response.json();
				alert(error.error || "Failed to join campaign");
			}
		} catch (error) {
			console.error("Error joining campaign:", error);
			alert("Failed to join campaign");
		} finally {
			setIsJoining(false);
		}
	};

	const handleCharacterCancel = () => {
		setShowCharacterDialog(false);
	};

	const handleSwitchCharacter = () => {
		setShowCharacterSwitchDialog(true);
	};

	const handleCharacterSwitch = async (
		characterId?: string,
		characterName?: string
	) => {
		setShowCharacterSwitchDialog(false);
		setIsUpdatingCharacter(true);

		try {
			const response = await fetch(
				`/api/campaigns/${campaignId}/update-character`,
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({ characterId, characterName }),
				}
			);

			if (response.ok) {
				// Refresh campaign data
				const campaignResponse = await fetch(
					`/api/campaigns/${campaignId}`
				);
				if (campaignResponse.ok) {
					const campaignData = await campaignResponse.json();
					setCampaign(campaignData);
				}

				// Refresh enriched data
				const enrichedResponse = await fetch(
					`/api/campaigns/${campaignId}/enriched`
				);
				if (enrichedResponse.ok) {
					const enrichedData = await enrichedResponse.json();
					setPendingPlayersList(enrichedData.pendingPlayers || []);
					setSignedUpPlayersList(enrichedData.signedUpPlayers || []);
					setWaitlistPlayersList(enrichedData.waitlistPlayers || []);
				}
			} else {
				const error = await response.json();
				alert(error.error || "Failed to update character");
			}
		} catch (error) {
			console.error("Error updating character:", error);
			alert("Failed to update character");
		} finally {
			setIsUpdatingCharacter(false);
		}
	};

	const handleCharacterSwitchCancel = () => {
		setShowCharacterSwitchDialog(false);
	};

	const handleWithdraw = async () => {
		if (!currentUserId) {
			return;
		}

		setIsWithdrawing(true);
		setWithdrawError(null);

		try {
			const response = await fetch(`/api/campaigns/${campaignId}/leave`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
			});

			if (response.ok) {
				// Refresh campaign data
				const campaignResponse = await fetch(
					`/api/campaigns/${campaignId}`
				);
				if (campaignResponse.ok) {
					const campaignData = await campaignResponse.json();
					setCampaign(campaignData);
				}

				// Refresh enriched data
				const enrichedResponse = await fetch(
					`/api/campaigns/${campaignId}/enriched`
				);
				if (enrichedResponse.ok) {
					const enrichedData = await enrichedResponse.json();
					setPendingPlayersList(enrichedData.pendingPlayers || []);
					setSignedUpPlayersList(enrichedData.signedUpPlayers || []);
					setWaitlistPlayersList(enrichedData.waitlistPlayers || []);
				}
			} else {
				const error = await response.json();
				setWithdrawError(error.error || "Failed to withdraw from campaign");
			}
		} catch (error) {
			console.error("Error withdrawing from campaign:", error);
			setWithdrawError("Failed to withdraw from campaign");
		} finally {
			setIsWithdrawing(false);
		}
	};

	const handleAddNote = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!newNoteContent.trim() || !currentUserId) {
			return;
		}

		setIsSubmittingNote(true);
		setNoteError(null);

		try {
			const response = await fetch(`/api/campaigns/${campaignId}/notes`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ content: newNoteContent }),
			});

			if (response.ok) {
				const notesData = await response.json();
				setNotes(notesData);
				setNewNoteContent("");
			} else {
				const error = await response.json();
				setNoteError(error.error || "Failed to add note");
			}
		} catch (error) {
			console.error("Error adding note:", error);
			setNoteError("Failed to add note");
		} finally {
			setIsSubmittingNote(false);
		}
	};

	const handleDeleteNote = async (noteId: string) => {
		try {
			const response = await fetch(
				`/api/campaigns/${campaignId}/notes/${noteId}`,
				{
					method: "DELETE",
				}
			);

			if (response.ok) {
				const notesData = await response.json();
				setNotes(notesData);
			} else {
				const error = await response.json();
				alert(error.error || "Failed to delete note");
			}
		} catch (error) {
			console.error("Error deleting note:", error);
			alert("Failed to delete note");
		}
	};

	const handleSendMessage = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!currentUserId || !messageSubject.trim() || !messageContent.trim()) {
			return;
		}

		setIsSendingMessage(true);
		setMessageError(null);
		setMessageSuccess(false);

		try {
			const response = await fetch(
				`/api/campaigns/${campaignId}/message-all`,
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						subject: messageSubject,
						message: messageContent,
					}),
				}
			);

			if (response.ok) {
				setMessageSuccess(true);
				setMessageSubject("");
				setMessageContent("");
				setTimeout(() => {
					setShowMessageModal(false);
					setMessageSuccess(false);
				}, 2000);
			} else {
				const error = await response.json();
				setMessageError(error.error || "Failed to send message");
			}
		} catch (error) {
			console.error("Error sending message:", error);
			setMessageError("Failed to send message");
		} finally {
			setIsSendingMessage(false);
		}
	};

	const handleDeleteCampaign = async () => {
		if (!currentUserId) {
			return;
		}

		setIsDeleting(true);
		setDeleteError(null);

		try {
			const response = await fetch(`/api/campaigns/${campaignId}`, {
				method: "DELETE",
			});

			if (response.ok) {
				// Redirect to campaigns list after successful deletion
				router.push("/find-campaigns");
			} else {
				const error = await response.json();
				setDeleteError(error.error || "Failed to delete campaign");
			}
		} catch (error) {
			console.error("Error deleting campaign:", error);
			setDeleteError("Failed to delete campaign");
		} finally {
			setIsDeleting(false);
		}
	};

	const handleRemovePlayerClick = (player: PlayerWithInfo) => {
		setSelectedPlayer(player);
		setRemoveReason("");
		setRemoveError(null);
		setShowRemoveModal(true);
	};

	const handleRemovePlayerConfirm = async () => {
		if (!selectedPlayer || !removeReason.trim()) {
			setRemoveError("Please provide a reason for removing this player");
			return;
		}

		setIsRemovingPlayer(true);
		setRemoveError(null);

		try {
			const response = await fetch(
				`/api/campaigns/${campaignId}/remove-player`,
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						playerId: selectedPlayer.userId,
						reason: removeReason.trim(),
					}),
				}
			);

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.error || "Failed to remove player");
			}

			// Close modal and refresh data
			setShowRemoveModal(false);
			setSelectedPlayer(null);
			setRemoveReason("");

			// Refresh campaign data
			const campaignResponse = await fetch(`/api/campaigns/${campaignId}`);
			if (campaignResponse.ok) {
				const campaignData = await campaignResponse.json();
				setCampaign(campaignData);
			}

			// Refresh enriched data
			const enrichedResponse = await fetch(
				`/api/campaigns/${campaignId}/enriched`
			);
			if (enrichedResponse.ok) {
				const enrichedData = await enrichedResponse.json();
				setSignedUpPlayersList(enrichedData.signedUpPlayers || []);
				setWaitlistPlayersList(enrichedData.waitlistPlayers || []);
				setPendingPlayersList(enrichedData.pendingPlayers || []);
			}
		} catch (err) {
			setRemoveError(
				err instanceof Error ? err.message : "Failed to remove player"
			);
		} finally {
			setIsRemovingPlayer(false);
		}
	};

	const handleCancelRemovePlayer = () => {
		setShowRemoveModal(false);
		setSelectedPlayer(null);
		setRemoveReason("");
		setRemoveError(null);
	};

	if (isLoading) {
		return (
			<div className="flex min-h-screen items-center justify-center">
				<p className="text-slate-400">Loading campaign...</p>
			</div>
		);
	}

	if (!campaign) {
		return (
			<div className="flex min-h-screen items-center justify-center">
				<p className="text-slate-400">Campaign not found</p>
			</div>
		);
	}

	const availableSlots = campaign.maxPlayers - campaign.signedUpPlayers.length;
	const isFull = availableSlots <= 0;

	const shareDescription = `Join me for ${campaign.game} on ${formatDateInTimezone(campaign.date, userTimezone)}!`;

	const isCreator = currentUserId === campaign.userId;
	const isSignedUp =
		currentUserId && campaign.signedUpPlayers.includes(currentUserId);
	const isOnWaitlist =
		currentUserId && campaign.waitlist.includes(currentUserId);
	const isPending =
		currentUserId && campaign.pendingPlayers.includes(currentUserId);
	const isParticipant = isSignedUp || isOnWaitlist || isPending;

	return (
		<div className="mx-auto max-w-4xl space-y-6 px-4 py-8">
			<Link
				href="/find-campaigns"
				className="inline-block text-sm text-sky-400 hover:text-sky-300"
			>
				← Back to campaigns
			</Link>

			<div className="rounded-lg border border-slate-800 bg-slate-950/40 p-6">
				{isCreator ? (
					// Layout for creators: image below edit button
					<div>
						<div className="flex items-start justify-between gap-4">
							<h1 className="text-2xl font-bold text-slate-100">
								{campaign.game}
							</h1>
							<div className="flex gap-2">
								<Link
									href={`/campaigns/${campaignId}/edit`}
									className="rounded-lg bg-gradient-to-r from-emerald-500 to-sky-500 px-4 py-2 font-semibold text-white shadow-lg shadow-slate-900/30 transition hover:from-emerald-400 hover:to-sky-400 disabled:cursor-not-allowed disabled:opacity-60"
								>
									Edit Campaign
								</Link>
								<button
									onClick={() => setShowDeleteConfirm(true)}
									className="inline-flex items-center rounded-lg border border-rose-500 px-4 py-2 font-medium text-rose-300 transition hover:bg-rose-500/10 disabled:cursor-not-allowed disabled:opacity-60"
								>
									Delete Campaign
								</button>
							</div>
						</div>

						{/* Share buttons */}
						<div className="mt-4">
							<ShareButtons
								url={campaignUrl}
								title={`${campaign.game} - Campaign`}
								description={shareDescription}
							/>
						</div>

						{campaign.imageUrl && (
							<img
								src={campaign.imageUrl}
								alt={campaign.game}
								className="mt-4 h-32 w-32 rounded-lg border border-slate-700 object-cover"
							/>
						)}

						{/* Pending Players Manager - shown directly under image */}
						{pendingPlayersList.length > 0 && (
							<div className="mt-4">
								<PendingCampaignPlayersManager
									campaignId={campaignId}
									pendingPlayers={pendingPlayersList}
									onPlayerApproved={handlePlayerApproved}
									onPlayerDenied={handlePlayerDenied}
								/>
							</div>
						)}

						<div className="mt-4 space-y-2 text-sm text-slate-400">
							<p>
								<span className="text-slate-500">Date:</span>{" "}
								{formatDateInTimezone(campaign.date, userTimezone)}
							</p>
							<p>
								<span className="text-slate-500">Times:</span>{" "}
								{sortTimesByChronology(campaign.times).join(", ")}
							</p>
							{(campaign.location || campaign.zipCode) && (
								<p>
									<span className="text-slate-500">Location:</span>{" "}
									{campaign.location || campaign.zipCode}
								</p>
							)}
							{vendor && (
								<p>
									<span className="text-slate-500">Venue:</span>{" "}
									<Link
										href={`/vendor/${vendor.id}`}
										className="text-sky-400 hover:text-sky-300 transition-colors"
									>
										{vendor.vendorName}
									</Link>
								</p>
							)}
							<p>
								<span className="text-slate-500">Players:</span>{" "}
								<span
									className={
										isFull ? "text-orange-400" : "text-green-400"
									}
								>
									{campaign.signedUpPlayers.length}/
									{campaign.maxPlayers}
								</span>
							</p>
							{campaign.waitlist.length > 0 && (
								<p>
									<span className="text-slate-500">Waitlist:</span>{" "}
									<span className="text-yellow-400">
										{campaign.waitlist.length}
									</span>
								</p>
							)}
							{campaign.meetingFrequency && (
								<p>
									<span className="text-slate-500">Frequency:</span>{" "}
									{campaign.meetingFrequency}
								</p>
							)}
							{campaign.sessionsLeft && (
								<p>
									<span className="text-slate-500">
										Sessions Left:
									</span>{" "}
									{campaign.sessionsLeft}
								</p>
							)}
							{campaign.costPerSession && (
								<p>
									<span className="text-slate-500">
										Cost per Session:
									</span>{" "}
									${campaign.costPerSession}
								</p>
							)}
						</div>
					</div>
				) : (
					// Layout for non-creators: image on the right
					<div className="flex items-start justify-between gap-4">
						<div className="flex-1">
							<h1 className="text-2xl font-bold text-slate-100">
								{campaign.game}
							</h1>
							{campaign.hostName && (
								<p className="mt-2 text-sm text-slate-400">
									<span className="text-slate-500">Host:</span>{" "}
									<Link
										href={`/user/${campaign.userId}`}
										className="text-slate-300 hover:text-sky-300 transition-colors"
									>
										{campaign.hostName}
									</Link>
								</p>
							)}

							{/* Share buttons */}
							<div className="mt-4">
								<ShareButtons
									url={campaignUrl}
									title={`${campaign.game} - Campaign`}
									description={shareDescription}
								/>
							</div>

							<div className="mt-4 space-y-2 text-sm text-slate-400">
								<p>
									<span className="text-slate-500">Date:</span>{" "}
									{formatDateInTimezone(campaign.date, userTimezone)}
								</p>
								<p>
									<span className="text-slate-500">Times:</span>{" "}
									{sortTimesByChronology(campaign.times).join(", ")}
								</p>
								{(campaign.location || campaign.zipCode) && (
									<p>
										<span className="text-slate-500">Location:</span>{" "}
										{campaign.location || campaign.zipCode}
									</p>
								)}
								{vendor && (
									<p>
										<span className="text-slate-500">Venue:</span>{" "}
										<Link
											href={`/vendor/${vendor.id}`}
											className="text-sky-400 hover:text-sky-300 transition-colors"
										>
											{vendor.vendorName}
										</Link>
									</p>
								)}
								<p>
									<span className="text-slate-500">Players:</span>{" "}
									<span
										className={
											isFull ? "text-orange-400" : "text-green-400"
										}
									>
										{campaign.signedUpPlayers.length}/
										{campaign.maxPlayers}
									</span>
								</p>
								{campaign.waitlist.length > 0 && (
									<p>
										<span className="text-slate-500">Waitlist:</span>{" "}
										<span className="text-yellow-400">
											{campaign.waitlist.length}
										</span>
									</p>
								)}
								{campaign.meetingFrequency && (
									<p>
										<span className="text-slate-500">Frequency:</span>{" "}
										{campaign.meetingFrequency}
									</p>
								)}
								{campaign.sessionsLeft && (
									<p>
										<span className="text-slate-500">
											Sessions Left:
										</span>{" "}
										{campaign.sessionsLeft}
									</p>
								)}
								{campaign.costPerSession && (
									<p>
										<span className="text-slate-500">
											Cost per Session:
										</span>{" "}
										${campaign.costPerSession}
									</p>
								)}
							</div>
						</div>

						{campaign.imageUrl && (
							<img
								src={campaign.imageUrl}
								alt={campaign.game}
								className="h-32 w-32 rounded-lg border border-slate-700 object-cover flex-shrink-0"
							/>
						)}
					</div>
				)}

				{campaign.description && (
					<div className="mt-6 rounded-lg border border-slate-800 bg-slate-900/50 p-4">
						<h2 className="text-sm font-medium text-slate-300 mb-2">
							Description
						</h2>
						<p className="text-sm text-slate-400 whitespace-pre-wrap">
							{campaign.description}
						</p>
					</div>
				)}

				{campaign.classesNeeded && campaign.classesNeeded.length > 0 && (
					<div className="mt-4">
						<h3 className="text-sm font-medium text-slate-300 mb-2">
							Classes Needed
						</h3>
						<div className="flex flex-wrap gap-2">
							{campaign.classesNeeded.map((className) => (
								<span
									key={className}
									className="rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-300"
								>
									{className}
								</span>
							))}
						</div>
					</div>
				)}

				{campaign.daysOfWeek && campaign.daysOfWeek.length > 0 && (
					<div className="mt-4">
						<h3 className="text-sm font-medium text-slate-300 mb-2">
							Days of the Week
						</h3>
						<div className="flex flex-wrap gap-2">
							{campaign.daysOfWeek.map((day) => (
								<span
									key={day}
									className="rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-300"
								>
									{day}
								</span>
							))}
						</div>
					</div>
				)}

				{/* Join/Leave Campaign Button */}
				{!isCreator && currentUserId && (
					<div className="mt-6">
						{isPending && (
							<div className="rounded-lg border border-orange-500/20 bg-orange-500/10 px-4 py-3 text-sm text-orange-200">
								Your request to join this campaign is pending host
								approval
							</div>
						)}
						{isOnWaitlist && (
							<div className="rounded-lg border border-yellow-500/20 bg-yellow-500/10 px-4 py-3 text-sm text-yellow-200">
								You are on the waitlist for this campaign
							</div>
						)}
						{isSignedUp && (
							<div className="rounded-lg border border-green-500/20 bg-green-500/10 px-4 py-3 text-sm text-green-200">
								You are signed up for this campaign
							</div>
						)}
						{!isParticipant && (
							<button
								onClick={handleJoinCampaign}
								disabled={isJoining}
								className="w-full rounded-lg bg-gradient-to-r from-amber-600 via-purple-500 to-indigo-500 font-semibold text-white transition hover:from-amber-500 hover:via-purple-400 hover:to-indigo-400 disabled:cursor-not-allowed disabled:opacity-50 py-3 text-md"
							>
								{isJoining ? "Joining..." : "Request to Join Campaign"}
							</button>
						)}
						{isParticipant && (
							<div className="flex gap-2">
								<button
									onClick={handleSwitchCharacter}
									disabled={isUpdatingCharacter}
									className="flex-1 rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-sky-700 disabled:opacity-50"
								>
									{isUpdatingCharacter
										? "Updating..."
										: "Switch Character"}
								</button>
								<button
									onClick={handleWithdraw}
									disabled={isWithdrawing}
									className="inline-flex items-center rounded-lg border border-rose-500 px-4 py-2 font-medium text-rose-300 transition hover:bg-rose-500/10 disabled:cursor-not-allowed disabled:opacity-60"
								>
									{isWithdrawing
										? "Withdrawing..."
										: "Withdraw from Campaign"}
								</button>
							</div>
						)}
						{withdrawError && (
							<p className="mt-2 text-sm text-red-400">
								{withdrawError}
							</p>
						)}
					</div>
				)}

				{/* Payment Section */}
				{!isCreator &&
					currentUserId &&
					isPaidCampaign(campaign) &&
					isSignedUp && (
						<div className="mt-4">
							<div className="rounded-xl border border-sky-600/40 bg-sky-900/20 px-4 py-3">
								<div className="flex items-center justify-between gap-4">
									<div>
										<p className="text-sm font-medium text-sky-200">
											Payment Required
										</p>
										<p className="text-xs text-slate-400 mt-1">
											Complete payment to confirm your spot ($
											{campaign.costPerSession?.toFixed(2)})
										</p>
									</div>
									<Link
										href={`/campaigns/${campaignId}/payment`}
										className="inline-flex items-center gap-2 rounded-lg border border-sky-500/40 bg-sky-500/20 px-4 py-2 text-sm font-medium text-sky-200 transition hover:border-sky-500 hover:bg-sky-500/30"
									>
										Proceed to payment
									</Link>
								</div>
							</div>
						</div>
					)}

				{/* Message All Players Button (Host Only) */}
				{isCreator && (
					<div className="mt-6">
						<button
							onClick={() => setShowMessageModal(true)}
							className="w-full rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-purple-700"
						>
							Message All Players
						</button>
					</div>
				)}
			</div>

			{/* Players List */}
			{signedUpPlayersList.length > 0 && (
				<div className="rounded-lg border border-slate-800 bg-slate-950/40 p-6">
					<h2 className="text-lg font-semibold text-slate-100 mb-4">
						Signed Up Players ({signedUpPlayersList.length}/
						{campaign.maxPlayers})
					</h2>
					<div className="space-y-3">
						{signedUpPlayersList.map((player) => (
							<div
								key={player.userId}
								className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-900/50 p-3"
							>
								<div className="flex items-center gap-3">
									{player.avatarUrl && (
										<img
											src={player.avatarUrl}
											alt={player.name}
											className="h-10 w-10 rounded-full border border-slate-700"
										/>
									)}
									<div>
										<Link
											href={`/user/${player.userId}`}
											className="text-sm font-medium text-slate-200 hover:text-sky-300"
										>
											{player.name}
										</Link>
										{player.characterName && (
											<p className="text-xs text-slate-400">
												Playing:{" "}
												{player.characterIsPublic &&
												player.characterId ? (
													<Link
														href={`/players/${player.userId}/characters/${player.characterId}`}
														className="hover:text-sky-300 transition-colors"
													>
														{player.characterName}
													</Link>
												) : (
													player.characterName
												)}
											</p>
										)}
									</div>
								</div>
								<div className="flex items-center gap-3">
									{player.characterName && (
										<div className="flex flex-col items-end">
											{player.characterIsPublic &&
											player.characterId ? (
												<Link
													href={`/players/${player.userId}/characters/${player.characterId}`}
													className="text-sm font-medium text-slate-200 hover:text-sky-300"
												>
													{player.characterName}
												</Link>
											) : (
												<span className="text-sm font-medium text-slate-200">
													{player.characterName}
												</span>
											)}
										</div>
									)}
									{player.characterAvatarUrl && (
										<img
											src={player.characterAvatarUrl}
											alt={player.characterName || "Character"}
											className="h-10 w-10 rounded-full border border-slate-700"
										/>
									)}
									{player.hasActiveSubscription && (
										<span className="text-xs text-green-400">
											Subscriber
										</span>
									)}
									{isCreator && (
										<button
											onClick={() => handleRemovePlayerClick(player)}
											className="inline-flex items-center rounded-lg border border-rose-500 px-4 py-2 font-medium text-rose-300 transition hover:bg-rose-500/10 disabled:cursor-not-allowed disabled:opacity-60"
										>
											Remove
										</button>
									)}
								</div>
							</div>
						))}
					</div>
				</div>
			)}

			{/* Waitlist */}
			{waitlistPlayersList.length > 0 && (
				<div className="rounded-lg border border-slate-800 bg-slate-950/40 p-6">
					<h2 className="text-lg font-semibold text-slate-100 mb-4">
						Waitlist ({waitlistPlayersList.length})
					</h2>
					<div className="space-y-3">
						{waitlistPlayersList.map((player) => (
							<div
								key={player.userId}
								className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-900/50 p-3"
							>
								<div className="flex items-center gap-3">
									{player.avatarUrl && (
										<img
											src={player.avatarUrl}
											alt={player.name}
											className="h-10 w-10 rounded-full border border-slate-700"
										/>
									)}
									<div>
										<Link
											href={`/user/${player.userId}`}
											className="text-sm font-medium text-slate-200 hover:text-sky-300"
										>
											{player.name}
										</Link>
										{player.characterName && (
											<p className="text-xs text-slate-400">
												Playing:{" "}
												{player.characterIsPublic &&
												player.characterId ? (
													<Link
														href={`/players/${player.userId}/characters/${player.characterId}`}
														className="hover:text-sky-300 transition-colors"
													>
														{player.characterName}
													</Link>
												) : (
													player.characterName
												)}
											</p>
										)}
									</div>
								</div>
								<div className="flex items-center gap-3">
									{player.characterName && (
										<div className="flex flex-col items-end">
											{player.characterIsPublic &&
											player.characterId ? (
												<Link
													href={`/players/${player.userId}/characters/${player.characterId}`}
													className="text-sm font-medium text-slate-200 hover:text-sky-300"
												>
													{player.characterName}
												</Link>
											) : (
												<span className="text-sm font-medium text-slate-200">
													{player.characterName}
												</span>
											)}
										</div>
									)}
									{player.characterAvatarUrl && (
										<img
											src={player.characterAvatarUrl}
											alt={player.characterName || "Character"}
											className="h-10 w-10 rounded-full border border-slate-700"
										/>
									)}
									{player.hasActiveSubscription && (
										<span className="text-xs text-green-400">
											Subscriber
										</span>
									)}
									{isCreator && (
										<button
											onClick={() => handleRemovePlayerClick(player)}
											className="inline-flex items-center rounded-lg border border-rose-500 px-4 py-2 font-medium text-rose-300 transition hover:bg-rose-500/10 disabled:cursor-not-allowed disabled:opacity-60"
										>
											Remove
										</button>
									)}
								</div>
							</div>
						))}
					</div>
				</div>
			)}

			{/* Tabs for Details and Notes */}
			<div className="rounded-lg border border-slate-800 bg-slate-950/40">
				<div className="flex border-b border-slate-800">
					<button
						onClick={() => setActiveTab("details")}
						className={`flex-1 px-4 py-3 text-sm font-medium transition ${
							activeTab === "details"
								? "border-b-2 border-sky-500 text-sky-400"
								: "text-slate-400 hover:text-slate-300"
						}`}
					>
						Details
					</button>
					<button
						onClick={() => setActiveTab("notes")}
						className={`flex-1 px-4 py-3 text-sm font-medium transition ${
							activeTab === "notes"
								? "border-b-2 border-sky-500 text-sky-400"
								: "text-slate-400 hover:text-slate-300"
						}`}
					>
						Notes
					</button>
				</div>

				<div className="p-6">
					{activeTab === "details" && (
						<div className="space-y-4 text-sm text-slate-300">
							<div>
								<span className="text-slate-500">Created:</span>{" "}
								{new Date(campaign.createdAt).toLocaleDateString()}
							</div>
							<div>
								<span className="text-slate-500">Last Updated:</span>{" "}
								{new Date(campaign.updatedAt).toLocaleDateString()}
							</div>
						</div>
					)}

					{activeTab === "notes" && (
						<div className="space-y-4">
							{isCreator && (
								<form onSubmit={handleAddNote} className="space-y-3">
									<textarea
										value={newNoteContent}
										onChange={(e) =>
											setNewNoteContent(e.target.value)
										}
										placeholder="Add a note for the campaign..."
										className="w-full rounded-lg border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
										rows={3}
									/>
									<div className="flex items-center justify-between">
										<button
											type="submit"
											disabled={
												isSubmittingNote || !newNoteContent.trim()
											}
											className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-sky-700 disabled:opacity-50"
										>
											{isSubmittingNote ? "Adding..." : "Add Note"}
										</button>
										{noteError && (
											<p className="text-sm text-red-400">
												{noteError}
											</p>
										)}
									</div>
								</form>
							)}

							<div className="space-y-3">
								{notes.length === 0 ? (
									<p className="text-sm text-slate-400">
										No notes yet
									</p>
								) : (
									notes.map((note) => (
										<div
											key={note.id}
											className="rounded-lg border border-slate-800 bg-slate-900/50 p-4"
										>
											<div className="flex items-start justify-between gap-3">
												<div className="flex-1">
													<p className="text-sm text-slate-300 whitespace-pre-wrap">
														{note.content}
													</p>
													<p className="mt-2 text-xs text-slate-500">
														{new Date(
															note.createdAt
														).toLocaleString()}
													</p>
												</div>
												{note.userId === currentUserId && (
													<button
														onClick={() =>
															handleDeleteNote(note.id)
														}
														className="text-sm text-red-400 hover:text-red-300"
													>
														Delete
													</button>
												)}
											</div>
										</div>
									))
								)}
							</div>
						</div>
					)}
				</div>
			</div>

			{/* Subscription Prompt */}
			{!hasActiveSubscription && !isCreator && (
				<div className="rounded-lg border border-purple-500/20 bg-purple-900/10 p-6">
					<h3 className="text-lg font-semibold text-purple-200 mb-2">
						Unlock Premium Features
					</h3>
					<p className="text-sm text-purple-300 mb-4">
						Subscribe to access advanced campaign features, priority
						support, and more!
					</p>
					<Link
						href="/subscription"
						className="inline-block rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-purple-700"
					>
						Learn More
					</Link>
				</div>
			)}

			{/* Message Modal */}
			{showMessageModal && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
					<div className="w-full max-w-lg rounded-lg border border-slate-700 bg-slate-900 p-6">
						<div className="flex items-center justify-between mb-4">
							<h2 className="text-xl font-bold text-slate-100">
								Message All Players
							</h2>
							<button
								onClick={() => setShowMessageModal(false)}
								className="text-slate-400 hover:text-slate-300"
							>
								✕
							</button>
						</div>

						<form onSubmit={handleSendMessage} className="space-y-4">
							<div>
								<label className="block text-sm font-medium text-slate-300 mb-2">
									Subject
								</label>
								<input
									type="text"
									value={messageSubject}
									onChange={(e) => setMessageSubject(e.target.value)}
									className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-sm text-slate-100 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
									required
								/>
							</div>

							<div>
								<label className="block text-sm font-medium text-slate-300 mb-2">
									Message
								</label>
								<textarea
									value={messageContent}
									onChange={(e) => setMessageContent(e.target.value)}
									className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-sm text-slate-100 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
									rows={6}
									required
								/>
							</div>

							{messageError && (
								<p className="text-sm text-red-400">{messageError}</p>
							)}

							{messageSuccess && (
								<p className="text-sm text-green-400">
									Message sent successfully!
								</p>
							)}

							<div className="flex gap-3">
								<button
									type="button"
									onClick={() => setShowMessageModal(false)}
									className="flex-1 rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium text-slate-300 transition hover:bg-slate-800"
								>
									Cancel
								</button>
								<button
									type="submit"
									disabled={isSendingMessage}
									className="flex-1 rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-purple-700 disabled:opacity-50"
								>
									{isSendingMessage ? "Sending..." : "Send Message"}
								</button>
							</div>
						</form>
					</div>
				</div>
			)}

			{/* Delete Confirmation Modal */}
			{showDeleteConfirm && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
					<div className="w-full max-w-md rounded-lg border border-slate-700 bg-slate-900 p-6">
						<div className="mb-4">
							<h2 className="text-xl font-bold text-slate-100">
								Delete Campaign
							</h2>
							<p className="mt-2 text-sm text-slate-400">
								Are you sure you want to delete this campaign? This
								action cannot be undone.
							</p>
						</div>

						{deleteError && (
							<div className="mb-4 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
								{deleteError}
							</div>
						)}

						<div className="flex gap-3">
							<button
								type="button"
								onClick={() => {
									setShowDeleteConfirm(false);
									setDeleteError(null);
								}}
								disabled={isDeleting}
								className="flex-1 rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium text-slate-300 transition hover:bg-slate-800 disabled:opacity-50"
							>
								Cancel
							</button>
							<button
								type="button"
								onClick={handleDeleteCampaign}
								disabled={isDeleting}
								className="inline-flex items-center rounded-lg border border-rose-500 px-4 py-2 font-medium text-rose-300 transition hover:bg-rose-500/10 disabled:cursor-not-allowed disabled:opacity-60"
							>
								{isDeleting ? "Deleting..." : "Delete"}
							</button>
						</div>
					</div>
				</div>
			)}

			{/* Remove Player Modal */}
			{showRemoveModal && selectedPlayer && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
					<div className="w-full max-w-md rounded-lg border border-slate-800 bg-slate-900 p-6">
						<h3 className="text-xl font-semibold text-slate-100 mb-4">
							Remove Player
						</h3>
						<p className="text-slate-300 mb-4">
							You are about to remove{" "}
							<strong>{selectedPlayer.name}</strong> from this campaign.
							Please provide a reason that will be sent to the player.
						</p>

						{removeError && (
							<div className="mb-4 rounded-lg border border-red-800 bg-red-900/20 px-4 py-3 text-sm text-red-400">
								{removeError}
							</div>
						)}

						<div className="mb-4">
							<label
								htmlFor="removeReason"
								className="block text-sm font-medium text-slate-300 mb-2"
							>
								Reason for removal
								<span className="text-red-500">*</span>
							</label>
							<textarea
								id="removeReason"
								value={removeReason}
								onChange={(e) => setRemoveReason(e.target.value)}
								placeholder="Please explain why you are removing this player..."
								rows={4}
								className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-slate-100 placeholder-slate-500 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
								disabled={isRemovingPlayer}
							/>
						</div>

						<div className="flex gap-3">
							<button
								onClick={handleCancelRemovePlayer}
								disabled={isRemovingPlayer}
								className="flex-1 rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-sm font-medium text-slate-300 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
							>
								Cancel
							</button>
							<button
								onClick={handleRemovePlayerConfirm}
								disabled={isRemovingPlayer || !removeReason.trim()}
								className="inline-flex items-center rounded-lg border border-rose-500 px-4 py-2 font-medium text-rose-300 transition hover:bg-rose-500/10 disabled:cursor-not-allowed disabled:opacity-60"
							>
								{isRemovingPlayer ? "Removing..." : "Remove Player"}
							</button>
						</div>
					</div>
				</div>
			)}

			{/* Character Selection Dialog for Joining */}
			{showCharacterDialog && (
				<CharacterSelectionDialog
					onSelect={handleCharacterSelect}
					onCancel={handleCharacterCancel}
					isLoading={isJoining}
					gameSystem={campaign?.game}
				/>
			)}

			{/* Character Selection Dialog for Switching */}
			{showCharacterSwitchDialog && (
				<CharacterSelectionDialog
					onSelect={handleCharacterSwitch}
					onCancel={handleCharacterSwitchCancel}
					isLoading={isUpdatingCharacter}
					gameSystem={campaign?.game}
				/>
			)}
		</div>
	);
}
