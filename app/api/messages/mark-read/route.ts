import { NextResponse, type NextRequest } from "next/server";
import { cookies } from "next/headers";
import { markMessageAsRead } from "@/lib/messages";
import { getDb } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function PATCH(request: NextRequest) {
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

    const { messageId } = await request.json();

    if (!messageId || typeof messageId !== "string") {
      return NextResponse.json(
        { error: "Message ID is required" },
        { status: 400 }
      );
    }

    // Verify the authenticated user is the recipient of the message
    const db = await getDb();
    const messagesCollection = db.collection("messages");
    const message = await messagesCollection.findOne({
      _id: new ObjectId(messageId),
    });

    if (!message) {
      return NextResponse.json(
        { error: "Message not found" },
        { status: 404 }
      );
    }

    // Ensure the authenticated user is the recipient
    if (message.recipientId !== authenticatedUserId) {
      return NextResponse.json(
        { error: "Unauthorized to mark this message as read" },
        { status: 403 }
      );
    }

    const success = await markMessageAsRead(messageId);

    if (!success) {
      return NextResponse.json(
        { error: "Failed to mark message as read" },
        { status: 500 }
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
