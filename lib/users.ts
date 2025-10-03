import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";

export type UserBasicInfo = {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
};

/**
 * Get basic user information by user ID
 */
export async function getUserBasicInfo(userId: string): Promise<UserBasicInfo | null> {
  try {
    const db = await getDb();
    const usersCollection = db.collection("users");
    
    if (!ObjectId.isValid(userId)) {
      return null;
    }
    
    const user = await usersCollection.findOne(
      { _id: new ObjectId(userId) },
      { projection: { _id: 1, name: 1, email: 1, "profile.avatarUrl": 1 } }
    );
    
    if (!user) {
      return null;
    }
    
    return {
      id: user._id?.toString() || userId,
      name: user.name || user.email?.split("@")[0] || "Unknown User",
      email: user.email || "",
      avatarUrl: user.profile?.avatarUrl || undefined,
    };
  } catch (error) {
    console.error("Failed to fetch user info:", error);
    return null;
  }
}

/**
 * Get basic user information for multiple user IDs
 */
export async function getUsersBasicInfo(userIds: string[]): Promise<Map<string, UserBasicInfo>> {
  const result = new Map<string, UserBasicInfo>();
  
  try {
    const db = await getDb();
    const usersCollection = db.collection("users");
    
    const validIds = userIds.filter(id => ObjectId.isValid(id));
    
    if (validIds.length === 0) {
      return result;
    }
    
    const objectIds = validIds.map(id => new ObjectId(id));
    
    const users = await usersCollection
      .find(
        { _id: { $in: objectIds } },
        { projection: { _id: 1, name: 1, email: 1, "profile.avatarUrl": 1 } }
      )
      .toArray();
    
    for (const user of users) {
      const userId = user._id?.toString();
      if (userId) {
        result.set(userId, {
          id: userId,
          name: user.name || user.email?.split("@")[0] || "Unknown User",
          email: user.email || "",
          avatarUrl: user.profile?.avatarUrl || undefined,
        });
      }
    }
  } catch (error) {
    console.error("Failed to fetch users info:", error);
  }
  
  return result;
}
