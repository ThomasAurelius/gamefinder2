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

  return {
    title: payload.title,
    content: payload.content,
    imageUrls: validatedImageUrls,
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
