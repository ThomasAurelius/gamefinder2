import { getDb } from "@/lib/mongodb";
import type { AdvertisementDocument } from "./types";
import { geocodeLocation, calculateDistance } from "@/lib/geolocation";

/**
 * Get all active advertisements
 */
export async function getActiveAdvertisements(): Promise<AdvertisementDocument[]> {
  try {
    const db = await getDb();
    const advertisementsCollection = db.collection<AdvertisementDocument>("advertisements");
    
    const advertisements = await advertisementsCollection
      .find({ isActive: true })
      .sort({ updatedAt: -1 })
      .toArray();
    
    return advertisements;
  } catch (error) {
    console.error("Error fetching active advertisements:", error);
    return [];
  }
}

/**
 * Get the active advertisement (backward compatibility)
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
 * Get the active advertisement for a user based on their location
 * Returns the closest advertisement within 100 miles
 */
export async function getActiveAdvertisementForUser(
  userLatitude?: number,
  userLongitude?: number
): Promise<AdvertisementDocument | null> {
  try {
    const advertisements = await getActiveAdvertisements();
    
    // If no user location provided, return the first active ad (backward compatibility)
    if (userLatitude === undefined || userLongitude === undefined) {
      return advertisements[0] || null;
    }
    
    // Filter advertisements within 100 miles and sort by distance
    const MAX_DISTANCE_MILES = 100;
    const adsWithDistance = advertisements
      .filter(ad => ad.latitude !== undefined && ad.longitude !== undefined)
      .map(ad => ({
        ad,
        distance: calculateDistance(
          userLatitude,
          userLongitude,
          ad.latitude!,
          ad.longitude!
        )
      }))
      .filter(item => item.distance <= MAX_DISTANCE_MILES)
      .sort((a, b) => a.distance - b.distance);
    
    // Return the closest ad, or fall back to ads without location (show to everyone)
    if (adsWithDistance.length > 0) {
      return adsWithDistance[0].ad;
    }
    
    // If no ads within range, check for ads without location (show to everyone)
    const globalAds = advertisements.filter(ad => !ad.latitude || !ad.longitude);
    return globalAds[0] || null;
  } catch (error) {
    console.error("Error fetching advertisement for user:", error);
    return null;
  }
}

/**
 * Create or update advertisement
 */
export async function setAdvertisement(
  userId: string,
  imageUrl: string,
  isActive: boolean,
  zipCode?: string
): Promise<AdvertisementDocument> {
  const db = await getDb();
  const advertisementsCollection = db.collection<AdvertisementDocument>("advertisements");
  
  const now = new Date();
  
  // Deactivate all existing advertisements (commented out to allow multiple active ads)
  // Instead, we'll allow multiple active advertisements and filter by location
  // await advertisementsCollection.updateMany(
  //   { isActive: true },
  //   { $set: { isActive: false, updatedAt: now } }
  // );
  
  // Create new advertisement if active
  if (isActive && imageUrl.trim()) {
    const advertisement: AdvertisementDocument = {
      imageUrl: imageUrl.trim(),
      isActive: true,
      zipCode: zipCode?.trim() || undefined,
      createdAt: now,
      updatedAt: now,
      createdBy: userId,
    };
    
    // Geocode the zip code if provided
    if (zipCode && zipCode.trim()) {
      try {
        const coords = await geocodeLocation(zipCode.trim());
        if (coords) {
          advertisement.latitude = coords.latitude;
          advertisement.longitude = coords.longitude;
        }
      } catch (error) {
        console.error("Failed to geocode advertisement zip code:", error);
        // Continue without coordinates - ad will be shown to everyone
      }
    }
    
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
