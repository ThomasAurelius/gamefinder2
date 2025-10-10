import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import {
  getTallTale,
  updateTallTale,
  deleteTallTale,
  updateTallTaleByAdmin,
  deleteTallTaleByAdmin,
} from "@/lib/tall-tales/db";
import { parseTallTalePayload } from "@/lib/tall-tales/validation";
import { isAdmin } from "@/lib/admin";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const tale = await getTallTale(id);

    if (!tale) {
      return NextResponse.json(
        { error: "Tall tale not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(tale, { status: 200 });
  } catch (error) {
    console.error("Failed to retrieve tall tale:", error);
    return NextResponse.json(
      { error: "Failed to retrieve tall tale" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("userId")?.value;

    if (!userId) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const payload = parseTallTalePayload(body);

    if (!payload) {
      return NextResponse.json(
        { error: "Invalid tall tale data. Title and content are required, and content must not exceed 5000 characters." },
        { status: 400 }
      );
    }

    // Check if user is admin
    const userIsAdmin = await isAdmin(userId);
    
    let tale;
    if (userIsAdmin) {
      // Admin can update any tale
      tale = await updateTallTaleByAdmin(id, payload);
    } else {
      // Regular user can only update their own tale
      tale = await updateTallTale(id, userId, payload);
    }

    if (!tale) {
      return NextResponse.json(
        { error: "Tall tale not found or you don't have permission to update it" },
        { status: 404 }
      );
    }

    return NextResponse.json(tale, { status: 200 });
  } catch (error) {
    console.error("Failed to update tall tale:", error);
    return NextResponse.json(
      { error: "Failed to update tall tale" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("userId")?.value;

    if (!userId) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const { id } = await params;
    
    // Check if user is admin
    const userIsAdmin = await isAdmin(userId);
    
    let success;
    if (userIsAdmin) {
      // Admin can delete any tale
      success = await deleteTallTaleByAdmin(id);
    } else {
      // Regular user can only delete their own tale
      success = await deleteTallTale(id, userId);
    }

    if (!success) {
      return NextResponse.json(
        { error: "Tall tale not found or you don't have permission to delete it" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Failed to delete tall tale:", error);
    return NextResponse.json(
      { error: "Failed to delete tall tale" },
      { status: 500 }
    );
  }
}
