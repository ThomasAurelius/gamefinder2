import { ObjectId } from "mongodb";

export type AdvertisementDocument = {
  _id?: ObjectId;
  imageUrl: string;
  isActive: boolean;
  zipCode?: string; // Optional zip code for location-based filtering
  latitude?: number; // Geocoded latitude from zipCode
  longitude?: number; // Geocoded longitude from zipCode
  url?: string; // Optional URL to redirect to when clicked
  impressions?: { userId: string; timestamp: Date }[]; // Track unique impressions per user per hour
  clicks?: number; // Track total clicks
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
};
