import { NextResponse, type NextRequest } from "next/server";
import { cookies } from "next/headers";
import { getConversation } from "@/lib/messages";

export async function GET(request: NextRequest) {
  try {
    // Get authenticated user from cookie
    const cookieStore = await cookies();
    const authenticatedUserId = cookieStore.get("userId")?.value;

    if (!authenticatedUserId) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const otherUserId = searchParams.get("otherUserId");

    if (!otherUserId || typeof otherUserId !== "string") {
      return NextResponse.json(
        { error: "Other user ID is required" },
        { status: 400 }
      );
    }

    // Use authenticated user ID for conversation lookup
    const messages = await getConversation(authenticatedUserId, otherUserId);

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
