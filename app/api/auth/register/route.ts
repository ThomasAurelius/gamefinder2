import { NextResponse, type NextRequest } from "next/server";
import { getDb } from "@/lib/mongodb";
import { UserDocument } from "@/lib/user-types";
import { AMBASSADOR_EXPIRATION_DATE } from "@/lib/ambassador-config";
import { getFirebaseAdminApp } from "@/lib/firebaseAdmin";
import { getAuth } from "firebase-admin/auth";

export async function POST(request: NextRequest) {
  try {
    const { idToken, email, name, isAmbassador } = await request.json();

    if (!idToken || typeof idToken !== "string") {
      return NextResponse.json(
        { error: "ID token is required" },
        { status: 400 },
      );
    }

    // Verify the Firebase ID token
    const app = getFirebaseAdminApp();
    const auth = getAuth(app);
    let decodedToken;
    
    try {
      decodedToken = await auth.verifyIdToken(idToken);
    } catch (error) {
      console.error("Failed to verify ID token", error);
      return NextResponse.json(
        { error: "Invalid authentication token" },
        { status: 401 },
      );
    }

    const firebaseUid = decodedToken.uid;
    const userEmail = decodedToken.email || email;

    if (!userEmail || typeof userEmail !== "string") {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 },
      );
    }

    const normalizedEmail = userEmail.trim().toLowerCase();
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

    const now = new Date();

    // Create user document with Firebase UID
    const userDocument: Omit<UserDocument, '_id'> = {
      email: normalizedEmail,
      firebaseUid,
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
