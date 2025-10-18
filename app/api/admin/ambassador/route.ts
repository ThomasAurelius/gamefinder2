import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { isAdmin } from "@/lib/admin";
import { 
  setAmbassadorStatus, 
  getAmbassadorStatus,
  getUserBasicInfo 
} from "@/lib/users";

/**
 * GET /api/admin/ambassador?userId={userId} - Get ambassador status for a user
 */
export async function GET(request: Request) {
  try {
    const cookieStore = await cookies();
    const adminUserId = cookieStore.get("userId")?.value;
    
    if (!adminUserId) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }
    
    const userIsAdmin = await isAdmin(adminUserId);
    if (!userIsAdmin) {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 }
      );
    }

    const status = await getAmbassadorStatus(userId);
    if (!status) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const userInfo = await getUserBasicInfo(userId);

    return NextResponse.json({
      userId,
      userName: userInfo?.name || "Unknown User",
      isAmbassador: status.isAmbassador,
      ambassadorUntil: status.ambassadorUntil,
    });
  } catch (error) {
    console.error("Error getting ambassador status:", error);
    return NextResponse.json(
      { error: "Failed to get ambassador status" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/ambassador - Set ambassador status for a user
 */
export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const adminUserId = cookieStore.get("userId")?.value;
    
    if (!adminUserId) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }
    
    const userIsAdmin = await isAdmin(adminUserId);
    if (!userIsAdmin) {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { userId, isAmbassador, ambassadorUntil } = body;

    if (!userId || typeof isAmbassador !== "boolean") {
      return NextResponse.json(
        { error: "userId and isAmbassador are required" },
        { status: 400 }
      );
    }

    // Parse ambassadorUntil date if provided
    const untilDate = ambassadorUntil ? new Date(ambassadorUntil) : undefined;

    const success = await setAmbassadorStatus(userId, isAmbassador, untilDate);
    
    if (!success) {
      return NextResponse.json(
        { error: "Failed to update ambassador status" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      userId,
      isAmbassador,
      ambassadorUntil: untilDate,
    });
  } catch (error) {
    console.error("Error setting ambassador status:", error);
    return NextResponse.json(
      { error: "Failed to set ambassador status" },
      { status: 500 }
    );
  }
}
