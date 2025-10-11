import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  getUserBadges,
  updateBadgeDisplayPreference,
  selfAssignBadge,
} from "@/lib/badges/db";

/**
 * GET /api/user-badges
 * Get all badges for the authenticated user or a specific user
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const targetUserId = searchParams.get("userId");
    
    // If no userId provided, use authenticated user
    let userId = targetUserId;
    if (!userId) {
      const cookieStore = await cookies();
      userId = cookieStore.get("userId")?.value ?? null;
    }

    if (!userId) {
      return NextResponse.json(
        { error: "Authentication required or userId parameter missing" },
        { status: 401 }
      );
    }

    const userBadges = await getUserBadges(userId);
    
    return NextResponse.json(
      userBadges.map(({ userBadge, badge }) => ({
        id: userBadge._id?.toString(),
        badgeId: badge._id?.toString(),
        name: badge.name,
        description: badge.description,
        imageUrl: badge.imageUrl,
        color: badge.color,
        awardedAt: userBadge.awardedAt,
        isDisplayed: userBadge.isDisplayed,
      })),
      { status: 200 }
    );
  } catch (error) {
    console.error("Failed to fetch user badges:", error);
    return NextResponse.json(
      { error: "Failed to retrieve user badges" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/user-badges
 * Update badge display preference for the authenticated user
 */
export async function PUT(request: Request) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("userId")?.value;

    if (!userId) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { badgeId, isDisplayed } = body;

    if (!badgeId || typeof badgeId !== "string") {
      return NextResponse.json(
        { error: "badgeId is required and must be a string" },
        { status: 400 }
      );
    }

    if (typeof isDisplayed !== "boolean") {
      return NextResponse.json(
        { error: "isDisplayed is required and must be a boolean" },
        { status: 400 }
      );
    }

    const success = await updateBadgeDisplayPreference(userId, badgeId, isDisplayed);

    if (!success) {
      return NextResponse.json(
        { error: "Badge not found or not updated" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Badge display preference updated successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Failed to update badge display preference:", error);
    return NextResponse.json(
      { error: "Failed to update badge display preference" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/user-badges
 * Self-assign a badge to the authenticated user (only for self-assignable badges)
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

    const body = await request.json();
    const { badgeId } = body;

    if (!badgeId || typeof badgeId !== "string") {
      return NextResponse.json(
        { error: "badgeId is required and must be a string" },
        { status: 400 }
      );
    }

    const userBadge = await selfAssignBadge(userId, badgeId);

    if (!userBadge) {
      return NextResponse.json(
        { error: "Badge not found, not self-assignable, or failed to assign" },
        { status: 400 }
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
    console.error("Failed to self-assign badge:", error);
    return NextResponse.json(
      { error: "Failed to self-assign badge" },
      { status: 500 }
    );
  }
}
