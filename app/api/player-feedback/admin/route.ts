import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { isAdmin } from "@/lib/admin";
import { getFlaggedFeedback, resolveFlaggedFeedback } from "@/lib/player-feedback/db";

/**
 * Get all flagged feedback (admin only)
 */
export async function GET() {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("userId")?.value;

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const userIsAdmin = await isAdmin(userId);
    if (!userIsAdmin) {
      return NextResponse.json(
        { error: "Forbidden - Admin access required" },
        { status: 403 }
      );
    }

    const flaggedFeedback = await getFlaggedFeedback();

    return NextResponse.json(flaggedFeedback, { status: 200 });
  } catch (error) {
    console.error("Failed to get flagged feedback", error);
    return NextResponse.json(
      { error: "Failed to get flagged feedback" },
      { status: 500 }
    );
  }
}

/**
 * Resolve flagged feedback (admin only)
 */
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

    const userIsAdmin = await isAdmin(userId);
    if (!userIsAdmin) {
      return NextResponse.json(
        { error: "Forbidden - Admin access required" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { feedbackId, action } = body;

    if (!feedbackId || !action) {
      return NextResponse.json(
        { error: "Feedback ID and action are required" },
        { status: 400 }
      );
    }

    if (action !== "accepted" && action !== "deleted") {
      return NextResponse.json(
        { error: "Invalid action. Must be 'accepted' or 'deleted'" },
        { status: 400 }
      );
    }

    const feedback = await resolveFlaggedFeedback(feedbackId, userId, action);

    return NextResponse.json(feedback, { status: 200 });
  } catch (error) {
    console.error("Failed to resolve flagged feedback", error);
    return NextResponse.json(
      { error: "Failed to resolve flagged feedback" },
      { status: 500 }
    );
  }
}
