import { NextResponse } from "next/server";
import { getUsersBasicInfo } from "@/lib/users";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userIds } = body;

    if (!userIds || !Array.isArray(userIds)) {
      return NextResponse.json(
        { error: "User IDs array is required" },
        { status: 400 }
      );
    }

    const usersMap = await getUsersBasicInfo(userIds);
    
    // Convert Map to object for JSON serialization
    const usersObject: Record<string, { id: string; name: string; email: string; avatarUrl?: string }> = {};
    usersMap.forEach((user, userId) => {
      usersObject[userId] = user;
    });

    return NextResponse.json(usersObject);
  } catch (error) {
    console.error("Failed to fetch users:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}
