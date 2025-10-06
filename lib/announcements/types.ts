import type { ObjectId } from "mongodb";

export type AnnouncementDocument = {
  _id?: ObjectId;
  message: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string; // userId of the admin who created it
};
