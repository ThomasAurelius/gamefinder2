import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { listUserGameSessions } from "@/lib/games/db";
import { getUsersBasicInfo } from "@/lib/users";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("userId")?.value;
    
    if (!userId) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }
    
    const sessions = await listUserGameSessions(userId);
    
    // Fetch host information for all sessions
    const hostIds = [...new Set(sessions.map(s => s.userId))];
    const hostsMap = await getUsersBasicInfo(hostIds);
    
    // Add host information to sessions
    const sessionsWithHosts = sessions.map(session => ({
      ...session,
      hostName: hostsMap.get(session.userId)?.name || "Unknown Host",
      hostAvatarUrl: hostsMap.get(session.userId)?.avatarUrl,
    }));
    
    return NextResponse.json(sessionsWithHosts, { status: 200 });
  } catch (error) {
    console.error("Failed to list user game sessions", error);
    return NextResponse.json(
      { error: "Failed to load game sessions" },
      { status: 500 }
    );
  }
}
