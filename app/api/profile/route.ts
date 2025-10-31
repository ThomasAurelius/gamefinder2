import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import { readProfile, writeProfile, sanitizeProfile, type ProfileRecord } from "@/lib/profile-db";
import { isValidTimezone, DEFAULT_TIMEZONE } from "@/lib/timezone";
import { geocodeLocation } from "@/lib/geolocation";

const ROLE_OPTIONS = new Set(["Healer", "Damage", "Caster", "Support", "DM", "Other", ""]);
const MAX_BIO_LENGTH = 2000;
const MAX_LONG_TEXT_LENGTH = 2000;

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
    phoneNumber,
    bggUsername,
    isGM,
    style,
    idealTable,
    preferences,
    gameStyle,
    systems,
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

  // Validate phoneNumber if provided (optional field, kept in backend only)
  // Only validate if it's explicitly a non-empty value that's not a string
  // This allows undefined, null, or other falsy values from the database
  if (phoneNumber && !isString(phoneNumber)) {
    throw new Error("Phone number must be a string");
  }

  // Validate bggUsername if provided (optional field)
  // Only validate if it's explicitly a non-empty value that's not a string
  if (bggUsername && !isString(bggUsername)) {
    throw new Error("BGG username must be a string");
  }

  // Validate isGM if provided (optional boolean field)
  if (isGM !== undefined && typeof isGM !== "boolean") {
    throw new Error("isGM must be a boolean");
  }

  // Validate style if provided (optional long text field)
  if (style !== undefined && (!isString(style) || style.length > MAX_LONG_TEXT_LENGTH)) {
    throw new Error("Style must be a string under 2000 characters");
  }

  // Validate idealTable if provided (optional long text field)
  if (idealTable !== undefined && (!isString(idealTable) || idealTable.length > MAX_LONG_TEXT_LENGTH)) {
    throw new Error("Ideal Table must be a string under 2000 characters");
  }

  // Validate preferences if provided (optional string array)
  if (preferences !== undefined && !isStringArray(preferences)) {
    throw new Error("Preferences must be a string array");
  }

  // Validate gameStyle if provided (optional string array)
  if (gameStyle !== undefined && !isStringArray(gameStyle)) {
    throw new Error("Game Style must be a string array");
  }

  // Validate systems if provided (optional string array)
  if (systems !== undefined && !isStringArray(systems)) {
    throw new Error("Systems must be a string array");
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
    timezone: timezone || DEFAULT_TIMEZONE,
    avatarUrl: avatarUrl || "",
    phoneNumber: isString(phoneNumber) && phoneNumber ? phoneNumber : undefined,
    bggUsername: bggUsername || undefined,
    isGM: isGM ?? false,
    style: style || "",
    idealTable: idealTable || "",
    preferences: preferences ? dedupe(preferences) : [],
    gameStyle: gameStyle ? dedupe(gameStyle) : [],
    systems: systems ? dedupe(systems) : [],
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
    // Return the full profile including phone number for the user's own profile
    // Phone number is only sanitized on public profile endpoints
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
    // Return the full profile including phone number for the user's own profile
    // Phone number is only sanitized on public profile endpoints
    return NextResponse.json(profile, { status: 200 });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    console.error(error);
    return NextResponse.json(
      { error: "Unable to save profile" },
      { status: 500 }
    );
  }
}

// PUT method for partial profile updates (used by onboarding)
export async function PUT(request: Request) {
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
    
    // Get current profile first
    const currentProfile = await readProfile(userId);
    
    // Get the partial update from request
    const partialUpdate = await request.json();
    
    // Merge the updates with current profile
    const updatedProfile = {
      ...currentProfile,
      ...partialUpdate,
    };
    
    // Validate the merged profile
    const profile = validateProfile(updatedProfile);
    
    // Geocode the location if it was updated
    if (partialUpdate.zipCode || partialUpdate.location) {
      const locationToGeocode = profile.zipCode || profile.location;
      if (locationToGeocode) {
        try {
          const coords = await geocodeLocation(locationToGeocode);
          if (coords) {
            profile.latitude = coords.latitude;
            profile.longitude = coords.longitude;
          }
        } catch (error) {
          console.error("Failed to geocode location:", error);
        }
      }
    }
    
    await writeProfile(userId, profile);
    return NextResponse.json(profile, { status: 200 });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    console.error(error);
    return NextResponse.json(
      { error: "Unable to update profile" },
      { status: 500 }
    );
  }
}
