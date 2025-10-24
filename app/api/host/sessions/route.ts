import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { listCampaigns } from "@/lib/campaigns/db";
import { getUsersBasicInfo } from "@/lib/users";

export async function GET(request: Request) {
	try {
		const cookieStore = await cookies();
		const userId = cookieStore.get("userId")?.value;

		if (!userId) {
			return NextResponse.json(
				{ error: "Authentication required" },
				{ status: 401 }
			);
		}

		const { searchParams } = new URL(request.url);
		const type = searchParams.get("type"); // 'upcoming' or 'recent'
		const page = parseInt(searchParams.get("page") || "1", 10);
		const limit = parseInt(searchParams.get("limit") || "5", 10);

		// Calculate pagination
		const skip = (page - 1) * limit;

		// Fetch all campaigns for the host (including past campaigns)
		const campaigns = await listCampaigns({ userFilter: userId, includePast: true });

		// Filter to only campaigns where user is the host
		const hostedCampaigns = campaigns.filter(campaign => campaign.userId === userId);

		// Get today's date for comparison
		const today = new Date().toISOString().split('T')[0];

		// Filter by type
		let filteredCampaigns = hostedCampaigns;
		if (type === 'upcoming') {
			filteredCampaigns = hostedCampaigns.filter(campaign => campaign.date >= today);
		} else if (type === 'recent') {
			filteredCampaigns = hostedCampaigns.filter(campaign => campaign.date < today);
		}

		// Sort by date
		filteredCampaigns.sort((a, b) => {
			if (type === 'upcoming') {
				return a.date.localeCompare(b.date); // Ascending for upcoming
			}
			return b.date.localeCompare(a.date); // Descending for recent
		});

		// Calculate total and paginated results
		const total = filteredCampaigns.length;
		const paginatedCampaigns = filteredCampaigns.slice(skip, skip + limit);

		// Fetch all unique player IDs from paginated campaigns
		const allPlayerIds = new Set<string>();
		paginatedCampaigns.forEach(campaign => {
			campaign.signedUpPlayers.forEach(playerId => allPlayerIds.add(playerId));
			campaign.waitlist.forEach(playerId => allPlayerIds.add(playerId));
			campaign.pendingPlayers.forEach(playerId => allPlayerIds.add(playerId));
		});

		// Fetch player information in batch
		const playersMap = allPlayerIds.size > 0 
			? await getUsersBasicInfo(Array.from(allPlayerIds))
			: new Map();

		// Enrich campaigns with player details
		const enrichedCampaigns = paginatedCampaigns.map(campaign => ({
			...campaign,
			signedUpPlayersDetails: campaign.signedUpPlayers.map(playerId => ({
				id: playerId,
				name: playersMap.get(playerId)?.name || "Unknown Player",
				avatarUrl: playersMap.get(playerId)?.avatarUrl,
			})),
			waitlistDetails: campaign.waitlist.map(playerId => ({
				id: playerId,
				name: playersMap.get(playerId)?.name || "Unknown Player",
				avatarUrl: playersMap.get(playerId)?.avatarUrl,
			})),
			pendingPlayersDetails: campaign.pendingPlayers.map(playerId => ({
				id: playerId,
				name: playersMap.get(playerId)?.name || "Unknown Player",
				avatarUrl: playersMap.get(playerId)?.avatarUrl,
			})),
		}));

		return NextResponse.json({
			sessions: enrichedCampaigns,
			pagination: {
				page,
				limit,
				total,
				totalPages: Math.ceil(total / limit),
			}
		});
	} catch (error) {
		console.error("Error fetching host sessions:", error);
		return NextResponse.json(
			{ error: "Failed to fetch sessions" },
			{ status: 500 }
		);
	}
}
