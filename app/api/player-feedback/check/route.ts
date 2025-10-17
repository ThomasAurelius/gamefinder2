import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { hasHostSubmittedFeedback } from "@/lib/player-feedback/db";

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("userId")?.value;

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { playerId, sessionId, sessionType } = body;

    if (!playerId || !sessionId || !sessionType) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (sessionType !== "game" && sessionType !== "campaign") {
      return NextResponse.json(
        { error: "Invalid session type" },
        { status: 400 }
      );
    }

    const hasRated = await hasHostSubmittedFeedback(
      userId,
      playerId,
      sessionId,
      sessionType
    );

    return NextResponse.json({ hasRated });
  } catch (error) {
    console.error("Failed to check player feedback status", error);
    return NextResponse.json(
      { error: "Failed to check feedback status" },
      { status: 500 }
    );
  }
}
