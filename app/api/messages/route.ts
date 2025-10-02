import { NextResponse, type NextRequest } from "next/server";
import {
  createMessage,
  getUserMessages,
  type MessagePayload,
} from "@/lib/messages";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { senderId, senderName, recipientId, recipientName, subject, content } = body;

    if (!senderId || typeof senderId !== "string") {
      return NextResponse.json(
        { error: "Sender ID is required" },
        { status: 400 }
      );
    }

    if (!senderName || typeof senderName !== "string") {
      return NextResponse.json(
        { error: "Sender name is required" },
        { status: 400 }
      );
    }

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

    const payload: MessagePayload = {
      senderId: senderId.trim(),
      senderName: senderName.trim(),
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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId || typeof userId !== "string") {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    const messages = await getUserMessages(userId);

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
