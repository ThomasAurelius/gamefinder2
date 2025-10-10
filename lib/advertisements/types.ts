import { ObjectId } from "mongodb";

export type AdvertisementDocument = {
  _id?: ObjectId;
  imageUrl: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
};
