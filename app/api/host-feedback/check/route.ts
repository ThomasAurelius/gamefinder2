import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { hasPlayerSubmittedFeedback } from "@/lib/host-feedback/db";

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
    const { sessionId, sessionType } = body;

    if (!sessionId || !sessionType) {
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

    const hasRated = await hasPlayerSubmittedFeedback(
      userId,
      sessionId,
      sessionType
    );

    return NextResponse.json({ hasRated });
  } catch (error) {
    console.error("Failed to check host feedback status", error);
    return NextResponse.json(
      { error: "Failed to check feedback status" },
      { status: 500 }
    );
  }
}
