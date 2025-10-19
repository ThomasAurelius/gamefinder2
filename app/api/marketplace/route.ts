import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import {
  createMarketplaceListing,
} from "@/lib/marketplace/db";
import { MarketplaceListingPayload } from "@/lib/marketplace/types";
import { geocodeLocation } from "@/lib/geolocation";
import { fetchBGGMarketplace } from "@/lib/bgg/marketplace";

function parseMarketplaceListingPayload(data: unknown): MarketplaceListingPayload | null {
  if (!data || typeof data !== "object") {
    return null;
  }

  const payload = data as Record<string, unknown>;

  if (
    typeof payload.title !== "string" ||
    typeof payload.description !== "string" ||
    typeof payload.listingType !== "string" ||
    !["sell", "want"].includes(payload.listingType)
  ) {
    return null;
  }

  if (!Array.isArray(payload.tags)) {
    return null;
  }

  const result: MarketplaceListingPayload = {
    title: payload.title,
    description: payload.description,
    listingType: payload.listingType as "sell" | "want",
    tags: payload.tags,
  };

  if (payload.gameSystem && typeof payload.gameSystem === "string") {
    result.gameSystem = payload.gameSystem;
  }

  if (payload.price !== undefined && typeof payload.price === "number") {
    result.price = payload.price;
  }

  if (payload.condition && typeof payload.condition === "string") {
    result.condition = payload.condition as "new" | "like-new" | "good" | "fair" | "poor";
  }

  if (payload.location && typeof payload.location === "string") {
    result.location = payload.location;
  }

  if (payload.zipCode && typeof payload.zipCode === "string") {
    result.zipCode = payload.zipCode;
  }

  if (payload.imageUrls && Array.isArray(payload.imageUrls)) {
    result.imageUrls = payload.imageUrls;
  }

  if (payload.contactInfo && typeof payload.contactInfo === "string") {
    result.contactInfo = payload.contactInfo;
  }

  return result;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Extract search query for BGG marketplace
    const searchQuery = searchParams.get("q") || searchParams.get("search") || undefined;
    const limit = parseInt(searchParams.get("limit") || "50");

    // Fetch marketplace listings from BoardGameGeek
    const bggItems = await fetchBGGMarketplace(searchQuery, limit);
    
    // Transform BGG items to match our marketplace listing format
    const listings = bggItems.flatMap(item => 
      item.listings.map(listing => ({
        id: listing.listingid,
        userId: "bgg",
        title: item.name,
        description: listing.notes || "BoardGameGeek Marketplace Listing",
        gameSystem: undefined,
        tags: item.yearpublished ? [item.yearpublished] : [],
        price: parseFloat(listing.price.value),
        condition: listing.condition,
        location: undefined,
        zipCode: undefined,
        latitude: undefined,
        longitude: undefined,
        imageUrls: item.thumbnail ? [item.thumbnail] : [],
        listingType: "sell" as const,
        contactInfo: listing.link.href,
        status: "active",
        createdAt: listing.listdate,
        updatedAt: listing.listdate,
        hostName: "BGG Marketplace",
        hostAvatarUrl: undefined,
        distance: undefined,
        bggGameId: item.id,
        externalLink: listing.link.href,
      }))
    );

    return NextResponse.json(listings);
  } catch (error) {
    console.error("Error fetching BGG marketplace listings:", error);
    return NextResponse.json(
      { error: "Failed to fetch listings" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("userId")?.value;
    
    if (!userId) {
      return NextResponse.json(
        { error: "Authentication required. Please log in to post a listing." },
        { status: 401 }
      );
    }
    
    const data = await request.json();
    const payload = parseMarketplaceListingPayload(data);

    if (!payload) {
      return NextResponse.json(
        { error: "Invalid listing data. Please ensure all required fields are filled." },
        { status: 400 }
      );
    }

    // Geocode the location to get coordinates
    // Try zipCode first, then fall back to location
    const locationToGeocode = payload.zipCode || payload.location;
    if (locationToGeocode) {
      try {
        const coords = await geocodeLocation(locationToGeocode);
        if (coords) {
          payload.latitude = coords.latitude;
          payload.longitude = coords.longitude;
        }
      } catch (error) {
        console.error("Error geocoding location:", error);
      }
    }

    const listing = await createMarketplaceListing(userId, payload);

    return NextResponse.json(listing, { status: 201 });
  } catch (error) {
    console.error("Error creating marketplace listing:", error);
    return NextResponse.json(
      { error: "Failed to create listing" },
      { status: 500 }
    );
  }
}
