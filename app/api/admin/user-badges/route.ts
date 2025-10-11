import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { isAdmin } from "@/lib/admin";
import {
  awardBadgeToUser,
  removeBadgeFromUser,
  getUsersWithBadge,
} from "@/lib/badges/db";

/**
 * POST /api/admin/user-badges
 * Award a badge to a user (admin only)
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
    const { userId, badgeId } = body;

    if (!userId || typeof userId !== "string") {
      return NextResponse.json(
        { error: "userId is required and must be a string" },
        { status: 400 }
      );
    }

    if (!badgeId || typeof badgeId !== "string") {
      return NextResponse.json(
        { error: "badgeId is required and must be a string" },
        { status: 400 }
      );
    }

    const userBadge = await awardBadgeToUser(userId, badgeId, adminUserId);

    if (!userBadge) {
      return NextResponse.json(
        { error: "Failed to award badge" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        id: userBadge._id?.toString(),
        userId: userBadge.userId,
        badgeId: userBadge.badgeId,
        awardedAt: userBadge.awardedAt,
        isDisplayed: userBadge.isDisplayed,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Failed to award badge:", error);
    return NextResponse.json(
      { error: "Failed to award badge" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/user-badges
 * Remove a badge from a user (admin only)
 */
export async function DELETE(request: Request) {
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
    const badgeId = searchParams.get("badgeId");

    if (!userId) {
      return NextResponse.json(
        { error: "userId query parameter is required" },
        { status: 400 }
      );
    }

    if (!badgeId) {
      return NextResponse.json(
        { error: "badgeId query parameter is required" },
        { status: 400 }
      );
    }

    const success = await removeBadgeFromUser(userId, badgeId);

    if (!success) {
      return NextResponse.json(
        { error: "Badge assignment not found or not deleted" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Badge removed from user successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Failed to remove badge from user:", error);
    return NextResponse.json(
      { error: "Failed to remove badge from user" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/admin/user-badges
 * Get all users who have a specific badge (admin only)
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
    const badgeId = searchParams.get("badgeId");

    if (!badgeId) {
      return NextResponse.json(
        { error: "badgeId query parameter is required" },
        { status: 400 }
      );
    }

    const userIds = await getUsersWithBadge(badgeId);

    return NextResponse.json(
      { userIds },
      { status: 200 }
    );
  } catch (error) {
    console.error("Failed to fetch users with badge:", error);
    return NextResponse.json(
      { error: "Failed to fetch users with badge" },
      { status: 500 }
    );
  }
}
