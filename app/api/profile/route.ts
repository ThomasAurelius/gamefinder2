import { NextResponse } from "next/server";

import { readProfile, writeProfile, type ProfileRecord } from "@/lib/profile-storage";

const ROLE_OPTIONS = new Set(["Healer", "Damage", "Support", "DM", "Other", ""]);
const MAX_BIO_LENGTH = 2000;

const isString = (value: unknown): value is string => typeof value === "string";

const isStringArray = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every((item) => typeof item === "string");

const isAvailability = (value: unknown): value is Record<string, string[]> => {
  if (!value || typeof value !== "object") {
    return false;
  }

  return Object.values(value).every((slots) => isStringArray(slots));
};

const normalizeAvailability = (
  availability: Record<string, string[]>
): Record<string, string[]> => {
  const normalized: Record<string, string[]> = {
    Monday: [],
    Tuesday: [],
    Wednesday: [],
    Thursday: [],
    Friday: [],
    Saturday: [],
    Sunday: [],
  };

  Object.entries(availability).forEach(([day, slots]) => {
    if (day in normalized) {
      normalized[day] = Array.from(new Set(slots));
    }
  });

  return normalized;
};

function dedupe<T>(items: T[]): T[] {
  return Array.from(new Set(items));
}

const validateProfile = (payload: unknown): ProfileRecord => {
  if (!payload || typeof payload !== "object") {
    throw new Error("Invalid profile payload");
  }

  const {
    name,
    commonName,
    location,
    zipCode,
    bio,
    games,
    favoriteGames,
    availability,
    primaryRole,
  } = payload as Partial<ProfileRecord>;

  if (!isString(name)) {
    throw new Error("Name must be a string");
  }

  if (!isString(commonName)) {
    throw new Error("Common name must be a string");
  }

  if (!isString(location)) {
    throw new Error("Location must be a string");
  }

  if (!isString(zipCode)) {
    throw new Error("Zip code must be a string");
  }

  if (!isString(bio) || bio.length > MAX_BIO_LENGTH) {
    throw new Error("Bio must be a string under 2000 characters");
  }

  if (!isStringArray(games)) {
    throw new Error("Games must be a string array");
  }

  if (!isStringArray(favoriteGames)) {
    throw new Error("Favorite games must be a string array");
  }

  if (!isAvailability(availability)) {
    throw new Error("Availability must be an object containing string arrays");
  }

  if (!isString(primaryRole) || !ROLE_OPTIONS.has(primaryRole)) {
    throw new Error("Primary role is invalid");
  }

  const normalizedGames = dedupe(games);
  const normalizedFavorites = dedupe(favoriteGames);

  const favoritesSubset = normalizedFavorites.every((game) =>
    normalizedGames.includes(game)
  );
  if (!favoritesSubset) {
    throw new Error("Favorite games must be selected games");
  }

  return {
    name,
    commonName,
    location,
    zipCode,
    bio,
    games: normalizedGames,
    favoriteGames: normalizedFavorites,
    availability: normalizeAvailability(availability),
    primaryRole,
  };
};

export async function GET() {
  try {
    const profile = await readProfile();
    return NextResponse.json(profile);
  } catch (error) {
    console.error(error);
    return new NextResponse("Unable to read profile", { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const profile = validateProfile(payload);
    await writeProfile(profile);
    return NextResponse.json(profile, { status: 200 });
  } catch (error) {
    if (error instanceof Error) {
      return new NextResponse(error.message, { status: 400 });
    }

    console.error(error);
    return new NextResponse("Unable to save profile", { status: 500 });
  }
}
