import { getDb } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

/**
 * Get a user's display name from their database record
 * Falls back to email username if name is not set
 * @param userId - The user's MongoDB ObjectId as a string
 * @returns The user's display name or null if user not found
 */
export async function getUserDisplayName(userId: string): Promise<string | null> {
  try {
    const db = await getDb();
    const usersCollection = db.collection("users");
    const user = await usersCollection.findOne(
      { _id: new ObjectId(userId) },
      { projection: { name: 1, email: 1 } }
    );

    if (!user) {
      return null;
    }

    return user.name || (user.email as string)?.split("@")[0] || "User";
  } catch (error) {
    console.error("Failed to get user display name:", error);
    return null;
  }
}
