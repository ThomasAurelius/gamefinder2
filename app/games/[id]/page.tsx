import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { getGameSession } from "@/lib/games/db";
import { getUsersBasicInfo } from "@/lib/users";
import { formatDateInTimezone, DEFAULT_TIMEZONE } from "@/lib/timezone";
import { getCharactersPublicStatus } from "@/lib/characters/db";
import { getVendorById } from "@/lib/vendors";
import GameDetailClient from "@/components/GameDetailClient";
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
	
	// Format times for display
	const timesStr = session.times.length > 0 ? ` | Times: ${session.times.join(", ")}` : "";
	const description = `${baseDescription} | Date: ${formattedDate}${timesStr}`;

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
	
	// Fetch vendor information if vendorId is present
	let vendor = null;
	if (session.vendorId) {
		vendor = await getVendorById(session.vendorId);
	}
	
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
	const shareDescription = `Join me for ${session.game} on ${formatDateInTimezone(session.date, DEFAULT_TIMEZONE)}!`;

	return (
		<GameDetailClient
			session={session}
			host={host || null}
			vendor={vendor}
			signedUpPlayersList={signedUpPlayersList}
			waitlistPlayersList={waitlistPlayersList}
			pendingPlayersList={pendingPlayersList}
			currentUserId={currentUserId || null}
			isHost={isHost}
			isUserSignedUp={!!isUserSignedUp}
			gameUrl={gameUrl}
			shareDescription={shareDescription}
		/>
	);
}
