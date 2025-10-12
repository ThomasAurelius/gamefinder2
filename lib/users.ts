import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";
import type { UserDocument } from "@/lib/user-types";

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

/**
 * Get Stripe customer ID for a user
 */
export async function getStripeCustomerId(userId: string): Promise<string | null> {
  try {
    const db = await getDb();
    const usersCollection = db.collection<UserDocument>("users");
    
    if (!ObjectId.isValid(userId)) {
      return null;
    }
    
    const user = await usersCollection.findOne(
      { _id: new ObjectId(userId) },
      { projection: { stripeCustomerId: 1 } }
    );
    
    return user?.stripeCustomerId || null;
  } catch (error) {
    console.error("Failed to get Stripe customer ID:", error);
    return null;
  }
}

/**
 * Set Stripe customer ID for a user
 */
export async function setStripeCustomerId(userId: string, customerId: string): Promise<boolean> {
  try {
    const db = await getDb();
    const usersCollection = db.collection<UserDocument>("users");
    
    if (!ObjectId.isValid(userId)) {
      return false;
    }
    
    const result = await usersCollection.updateOne(
      { _id: new ObjectId(userId) },
      { 
        $set: { 
          stripeCustomerId: customerId,
          updatedAt: new Date()
        } 
      }
    );
    
    return result.modifiedCount > 0;
  } catch (error) {
    console.error("Failed to set Stripe customer ID:", error);
    return false;
  }
}

/**
 * Get user email by user ID (needed for Stripe customer creation)
 */
export async function getUserEmail(userId: string): Promise<string | null> {
  try {
    const db = await getDb();
    const usersCollection = db.collection<UserDocument>("users");
    
    if (!ObjectId.isValid(userId)) {
      return null;
    }
    
    const user = await usersCollection.findOne(
      { _id: new ObjectId(userId) },
      { projection: { email: 1 } }
    );
    
    return user?.email || null;
  } catch (error) {
    console.error("Failed to get user email:", error);
    return null;
  }
}

/**
 * Get Stripe Connect account ID for a host user
 */
export async function getStripeConnectAccountId(userId: string): Promise<string | null> {
  try {
    const db = await getDb();
    const usersCollection = db.collection<UserDocument>("users");
    
    if (!ObjectId.isValid(userId)) {
      return null;
    }
    
    const user = await usersCollection.findOne(
      { _id: new ObjectId(userId) },
      { projection: { stripeConnectAccountId: 1 } }
    );
    
    return user?.stripeConnectAccountId || null;
  } catch (error) {
    console.error("Failed to get Stripe Connect account ID:", error);
    return null;
  }
}

/**
 * Set Stripe Connect account ID for a host user
 */
export async function setStripeConnectAccountId(userId: string, accountId: string): Promise<boolean> {
  try {
    const db = await getDb();
    const usersCollection = db.collection<UserDocument>("users");
    
    if (!ObjectId.isValid(userId)) {
      return false;
    }
    
    const result = await usersCollection.updateOne(
      { _id: new ObjectId(userId) },
      { 
        $set: { 
          stripeConnectAccountId: accountId,
          updatedAt: new Date()
        } 
      }
    );
    
    return result.modifiedCount > 0;
  } catch (error) {
    console.error("Failed to set Stripe Connect account ID:", error);
    return false;
  }
}

/**
 * Update Stripe Connect onboarding status for a host user
 */
export async function setStripeConnectOnboardingComplete(userId: string, complete: boolean): Promise<boolean> {
  try {
    const db = await getDb();
    const usersCollection = db.collection<UserDocument>("users");
    
    if (!ObjectId.isValid(userId)) {
      return false;
    }
    
    const result = await usersCollection.updateOne(
      { _id: new ObjectId(userId) },
      { 
        $set: { 
          stripeConnectOnboardingComplete: complete,
          updatedAt: new Date()
        } 
      }
    );
    
    return result.modifiedCount > 0;
  } catch (error) {
    console.error("Failed to update Stripe Connect onboarding status:", error);
    return false;
  }
}

/**
 * Get user's Stripe Connect status (account ID and onboarding completion)
 */
export async function getStripeConnectStatus(userId: string): Promise<{
  accountId: string | null;
  onboardingComplete: boolean;
} | null> {
  try {
    const db = await getDb();
    const usersCollection = db.collection<UserDocument>("users");
    
    if (!ObjectId.isValid(userId)) {
      return null;
    }
    
    const user = await usersCollection.findOne(
      { _id: new ObjectId(userId) },
      { projection: { stripeConnectAccountId: 1, stripeConnectOnboardingComplete: 1 } }
    );
    
    if (!user) {
      return null;
    }
    
    return {
      accountId: user.stripeConnectAccountId || null,
      onboardingComplete: user.stripeConnectOnboardingComplete || false,
    };
  } catch (error) {
    console.error("Failed to get Stripe Connect status:", error);
    return null;
  }
}

/**
 * Search for users by name (partial match, case-insensitive)
 */
export async function searchUsersByName(searchTerm: string): Promise<UserBasicInfo[]> {
  try {
    const db = await getDb();
    const usersCollection = db.collection<UserDocument>("users");
    
    if (!searchTerm || searchTerm.trim().length === 0) {
      return [];
    }
    
    // Escape special regex characters to prevent regex injection
    const escapedSearchTerm = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    
    // Search by name or commonName (case-insensitive)
    const users = await usersCollection
      .find(
        {
          $or: [
            { name: { $regex: new RegExp(escapedSearchTerm, "i") } },
            { "profile.commonName": { $regex: new RegExp(escapedSearchTerm, "i") } },
          ],
        },
        { projection: { _id: 1, name: 1, email: 1, "profile.avatarUrl": 1, "profile.commonName": 1 } }
      )
      .limit(10) // Limit results to prevent large result sets
      .toArray();
    
    return users.map(user => ({
      id: user._id?.toString() || "",
      name: user.profile?.commonName || user.name || user.email?.split("@")[0] || "Unknown User",
      email: user.email || "",
      avatarUrl: user.profile?.avatarUrl || undefined,
    }));
  } catch (error) {
    console.error("Failed to search users by name:", error);
    return [];
  }
}

