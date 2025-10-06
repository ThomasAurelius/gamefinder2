import type { ObjectId } from "mongodb";
import type { ProfileRecord } from "./profile-db";

export type UserDocument = {
  _id?: ObjectId;
  email: string;
  passwordHash: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
  profile?: ProfileRecord;
  isAdmin?: boolean;
  isHidden?: boolean; // Admin can hide profiles
};
