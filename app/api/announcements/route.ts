import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { isAdmin } from "@/lib/admin";
import { getActiveAnnouncement, setAnnouncement } from "@/lib/announcements/db";

/**
 * GET /api/announcements - Get the active announcement
 */
export async function GET() {
  try {
    const announcement = await getActiveAnnouncement();
    
    if (!announcement || !announcement.isActive) {
      return NextResponse.json({ message: "", isActive: false });
    }
    
    return NextResponse.json({
      message: announcement.message,
      isActive: announcement.isActive,
      updatedAt: announcement.updatedAt,
    });
  } catch (error) {
    console.error("Error fetching announcement:", error);
    return NextResponse.json(
      { error: "Failed to fetch announcement" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/announcements - Create or update announcement (admin only)
 */
export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("userId")?.value;
    
    if (!userId) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }
    
    // Check if user is admin
    const userIsAdmin = await isAdmin(userId);
    if (!userIsAdmin) {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }
    
    const { message, isActive } = await request.json();
    
    if (typeof message !== "string") {
      return NextResponse.json(
        { error: "Message must be a string" },
        { status: 400 }
      );
    }
    
    if (typeof isActive !== "boolean") {
      return NextResponse.json(
        { error: "isActive must be a boolean" },
        { status: 400 }
      );
    }
    
    const announcement = await setAnnouncement(userId, message, isActive);
    
    return NextResponse.json({
      message: announcement.message,
      isActive: announcement.isActive,
      updatedAt: announcement.updatedAt,
    });
  } catch (error) {
    console.error("Error updating announcement:", error);
    return NextResponse.json(
      { error: "Failed to update announcement" },
      { status: 500 }
    );
  }
}
