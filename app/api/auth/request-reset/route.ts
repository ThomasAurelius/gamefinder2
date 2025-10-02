import { NextResponse, type NextRequest } from "next/server";
import { createHash, randomBytes } from "node:crypto";
import type { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";
import { sendResetPasswordEmail } from "@/lib/email";

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 },
      );
    }

    const normalizedEmail = email.trim().toLowerCase();
    const db = await getDb();
    const usersCollection = db.collection<{ _id: ObjectId; email: string }>("users");
    const user = await usersCollection.findOne({ email: normalizedEmail });

    if (!user) {
      return NextResponse.json({
        message: "If an account exists for that email, a reset link is on its way.",
      });
    }

    const token = randomBytes(32).toString("hex");
    const tokenHash = createHash("sha256").update(token).digest("hex");
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60);

    const tokensCollection = db.collection<{
      userId: ObjectId;
      tokenHash: string;
      expiresAt: Date;
    }>("password_reset_tokens");

    await tokensCollection.updateOne(
      { userId: user._id },
      { $set: { userId: user._id, tokenHash, expiresAt } },
      { upsert: true },
    );

    await sendResetPasswordEmail({ email: normalizedEmail, token });

    return NextResponse.json({
      message: "If an account exists for that email, a reset link is on its way.",
    });
  } catch (error) {
    console.error("Failed to start password reset", error);
    const message =
      error instanceof Error ? error.message : "Unexpected error starting reset";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
