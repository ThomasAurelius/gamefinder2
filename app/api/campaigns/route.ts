import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import {
  createCampaign,
  listCampaigns,
} from "@/lib/campaigns/db";
import { CampaignPayload } from "@/lib/campaigns/types";
import { geocodeLocation, calculateDistance } from "@/lib/geolocation";
import { getUsersBasicInfo } from "@/lib/users";

function parseCampaignPayload(data: unknown): CampaignPayload | null {
  if (
    typeof data !== "object" ||
    data === null ||
    !("game" in data) ||
    !("date" in data) ||
    !("times" in data) ||
    !("description" in data) ||
    !("maxPlayers" in data)
  ) {
    return null;
  }

  const payload = data as Record<string, unknown>;

  if (
    typeof payload.game !== "string" ||
    typeof payload.date !== "string" ||
    !Array.isArray(payload.times) ||
    typeof payload.description !== "string" ||
    typeof payload.maxPlayers !== "number"
  ) {
    return null;
  }

  return {
    game: payload.game,
    date: payload.date,
    times: payload.times as string[],
    description: payload.description,
    maxPlayers: payload.maxPlayers,
    imageUrl: typeof payload.imageUrl === "string" ? payload.imageUrl : undefined,
    location: typeof payload.location === "string" ? payload.location : undefined,
    zipCode: typeof payload.zipCode === "string" ? payload.zipCode : undefined,
    latitude: typeof payload.latitude === "number" ? payload.latitude : undefined,
    longitude: typeof payload.longitude === "number" ? payload.longitude : undefined,
    sessionsLeft: typeof payload.sessionsLeft === "number" ? payload.sessionsLeft : undefined,
    classesNeeded: Array.isArray(payload.classesNeeded) ? payload.classesNeeded as string[] : undefined,
    costPerSession: typeof payload.costPerSession === "number" ? payload.costPerSession : undefined,
    paymentMethod: typeof payload.paymentMethod === "string" ? payload.paymentMethod : undefined,
    stripePaymentIntentId: typeof payload.stripePaymentIntentId === "string" ? payload.stripePaymentIntentId : undefined,
    stripeClientSecret: typeof payload.stripeClientSecret === "string" ? payload.stripeClientSecret : undefined,
    requiresPayment: typeof payload.requiresPayment === "boolean" ? payload.requiresPayment : undefined,
    meetingFrequency: typeof payload.meetingFrequency === "string" ? payload.meetingFrequency : undefined,
    daysOfWeek: Array.isArray(payload.daysOfWeek) ? payload.daysOfWeek as string[] : undefined,
    vendorId: typeof payload.vendorId === "string" ? payload.vendorId : undefined,
    isPrivate: typeof payload.isPrivate === "boolean" ? payload.isPrivate : undefined,
  };
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Extract filter parameters
    const game = searchParams.get("game") || undefined;
    const date = searchParams.get("date") || undefined;
    const timesParam = searchParams.get("times");
    const times = timesParam ? timesParam.split(",") : undefined;
    const locationSearch = searchParams.get("location") || "";
    const radiusMiles = parseFloat(searchParams.get("radius") || "25");
    const userFilter = searchParams.get("userFilter") || undefined;
    const hostId = searchParams.get("hostId") || undefined;
    const vendorId = searchParams.get("vendorId") || undefined;

    const campaigns = await listCampaigns({ game, date, times, userFilter, hostId, vendorId });

    // Fetch host information for all campaigns
    const hostIds = [...new Set(campaigns.map(c => c.userId))];
    const hostsMap = await getUsersBasicInfo(hostIds);
    
    // Add host information to campaigns
    const campaignsWithHosts = campaigns.map(campaign => ({
      ...campaign,
      hostName: hostsMap.get(campaign.userId)?.name || "Unknown Host",
      hostAvatarUrl: hostsMap.get(campaign.userId)?.avatarUrl,
    }));

    // If location search is provided, filter by distance
    if (locationSearch) {
      const userCoords = await geocodeLocation(locationSearch);
      
      if (userCoords) {
        const campaignsWithDistance = campaignsWithHosts
          .map(campaign => {
            if (campaign.latitude && campaign.longitude) {
              const distance = calculateDistance(
                userCoords.latitude,
                userCoords.longitude,
                campaign.latitude,
                campaign.longitude
              );
              return { ...campaign, distance };
            }
            return { ...campaign, distance: undefined };
          })
          .filter((campaign): campaign is typeof campaign & { distance: number | undefined } => {
            // Only show campaigns within the specified radius or campaigns without location
            if (campaign.distance === undefined) return true;
            return campaign.distance <= radiusMiles;
          })
          .sort((a, b) => {
            // Sort by distance (campaigns with distance first, then by date)
            if (a.distance === undefined && b.distance === undefined) return 0;
            if (a.distance === undefined) return 1;
            if (b.distance === undefined) return -1;
            return a.distance - b.distance;
          });

        return NextResponse.json(campaignsWithDistance);
      }
    }

    return NextResponse.json(campaignsWithHosts);
  } catch (error) {
    console.error("Error fetching campaigns:", error);
    return NextResponse.json(
      { error: "Failed to fetch campaigns" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("userId")?.value;
    
    if (!userId) {
      return NextResponse.json(
        { error: "Authentication required. Please log in to post a campaign." },
        { status: 401 }
      );
    }
    
    const data = await request.json();
    const payload = parseCampaignPayload(data);

    if (!payload) {
      return NextResponse.json(
        { error: "Invalid campaign data. Please ensure all required fields are filled." },
        { status: 400 }
      );
    }

    // Geocode the location to get coordinates
    // Try zipCode first, then fall back to location
    const locationToGeocode = payload.zipCode || payload.location;
    if (locationToGeocode) {
      try {
        const coords = await geocodeLocation(locationToGeocode);
        if (coords) {
          payload.latitude = coords.latitude;
          payload.longitude = coords.longitude;
        }
      } catch (error) {
        console.error("Failed to geocode location:", error);
        // Continue without coordinates - geocoding failure shouldn't prevent campaign creation
      }
    }

    const campaign = await createCampaign(userId, payload);

    return NextResponse.json(campaign, { status: 201 });
  } catch (error) {
    console.error("Error creating campaign:", error);
    return NextResponse.json(
      { error: "Failed to create campaign" },
      { status: 500 }
    );
  }
}
