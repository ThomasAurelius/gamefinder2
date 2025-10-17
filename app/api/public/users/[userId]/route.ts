import { NextRequest, NextResponse } from "next/server";
import { getUserBasicInfo } from "@/lib/users";
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
    // Get basic user info using the existing utility function
    const userInfo = await getUserBasicInfo(userId);

    if (!userInfo) {
      return new NextResponse("User not found", { status: 404 });
    }

    // Fetch commonName from profile since it's not in the basic info
    const db = await getDb();
    const usersCollection = db.collection("users");
    const user = await usersCollection.findOne(
      { _id: new ObjectId(userId) },
      { projection: { "profile.commonName": 1 } }
    );

    // Return user info with commonName from profile
    return NextResponse.json({
      id: userInfo.id,
      name: userInfo.name,
      commonName: user?.profile?.commonName || "",
      email: userInfo.email,
      avatarUrl: userInfo.avatarUrl,
    });
  } catch (error) {
    console.error("Failed to fetch user info:", error);
    return NextResponse.json(
      { error: "Failed to fetch user info" },
      { status: 500 }
    );
  }
}
