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
    // Trim whitespace to ensure consistent geocoding
    const trimmedLocation = location.trim();
    
    // For US zip codes, add country context to improve geocoding accuracy
    let searchQuery = trimmedLocation;
    if (isUSZipCode(trimmedLocation)) {
      searchQuery = `${trimmedLocation}, USA`;
    }

    // Use Nominatim API with a proper user agent
    // Add timeout and retry logic to handle API issues
    const maxRetries = 2;
    const timeoutMs = 5000; // 5 second timeout
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        // Add delay between retries to respect rate limits (1 req/sec for Nominatim)
        if (attempt > 0) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
        
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchQuery)}&format=json&limit=1`,
          {
            headers: {
              "User-Agent": "GameFinder2-App/1.0",
            },
            signal: controller.signal,
          }
        );
        
        clearTimeout(timeoutId);

        if (!response.ok) {
          console.error("Geocoding API error:", response.statusText);
          if (attempt < maxRetries) {
            continue; // Retry on non-OK response
          }
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

        // If we got an empty result, don't retry - the location wasn't found
        return null;
      } catch (fetchError) {
        // Handle timeout or network errors
        if (fetchError instanceof Error && fetchError.name === 'AbortError') {
          console.error(`Geocoding timeout (attempt ${attempt + 1}/${maxRetries + 1})`);
        } else {
          console.error(`Geocoding fetch error (attempt ${attempt + 1}/${maxRetries + 1}):`, fetchError);
        }
        
        // If this was the last attempt, give up
        if (attempt === maxRetries) {
          throw fetchError;
        }
        // Otherwise, continue to retry
      }
    }

    return null;
  } catch (error) {
    console.error("Error geocoding location:", error);
    return null;
  }
}
