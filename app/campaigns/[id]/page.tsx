import Link from "next/link";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { getCampaign } from "@/lib/campaigns/db";
import { getUsersBasicInfo } from "@/lib/users";
import { formatDateInTimezone, DEFAULT_TIMEZONE } from "@/lib/timezone";
import { formatTimeSlotsByGroup } from "@/lib/constants";
import type { Metadata } from "next";

export async function generateMetadata({
	params,
}: {
	params: Promise<{ id: string }>;
}): Promise<Metadata> {
	const { id } = await params;
	const campaign = await getCampaign(id);

	if (!campaign) {
		return {
			title: "Campaign Not Found",
		};
	}

	const formattedDate = formatDateInTimezone(campaign.date, DEFAULT_TIMEZONE);
	
	const baseDescription = campaign.description
		? `${campaign.description.substring(0, 150)}${campaign.description.length > 150 ? "..." : ""}`
		: `Join us for ${campaign.game}. ${campaign.maxPlayers - campaign.signedUpPlayers.length} spots available!`;
	
	const description = `${baseDescription} | Start Date: ${formattedDate}`;

	const url = `${process.env.NEXT_PUBLIC_APP_URL || "https://thegatheringcall.com"}/campaigns/${id}`;

	return {
		title: `${campaign.game} - Campaign`,
		description,
		openGraph: {
			title: `${campaign.game} Campaign`,
			description,
			url,
			type: "website",
			images: campaign.imageUrl
				? [
						{
							url: campaign.imageUrl,
							width: 1200,
							height: 630,
							alt: campaign.game,
						},
				  ]
				: [],
		},
		twitter: {
			card: "summary_large_image",
			title: `${campaign.game} Campaign`,
			description,
			images: campaign.imageUrl ? [campaign.imageUrl] : [],
		},
	};
}

export default async function CampaignDetailPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const { id } = await params;
	const campaign = await getCampaign(id);

	if (!campaign) {
		notFound();
	}

	// Get current user ID
	const cookieStore = await cookies();
	const currentUserId = cookieStore.get("userId")?.value;

	// Fetch user information for all players
	const allUserIds = [
		campaign.userId,
		...campaign.signedUpPlayers,
		...campaign.waitlist,
		...campaign.pendingPlayers,
	];
	const usersMap = await getUsersBasicInfo(allUserIds);

	const host = usersMap.get(campaign.userId);
	
	const signedUpPlayersList = campaign.signedUpPlayers
		.map((playerId) => {
			const user = usersMap.get(playerId);
			const characterInfo = campaign.signedUpPlayersWithCharacters?.find(p => p.userId === playerId);
			return user ? { 
				...user, 
				characterName: characterInfo?.characterName,
			} : undefined;
		})
		.filter((user) => user !== undefined);
	
	const waitlistPlayersList = campaign.waitlist
		.map((playerId) => {
			const user = usersMap.get(playerId);
			const characterInfo = campaign.waitlistWithCharacters?.find(p => p.userId === playerId);
			return user ? { 
				...user, 
				characterName: characterInfo?.characterName,
			} : undefined;
		})
		.filter((user) => user !== undefined);

	const isFull = campaign.signedUpPlayers.length >= campaign.maxPlayers;
	const availableSlots = campaign.maxPlayers - campaign.signedUpPlayers.length;
	const isHost = currentUserId === campaign.userId;

	const isUserSignedUp =
		currentUserId &&
		(campaign.signedUpPlayers.includes(currentUserId) ||
			campaign.waitlist.includes(currentUserId) ||
			campaign.pendingPlayers.includes(currentUserId));

	return (
		<div className="mx-auto flex w-full max-w-4xl flex-col gap-8 px-4 py-8 text-slate-100">
			{/* Back link */}
			<Link
				href="/find-campaigns"
				className="text-sm font-medium text-sky-300 hover:text-sky-200"
			>
				← Back to Find Campaigns
			</Link>

			{/* Campaign Image */}
			{campaign.imageUrl && (
				<div className="aspect-video w-full overflow-hidden rounded-lg border border-slate-800 bg-slate-900/50">
					<img
						src={campaign.imageUrl}
						alt={campaign.game}
						className="h-full w-full object-cover"
					/>
				</div>
			)}

			{/* Campaign title and basic info */}
			<header className="space-y-4">
				<div className="flex items-start justify-between gap-4">
					<div>
						<h1 className="text-3xl font-bold text-slate-100">
							{campaign.game}
						</h1>
						<p className="mt-2 text-sm uppercase tracking-wide text-slate-400">
							Campaign
						</p>
					</div>
				</div>
			</header>

			{/* Campaign details grid */}
			<div className="grid gap-6 md:grid-cols-2">
				{/* Left column - Campaign information */}
				<div className="space-y-6">
					{/* Host information */}
					<section className="rounded-lg border border-slate-800 bg-slate-900/50 p-4">
						<h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">
							Game Master
						</h2>
						{host ? (
							<Link
								href={`/user/${campaign.userId}`}
								className="flex items-center gap-3 text-slate-100 hover:text-sky-300"
							>
								{host.avatarUrl && (
									<img
										src={host.avatarUrl}
										alt={host.name}
										className="h-10 w-10 rounded-full border border-slate-700"
									/>
								)}
								<span className="font-medium">{host.name}</span>
							</Link>
						) : (
							<p className="text-slate-400">Unknown Host</p>
						)}
					</section>

					{/* Campaign schedule */}
					<section className="rounded-lg border border-slate-800 bg-slate-900/50 p-4">
						<h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">
							Schedule
						</h2>
						<div className="space-y-2 text-sm">
							<div>
								<span className="text-slate-500">Start Date:</span>{" "}
								<span className="text-slate-100">
									{formatDateInTimezone(campaign.date, DEFAULT_TIMEZONE)}
								</span>
							</div>
							{campaign.times && campaign.times.length > 0 && (
								<div>
									<span className="text-slate-500">Time Slots:</span>{" "}
									<span className="text-slate-100">
										{formatTimeSlotsByGroup(campaign.times)}
									</span>
								</div>
							)}
							{campaign.meetingFrequency && (
								<div>
									<span className="text-slate-500">Frequency:</span>{" "}
									<span className="text-slate-100">{campaign.meetingFrequency}</span>
								</div>
							)}
							{campaign.daysOfWeek && campaign.daysOfWeek.length > 0 && (
								<div>
									<span className="text-slate-500">Days:</span>{" "}
									<span className="text-slate-100">
										{campaign.daysOfWeek.join(", ")}
									</span>
								</div>
							)}
							{campaign.sessionsLeft && (
								<div>
									<span className="text-slate-500">Sessions Remaining:</span>{" "}
									<span className="text-slate-100">{campaign.sessionsLeft}</span>
								</div>
							)}
						</div>
					</section>

					{/* Location */}
					{campaign.location && (
						<section className="rounded-lg border border-slate-800 bg-slate-900/50 p-4">
							<h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">
								Location
							</h2>
							<p className="text-sm text-slate-100">
								{campaign.location}
								{campaign.zipCode && ` (${campaign.zipCode})`}
							</p>
						</section>
					)}

					{/* Campaign info */}
					{(campaign.classesNeeded || campaign.costPerSession) && (
						<section className="rounded-lg border border-slate-800 bg-slate-900/50 p-4">
							<h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">
								Campaign Details
							</h2>
							<div className="space-y-2 text-sm">
								{campaign.classesNeeded && campaign.classesNeeded.length > 0 && (
									<div>
										<span className="text-slate-500">Classes Needed:</span>{" "}
										<span className="text-slate-100">{campaign.classesNeeded.join(", ")}</span>
									</div>
								)}
								{campaign.costPerSession && (
									<div>
										<span className="text-slate-500">Cost Per Session:</span>{" "}
										<span className="text-slate-100">${campaign.costPerSession}</span>
									</div>
								)}
							</div>
						</section>
					)}
				</div>

				{/* Right column - Players and description */}
				<div className="space-y-6">
					{/* Description */}
					<section className="rounded-lg border border-slate-800 bg-slate-900/50 p-4">
						<h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">
							Description
						</h2>
						<p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-200">
							{campaign.description}
						</p>
					</section>

					{/* Player slots */}
					<section className="rounded-lg border border-slate-800 bg-slate-900/50 p-4">
						<div className="mb-3 flex items-center justify-between">
							<h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
								Players
							</h2>
							<span className="text-sm text-slate-400">
								{campaign.signedUpPlayers.length} / {campaign.maxPlayers}
							</span>
						</div>

						{/* Signed up players */}
						{signedUpPlayersList.length > 0 ? (
							<ul className="space-y-2">
								{signedUpPlayersList.map((player) => (
									<li key={player.id} className="flex items-center gap-2">
										{player.avatarUrl && (
											<img
												src={player.avatarUrl}
												alt={player.name}
												className="h-8 w-8 rounded-full border border-slate-700"
											/>
										)}
										<div className="flex-1">
											<Link
												href={`/user/${player.id}`}
												className="text-sm font-medium text-slate-100 hover:text-sky-300"
											>
												{player.name}
											</Link>
											{player.characterName && (
												<p className="text-xs text-slate-500">
													Playing: {player.characterName}
												</p>
											)}
										</div>
									</li>
								))}
							</ul>
						) : (
							<p className="text-sm text-slate-500">No players yet</p>
						)}

						{/* Available slots indicator */}
						{!isFull && availableSlots > 0 && (
							<p className="mt-3 text-sm text-slate-400">
								{availableSlots} {availableSlots === 1 ? "slot" : "slots"} available
							</p>
						)}

						{/* Waitlist */}
						{waitlistPlayersList.length > 0 && (
							<div className="mt-4 border-t border-slate-700 pt-4">
								<h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
									Waitlist ({waitlistPlayersList.length})
								</h3>
								<ul className="space-y-2">
									{waitlistPlayersList.map((player) => (
										<li key={player.id} className="flex items-center gap-2">
											{player.avatarUrl && (
												<img
													src={player.avatarUrl}
													alt={player.name}
													className="h-6 w-6 rounded-full border border-slate-700"
												/>
											)}
											<Link
												href={`/user/${player.id}`}
												className="text-sm text-slate-300 hover:text-sky-300"
											>
												{player.name}
											</Link>
										</li>
									))}
								</ul>
							</div>
						)}
					</section>

					{/* Join/Leave button */}
					{!isHost && currentUserId && (
						<div className="rounded-lg border border-slate-800 bg-slate-900/50 p-4">
							{isUserSignedUp ? (
								<p className="text-sm text-slate-400">
									You have requested to join this campaign. The Game Master will review your request.
								</p>
							) : isFull ? (
								<p className="text-sm text-slate-400">
									This campaign is currently full. You can join the waitlist from the Find Campaigns page.
								</p>
							) : (
								<p className="text-sm text-slate-400">
									You can request to join this campaign from the Find Campaigns page.
								</p>
							)}
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
