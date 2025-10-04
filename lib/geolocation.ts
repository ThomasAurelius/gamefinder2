/**
 * Geolocation utilities for calculating distances between coordinates
 * and geocoding addresses/zip codes
 */

// Haversine formula to calculate distance between two points on Earth
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 3959; // Earth's radius in miles
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return distance;
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

export type Coordinates = {
  latitude: number;
  longitude: number;
};

/**
 * Check if a string looks like a US zip code (5 digits or 5+4 format)
 */
function isUSZipCode(location: string): boolean {
  const trimmed = location.trim();
  // Match 5 digits or 5+4 format (e.g., "78729" or "78729-1234")
  return /^\d{5}(-\d{4})?$/.test(trimmed);
}

/**
 * Geocode a location string (address or zip code) to coordinates
 * Uses OpenStreetMap Nominatim API (free, no API key required)
 */
export async function geocodeLocation(
  location: string
): Promise<Coordinates | null> {
  if (!location || location.trim().length === 0) {
    return null;
  }

  try {
    // For US zip codes, add country context to improve geocoding accuracy
    let searchQuery = location;
    if (isUSZipCode(location)) {
      searchQuery = `${location}, USA`;
    }

    // Use Nominatim API with a proper user agent
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchQuery)}&format=json&limit=1`,
      {
        headers: {
          "User-Agent": "GameFinder2-App/1.0",
        },
      }
    );

    if (!response.ok) {
      console.error("Geocoding API error:", response.statusText);
      return null;
    }

    const data = await response.json();

    if (Array.isArray(data) && data.length > 0) {
      const result = data[0];
      return {
        latitude: parseFloat(result.lat),
        longitude: parseFloat(result.lon),
      };
    }

    return null;
  } catch (error) {
    console.error("Error geocoding location:", error);
    return null;
  }
}
