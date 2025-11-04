import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import {
  createGameSession,
  listGameSessions,
} from "@/lib/games/db";
import { GameSessionPayload } from "@/lib/games/types";
import { geocodeLocation, calculateDistance } from "@/lib/geolocation";
import { getUsersBasicInfo, getStripeConnectAccountId } from "@/lib/users";

function parseGameSessionPayload(data: unknown): GameSessionPayload | null {
  if (!data || typeof data !== "object") {
    return null;
  }

  const payload = data as Partial<GameSessionPayload>;

  if (
    typeof payload.game !== "string" ||
    typeof payload.date !== "string" ||
    !Array.isArray(payload.times) ||
    payload.times.length === 0 ||
    typeof payload.maxPlayers !== "number" ||
    payload.maxPlayers < 1
  ) {
    return null;
  }

  return {
    game: payload.game,
    date: payload.date,
    times: payload.times.filter((t) => typeof t === "string"),
    description: typeof payload.description === "string" ? payload.description : "",
    maxPlayers: payload.maxPlayers,
    imageUrl: typeof payload.imageUrl === "string" ? payload.imageUrl : undefined,
    location: typeof payload.location === "string" ? payload.location : undefined,
    zipCode: typeof payload.zipCode === "string" ? payload.zipCode : undefined,
    latitude: typeof payload.latitude === "number" ? payload.latitude : undefined,
    longitude: typeof payload.longitude === "number" ? payload.longitude : undefined,
    costPerSession: typeof payload.costPerSession === "number" && payload.costPerSession >= 0 ? payload.costPerSession : undefined,
    stripeConnectAccountId: typeof payload.stripeConnectAccountId === "string" ? payload.stripeConnectAccountId : undefined,
    vendorId: typeof payload.vendorId === "string" ? payload.vendorId : undefined,
    partyLevel: typeof payload.partyLevel === "number" ? payload.partyLevel : undefined,
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
    const hostId = searchParams.get("hostId") || undefined;
    const vendorId = searchParams.get("vendorId") || undefined;

    const sessions = await listGameSessions({ game, date, times, hostId, vendorId });

    // Fetch host information for all sessions
    const hostIds = [...new Set(sessions.map(s => s.userId))];
    const hostsMap = await getUsersBasicInfo(hostIds);
    
    // Add host information to sessions
    const sessionsWithHosts = sessions.map(session => ({
      ...session,
      hostName: hostsMap.get(session.userId)?.name || "Unknown Host",
      hostAvatarUrl: hostsMap.get(session.userId)?.avatarUrl,
    }));

    // If location search is provided, filter by distance
    if (locationSearch) {
      try {
        const searchCoords = await geocodeLocation(locationSearch);
        
        if (searchCoords) {
          // Calculate distances and filter by radius
          const sessionsWithDistance: (typeof sessionsWithHosts[0] & { distance?: number })[] = [];
          const sessionsWithoutLocation: typeof sessionsWithHosts = [];
          
          for (const session of sessionsWithHosts) {
            const lat = session.latitude;
            const lon = session.longitude;
            
            if (lat !== undefined && lon !== undefined) {
              const distance = calculateDistance(
                searchCoords.latitude,
                searchCoords.longitude,
                lat,
                lon
              );
              
              if (distance <= radiusMiles) {
                sessionsWithDistance.push({ ...session, distance });
              }
            } else {
              // Include sessions without location data at the end
              sessionsWithoutLocation.push(session);
            }
          }
          
          // Sort sessions with distance by distance, then append sessions without location
          const sortedWithDistance = sessionsWithDistance.sort((a, b) => (a.distance || 0) - (b.distance || 0));
          const allSessions = [...sortedWithDistance, ...sessionsWithoutLocation];
          
          return NextResponse.json(allSessions, { status: 200 });
        }
      } catch (error) {
        console.error("Failed to geocode search location:", error);
        // Continue without location filtering
      }
    }

    return NextResponse.json(sessionsWithHosts, { status: 200 });
  } catch (error) {
    console.error("Failed to list game sessions", error);
    return NextResponse.json(
      { error: "Failed to load game sessions" },
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
        { error: "Authentication required. Please log in to post a game session." },
        { status: 401 }
      );
    }
    
    const data = await request.json();
    const payload = parseGameSessionPayload(data);

    if (!payload) {
      return NextResponse.json(
        { error: "Invalid game session data. Please ensure all required fields are filled." },
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
        // Log the error but don't fail the game session creation
        console.error("Failed to geocode location:", error);
      }
    }

    // If the game has a cost, get the host's Stripe Connect account ID
    if (payload.costPerSession && payload.costPerSession > 0) {
      try {
        const connectAccountId = await getStripeConnectAccountId(userId);
        if (connectAccountId) {
          payload.stripeConnectAccountId = connectAccountId;
        }
      } catch (error) {
        console.error("Failed to get Stripe Connect account ID:", error);
        // Continue without Connect account - payment will still work but won't use Connect
      }
    }

    const session = await createGameSession(userId, payload);

    return NextResponse.json(session, { status: 201 });
  } catch (error) {
    console.error("Failed to create game session", error);
    return NextResponse.json(
      { error: "Failed to create game session" },
      { status: 500 }
    );
  }
}
