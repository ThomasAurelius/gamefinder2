import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getPlayerFeedbackStats, getPlayerFeedbackWithComments } from "@/lib/player-feedback/db";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ playerId: string }> }
) {
  try {
    const { playerId } = await params;
    const cookieStore = await cookies();
    const userId = cookieStore.get("userId")?.value;
    const isAdmin = cookieStore.get("isAdmin")?.value === "true";

    if (!playerId) {
      return NextResponse.json(
        { error: "Player ID is required" },
        { status: 400 }
      );
    }

    // Get basic stats (public)
    const stats = await getPlayerFeedbackStats(playerId);

    // Include comments for everyone, but filter flagged comments for non-admins
    const feedbackWithComments = await getPlayerFeedbackWithComments(playerId, isAdmin);
    return NextResponse.json({
      ...stats,
      feedback: feedbackWithComments,
    });
  } catch (error) {
    console.error("Failed to get player feedback stats", error);
    return NextResponse.json(
      { error: "Failed to get feedback stats" },
      { status: 500 }
    );
  }
}
