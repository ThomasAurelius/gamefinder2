import { randomUUID } from "crypto";
import type { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";
import { MarketplaceListingPayload, StoredMarketplaceListing } from "./types";

type MarketplaceListingDocument = StoredMarketplaceListing & {
  _id?: ObjectId;
};

export async function listMarketplaceListings(filters?: {
  gameSystem?: string;
  tags?: string[];
  listingType?: "sell" | "want";
  minPrice?: number;
  maxPrice?: number;
  condition?: string;
  status?: string;
}): Promise<StoredMarketplaceListing[]> {
  const db = await getDb();
  const marketplaceCollection = db.collection<MarketplaceListingDocument>("marketplaceListings");

  // Build query based on filters
  const query: Record<string, unknown> = {};
  
  if (filters?.gameSystem) {
    query.gameSystem = filters.gameSystem;
  }
  
  if (filters?.tags && filters.tags.length > 0) {
    // Find listings that have at least one matching tag
    query.tags = { $in: filters.tags };
  }
  
  if (filters?.listingType) {
    query.listingType = filters.listingType;
  }

  if (filters?.condition) {
    query.condition = filters.condition;
  }

  if (filters?.status) {
    query.status = filters.status;
  } else {
    // Default to only showing active listings
    query.status = "active";
  }
  
  // Price range filter
  if (filters?.minPrice !== undefined || filters?.maxPrice !== undefined) {
    query.price = {};
    if (filters?.minPrice !== undefined) {
      (query.price as Record<string, unknown>).$gte = filters.minPrice;
    }
    if (filters?.maxPrice !== undefined) {
      (query.price as Record<string, unknown>).$lte = filters.maxPrice;
    }
  }

  const listings = await marketplaceCollection
    .find(query)
    .sort({ createdAt: -1 })
    .toArray();

  return listings.map((listing) => ({
    id: listing.id,
    userId: listing.userId,
    title: listing.title,
    description: listing.description,
    gameSystem: listing.gameSystem,
    tags: listing.tags || [],
    price: listing.price,
    condition: listing.condition,
    location: listing.location,
    zipCode: listing.zipCode,
    latitude: listing.latitude,
    longitude: listing.longitude,
    imageUrls: listing.imageUrls || [],
    listingType: listing.listingType,
    contactInfo: listing.contactInfo,
    status: listing.status,
    createdAt: listing.createdAt,
    updatedAt: listing.updatedAt,
  }));
}

export async function getMarketplaceListing(id: string): Promise<StoredMarketplaceListing | null> {
  const db = await getDb();
  const marketplaceCollection = db.collection<MarketplaceListingDocument>("marketplaceListings");

  const listing = await marketplaceCollection.findOne({ id });

  if (!listing) {
    return null;
  }

  return {
    id: listing.id,
    userId: listing.userId,
    title: listing.title,
    description: listing.description,
    gameSystem: listing.gameSystem,
    tags: listing.tags || [],
    price: listing.price,
    condition: listing.condition,
    location: listing.location,
    zipCode: listing.zipCode,
    latitude: listing.latitude,
    longitude: listing.longitude,
    imageUrls: listing.imageUrls || [],
    listingType: listing.listingType,
    contactInfo: listing.contactInfo,
    status: listing.status,
    createdAt: listing.createdAt,
    updatedAt: listing.updatedAt,
  };
}

export async function createMarketplaceListing(
  userId: string,
  payload: MarketplaceListingPayload
): Promise<StoredMarketplaceListing> {
  const db = await getDb();
  const marketplaceCollection = db.collection<MarketplaceListingDocument>("marketplaceListings");

  const now = new Date().toISOString();
  const listing: StoredMarketplaceListing = {
    id: randomUUID(),
    userId,
    ...payload,
    status: "active",
    createdAt: now,
    updatedAt: now,
  };

  await marketplaceCollection.insertOne(listing as MarketplaceListingDocument);
  return listing;
}

export async function updateMarketplaceListing(
  id: string,
  userId: string,
  updates: Partial<MarketplaceListingPayload> & { status?: "active" | "sold" | "closed" }
): Promise<StoredMarketplaceListing | null> {
  const db = await getDb();
  const marketplaceCollection = db.collection<MarketplaceListingDocument>("marketplaceListings");

  const now = new Date().toISOString();
  const result = await marketplaceCollection.findOneAndUpdate(
    { id, userId },
    { $set: { ...updates, updatedAt: now } },
    { returnDocument: "after" }
  );

  if (!result) {
    return null;
  }

  return {
    id: result.id,
    userId: result.userId,
    title: result.title,
    description: result.description,
    gameSystem: result.gameSystem,
    tags: result.tags || [],
    price: result.price,
    condition: result.condition,
    location: result.location,
    zipCode: result.zipCode,
    latitude: result.latitude,
    longitude: result.longitude,
    imageUrls: result.imageUrls || [],
    listingType: result.listingType,
    contactInfo: result.contactInfo,
    status: result.status,
    createdAt: result.createdAt,
    updatedAt: result.updatedAt,
  };
}

export async function deleteMarketplaceListing(
  id: string,
  userId: string
): Promise<boolean> {
  const db = await getDb();
  const marketplaceCollection = db.collection<MarketplaceListingDocument>("marketplaceListings");

  const result = await marketplaceCollection.deleteOne({ id, userId });
  return result.deletedCount === 1;
}
