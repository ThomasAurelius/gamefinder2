import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createFlag } from "@/lib/tall-tales/db";
import { FlagReason } from "@/lib/tall-tales/types";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("userId")?.value;

    if (!userId) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const { id: taleId } = await params;
    const body = await request.json();
    const { flagReason, flagComment } = body;

    if (!flagReason || !["offtopic", "inappropriate", "spam", "other"].includes(flagReason)) {
      return NextResponse.json(
        { error: "Valid flag reason is required (offtopic, inappropriate, spam, or other)" },
        { status: 400 }
      );
    }

    const flag = await createFlag(
      taleId,
      userId,
      flagReason as FlagReason,
      flagComment
    );

    return NextResponse.json({ 
      message: "Content flagged successfully",
      flagId: flag.id 
    }, { status: 201 });
  } catch (error) {
    console.error("Failed to flag content:", error);
    return NextResponse.json(
      { error: "Failed to flag content" },
      { status: 500 }
    );
  }
}
