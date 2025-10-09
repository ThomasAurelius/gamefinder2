import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import {
  getTallTale,
  updateTallTale,
  deleteTallTale,
} from "@/lib/tall-tales/db";
import { parseTallTalePayload } from "@/lib/tall-tales/validation";

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

    const tale = await updateTallTale(id, userId, payload);

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
    const success = await deleteTallTale(id, userId);

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
