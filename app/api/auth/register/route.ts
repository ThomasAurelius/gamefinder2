import { NextResponse, type NextRequest } from "next/server";
import type { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";
import { hashPassword } from "@/lib/password";

type UserDocument = {
  _id?: ObjectId;
  email: string;
  passwordHash: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
};

export async function POST(request: NextRequest) {
  try {
    const { email, password, name } = await request.json();

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 },
      );
    }

    if (!password || typeof password !== "string") {
      return NextResponse.json(
        { error: "Password is required" },
        { status: 400 },
      );
    }

    const normalizedEmail = email.trim().toLowerCase();
    const displayName = typeof name === "string" && name.trim().length > 0 ? name.trim() : normalizedEmail.split("@")[0];

    const db = await getDb();
    const usersCollection = db.collection<UserDocument>("users");

    const existingUser = await usersCollection.findOne({ email: normalizedEmail });

    if (existingUser) {
      return NextResponse.json(
        { error: "An account with that email already exists" },
        { status: 409 },
      );
    }

    const passwordHash = await hashPassword(password);
    const now = new Date();

    const insertResult = await usersCollection.insertOne({
      email: normalizedEmail,
      passwordHash,
      name: displayName,
      createdAt: now,
      updatedAt: now,
    });

    return NextResponse.json({
      message: "Account created",
      userId: insertResult.insertedId.toString(),
    });
  } catch (error) {
    console.error("Failed to register user", error);
    const message =
      error instanceof Error ? error.message : "Unexpected error registering user";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
