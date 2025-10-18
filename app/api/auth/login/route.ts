import { NextResponse, type NextRequest } from "next/server";
import { getDb } from "@/lib/mongodb";
import { verifyPassword } from "@/lib/password";
import type { UserDocument } from "@/lib/user-types";

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
    const usersCollection = db.collection<UserDocument>(
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

    // Check if ambassador status has expired and turn off if necessary
    const now = new Date();
    const updateFields: Partial<UserDocument> = { lastLoginAt: now };
    
    if (user.isAmbassador && user.ambassadorUntil && user.ambassadorUntil <= now) {
      // Ambassador status has expired, turn it off
      updateFields.isAmbassador = false;
      updateFields.updatedAt = now;
    }

    // Update user with login timestamp and potentially expired ambassador status
    await usersCollection.updateOne(
      { _id: user._id },
      { $set: updateFields }
    );

    const response = NextResponse.json({
      message: "Login successful",
      user: {
        id: user._id?.toString(),
        email: normalizedEmail,
        name: user.name ?? normalizedEmail.split("@")[0],
      },
    });

    // Set userId cookie for authenticated requests
    const userId = user._id?.toString();
    if (!userId) {
      throw new Error("User ID is missing");
    }
    
    response.cookies.set("userId", userId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Failed to authenticate user", error);
    const message =
      error instanceof Error ? error.message : "Unexpected error authenticating user";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
