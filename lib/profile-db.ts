import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";

export type ProfileRecord = {
  name: string;
  commonName: string;
  location: string;
  zipCode: string;
  bio: string;
  games: string[];
  favoriteGames: string[];
  availability: Record<string, string[]>;
  primaryRole: string;
  timezone?: string;
  avatarUrl?: string;
};

const DEFAULT_PROFILE: ProfileRecord = {
  name: "",
  commonName: "",
  location: "",
  zipCode: "",
  bio: "",
  games: [],
  favoriteGames: [],
  availability: {
    Monday: [],
    Tuesday: [],
    Wednesday: [],
    Thursday: [],
    Friday: [],
    Saturday: [],
    Sunday: [],
  },
  primaryRole: "",
  timezone: "America/New_York",
  avatarUrl: "",
};

export async function readProfile(userId: string): Promise<ProfileRecord> {
  const db = await getDb();
  const usersCollection = db.collection("users");

  // userId is the user document's _id from the users collection, not an ID within the profile subdocument
  // Try to find by ObjectId first (for authenticated users)
  let user = null;
  if (ObjectId.isValid(userId)) {
    user = await usersCollection.findOne({ _id: new ObjectId(userId) });
  }
  
  // If not found and it's a demo user, return default profile
  if (!user) {
    return DEFAULT_PROFILE;
  }

  if (!user.profile) {
    return DEFAULT_PROFILE;
  }

  const profile = user.profile as ProfileRecord;

  return {
    name: profile.name ?? "",
    commonName: profile.commonName ?? "",
    location: profile.location ?? "",
    zipCode: profile.zipCode ?? "",
    bio: profile.bio ?? "",
    games: profile.games ?? [],
    favoriteGames: profile.favoriteGames ?? [],
    availability: {
      ...DEFAULT_PROFILE.availability,
      ...(profile.availability ?? {}),
    },
    primaryRole: profile.primaryRole ?? "",
    timezone: profile.timezone ?? "America/New_York",
    avatarUrl: profile.avatarUrl ?? "",
  };
}

export async function writeProfile(
  userId: string,
  profile: ProfileRecord
): Promise<void> {
  const db = await getDb();
  const usersCollection = db.collection("users");

  const now = new Date();

  // Only update if userId is a valid ObjectId (authenticated user)
  if (!ObjectId.isValid(userId)) {
    throw new Error("Invalid user ID");
  }

  const result = await usersCollection.updateOne(
    { _id: new ObjectId(userId) },
    {
      $set: {
        profile,
        updatedAt: now,
      },
    }
  );

  if (result.matchedCount === 0) {
    throw new Error("User not found");
  }
}
