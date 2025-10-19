/**
 * MongoDB utility functions that can be safely used in Server Components
 * without causing client-side bundling issues.
 */

/**
 * Validates if a string is a valid MongoDB ObjectId format.
 * This uses a simple pattern check instead of importing mongodb.
 * 
 * @param id - The string to validate
 * @returns true if the string is a valid ObjectId format
 */
export function isValidObjectId(id: string): boolean {
  // MongoDB ObjectId is a 24-character hex string
  return /^[0-9a-fA-F]{24}$/.test(id);
}

/**
 * Dynamically imports ObjectId from mongodb to avoid bundling issues.
 * This should only be used in server-side code (API routes, Server Components).
 */
export async function validateObjectId(id: string): Promise<boolean> {
  if (!isValidObjectId(id)) {
    return false;
  }
  
  try {
    const { ObjectId } = await import("mongodb");
    return ObjectId.isValid(id);
  } catch {
    // If mongodb import fails, fall back to pattern validation
    return isValidObjectId(id);
  }
}
