import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";

export type PlayerSearchResult = {
  id: string;
  name: string;
  commonName: string;
  location: string;
  primaryRole: string;
  bio: string;
  favoriteGames: string[];
  avatarUrl?: string;
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const searchQuery = searchParams.get("search") || "";
    const role = searchParams.get("role") || "";
    const game = searchParams.get("game") || "";

    const db = await getDb();
    const usersCollection = db.collection("users");

    // Build the filter query
    // Only require that the profile object exists
    const filter: Record<string, unknown> = {
      profile: { $exists: true },
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

    // Add game filter
    if (game) {
      filter["profile.favoriteGames"] = { $in: [game] };
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
        },
      })
      .toArray();

    const players: PlayerSearchResult[] = users.map((user) => ({
      id: user._id.toString(),
      name: user.name || "Unknown Player",
      commonName: user.profile?.commonName || "",
      location: user.profile?.location || "",
      primaryRole: user.profile?.primaryRole || "",
      bio: user.profile?.bio || "",
      favoriteGames: user.profile?.favoriteGames || [],
      avatarUrl: user.profile?.avatarUrl || undefined,
    }));

    return NextResponse.json(players);
  } catch (error) {
    console.error("Failed to fetch players:", error);
    return NextResponse.json(
      { error: "Failed to fetch players" },
      { status: 500 }
    );
  }
}
