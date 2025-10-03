import type { ObjectId } from "mongodb";
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
};

type ProfileDocument = ProfileRecord & {
  _id?: ObjectId;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
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
};

export async function readProfile(userId: string): Promise<ProfileRecord> {
  const db = await getDb();
  const profilesCollection = db.collection<ProfileDocument>("profiles");

  const profile = await profilesCollection.findOne({ userId });

  if (!profile) {
    return DEFAULT_PROFILE;
  }

  return {
    name: profile.name,
    commonName: profile.commonName,
    location: profile.location,
    zipCode: profile.zipCode,
    bio: profile.bio,
    games: profile.games,
    favoriteGames: profile.favoriteGames,
    availability: {
      ...DEFAULT_PROFILE.availability,
      ...(profile.availability ?? {}),
    },
    primaryRole: profile.primaryRole,
  };
}

export async function writeProfile(
  userId: string,
  profile: ProfileRecord
): Promise<void> {
  const db = await getDb();
  const profilesCollection = db.collection<ProfileDocument>("profiles");

  const now = new Date();

  await profilesCollection.updateOne(
    { userId },
    {
      $set: {
        ...profile,
        updatedAt: now,
      },
      $setOnInsert: {
        userId,
        createdAt: now,
      },
    },
    { upsert: true }
  );
}
