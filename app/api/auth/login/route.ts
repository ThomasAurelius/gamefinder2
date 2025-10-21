import { NextResponse, type NextRequest } from "next/server";
import { getDb } from "@/lib/mongodb";
import type { UserDocument } from "@/lib/user-types";
import { getFirebaseAdminApp } from "@/lib/firebaseAdmin";
import { getAuth } from "firebase-admin/auth";

export async function POST(request: NextRequest) {
  try {
    const { idToken, email } = await request.json();

    if (!idToken || typeof idToken !== "string") {
      console.error("Login attempt without valid ID token");
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

    if (!userEmail) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 },
      );
    }

    const normalizedEmail = userEmail.trim().toLowerCase();
    const db = await getDb();
    const usersCollection = db.collection<UserDocument>("users");
    
    // Find or create user in MongoDB
    let user = await usersCollection.findOne({ email: normalizedEmail });

    const now = new Date();

    if (!user) {
      // Create a new user profile if it doesn't exist
      const newUser: Omit<UserDocument, '_id'> = {
        email: normalizedEmail,
        firebaseUid,
        name: normalizedEmail.split("@")[0],
        createdAt: now,
        updatedAt: now,
        lastLoginAt: now,
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

      const insertResult = await usersCollection.insertOne(newUser);
      user = { ...newUser, _id: insertResult.insertedId };
    } else {
      // Update existing user with Firebase UID and last login
      const updateFields: Partial<UserDocument> = { 
        lastLoginAt: now,
        firebaseUid,
      };
      
      // Check if ambassador status has expired and turn off if necessary
      if (user.isAmbassador && user.ambassadorUntil && user.ambassadorUntil <= now) {
        updateFields.isAmbassador = false;
        updateFields.updatedAt = now;
      }

      await usersCollection.updateOne(
        { _id: user._id },
        { $set: updateFields }
      );
    }

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
