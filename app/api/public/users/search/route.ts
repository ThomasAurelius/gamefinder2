import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";

/**
 * GET /api/public/users/search
 * Search for a user by username (for badge awarding)
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get("username");

    if (!username) {
      return NextResponse.json(
        { error: "username query parameter is required" },
        { status: 400 }
      );
    }

    // Escape special regex characters to prevent regex injection
    const escapedUsername = username.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    const db = await getDb();
    const usersCollection = db.collection("users");

    // Search for user by name or commonName in profile
    const user = await usersCollection.findOne({
      $or: [
        { name: { $regex: new RegExp(`^${escapedUsername}$`, "i") } },
        { "profile.commonName": { $regex: new RegExp(`^${escapedUsername}$`, "i") } },
      ],
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        userId: user._id.toString(),
        name: user.name,
        commonName: user.profile?.commonName || user.name,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Failed to search user:", error);
    return NextResponse.json(
      { error: "Failed to search user" },
      { status: 500 }
    );
  }
}
