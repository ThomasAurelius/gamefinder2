import { NextResponse, type NextRequest } from "next/server";
import { getConversation } from "@/lib/messages";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const otherUserId = searchParams.get("otherUserId");

    if (!userId || typeof userId !== "string") {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    if (!otherUserId || typeof otherUserId !== "string") {
      return NextResponse.json(
        { error: "Other user ID is required" },
        { status: 400 }
      );
    }

    const messages = await getConversation(userId, otherUserId);

    return NextResponse.json({
      messages,
    });
  } catch (error) {
    console.error("Failed to fetch conversation", error);
    const message =
      error instanceof Error
        ? error.message
        : "Unexpected error fetching conversation";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
