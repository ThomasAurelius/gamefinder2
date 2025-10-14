import { NextResponse, type NextRequest } from "next/server";
import { cookies } from "next/headers";
import {
  createMessage,
  getUserMessages,
  type MessagePayload,
} from "@/lib/messages";
import { getUserDisplayName } from "@/lib/user-utils";

export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const { recipientId, recipientName, subject, content } = body;

    if (!recipientId || typeof recipientId !== "string") {
      return NextResponse.json(
        { error: "Recipient ID is required" },
        { status: 400 }
      );
    }

    if (!recipientName || typeof recipientName !== "string") {
      return NextResponse.json(
        { error: "Recipient name is required" },
        { status: 400 }
      );
    }

    if (!subject || typeof subject !== "string" || subject.trim().length === 0) {
      return NextResponse.json(
        { error: "Subject is required" },
        { status: 400 }
      );
    }

    if (!content || typeof content !== "string" || content.trim().length === 0) {
      return NextResponse.json(
        { error: "Message content is required" },
        { status: 400 }
      );
    }

    // Get sender info from database using authenticated user ID
    const senderName = await getUserDisplayName(authenticatedUserId);

    if (!senderName) {
      return NextResponse.json(
        { error: "Sender not found" },
        { status: 404 }
      );
    }

    const payload: MessagePayload = {
      senderId: authenticatedUserId,
      senderName: senderName,
      recipientId: recipientId.trim(),
      recipientName: recipientName.trim(),
      subject: subject.trim(),
      content: content.trim(),
    };

    const message = await createMessage(payload);

    return NextResponse.json({
      message: "Message sent successfully",
      data: message,
    });
  } catch (error) {
    console.error("Failed to send message", error);
    const message =
      error instanceof Error ? error.message : "Unexpected error sending message";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET() {
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

    // Only allow users to fetch their own messages
    const messages = await getUserMessages(authenticatedUserId);

    return NextResponse.json({
      messages,
    });
  } catch (error) {
    console.error("Failed to fetch messages", error);
    const message =
      error instanceof Error ? error.message : "Unexpected error fetching messages";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
