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
 * Returns the closest advertisement within 50 miles, or a global ad as fallback
 */
export async function getActiveAdvertisementForUser(
  userLatitude?: number,
  userLongitude?: number
): Promise<AdvertisementDocument | null> {
  try {
    const advertisements = await getActiveAdvertisements();
    
    if (advertisements.length === 0) {
      console.log("No active advertisements found");
      return null;
    }
    
    // Separate global ads (without location) from location-specific ads
    const globalAds = advertisements.filter(ad => !ad.latitude || !ad.longitude);
    const locationAds = advertisements.filter(ad => ad.latitude !== undefined && ad.longitude !== undefined);
    
    console.log(`Found ${advertisements.length} active ads: ${globalAds.length} global, ${locationAds.length} location-specific`);
    
    // If no user location provided, prefer global ads, then fall back to any ad
    if (userLatitude === undefined || userLongitude === undefined) {
      console.log("No user location, returning global ad or first available");
      return globalAds[0] || advertisements[0] || null;
    }
    
    // Filter location-specific advertisements within 50 miles and sort by distance
    const MAX_DISTANCE_MILES = 50;
    const adsWithDistance = locationAds
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
    
    console.log(`Found ${adsWithDistance.length} ads within ${MAX_DISTANCE_MILES} miles`);
    
    // Return the closest ad within range, or fall back to global ads
    if (adsWithDistance.length > 0) {
      console.log(`Returning closest ad at ${adsWithDistance[0].distance.toFixed(1)} miles`);
      return adsWithDistance[0].ad;
    }
    
    // If no ads within range, return global ad or any ad as fallback
    console.log("No ads within range, returning global ad");
    return globalAds[0] || advertisements[0] || null;
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
  zipCode?: string,
  url?: string
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
      url: url?.trim() || undefined,
      impressions: [],
      clicks: 0,
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
    impressions: [],
    clicks: 0,
    createdAt: now,
    updatedAt: now,
    createdBy: userId,
  };
}

/**
 * Track impression for an advertisement
 * Only counts if the user hasn't been shown this ad in the last hour
 */
export async function trackImpression(
  advertisementId: string,
  userId: string
): Promise<boolean> {
  try {
    const db = await getDb();
    const advertisementsCollection = db.collection<AdvertisementDocument>("advertisements");
    const { ObjectId } = await import("mongodb");
    
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    
    // First, clean up old impressions to keep the array from growing indefinitely
    await advertisementsCollection.updateOne(
      { _id: new ObjectId(advertisementId) },
      {
        $pull: {
          impressions: { timestamp: { $lt: oneHourAgo } }
        }
      }
    );
    
    // Then, use an atomic operation to check and add new impression
    // This prevents race conditions by using MongoDB's atomic operations
    const result = await advertisementsCollection.updateOne(
      {
        _id: new ObjectId(advertisementId),
        // Only update if user hasn't seen ad in the last hour
        $nor: [
          {
            impressions: {
              $elemMatch: {
                userId: userId,
                timestamp: { $gte: oneHourAgo }
              }
            }
          }
        ]
      },
      {
        $push: {
          impressions: { userId, timestamp: new Date() }
        }
      }
    );
    
    // If modifiedCount is 0, the user has already seen this ad in the last hour
    return result.modifiedCount > 0;
  } catch (error) {
    console.error("Error tracking impression:", error);
    return false;
  }
}

/**
 * Track click for an advertisement
 */
export async function trackClick(advertisementId: string): Promise<boolean> {
  try {
    const db = await getDb();
    const advertisementsCollection = db.collection<AdvertisementDocument>("advertisements");
    const { ObjectId } = await import("mongodb");
    
    await advertisementsCollection.updateOne(
      { _id: new ObjectId(advertisementId) },
      { $inc: { clicks: 1 } }
    );
    
    return true;
  } catch (error) {
    console.error("Error tracking click:", error);
    return false;
  }
}
