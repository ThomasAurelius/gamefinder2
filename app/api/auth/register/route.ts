import { NextResponse, type NextRequest } from "next/server";
import { getDb } from "@/lib/mongodb";
import { hashPassword } from "@/lib/password";
import { UserDocument } from "@/lib/user-types";
import { AMBASSADOR_EXPIRATION_DATE } from "@/lib/ambassador-config";

export async function POST(request: NextRequest) {
  try {
    const { email, password, name, isAmbassador } = await request.json();

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

    // Set ambassador status and expiration if isAmbassador is true
    const userDocument: Partial<UserDocument> = {
      email: normalizedEmail,
      passwordHash,
      name: displayName,
      createdAt: now,
      updatedAt: now,
      profile: {
        name: "",
        commonName: "",
        location: "",
        zipCode: "",
        bio: "",
        games: [],
        favoriteGames: [],
        availability: {
          Monday: [],
          Tuesday: [],
          Wednesday: [],
          Thursday: [],
          Friday: [],
          Saturday: [],
          Sunday: [],
        },
        primaryRole: "",
        avatarUrl: "",
        canPostPaidGames: false,
      },
    };

    if (isAmbassador === true) {
      userDocument.isAmbassador = true;
      // Set ambassador expiration to the configured date
      userDocument.ambassadorUntil = AMBASSADOR_EXPIRATION_DATE;
    }

    const insertResult = await usersCollection.insertOne(userDocument);

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
