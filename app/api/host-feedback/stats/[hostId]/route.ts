import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getHostFeedbackStats, getHostFeedbackWithComments } from "@/lib/host-feedback/db";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ hostId: string }> }
) {
  try {
    const { hostId } = await params;
    const cookieStore = await cookies();
    const userId = cookieStore.get("userId")?.value;
    const isAdmin = cookieStore.get("isAdmin")?.value === "true";

    if (!hostId) {
      return NextResponse.json(
        { error: "Host ID is required" },
        { status: 400 }
      );
    }

    // Get basic stats (public)
    const stats = await getHostFeedbackStats(hostId);

    // Include comments only if requester is the host or an admin
    if (userId && (userId === hostId || isAdmin)) {
      const feedbackWithComments = await getHostFeedbackWithComments(hostId);
      return NextResponse.json({
        ...stats,
        feedback: feedbackWithComments,
      });
    }

    return NextResponse.json(stats);
  } catch (error) {
    console.error("Failed to get host feedback stats", error);
    return NextResponse.json(
      { error: "Failed to get feedback stats" },
      { status: 500 }
    );
  }
}
