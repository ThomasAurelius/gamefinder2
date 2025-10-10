import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { listCampaigns } from "@/lib/campaigns/db";
import { getUsersBasicInfo } from "@/lib/users";

// Helper function to get date 7 days ago or ahead
function getDateOffset(daysOffset: number): string {
	const date = new Date();
	date.setDate(date.getDate() + daysOffset);
	return date.toISOString().split('T')[0];
}

// Helper function to check if a date is in range
function isDateInRange(dateStr: string, startDate: string, endDate: string): boolean {
	return dateStr >= startDate && dateStr <= endDate;
}

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

		// Calculate date ranges
		const today = new Date().toISOString().split('T')[0];
		const upcomingStart = today;
		const upcomingEnd = getDateOffset(7);
		const recentStart = getDateOffset(-7);
		const recentEnd = today;

		// Fetch all campaigns for the host
		const campaigns = await listCampaigns({ userFilter: userId });

		// Filter to only campaigns where user is the host
		const hostedCampaigns = campaigns.filter(campaign => campaign.userId === userId);

		// Filter by date range based on type
		let filteredCampaigns = hostedCampaigns;
		if (type === 'upcoming') {
			filteredCampaigns = hostedCampaigns.filter(campaign =>
				isDateInRange(campaign.date, upcomingStart, upcomingEnd)
			);
		} else if (type === 'recent') {
			filteredCampaigns = hostedCampaigns.filter(campaign =>
				isDateInRange(campaign.date, recentStart, recentEnd) && campaign.date < today
			);
		}

		// Sort by date
		filteredCampaigns.sort((a, b) => {
			if (type === 'upcoming') {
				return a.date.localeCompare(b.date); // Ascending for upcoming
			}
			return b.date.localeCompare(a.date); // Descending for recent
		});

		// Fetch all unique player IDs from all filtered campaigns
		const allPlayerIds = new Set<string>();
		filteredCampaigns.forEach(campaign => {
			campaign.signedUpPlayers.forEach(playerId => allPlayerIds.add(playerId));
			campaign.waitlist.forEach(playerId => allPlayerIds.add(playerId));
			campaign.pendingPlayers.forEach(playerId => allPlayerIds.add(playerId));
		});

		// Fetch player information in batch
		const playersMap = allPlayerIds.size > 0 
			? await getUsersBasicInfo(Array.from(allPlayerIds))
			: new Map();

		// Enrich campaigns with player details
		const enrichedCampaigns = filteredCampaigns.map(campaign => ({
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
			dateRange: type === 'upcoming' 
				? { start: upcomingStart, end: upcomingEnd }
				: { start: recentStart, end: recentEnd }
		});
	} catch (error) {
		console.error("Error fetching host sessions:", error);
		return NextResponse.json(
			{ error: "Failed to fetch sessions" },
			{ status: 500 }
		);
	}
}
