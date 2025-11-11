import { getDb } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import type { BadgeDocument, UserBadgeDocument } from "./types";

/**
 * Get all badges
 */
export async function getAllBadges(): Promise<BadgeDocument[]> {
  try {
    const db = await getDb();
    const badgesCollection = db.collection<BadgeDocument>("badges");
    
    const badges = await badgesCollection
      .find({})
      .sort({ name: 1 })
      .toArray();
    
    return badges;
  } catch (error) {
    console.error("Error fetching badges:", error);
    return [];
  }
}

/**
 * Get a badge by ID
 */
export async function getBadgeById(badgeId: string): Promise<BadgeDocument | null> {
  try {
    const db = await getDb();
    const badgesCollection = db.collection<BadgeDocument>("badges");
    
    const badge = await badgesCollection.findOne({ _id: new ObjectId(badgeId) });
    
    return badge;
  } catch (error) {
    console.error("Error fetching badge:", error);
    return null;
  }
}

/**
 * Create a new badge (admin only)
 */
export async function createBadge(
  userId: string,
  name: string,
  description: string,
  text: string,
  color: string,
  isSelfAssignable?: boolean
): Promise<BadgeDocument> {
  const db = await getDb();
  const badgesCollection = db.collection<BadgeDocument>("badges");
  
  const now = new Date();
  const badge: BadgeDocument = {
    name: name.trim(),
    description: description.trim(),
    text: text.trim(),
    color: color.trim(),
    createdAt: now,
    updatedAt: now,
    createdBy: userId,
    isSelfAssignable: isSelfAssignable || false,
  };
  
  const result = await badgesCollection.insertOne(badge);
  badge._id = result.insertedId;
  
  return badge;
}

/**
 * Update a badge (admin only)
 */
export async function updateBadge(
  badgeId: string,
  name: string,
  description: string,
  text: string,
  color: string,
  isSelfAssignable?: boolean
): Promise<boolean> {
  try {
    const db = await getDb();
    const badgesCollection = db.collection<BadgeDocument>("badges");
    
    const result = await badgesCollection.updateOne(
      { _id: new ObjectId(badgeId) },
      {
        $set: {
          name: name.trim(),
          description: description.trim(),
          text: text.trim(),
          color: color.trim(),
          isSelfAssignable: isSelfAssignable || false,
          updatedAt: new Date(),
        }
      }
    );
    
    return result.modifiedCount > 0;
  } catch (error) {
    console.error("Error updating badge:", error);
    return false;
  }
}

/**
 * Delete a badge (admin only)
 * Also removes all user assignments of this badge
 */
export async function deleteBadge(badgeId: string): Promise<boolean> {
  try {
    const db = await getDb();
    const badgesCollection = db.collection<BadgeDocument>("badges");
    const userBadgesCollection = db.collection<UserBadgeDocument>("userBadges");
    
    // Delete the badge
    const result = await badgesCollection.deleteOne({ _id: new ObjectId(badgeId) });
    
    // Remove all user assignments of this badge
    await userBadgesCollection.deleteMany({ badgeId });
    
    return result.deletedCount > 0;
  } catch (error) {
    console.error("Error deleting badge:", error);
    return false;
  }
}

/**
 * Award a badge to a user (admin only)
 */
export async function awardBadgeToUser(
  userId: string,
  badgeId: string,
  awardedBy: string
): Promise<UserBadgeDocument | null> {
  try {
    const db = await getDb();
    const userBadgesCollection = db.collection<UserBadgeDocument>("userBadges");
    
    // Check if user already has this badge
    const existing = await userBadgesCollection.findOne({ userId, badgeId });
    if (existing) {
      return existing; // Already has the badge
    }
    
    const userBadge: UserBadgeDocument = {
      userId,
      badgeId,
      awardedAt: new Date(),
      awardedBy,
      isDisplayed: true, // Default to displayed
    };
    
    const result = await userBadgesCollection.insertOne(userBadge);
    userBadge._id = result.insertedId;
    
    return userBadge;
  } catch (error) {
    console.error("Error awarding badge:", error);
    return null;
  }
}

/**
 * Self-assign a badge to a user (only for self-assignable badges)
 */
export async function selfAssignBadge(
  userId: string,
  badgeId: string
): Promise<UserBadgeDocument | null> {
  try {
    const db = await getDb();
    const badgesCollection = db.collection<BadgeDocument>("badges");
    const userBadgesCollection = db.collection<UserBadgeDocument>("userBadges");
    
    // Check if badge is self-assignable
    const badge = await badgesCollection.findOne({ _id: new ObjectId(badgeId) });
    if (!badge || !badge.isSelfAssignable) {
      return null; // Badge doesn't exist or is not self-assignable
    }
    
    // Check if user already has this badge
    const existing = await userBadgesCollection.findOne({ userId, badgeId });
    if (existing) {
      return existing; // Already has the badge
    }
    
    const userBadge: UserBadgeDocument = {
      userId,
      badgeId,
      awardedAt: new Date(),
      awardedBy: userId, // Self-assigned
      isDisplayed: true, // Default to displayed
    };
    
    const result = await userBadgesCollection.insertOne(userBadge);
    userBadge._id = result.insertedId;
    
    return userBadge;
  } catch (error) {
    console.error("Error self-assigning badge:", error);
    return null;
  }
}

/**
 * Remove a badge from a user (admin only)
 */
export async function removeBadgeFromUser(
  userId: string,
  badgeId: string
): Promise<boolean> {
  try {
    const db = await getDb();
    const userBadgesCollection = db.collection<UserBadgeDocument>("userBadges");
    
    const result = await userBadgesCollection.deleteOne({ userId, badgeId });
    
    return result.deletedCount > 0;
  } catch (error) {
    console.error("Error removing badge from user:", error);
    return false;
  }
}

/**
 * Get all badges for a user with badge details
 */
export async function getUserBadges(userId: string): Promise<Array<{
  userBadge: UserBadgeDocument;
  badge: BadgeDocument;
}>> {
  try {
    const db = await getDb();
    const userBadgesCollection = db.collection<UserBadgeDocument>("userBadges");
    const badgesCollection = db.collection<BadgeDocument>("badges");
    
    const userBadges = await userBadgesCollection
      .find({ userId })
      .toArray();
    
    // Fetch badge details for each user badge
    const badgeIds = userBadges.map(ub => new ObjectId(ub.badgeId));
    const badges = await badgesCollection
      .find({ _id: { $in: badgeIds } })
      .toArray();
    
    // Create a map for quick lookup
    const badgeMap = new Map(badges.map(b => [b._id!.toString(), b]));
    
    // Combine user badges with badge details
    const result: Array<{ userBadge: UserBadgeDocument; badge: BadgeDocument }> = [];
    for (const userBadge of userBadges) {
      const badge = badgeMap.get(userBadge.badgeId);
      if (badge) {
        result.push({ userBadge, badge });
      }
    }
    
    return result;
  } catch (error) {
    console.error("Error fetching user badges:", error);
    return [];
  }
}

/**
 * Get displayed badges for a user (for public viewing)
 */
export async function getDisplayedUserBadges(userId: string): Promise<Array<{
  userBadge: UserBadgeDocument;
  badge: BadgeDocument;
}>> {
  try {
    const allBadges = await getUserBadges(userId);
    return allBadges.filter(({ userBadge }) => userBadge.isDisplayed);
  } catch (error) {
    console.error("Error fetching displayed user badges:", error);
    return [];
  }
}

/**
 * Update badge display preference for a user
 */
export async function updateBadgeDisplayPreference(
  userId: string,
  badgeId: string,
  isDisplayed: boolean
): Promise<boolean> {
  try {
    const db = await getDb();
    const userBadgesCollection = db.collection<UserBadgeDocument>("userBadges");
    
    const result = await userBadgesCollection.updateOne(
      { userId, badgeId },
      { $set: { isDisplayed } }
    );
    
    return result.modifiedCount > 0;
  } catch (error) {
    console.error("Error updating badge display preference:", error);
    return false;
  }
}

/**
 * Get all users who have a specific badge
 */
export async function getUsersWithBadge(badgeId: string): Promise<string[]> {
  try {
    const db = await getDb();
    const userBadgesCollection = db.collection<UserBadgeDocument>("userBadges");
    
    const userBadges = await userBadgesCollection
      .find({ badgeId })
      .toArray();
    
    return userBadges.map(ub => ub.userId);
  } catch (error) {
    console.error("Error fetching users with badge:", error);
    return [];
  }
}
