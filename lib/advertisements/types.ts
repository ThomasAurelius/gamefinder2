import { ObjectId } from "mongodb";

export type AdvertisementDocument = {
  _id?: ObjectId;
  imageUrl: string;
  isActive: boolean;
  zipCode?: string; // Optional zip code for location-based filtering
  latitude?: number; // Geocoded latitude from zipCode
  longitude?: number; // Geocoded longitude from zipCode
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
};
