/**
 * Types for the marketplace feature
 */

export type ListingType = "sell" | "want";

export type MarketplaceListingPayload = {
  title: string;
  description: string;
  gameSystem?: string; // e.g., "Dungeons & Dragons", "Pathfinder", etc.
  tags: string[]; // Tag-style searchable labels
  price?: number; // Price for sell listings, optional for want ads
  condition?: "new" | "like-new" | "good" | "fair" | "poor"; // For sell listings
  location?: string; // City, state
  zipCode?: string; // For distance calculation
  latitude?: number;
  longitude?: number;
  imageUrls?: string[]; // Multiple images
  listingType: ListingType; // "sell" or "want"
  contactInfo?: string; // How to contact (payment handled off-site)
};

export type StoredMarketplaceListing = MarketplaceListingPayload & {
  id: string;
  userId: string;
  status: "active" | "sold" | "closed";
  createdAt: string;
  updatedAt: string;
  hostName?: string;
  hostAvatarUrl?: string;
  distance?: number; // Calculated distance from search location
};
