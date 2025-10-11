import { ObjectId } from "mongodb";

/**
 * Badge definition - created and managed by admins
 */
export type BadgeDocument = {
  _id?: ObjectId;
  name: string; // Display name of the badge
  description: string; // Description of what the badge represents
  imageUrl: string; // URL to badge icon/image
  color?: string; // Optional color for the badge (hex code)
  createdAt: Date;
  updatedAt: Date;
  createdBy: string; // Admin user ID who created the badge
  isSelfAssignable?: boolean; // Whether users can assign this badge to themselves
};

/**
 * User badge assignment - tracks which badges a user has been awarded
 */
export type UserBadgeDocument = {
  _id?: ObjectId;
  userId: string; // User who received the badge
  badgeId: string; // Badge ID
  awardedAt: Date; // When the badge was awarded
  awardedBy: string; // Admin user ID who awarded the badge
  isDisplayed: boolean; // Whether the user wants to display this badge
};
