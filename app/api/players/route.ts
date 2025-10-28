import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { geocodeLocation, calculateDistance } from "@/lib/geolocation";
import { getDisplayedUserBadges } from "@/lib/badges/db";

export type PlayerSearchResult = {
  id: string;
  name: string;
  commonName: string;
  location: string;
  primaryRole: string;
  bio: string;
  favoriteGames: string[];
  avatarUrl?: string;
  distance?: number; // Distance in miles
  availability?: Record<string, string[]>; // Day of week to time slots
  isGM?: boolean; // Whether user is a Game Master / Dungeon Master
  badges?: Array<{
    name: string;
    imageUrl: string;
    color?: string;
  }>;
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const searchQuery = searchParams.get("search") || "";
    const role = searchParams.get("role") || "";
    const game = searchParams.get("game") || "";
    const locationSearch = searchParams.get("location") || "";
    const radiusMiles = parseFloat(searchParams.get("radius") || "50");
    const dayOfWeek = searchParams.get("dayOfWeek") || "";
    const timeSlot = searchParams.get("timeSlot") || "";
    const games = searchParams.get("games") || ""; // Multiple games comma-separated
    const isGM = searchParams.get("isGM"); // Filter by GM status

    const db = await getDb();
    const usersCollection = db.collection("users");

    // Build the filter query
    // Only require that the profile object exists
    const filter: Record<string, unknown> = {
      profile: { $exists: true },
      isHidden: { $ne: true }, // Exclude hidden profiles
    };

    // Add search filter for name or location
    if (searchQuery) {
      filter.$or = [
        { name: { $regex: searchQuery, $options: "i" } },
        { "profile.commonName": { $regex: searchQuery, $options: "i" } },
        { "profile.location": { $regex: searchQuery, $options: "i" } },
      ];
    }

    // Add role filter
    if (role) {
      filter["profile.primaryRole"] = role;
    }

    // Add game filter (single game for backward compatibility or multiple games)
    if (games) {
      // Multiple games filter takes precedence
      const gamesList = games.split(",").map((g) => g.trim()).filter(Boolean);
      if (gamesList.length > 0) {
        filter["profile.favoriteGames"] = { $in: gamesList };
      }
    } else if (game) {
      // Single game filter for backward compatibility
      filter["profile.favoriteGames"] = { $in: [game] };
    }

    // Add day of week and time slot filters
    if (dayOfWeek && timeSlot) {
      // Both day and specific time slot specified
      filter[`profile.availability.${dayOfWeek}`] = { $in: [timeSlot] };
    } else if (dayOfWeek) {
      // Only day specified, find anyone available on that day
      filter[`profile.availability.${dayOfWeek}`] = { $exists: true, $ne: [] };
    }

    // Add isGM filter
    if (isGM === "true") {
      filter["profile.isGM"] = true;
    } else if (isGM === "false") {
      filter["profile.isGM"] = { $ne: true };
    }

    const users = await usersCollection
      .find(filter, {
        projection: {
          _id: 1,
          name: 1,
          "profile.commonName": 1,
          "profile.location": 1,
          "profile.primaryRole": 1,
          "profile.bio": 1,
          "profile.favoriteGames": 1,
          "profile.avatarUrl": 1,
          "profile.latitude": 1,
          "profile.longitude": 1,
          "profile.availability": 1,
          "profile.isGM": 1,
        },
      })
      .toArray();

    let players: PlayerSearchResult[] = users.map((user) => ({
      id: user._id.toString(),
      name: user.name || "Unknown Player",
      commonName: user.profile?.commonName || "",
      location: user.profile?.location || "",
      primaryRole: user.profile?.primaryRole || "",
      bio: user.profile?.bio || "",
      favoriteGames: user.profile?.favoriteGames || [],
      avatarUrl: user.profile?.avatarUrl || undefined,
      distance: undefined,
      availability: user.profile?.availability || {},
      isGM: user.profile?.isGM || false,
      badges: [], // Will be populated in the parallel badge fetching section below
    }));

    // Fetch badges for all players
    const userIds = players.map(p => p.id);
    const badgesMap = new Map<string, Array<{ name: string; imageUrl: string; color?: string }>>();
    
    // Fetch badges in parallel for all users
    await Promise.all(
      userIds.map(async (userId) => {
        try {
          const userBadges = await getDisplayedUserBadges(userId);
          badgesMap.set(
            userId,
            userBadges.map(({ badge }) => ({
              name: badge.name,
              imageUrl: badge.imageUrl,
              color: badge.color,
            }))
          );
        } catch (error) {
          console.error(`Failed to fetch badges for user ${userId}:`, error);
          badgesMap.set(userId, []);
        }
      })
    );

    // Add badges to players
    players = players.map(player => ({
      ...player,
      badges: badgesMap.get(player.id) || [],
    }));

    // If location search is provided, geocode it and filter by distance
    if (locationSearch) {
      try {
        const searchCoords = await geocodeLocation(locationSearch);
        
        if (searchCoords) {
          // Calculate distances and filter by radius
          const playersWithDistance: PlayerSearchResult[] = [];
          
          for (const player of players) {
            const user = users.find((u) => u._id.toString() === player.id);
            const lat = user?.profile?.latitude;
            const lon = user?.profile?.longitude;
            
            if (lat !== undefined && lon !== undefined) {
              const distance = calculateDistance(
                searchCoords.latitude,
                searchCoords.longitude,
                lat,
                lon
              );
              
              if (distance <= radiusMiles) {
                playersWithDistance.push({ ...player, distance });
              }
            }
          }
          
          // Sort by distance
          players = playersWithDistance.sort((a, b) => (a.distance || 0) - (b.distance || 0));
        }
      } catch (error) {
        console.error("Failed to geocode search location:", error);
        // Continue without location filtering
      }
    }

    return NextResponse.json(players);
  } catch (error) {
    console.error("Failed to fetch players:", error);
    return NextResponse.json(
      { error: "Failed to fetch players" },
      { status: 500 }
    );
  }
}
