import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { submitHostFeedback } from "@/lib/host-feedback/db";
import { HostFeedbackPayload } from "@/lib/host-feedback/types";

function parseHostFeedbackPayload(data: unknown): HostFeedbackPayload | null {
  if (typeof data !== "object" || data === null) {
    return null;
  }

  const obj = data as Record<string, unknown>;

  if (
    typeof obj.hostId !== "string" ||
    typeof obj.sessionId !== "string" ||
    typeof obj.sessionType !== "string" ||
    typeof obj.rating !== "number"
  ) {
    return null;
  }

  if (
    obj.sessionType !== "game" &&
    obj.sessionType !== "campaign"
  ) {
    return null;
  }

  if (
    obj.rating !== 1 &&
    obj.rating !== 2 &&
    obj.rating !== 3 &&
    obj.rating !== 4 &&
    obj.rating !== 5
  ) {
    return null;
  }

  return {
    hostId: obj.hostId,
    sessionId: obj.sessionId,
    sessionType: obj.sessionType as "game" | "campaign",
    rating: obj.rating as 1 | 2 | 3 | 4 | 5,
    comment: typeof obj.comment === "string" ? obj.comment : undefined,
  };
}

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
    const payload = parseHostFeedbackPayload(body);

    if (!payload) {
      return NextResponse.json(
        { error: "Invalid feedback data" },
        { status: 400 }
      );
    }

    // Validate that player is not rating themselves
    if (payload.hostId === userId) {
      return NextResponse.json(
        { error: "Cannot rate yourself" },
        { status: 400 }
      );
    }

    const feedback = await submitHostFeedback(userId, payload);

    return NextResponse.json(feedback, { status: 201 });
  } catch (error) {
    console.error("Failed to submit host feedback", error);
    return NextResponse.json(
      { error: "Failed to submit feedback" },
      { status: 500 }
    );
  }
}
