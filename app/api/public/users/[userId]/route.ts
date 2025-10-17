import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";

/**
 * GET /api/public/users/[userId]
 * Get public user information by user ID
 */
export async function GET(
  request: Request,
  context: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await context.params;

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // Validate ObjectId format
    if (!ObjectId.isValid(userId)) {
      return NextResponse.json(
        { error: "Invalid user ID format" },
        { status: 400 }
      );
    }

    const db = await getDb();
    const usersCollection = db.collection("users");

    const user = await usersCollection.findOne(
      { _id: new ObjectId(userId) },
      { 
        projection: { 
          _id: 1, 
          name: 1, 
          email: 1, 
          "profile.avatarUrl": 1,
          "profile.commonName": 1
        } 
      }
    );

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        id: user._id.toString(),
        name: user.name || user.email?.split("@")[0] || "Unknown",
        commonName: user.profile?.commonName || user.name || user.email?.split("@")[0] || "Unknown",
        avatarUrl: user.profile?.avatarUrl || undefined,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Failed to fetch user:", error);
    return NextResponse.json(
      { error: "Failed to fetch user" },
      { status: 500 }
    );
  }
}
