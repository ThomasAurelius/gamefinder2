import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { listUserGameSessions } from "@/lib/games/db";
import { getUsersBasicInfo } from "@/lib/users";
import { getVendorsBasicInfo } from "@/lib/vendors";

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
    
    // Fetch vendor information for all sessions that have a vendorId
    const vendorIds = [...new Set(sessions.map(s => s.vendorId).filter((id): id is string => !!id))];
    const vendorsMap = await getVendorsBasicInfo(vendorIds);
    
    // Add host and vendor information to sessions
    const sessionsWithHosts = sessions.map(session => ({
      ...session,
      hostName: hostsMap.get(session.userId)?.name || "Unknown Host",
      hostAvatarUrl: hostsMap.get(session.userId)?.avatarUrl,
      vendorName: session.vendorId ? vendorsMap.get(session.vendorId)?.vendorName : undefined,
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
