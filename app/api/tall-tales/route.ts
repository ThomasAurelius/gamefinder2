import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import {
  createTallTale,
  listTallTales,
} from "@/lib/tall-tales/db";
import { TallTalePayload } from "@/lib/tall-tales/types";
import { getUsersBasicInfo } from "@/lib/users";

function parseTallTalePayload(data: unknown): TallTalePayload | null {
  if (!data || typeof data !== "object") {
    return null;
  }

  const payload = data as Partial<TallTalePayload>;

  if (
    typeof payload.title !== "string" ||
    typeof payload.content !== "string" ||
    payload.title.trim().length === 0 ||
    payload.content.trim().length === 0 ||
    payload.content.length > 5000
  ) {
    return null;
  }

  return {
    title: payload.title,
    content: payload.content,
    imageUrls: Array.isArray(payload.imageUrls) 
      ? payload.imageUrls.filter((url) => typeof url === "string").slice(0, 5)
      : undefined,
  };
}

export async function GET() {
  try {
    const tales = await listTallTales();

    // Fetch author information for all tales
    const authorIds = [...new Set(tales.map(t => t.userId))];
    const authorsMap = await getUsersBasicInfo(authorIds);
    
    // Add author information to tales
    const talesWithAuthors = tales.map(tale => ({
      ...tale,
      authorName: authorsMap.get(tale.userId)?.name || "Unknown Author",
      authorAvatarUrl: authorsMap.get(tale.userId)?.avatarUrl,
    }));

    return NextResponse.json(talesWithAuthors, { status: 200 });
  } catch (error) {
    console.error("Failed to list tall tales:", error);
    return NextResponse.json(
      { error: "Failed to retrieve tall tales" },
      { status: 500 }
    );
  }
}

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
    const payload = parseTallTalePayload(body);

    if (!payload) {
      return NextResponse.json(
        { error: "Invalid tall tale data. Title and content are required, and content must not exceed 5000 characters." },
        { status: 400 }
      );
    }

    const tale = await createTallTale(userId, payload);

    return NextResponse.json(tale, { status: 201 });
  } catch (error) {
    console.error("Failed to create tall tale:", error);
    return NextResponse.json(
      { error: "Failed to create tall tale" },
      { status: 500 }
    );
  }
}
