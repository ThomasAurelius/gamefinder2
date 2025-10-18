import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { readProfile } from "@/lib/profile-db";
import { DEFAULT_TIMEZONE } from "@/lib/timezone";

/**
 * GET /api/auth/user - Get current user's ID and timezone
 */
export async function GET() {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("userId")?.value;

    if (!userId) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    // Fetch user profile to get timezone
    const profile = await readProfile(userId);

    return NextResponse.json({ 
      userId, 
      timezone: profile.timezone || DEFAULT_TIMEZONE 
    });
  } catch (error) {
    console.error("Failed to get user info", error);
    return NextResponse.json(
      { error: "Failed to get user info" },
      { status: 500 }
    );
  }
}
