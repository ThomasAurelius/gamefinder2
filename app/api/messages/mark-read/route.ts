import { NextResponse, type NextRequest } from "next/server";
import { markMessageAsRead } from "@/lib/messages";

export async function PATCH(request: NextRequest) {
  try {
    const { messageId } = await request.json();

    if (!messageId || typeof messageId !== "string") {
      return NextResponse.json(
        { error: "Message ID is required" },
        { status: 400 }
      );
    }

    const success = await markMessageAsRead(messageId);

    if (!success) {
      return NextResponse.json(
        { error: "Message not found or already read" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Message marked as read",
    });
  } catch (error) {
    console.error("Failed to mark message as read", error);
    const message =
      error instanceof Error
        ? error.message
        : "Unexpected error marking message as read";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
