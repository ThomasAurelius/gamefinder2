import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";
import type { UserDocument } from "@/lib/user-types";

/**
 * Check if a user is an admin
 * @param userId - The user's MongoDB ObjectId as a string
 * @returns true if the user is an admin, false otherwise
 */
export async function isAdmin(userId: string): Promise<boolean> {
  if (!userId || !ObjectId.isValid(userId)) {
    return false;
  }

  try {
    const db = await getDb();
    const usersCollection = db.collection<UserDocument>("users");
    
    const user = await usersCollection.findOne(
      { _id: new ObjectId(userId) },
      { projection: { isAdmin: 1 } }
    );
    
    return user?.isAdmin === true;
  } catch (error) {
    console.error("Error checking admin status:", error);
    return false;
  }
}

/**
 * Get user by ID with admin status
 * @param userId - The user's MongoDB ObjectId as a string
 * @returns UserDocument or null
 */
export async function getUserWithAdminStatus(userId: string): Promise<Pick<UserDocument, "_id" | "isAdmin"> | null> {
  if (!userId || !ObjectId.isValid(userId)) {
    return null;
  }

  try {
    const db = await getDb();
    const usersCollection = db.collection<UserDocument>("users");
    
    const user = await usersCollection.findOne(
      { _id: new ObjectId(userId) },
      { projection: { _id: 1, isAdmin: 1 } }
    );
    
    return user;
  } catch (error) {
    console.error("Error fetching user admin status:", error);
    return null;
  }
}
