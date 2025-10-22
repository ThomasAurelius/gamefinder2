import type { ObjectId } from "mongodb";
import type { ProfileRecord } from "./profile-db";

export type UserDocument = {
  _id?: ObjectId;
  email: string;
  passwordHash?: string; // Optional for backward compatibility with Firebase Auth
  firebaseUid?: string; // Firebase Authentication UID
  name: string;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
  profile?: ProfileRecord;
  isAdmin?: boolean;
  isHidden?: boolean; // Admin can hide profiles
  stripeCustomerId?: string; // Stripe customer ID for subscription management
  stripeConnectAccountId?: string; // Stripe Connect account ID for hosts receiving payments
  stripeConnectOnboardingComplete?: boolean; // Whether host has completed Connect onboarding
  isAmbassador?: boolean; // Whether user is an ambassador (no platform fee)
  ambassadorUntil?: Date; // Date until which ambassador status is valid
  onboardingCompleted?: boolean; // Whether user has completed the onboarding flow
};
