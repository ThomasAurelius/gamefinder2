import { NextResponse } from "next/server";
import { getCampaign } from "@/lib/campaigns/db";
import { getUsersBasicInfo } from "@/lib/users";
import { getCharactersPublicStatus } from "@/lib/characters/db";

type PendingPlayer = {
  id: string;
  name: string;
  avatarUrl?: string;
  characterName?: string;
  characterId?: string;
  characterIsPublic?: boolean;
};

type PlayerWithInfo = {
  userId: string;
  name: string;
  avatarUrl?: string;
  characterName?: string;
  characterId?: string;
  characterIsPublic?: boolean;
  hasActiveSubscription?: boolean;
};

/**
 * GET /api/campaigns/[id]/enriched - Get campaign with enriched player information
 * Returns the campaign data with player names, avatars, and character information
 */
export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    
    const campaign = await getCampaign(id);
    
    if (!campaign) {
      return NextResponse.json(
        { error: "Campaign not found" },
        { status: 404 }
      );
    }

    // Collect all unique user IDs from all player lists
    const allUserIds = new Set<string>();
    
    // Add pending players
    campaign.pendingPlayers.forEach(userId => allUserIds.add(userId));
    campaign.pendingPlayersWithCharacters?.forEach(player => allUserIds.add(player.userId));
    
    // Add signed up players
    campaign.signedUpPlayers.forEach(userId => allUserIds.add(userId));
    campaign.signedUpPlayersWithCharacters?.forEach(player => allUserIds.add(player.userId));
    
    // Add waitlist players
    campaign.waitlist.forEach(userId => allUserIds.add(userId));
    campaign.waitlistWithCharacters?.forEach(player => allUserIds.add(player.userId));

    // Fetch user information for all players
    const usersInfo = await getUsersBasicInfo(Array.from(allUserIds));

    // Collect all character IDs to fetch their public status
    const allCharacterRefs: { userId: string; characterId: string }[] = [];
    
    campaign.signedUpPlayersWithCharacters?.filter(p => p.characterId).forEach(p => {
      allCharacterRefs.push({ userId: p.userId, characterId: p.characterId! });
    });
    campaign.waitlistWithCharacters?.filter(p => p.characterId).forEach(p => {
      allCharacterRefs.push({ userId: p.userId, characterId: p.characterId! });
    });
    campaign.pendingPlayersWithCharacters?.filter(p => p.characterId).forEach(p => {
      allCharacterRefs.push({ userId: p.userId, characterId: p.characterId! });
    });
    
    const charactersPublicStatusMap = await getCharactersPublicStatus(allCharacterRefs);

    // Build enriched pending players list
    const pendingPlayers: PendingPlayer[] = [];
    
    // First, process pendingPlayersWithCharacters if available
    if (campaign.pendingPlayersWithCharacters && campaign.pendingPlayersWithCharacters.length > 0) {
      for (const player of campaign.pendingPlayersWithCharacters) {
        const userInfo = usersInfo.get(player.userId);
        if (userInfo) {
          pendingPlayers.push({
            id: player.userId,
            name: userInfo.name,
            avatarUrl: userInfo.avatarUrl,
            characterName: player.characterName,
            characterId: player.characterId,
            characterIsPublic: player.characterId ? charactersPublicStatusMap.get(player.characterId) ?? false : false,
          });
        }
      }
    } else {
      // Fallback to simple pendingPlayers array
      for (const userId of campaign.pendingPlayers) {
        const userInfo = usersInfo.get(userId);
        if (userInfo) {
          pendingPlayers.push({
            id: userId,
            name: userInfo.name,
            avatarUrl: userInfo.avatarUrl,
          });
        }
      }
    }

    // Build enriched signed up players list
    const signedUpPlayers: PlayerWithInfo[] = [];
    
    if (campaign.signedUpPlayersWithCharacters && campaign.signedUpPlayersWithCharacters.length > 0) {
      for (const player of campaign.signedUpPlayersWithCharacters) {
        const userInfo = usersInfo.get(player.userId);
        if (userInfo) {
          signedUpPlayers.push({
            userId: player.userId,
            name: userInfo.name,
            avatarUrl: userInfo.avatarUrl,
            characterName: player.characterName,
            characterId: player.characterId,
            characterIsPublic: player.characterId ? charactersPublicStatusMap.get(player.characterId) ?? false : false,
            // TODO: Add subscription status check if needed
            hasActiveSubscription: false,
          });
        }
      }
    } else {
      // Fallback to simple signedUpPlayers array
      for (const userId of campaign.signedUpPlayers) {
        const userInfo = usersInfo.get(userId);
        if (userInfo) {
          signedUpPlayers.push({
            userId,
            name: userInfo.name,
            avatarUrl: userInfo.avatarUrl,
            hasActiveSubscription: false,
          });
        }
      }
    }

    // Build enriched waitlist players list
    const waitlistPlayers: PlayerWithInfo[] = [];
    
    if (campaign.waitlistWithCharacters && campaign.waitlistWithCharacters.length > 0) {
      for (const player of campaign.waitlistWithCharacters) {
        const userInfo = usersInfo.get(player.userId);
        if (userInfo) {
          waitlistPlayers.push({
            userId: player.userId,
            name: userInfo.name,
            avatarUrl: userInfo.avatarUrl,
            characterName: player.characterName,
            characterId: player.characterId,
            characterIsPublic: player.characterId ? charactersPublicStatusMap.get(player.characterId) ?? false : false,
            hasActiveSubscription: false,
          });
        }
      }
    } else {
      // Fallback to simple waitlist array
      for (const userId of campaign.waitlist) {
        const userInfo = usersInfo.get(userId);
        if (userInfo) {
          waitlistPlayers.push({
            userId,
            name: userInfo.name,
            avatarUrl: userInfo.avatarUrl,
            hasActiveSubscription: false,
          });
        }
      }
    }

    return NextResponse.json({
      pendingPlayers,
      signedUpPlayers,
      waitlistPlayers,
    });
  } catch (error) {
    console.error("Failed to fetch enriched campaign data:", error);
    return NextResponse.json(
      { error: "Failed to fetch enriched campaign data" },
      { status: 500 }
    );
  }
}
