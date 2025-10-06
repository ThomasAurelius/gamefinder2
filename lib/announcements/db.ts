import { getDb } from "@/lib/mongodb";
import type { AnnouncementDocument } from "./types";

/**
 * Get the active announcement
 */
export async function getActiveAnnouncement(): Promise<AnnouncementDocument | null> {
  try {
    const db = await getDb();
    const announcementsCollection = db.collection<AnnouncementDocument>("announcements");
    
    const announcement = await announcementsCollection.findOne(
      { isActive: true },
      { sort: { updatedAt: -1 } }
    );
    
    return announcement;
  } catch (error) {
    console.error("Error fetching active announcement:", error);
    return null;
  }
}

/**
 * Create or update announcement
 */
export async function setAnnouncement(
  userId: string,
  message: string,
  isActive: boolean
): Promise<AnnouncementDocument> {
  const db = await getDb();
  const announcementsCollection = db.collection<AnnouncementDocument>("announcements");
  
  const now = new Date();
  
  // Deactivate all existing announcements
  await announcementsCollection.updateMany(
    { isActive: true },
    { $set: { isActive: false, updatedAt: now } }
  );
  
  // Create new announcement if active
  if (isActive && message.trim()) {
    const announcement: AnnouncementDocument = {
      message: message.trim(),
      isActive: true,
      createdAt: now,
      updatedAt: now,
      createdBy: userId,
    };
    
    const result = await announcementsCollection.insertOne(announcement);
    announcement._id = result.insertedId;
    
    return announcement;
  }
  
  // Return empty announcement if inactive
  return {
    message: "",
    isActive: false,
    createdAt: now,
    updatedAt: now,
    createdBy: userId,
  };
}
