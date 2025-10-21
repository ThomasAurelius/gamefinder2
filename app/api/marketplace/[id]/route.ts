import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  updateMarketplaceListing,
  deleteMarketplaceListing,
  updateMarketplaceListingByAdmin,
  deleteMarketplaceListingByAdmin,
} from "@/lib/marketplace/db";
import { isAdmin } from "@/lib/admin";
import { MarketplaceListingPayload } from "@/lib/marketplace/types";

function parseMarketplaceListingPayload(data: unknown): (Partial<MarketplaceListingPayload> & { status?: "active" | "sold" | "closed" }) | null {
  if (typeof data !== "object" || data === null) {
    return null;
  }

  const payload = data as Record<string, unknown>;
  const result: Partial<MarketplaceListingPayload> & { status?: "active" | "sold" | "closed" } = {};

  if (payload.title && typeof payload.title === "string") {
    result.title = payload.title;
  }

  if (payload.description && typeof payload.description === "string") {
    result.description = payload.description;
  }

  if (payload.gameSystem && typeof payload.gameSystem === "string") {
    result.gameSystem = payload.gameSystem;
  }

  if (payload.tags && Array.isArray(payload.tags)) {
    result.tags = payload.tags;
  }

  if (payload.price !== undefined) {
    result.price = typeof payload.price === "number" ? payload.price : undefined;
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

  if (payload.listingType && typeof payload.listingType === "string") {
    result.listingType = payload.listingType as "sell" | "want";
  }

  if (payload.contactInfo && typeof payload.contactInfo === "string") {
    result.contactInfo = payload.contactInfo;
  }

  if (payload.status && typeof payload.status === "string") {
    result.status = payload.status as "active" | "sold" | "closed";
  }

  return result;
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Since we're now using BGG marketplace data, redirect to BGG marketplace
    // The listing ID from BGG should be used to construct the BGG marketplace URL
    return NextResponse.json(
      { 
        error: "This marketplace listing is from BoardGameGeek. Please visit the BGG marketplace directly.",
        redirectUrl: `https://boardgamegeek.com/market/product/${id}`
      },
      { status: 410 } // 410 Gone - resource is no longer available
    );
  } catch (error) {
    console.error("Error fetching marketplace listing:", error);
    return NextResponse.json(
      { error: "Failed to fetch listing" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("userId")?.value;

    if (!userId) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const payload = parseMarketplaceListingPayload(body);

    if (!payload) {
      return NextResponse.json(
        { error: "Invalid listing data" },
        { status: 400 }
      );
    }

    // Check if user is admin
    const userIsAdmin = await isAdmin(userId);
    
    let listing;
    if (userIsAdmin) {
      // Admin can update any listing
      listing = await updateMarketplaceListingByAdmin(id, payload as Partial<MarketplaceListingPayload> & { status?: "active" | "sold" | "closed" });
    } else {
      // Regular user can only update their own listing
      listing = await updateMarketplaceListing(id, userId, payload as Partial<MarketplaceListingPayload> & { status?: "active" | "sold" | "closed" });
    }

    if (!listing) {
      return NextResponse.json(
        { error: "Listing not found or you don't have permission to update it" },
        { status: 404 }
      );
    }

    return NextResponse.json(listing, { status: 200 });
  } catch (error) {
    console.error("Error updating marketplace listing:", error);
    return NextResponse.json(
      { error: "Failed to update listing" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("userId")?.value;

    if (!userId) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const { id } = await params;
    
    // Check if user is admin
    const userIsAdmin = await isAdmin(userId);
    
    let success;
    if (userIsAdmin) {
      // Admin can delete any listing
      success = await deleteMarketplaceListingByAdmin(id);
    } else {
      // Regular user can only delete their own listing
      success = await deleteMarketplaceListing(id, userId);
    }

    if (!success) {
      return NextResponse.json(
        { error: "Listing not found or you don't have permission to delete it" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error deleting marketplace listing:", error);
    return NextResponse.json(
      { error: "Failed to delete listing" },
      { status: 500 }
    );
  }
}
