import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { isAdmin } from "@/lib/admin";
import {
  getAllBadges,
  createBadge,
  updateBadge,
  deleteBadge,
} from "@/lib/badges/db";

/**
 * GET /api/badges
 * Get all badges (public)
 */
export async function GET() {
  try {
    const badges = await getAllBadges();
    
    return NextResponse.json(
      badges.map(b => ({
        id: b._id?.toString(),
        name: b.name,
        description: b.description,
        imageUrl: b.imageUrl,
        color: b.color,
        createdAt: b.createdAt,
      })),
      { status: 200 }
    );
  } catch (error) {
    console.error("Failed to fetch badges:", error);
    return NextResponse.json(
      { error: "Failed to retrieve badges" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/badges
 * Create a new badge (admin only)
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

    const userIsAdmin = await isAdmin(userId);
    if (!userIsAdmin) {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { name, description, imageUrl, color } = body;

    if (!name || typeof name !== "string") {
      return NextResponse.json(
        { error: "name is required and must be a string" },
        { status: 400 }
      );
    }

    if (!description || typeof description !== "string") {
      return NextResponse.json(
        { error: "description is required and must be a string" },
        { status: 400 }
      );
    }

    if (!imageUrl || typeof imageUrl !== "string") {
      return NextResponse.json(
        { error: "imageUrl is required and must be a string" },
        { status: 400 }
      );
    }

    if (color !== undefined && typeof color !== "string") {
      return NextResponse.json(
        { error: "color must be a string" },
        { status: 400 }
      );
    }

    const badge = await createBadge(userId, name, description, imageUrl, color);

    return NextResponse.json(
      {
        id: badge._id?.toString(),
        name: badge.name,
        description: badge.description,
        imageUrl: badge.imageUrl,
        color: badge.color,
        createdAt: badge.createdAt,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Failed to create badge:", error);
    return NextResponse.json(
      { error: "Failed to create badge" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/badges
 * Update a badge (admin only)
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

    const userIsAdmin = await isAdmin(userId);
    if (!userIsAdmin) {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { id, name, description, imageUrl, color } = body;

    if (!id || typeof id !== "string") {
      return NextResponse.json(
        { error: "id is required and must be a string" },
        { status: 400 }
      );
    }

    if (!name || typeof name !== "string") {
      return NextResponse.json(
        { error: "name is required and must be a string" },
        { status: 400 }
      );
    }

    if (!description || typeof description !== "string") {
      return NextResponse.json(
        { error: "description is required and must be a string" },
        { status: 400 }
      );
    }

    if (!imageUrl || typeof imageUrl !== "string") {
      return NextResponse.json(
        { error: "imageUrl is required and must be a string" },
        { status: 400 }
      );
    }

    if (color !== undefined && typeof color !== "string") {
      return NextResponse.json(
        { error: "color must be a string" },
        { status: 400 }
      );
    }

    const success = await updateBadge(id, name, description, imageUrl, color);

    if (!success) {
      return NextResponse.json(
        { error: "Badge not found or not updated" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Badge updated successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Failed to update badge:", error);
    return NextResponse.json(
      { error: "Failed to update badge" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/badges
 * Delete a badge (admin only)
 */
export async function DELETE(request: Request) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("userId")?.value;

    if (!userId) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const userIsAdmin = await isAdmin(userId);
    if (!userIsAdmin) {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "id query parameter is required" },
        { status: 400 }
      );
    }

    const success = await deleteBadge(id);

    if (!success) {
      return NextResponse.json(
        { error: "Badge not found or not deleted" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Badge deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Failed to delete badge:", error);
    return NextResponse.json(
      { error: "Failed to delete badge" },
      { status: 500 }
    );
  }
}
