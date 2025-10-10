import { getDb } from "@/lib/mongodb";
import type { AdvertisementDocument } from "./types";

/**
 * Get the active advertisement
 */
export async function getActiveAdvertisement(): Promise<AdvertisementDocument | null> {
  try {
    const db = await getDb();
    const advertisementsCollection = db.collection<AdvertisementDocument>("advertisements");
    
    const advertisement = await advertisementsCollection.findOne(
      { isActive: true },
      { sort: { updatedAt: -1 } }
    );
    
    return advertisement;
  } catch (error) {
    console.error("Error fetching active advertisement:", error);
    return null;
  }
}

/**
 * Create or update advertisement
 */
export async function setAdvertisement(
  userId: string,
  imageUrl: string,
  isActive: boolean
): Promise<AdvertisementDocument> {
  const db = await getDb();
  const advertisementsCollection = db.collection<AdvertisementDocument>("advertisements");
  
  const now = new Date();
  
  // Deactivate all existing advertisements
  await advertisementsCollection.updateMany(
    { isActive: true },
    { $set: { isActive: false, updatedAt: now } }
  );
  
  // Create new advertisement if active
  if (isActive && imageUrl.trim()) {
    const advertisement: AdvertisementDocument = {
      imageUrl: imageUrl.trim(),
      isActive: true,
      createdAt: now,
      updatedAt: now,
      createdBy: userId,
    };
    
    const result = await advertisementsCollection.insertOne(advertisement);
    advertisement._id = result.insertedId;
    
    return advertisement;
  }
  
  // Return empty advertisement if inactive
  return {
    imageUrl: "",
    isActive: false,
    createdAt: now,
    updatedAt: now,
    createdBy: userId,
  };
}
