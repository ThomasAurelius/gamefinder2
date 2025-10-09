import { TallTalePayload } from "./types";

export function parseTallTalePayload(data: unknown): TallTalePayload | null {
  if (!data || typeof data !== "object") {
    return null;
  }

  const payload = data as Partial<TallTalePayload>;

  if (
    typeof payload.title !== "string" ||
    typeof payload.content !== "string" ||
    payload.title.trim().length === 0 ||
    payload.content.trim().length === 0 ||
    payload.content.length > 5000
  ) {
    return null;
  }

  // Validate image URLs if provided
  let validatedImageUrls: string[] | undefined = undefined;
  if (Array.isArray(payload.imageUrls)) {
    validatedImageUrls = payload.imageUrls
      .filter((url) => typeof url === "string" && isValidImageUrl(url))
      .slice(0, 5);
  }

  // Validate game system if provided
  let validatedGameSystem: string | undefined = undefined;
  let validatedCustomGameSystem: string | undefined = undefined;
  if (typeof payload.gameSystem === "string" && payload.gameSystem.trim().length > 0) {
    validatedGameSystem = payload.gameSystem.trim();
    // If "Other" is selected, validate custom game system
    if (validatedGameSystem === "Other" && typeof payload.customGameSystem === "string" && payload.customGameSystem.trim().length > 0) {
      validatedCustomGameSystem = payload.customGameSystem.trim();
    }
  }

  return {
    title: payload.title,
    content: payload.content,
    imageUrls: validatedImageUrls,
    gameSystem: validatedGameSystem,
    customGameSystem: validatedCustomGameSystem,
  };
}

function isValidImageUrl(url: string): boolean {
  try {
    const parsedUrl = new URL(url);
    // Only allow HTTPS URLs
    if (parsedUrl.protocol !== "https:") {
      return false;
    }
    // Check if URL points to Firebase Storage or other trusted domains
    // Adjust this list based on your storage providers
    const trustedDomains = [
      "firebasestorage.googleapis.com",
      "storage.googleapis.com",
      // Add other trusted domains as needed
    ];
    return trustedDomains.some(
      domain => parsedUrl.hostname === domain || parsedUrl.hostname.endsWith('.' + domain)
    );
  } catch {
    return false;
  }
}
