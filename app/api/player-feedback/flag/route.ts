import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { flagFeedback } from "@/lib/player-feedback/db";

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
    const { feedbackId, flagReason } = body;

    if (!feedbackId || !flagReason) {
      return NextResponse.json(
        { error: "Feedback ID and flag reason are required" },
        { status: 400 }
      );
    }

    const feedback = await flagFeedback(feedbackId, userId, flagReason);

    return NextResponse.json(feedback, { status: 200 });
  } catch (error) {
    console.error("Failed to flag feedback", error);
    return NextResponse.json(
      { error: "Failed to flag feedback" },
      { status: 500 }
    );
  }
}
