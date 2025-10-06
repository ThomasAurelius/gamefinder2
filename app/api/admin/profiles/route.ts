import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";
import { isAdmin } from "@/lib/admin";
import type { UserDocument } from "@/lib/user-types";

/**
 * POST /api/admin/profiles - Hide or show a user profile (admin only)
 */
export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("userId")?.value;
    
    if (!userId) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }
    
    // Check if user is admin
    const userIsAdmin = await isAdmin(userId);
    if (!userIsAdmin) {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }
    
    const { targetUserId, isHidden } = await request.json();
    
    if (!targetUserId || typeof targetUserId !== "string") {
      return NextResponse.json(
        { error: "targetUserId is required" },
        { status: 400 }
      );
    }
    
    if (typeof isHidden !== "boolean") {
      return NextResponse.json(
        { error: "isHidden must be a boolean" },
        { status: 400 }
      );
    }
    
    if (!ObjectId.isValid(targetUserId)) {
      return NextResponse.json(
        { error: "Invalid user ID" },
        { status: 400 }
      );
    }
    
    const db = await getDb();
    const usersCollection = db.collection<UserDocument>("users");
    
    const result = await usersCollection.updateOne(
      { _id: new ObjectId(targetUserId) },
      { 
        $set: { 
          isHidden,
          updatedAt: new Date()
        } 
      }
    );
    
    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ 
      success: true,
      isHidden 
    });
  } catch (error) {
    console.error("Error updating profile visibility:", error);
    return NextResponse.json(
      { error: "Failed to update profile visibility" },
      { status: 500 }
    );
  }
}
