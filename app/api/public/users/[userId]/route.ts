import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ userId: string }> }
) {
  const { userId } = await context.params;

  // Validate ObjectId format
  if (!ObjectId.isValid(userId)) {
    return new NextResponse("Invalid user ID", { status: 400 });
  }

  try {
    const db = await getDb();
    const usersCollection = db.collection("users");
    
    const user = await usersCollection.findOne(
      { _id: new ObjectId(userId) },
      { projection: { _id: 1, name: 1, email: 1, "profile.commonName": 1, "profile.avatarUrl": 1 } }
    );

    if (!user) {
      return new NextResponse("User not found", { status: 404 });
    }

    // Return user info with commonName from profile
    return NextResponse.json({
      id: user._id?.toString() || userId,
      name: user.name || user.email?.split("@")[0] || "Unknown User",
      commonName: user.profile?.commonName || "",
      email: user.email || "",
      avatarUrl: user.profile?.avatarUrl || "",
    });
  } catch (error) {
    console.error("Failed to fetch user info:", error);
    return NextResponse.json(
      { error: "Failed to fetch user info" },
      { status: 500 }
    );
  }
}
