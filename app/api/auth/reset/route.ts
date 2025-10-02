import { NextResponse, type NextRequest } from "next/server";
import { createHash } from "node:crypto";
import type { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";
import { hashPassword } from "@/lib/password";

export async function POST(request: NextRequest) {
  try {
    const { token, password } = await request.json();

    if (!token || typeof token !== "string") {
      return NextResponse.json(
        { error: "Reset token is required" },
        { status: 400 },
      );
    }

    if (!password || typeof password !== "string") {
      return NextResponse.json(
        { error: "Password is required" },
        { status: 400 },
      );
    }

    const tokenHash = createHash("sha256").update(token).digest("hex");
    const db = await getDb();

    const tokensCollection = db.collection<{
      _id: ObjectId;
      userId: ObjectId;
      tokenHash: string;
      expiresAt: Date;
    }>("password_reset_tokens");

    const tokenRecord = await tokensCollection.findOne({ tokenHash });

    if (!tokenRecord) {
      return NextResponse.json(
        { error: "Reset link is invalid or has already been used" },
        { status: 400 },
      );
    }

    if (tokenRecord.expiresAt.getTime() < Date.now()) {
      await tokensCollection.deleteOne({ _id: tokenRecord._id });
      return NextResponse.json(
        { error: "Reset link has expired" },
        { status: 400 },
      );
    }

    const usersCollection = db.collection<{ _id: ObjectId }>("users");

    const passwordHash = await hashPassword(password);

    await usersCollection.updateOne(
      { _id: tokenRecord.userId },
      { $set: { passwordHash, updatedAt: new Date() } },
    );

    await tokensCollection.deleteOne({ _id: tokenRecord._id });

    return NextResponse.json({ message: "Password has been reset" });
  } catch (error) {
    console.error("Failed to reset password", error);
    const message =
      error instanceof Error ? error.message : "Unexpected error resetting password";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
