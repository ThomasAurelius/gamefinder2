import Link from "next/link";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { getGameSession } from "@/lib/games/db";
import { getUsersBasicInfo } from "@/lib/users";
import { formatDateInTimezone, DEFAULT_TIMEZONE } from "@/lib/timezone";
import { formatTimeSlotsByGroup } from "@/lib/constants";
import PendingPlayersManager from "@/components/PendingPlayersManager";
import GameActions from "@/components/GameActions";
import { getCharactersPublicStatus } from "@/lib/characters/db";
import ShareToFacebook from "@/components/ShareToFacebook";
import GameDetailActions from "@/components/GameDetailActions";
import { isPaidGame } from "@/lib/game-utils";
import type { Metadata } from "next";

export async function generateMetadata({
	params,
}: {
	params: Promise<{ id: string }>;
}): Promise<Metadata> {
	const { id } = await params;
	const session = await getGameSession(id);

	if (!session) {
		return {
			title: "Game Not Found",
		};
	}

	const formattedDate = formatDateInTimezone(session.date, DEFAULT_TIMEZONE);
	
	// Always include the date in the description, even with custom descriptions
	const baseDescription = session.description
		? `${session.description.substring(0, 150)}${session.description.length > 150 ? "..." : ""}`
		: `Join us for ${session.game}. ${session.maxPlayers - session.signedUpPlayers.length} spots available!`;
	
	const description = `${baseDescription} | Date: ${formattedDate}`;

	const url = `${process.env.NEXT_PUBLIC_APP_URL || "https://thegatheringcall.com"}/games/${id}`;

	return {
		title: `${session.game} - Game Session`,
		description,
		openGraph: {
			title: `${session.game} on ${formattedDate}`,
			description,
			url,
			type: "website",
			images: session.imageUrl
				? [
						{
							url: session.imageUrl,
							width: 1200,
							height: 630,
							alt: session.game,
						},
				  ]
				: [],
		},
		twitter: {
			card: "summary_large_image",
			title: `${session.game} on ${formattedDate}`,
			description,
			images: session.imageUrl ? [session.imageUrl] : [],
		},
	};
}

export default async function GameDetailPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const { id } = await params;
	const session = await getGameSession(id);

	if (!session) {
		notFound();
	}

	// Get current user ID
	const cookieStore = await cookies();
	const currentUserId = cookieStore.get("userId")?.value;

	// Fetch user information for all players, waitlist, and pending
	const allUserIds = [
		session.userId,
		...session.signedUpPlayers,
		...session.waitlist,
		...session.pendingPlayers,
	];
	const usersMap = await getUsersBasicInfo(allUserIds);

	const host = usersMap.get(session.userId);
	
	// Collect all character IDs to fetch their public status
	const signedUpPlayersWithCharacters = session.signedUpPlayersWithCharacters || [];
	const waitlistWithCharacters = session.waitlistWithCharacters || [];
	const pendingPlayersWithCharacters = session.pendingPlayersWithCharacters || [];
	
	const allCharacterRefs = [
		...signedUpPlayersWithCharacters.filter(p => p.characterId).map(p => ({ userId: p.userId, characterId: p.characterId! })),
		...waitlistWithCharacters.filter(p => p.characterId).map(p => ({ userId: p.userId, characterId: p.characterId! })),
		...pendingPlayersWithCharacters.filter(p => p.characterId).map(p => ({ userId: p.userId, characterId: p.characterId! })),
	];
	
	const charactersPublicStatusMap = await getCharactersPublicStatus(allCharacterRefs);
	
	// Create enriched player lists with character information
	const signedUpPlayersList = session.signedUpPlayers
		.map((playerId) => {
			const user = usersMap.get(playerId);
			const characterInfo = signedUpPlayersWithCharacters.find(p => p.userId === playerId);
			return user ? { 
				...user, 
				characterName: characterInfo?.characterName,
				characterId: characterInfo?.characterId,
				characterIsPublic: characterInfo?.characterId ? charactersPublicStatusMap.get(characterInfo.characterId) ?? false : false,
			} : undefined;
		})
		.filter((user) => user !== undefined);
	
	const waitlistPlayersList = session.waitlist
		.map((playerId) => {
			const user = usersMap.get(playerId);
			const characterInfo = waitlistWithCharacters.find(p => p.userId === playerId);
			return user ? { 
				...user, 
				characterName: characterInfo?.characterName,
				characterId: characterInfo?.characterId,
				characterIsPublic: characterInfo?.characterId ? charactersPublicStatusMap.get(characterInfo.characterId) ?? false : false,
			} : undefined;
		})
		.filter((user) => user !== undefined);
	
	const pendingPlayersList = session.pendingPlayers
		.map((playerId) => {
			const user = usersMap.get(playerId);
			const characterInfo = pendingPlayersWithCharacters.find(p => p.userId === playerId);
			return user ? { 
				...user, 
				characterName: characterInfo?.characterName,
				characterId: characterInfo?.characterId,
				characterIsPublic: characterInfo?.characterId ? charactersPublicStatusMap.get(characterInfo.characterId) ?? false : false,
			} : undefined;
		})
		.filter((user) => user !== undefined);

	const isFull = session.signedUpPlayers.length >= session.maxPlayers;
	const availableSlots = session.maxPlayers - session.signedUpPlayers.length;
	const isHost = currentUserId === session.userId;

	// Check if the current user is signed up (in any list)
	const isUserSignedUp =
		currentUserId &&
		(session.signedUpPlayers.includes(currentUserId) ||
			session.waitlist.includes(currentUserId) ||
			session.pendingPlayers.includes(currentUserId));

	// Get the full URL for sharing
	const gameUrl = `${process.env.NEXT_PUBLIC_APP_URL || "https://thegatheringcall.com"}/games/${id}`;
	const shareQuote = `Join me for ${session.game} on ${formatDateInTimezone(session.date, DEFAULT_TIMEZONE)}!`;

	return (
		<div className="mx-auto flex w-full max-w-4xl flex-col gap-8 px-4 py-8 text-slate-100">
			{/* Back link */}
			<Link
				href="/find"
				className="text-sm font-medium text-sky-300 hover:text-sky-200"
			>
				← Back to Find Games
			</Link>

			{/* Game Image */}
			{session.imageUrl && (
				<div className="aspect-video w-full overflow-hidden rounded-lg border border-slate-800 bg-slate-900/50">
					<img
						src={session.imageUrl}
						alt={session.game}
						className="h-full w-full object-cover"
					/>
				</div>
			)}

			{/* Game title and basic info */}
			<header className="space-y-4">
				<div className="flex items-start justify-between gap-4">
					<div>
						<h1 className="text-3xl font-bold text-slate-100">
							{session.game}
						</h1>
						<p className="mt-2 text-sm uppercase tracking-wide text-slate-400">
							Game Session
						</p>
					</div>

					{/* Edit and Delete buttons - only visible to host */}
					{isHost && <GameActions session={session} />}
				</div>

				{/* Share to Facebook button */}
				<div className="flex gap-3">
					<ShareToFacebook url={gameUrl} quote={shareQuote} />
					<GameDetailActions
						sessionId={id}
						currentUserId={currentUserId ?? null}
						isUserSignedUp={!!isUserSignedUp}
						isHost={isHost}
					/>
				</div>

				{/* Payment Section for non-hosts */}
				{!isHost && currentUserId && isPaidGame(session) && (
					<div className="mt-4">
						{session.signedUpPlayers.includes(currentUserId) ? (
							<div className="rounded-xl border border-sky-600/40 bg-sky-900/20 px-4 py-3">
								<div className="flex items-center justify-between gap-4">
									<div>
										<p className="text-sm font-medium text-sky-200">Payment Required</p>
										<p className="text-xs text-slate-400 mt-1">
											Complete payment to confirm your spot (${session.costPerSession?.toFixed(2)})
										</p>
									</div>
									<Link
										href={`/games/${id}/payment`}
										className="inline-flex items-center gap-2 rounded-lg border border-sky-500/40 bg-sky-500/20 px-4 py-2 text-sm font-medium text-sky-200 transition hover:border-sky-500 hover:bg-sky-500/30"
									>
										Proceed to payment
									</Link>
								</div>
							</div>
						) : session.pendingPlayers.includes(currentUserId) ? (
							<div className="rounded-xl border border-orange-500/20 bg-orange-500/10 px-4 py-3 text-sm text-orange-200">
								Your request to join this game is pending approval from the host. You&apos;ll be able to proceed with payment once you&apos;ve been approved.
							</div>
						) : session.waitlist.includes(currentUserId) ? (
							<div className="rounded-xl border border-yellow-500/20 bg-yellow-500/10 px-4 py-3 text-sm text-yellow-200">
								You&apos;re currently on the waitlist for this game. You&apos;ll be able to proceed with payment once a spot becomes available.
							</div>
						) : null}
					</div>
				)}

				<div className="flex flex-wrap items-center gap-4 text-sm">
					<div className="rounded-lg border border-slate-800 bg-slate-900/70 px-4 py-2">
						<span className="block text-xs uppercase tracking-wide text-slate-400">
							Date
						</span>
						<span className="text-base font-medium text-slate-100">
							{formatDateInTimezone(session.date, DEFAULT_TIMEZONE)}
						</span>
					</div>

					<div className="rounded-lg border border-slate-800 bg-slate-900/70 px-4 py-2">
						<span className="block text-xs uppercase tracking-wide text-slate-400">
							Time Slots
						</span>
						<span className="whitespace-pre-line text-base font-medium text-slate-100">
							{formatTimeSlotsByGroup(session.times)}
						</span>
					</div>

					<div className="rounded-lg border border-slate-800 bg-slate-900/70 px-4 py-2">
						<span className="block text-xs uppercase tracking-wide text-slate-400">
							Players
						</span>
						<span
							className={`text-base font-medium ${isFull ? "text-orange-400" : "text-green-400"}`}
						>
							{session.signedUpPlayers.length}/{session.maxPlayers}
						</span>
					</div>

					{session.costPerSession !== undefined && session.costPerSession > 0 && (
						<div className="rounded-lg border border-sky-600/40 bg-sky-900/20 px-4 py-2">
							<span className="block text-xs uppercase tracking-wide text-sky-400">
								Cost
							</span>
							<span className="text-base font-medium text-sky-100">
								${session.costPerSession.toFixed(2)}
							</span>
						</div>
					)}
				</div>
			</header>

			{/* Description */}
			{session.description && (
				<section className="space-y-2">
					<h2 className="text-lg font-semibold text-slate-100">
						Description
					</h2>
					<p className="whitespace-pre-line text-base text-slate-200">
						{session.description}
					</p>
				</section>
			)}

			{/* Host Information */}
			<section className="space-y-3">
				<h2 className="text-lg font-semibold text-slate-100">
					Game Master
				</h2>
				<div className="rounded-lg border border-slate-800 bg-slate-900/70 p-4">
					<Link
						href={`/user/${session.userId}`}
						className="flex items-center gap-4 hover:opacity-80 transition-opacity"
					>
						{host?.avatarUrl ? (
							<img
								src={host.avatarUrl}
								alt={host.name}
								className="h-12 w-12 rounded-full border-2 border-slate-700 object-cover"
							/>
						) : (
							<div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-slate-700 bg-slate-800 text-lg font-semibold text-slate-400">
								{host ? host.name.charAt(0).toUpperCase() : "?"}
							</div>
						)}
						<p className="text-base text-slate-100">
							{host ? host.name : "Unknown Host"}
						</p>
					</Link>
				</div>
			</section>

			{/* Pending Players (only visible to host) */}
			{isHost && pendingPlayersList.length > 0 && (
				<PendingPlayersManager
					sessionId={id}
					pendingPlayers={pendingPlayersList.map(p => ({
						id: p.id,
						name: p.name,
						avatarUrl: p.avatarUrl,
						characterName: p.characterName,
					}))}
				/>
			)}

			{/* Signed Up Players */}
			<section className="space-y-3">
				<div className="flex items-center justify-between">
					<h2 className="text-lg font-semibold text-slate-100">
						Signed Up Players
					</h2>
					<span className="text-sm text-slate-400">
						{session.signedUpPlayers.length} / {session.maxPlayers}
					</span>
				</div>

				{signedUpPlayersList.length > 0 ? (
					<div className="space-y-2">
						{signedUpPlayersList.map((player, index) => (
							<div
								key={player.id}
								className="rounded-lg border border-slate-800 bg-slate-900/70 px-4 py-3 text-base text-slate-100"
							>
								<div className="flex items-center gap-3">
									<span className="flex h-8 w-8 items-center justify-center rounded-full bg-sky-600 text-sm font-medium">
										{index + 1}
									</span>
									<div className="flex flex-col">
										<Link
											href={`/players/${player.id}`}
											className="hover:text-sky-300 transition-colors"
										>
											{player.name}
										</Link>
										{player.characterName && (
											<span className="text-sm text-slate-400">
												Playing as:{" "}
												{player.characterIsPublic && player.characterId ? (
													<Link
														href={`/players/${player.id}/characters/${player.characterId}`}
														className="hover:text-sky-300 transition-colors"
													>
														{player.characterName}
													</Link>
												) : (
													player.characterName
												)}
											</span>
										)}
									</div>
								</div>
							</div>
						))}
					</div>
				) : (
					<p className="rounded-lg border border-slate-800 bg-slate-900/70 px-4 py-3 text-sm text-slate-400">
						No players signed up yet.
					</p>
				)}

				{availableSlots > 0 && (
					<p className="text-sm text-green-400">
						{availableSlots} {availableSlots === 1 ? "spot" : "spots"}{" "}
						available
					</p>
				)}
			</section>

			{/* Waitlist */}
			{(waitlistPlayersList.length > 0 || isFull) && (
				<section className="space-y-3">
					<div className="flex items-center justify-between">
						<h2 className="text-lg font-semibold text-slate-100">
							Waitlist
						</h2>
						<span className="text-sm text-slate-400">
							{waitlistPlayersList.length}{" "}
							{waitlistPlayersList.length === 1 ? "player" : "players"}
						</span>
					</div>

					{waitlistPlayersList.length > 0 ? (
						<div className="space-y-2">
							{waitlistPlayersList.map((player, index) => (
								<div
									key={player.id}
									className="rounded-lg border border-slate-800 bg-slate-900/70 px-4 py-3 text-base text-slate-100"
								>
									<div className="flex items-center gap-3">
										<span className="flex h-8 w-8 items-center justify-center rounded-full bg-yellow-600 text-sm font-medium">
											{index + 1}
										</span>
										<div className="flex flex-col">
											<Link
												href={`/players/${player.id}`}
												className="hover:text-sky-300 transition-colors"
											>
												{player.name}
											</Link>
											{player.characterName && (
												<span className="text-sm text-slate-400">
													Playing as:{" "}
													{player.characterIsPublic && player.characterId ? (
														<Link
															href={`/players/${player.id}/characters/${player.characterId}`}
															className="hover:text-sky-300 transition-colors"
														>
															{player.characterName}
														</Link>
													) : (
														player.characterName
													)}
												</span>
											)}
										</div>
									</div>
								</div>
							))}
						</div>
					) : (
						<p className="rounded-lg border border-slate-800 bg-slate-900/70 px-4 py-3 text-sm text-slate-400">
							No players on waitlist.
						</p>
					)}
				</section>
			)}

			{/* Game metadata */}
			<section className="rounded-lg border border-slate-800 bg-slate-900/40 p-4">
				<div className="space-y-2 text-xs text-slate-400">
					<p>
						<span className="font-medium">Created:</span>{" "}
						{new Date(session.createdAt).toLocaleString()}
					</p>
					<p>
						<span className="font-medium">Last Updated:</span>{" "}
						{new Date(session.updatedAt).toLocaleString()}
					</p>
				</div>
			</section>
		</div>
	);
}
