import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { readProfile } from "@/lib/profile-db";
import { getUnreadCount } from "@/lib/messages";

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
    
    // Check profile completeness
    const profile = await readProfile(userId);
    const hasIncompleteSettings = !profile.name || !profile.commonName || !profile.location;
    
    // Get unread message count
    const unreadMessageCount = await getUnreadCount(userId);
    
    return NextResponse.json({
      hasIncompleteSettings,
      unreadMessageCount,
    });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return NextResponse.json(
      { error: "Failed to fetch notifications" },
      { status: 500 }
    );
  }
}
