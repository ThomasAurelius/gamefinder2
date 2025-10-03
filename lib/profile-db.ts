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
  const usersCollection = db.collection("users");

  const user = await usersCollection.findOne({ _id: new ObjectId(userId) });

  if (!user || !user.profile) {
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
  };
}

export async function writeProfile(
  userId: string,
  profile: ProfileRecord
): Promise<void> {
  const db = await getDb();
  const usersCollection = db.collection("users");

  const now = new Date();

  await usersCollection.updateOne(
    { _id: new ObjectId(userId) },
    {
      $set: {
        profile,
        updatedAt: now,
      },
    }
  );
}
