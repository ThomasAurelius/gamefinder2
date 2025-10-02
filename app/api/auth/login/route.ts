import { NextResponse, type NextRequest } from "next/server";
import type { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";
import { verifyPassword } from "@/lib/password";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

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
    const db = await getDb();
    const usersCollection = db.collection<{ _id: ObjectId; passwordHash: string; name?: string }>(
      "users",
    );
    const user = await usersCollection.findOne(
      { email: normalizedEmail },
    );

    if (!user || !user.passwordHash) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 },
      );
    }

    const isValidPassword = await verifyPassword(password, user.passwordHash);

    if (!isValidPassword) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 },
      );
    }

    return NextResponse.json({
      message: "Login successful",
      user: {
        id: user._id?.toString(),
        email: normalizedEmail,
        name: user.name ?? normalizedEmail.split("@")[0],
      },
    });
  } catch (error) {
    console.error("Failed to authenticate user", error);
    const message =
      error instanceof Error ? error.message : "Unexpected error authenticating user";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
