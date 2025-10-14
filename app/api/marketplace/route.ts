import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import {
  createMarketplaceListing,
  listMarketplaceListings,
} from "@/lib/marketplace/db";
import { MarketplaceListingPayload } from "@/lib/marketplace/types";
import { geocodeLocation, calculateDistance } from "@/lib/geolocation";
import { getUsersBasicInfo } from "@/lib/users";

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
    
    // Extract filter parameters
    const gameSystem = searchParams.get("gameSystem") || undefined;
    const tagsParam = searchParams.get("tags");
    const tags = tagsParam ? tagsParam.split(",") : undefined;
    const listingType = searchParams.get("listingType") as "sell" | "want" | undefined;
    const condition = searchParams.get("condition") || undefined;
    const minPrice = searchParams.get("minPrice") ? parseFloat(searchParams.get("minPrice")!) : undefined;
    const maxPrice = searchParams.get("maxPrice") ? parseFloat(searchParams.get("maxPrice")!) : undefined;
    const locationSearch = searchParams.get("location") || "";
    const radiusMiles = parseFloat(searchParams.get("radius") || "50");

    const listings = await listMarketplaceListings({ 
      gameSystem, 
      tags, 
      listingType,
      condition,
      minPrice,
      maxPrice,
    });

    // Fetch host information for all listings
    const hostIds = [...new Set(listings.map(l => l.userId))];
    const hostsMap = await getUsersBasicInfo(hostIds);
    
    // Add host information to listings
    let listingsWithHosts = listings.map(listing => ({
      ...listing,
      hostName: hostsMap.get(listing.userId)?.name || "Unknown User",
      hostAvatarUrl: hostsMap.get(listing.userId)?.avatarUrl,
    }));

    // Filter by distance if location is provided
    if (locationSearch) {
      try {
        const searchCoords = await geocodeLocation(locationSearch);
        if (searchCoords) {
          listingsWithHosts = listingsWithHosts
            .map(listing => {
              if (listing.latitude && listing.longitude) {
                const distance = calculateDistance(
                  searchCoords.latitude,
                  searchCoords.longitude,
                  listing.latitude,
                  listing.longitude
                );
                return { ...listing, distance };
              }
              return listing;
            })
            .filter(listing => !listing.distance || listing.distance <= radiusMiles)
            .sort((a, b) => (a.distance || Infinity) - (b.distance || Infinity));
        }
      } catch (error) {
        console.error("Error calculating distances:", error);
      }
    }

    return NextResponse.json(listingsWithHosts);
  } catch (error) {
    console.error("Error fetching marketplace listings:", error);
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
