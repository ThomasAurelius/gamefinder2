import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getDb } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import type { UserDocument } from "@/lib/user-types";

export async function POST() {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("userId")?.value;

    if (!userId) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const db = await getDb();
    const usersCollection = db.collection<UserDocument>("users");

    await usersCollection.updateOne(
      { _id: new ObjectId(userId) },
      { 
        $set: { 
          onboardingCompleted: true,
          updatedAt: new Date()
        } 
      }
    );

    return NextResponse.json({ 
      message: "Onboarding completed successfully" 
    });
  } catch (error) {
    console.error("Failed to complete onboarding", error);
    return NextResponse.json(
      { error: "Failed to complete onboarding" },
      { status: 500 }
    );
  }
}
