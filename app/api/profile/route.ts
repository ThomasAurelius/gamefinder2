import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import { readProfile, writeProfile, type ProfileRecord } from "@/lib/profile-db";
import { isValidTimezone } from "@/lib/timezone";
import { geocodeLocation } from "@/lib/geolocation";

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
    timezone,
    avatarUrl,
    bggUsername,
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

  // Validate timezone if provided
  if (timezone !== undefined && (!isString(timezone) || !isValidTimezone(timezone))) {
    throw new Error("Invalid timezone");
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
    timezone: timezone || "America/New_York",
    avatarUrl: avatarUrl || "",
    bggUsername: isString(bggUsername) ? bggUsername : undefined,
  };
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const cookieStore = await cookies();
    const userId = searchParams.get("userId") || cookieStore.get("userId")?.value;
    
    if (!userId) {
      return NextResponse.json(
        { error: "Authentication required. Please log in." },
        { status: 401 }
      );
    }
    
    const profile = await readProfile(userId);
    return NextResponse.json({ ...profile, userId });
  } catch (error) {
    console.error(error);
    return new NextResponse("Unable to read profile", { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const cookieStore = await cookies();
    const userId = searchParams.get("userId") || cookieStore.get("userId")?.value;
    
    if (!userId) {
      return NextResponse.json(
        { error: "Authentication required. Please log in." },
        { status: 401 }
      );
    }
    
    const payload = await request.json();
    const profile = validateProfile(payload);
    
    // Geocode the location to get coordinates
    // Try zipCode first, then fall back to location
    const locationToGeocode = profile.zipCode || profile.location;
    if (locationToGeocode) {
      try {
        const coords = await geocodeLocation(locationToGeocode);
        if (coords) {
          profile.latitude = coords.latitude;
          profile.longitude = coords.longitude;
        }
      } catch (error) {
        // Log the error but don't fail the profile save
        console.error("Failed to geocode location:", error);
      }
    }
    
    await writeProfile(userId, profile);
    return NextResponse.json(profile, { status: 200 });
  } catch (error) {
    if (error instanceof Error) {
      return new NextResponse(error.message, { status: 400 });
    }

    console.error(error);
    return new NextResponse("Unable to save profile", { status: 500 });
  }
}
