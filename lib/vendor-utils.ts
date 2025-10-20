import { DAYS_OF_WEEK, TIME_SLOTS } from "@/lib/constants";

export type VendorHours = Record<string, string[]>;

const VALID_DAYS = new Set(DAYS_OF_WEEK);
const VALID_TIME_SLOTS = new Set(TIME_SLOTS);

export const createDefaultHours = (): VendorHours =>
  DAYS_OF_WEEK.reduce((acc, day) => {
    acc[day] = [];
    return acc;
  }, {} as VendorHours);

export function sortTimeSlots(slots: string[]): string[] {
  return Array.from(new Set(slots))
    .filter((slot) => VALID_TIME_SLOTS.has(slot))
    .sort((a, b) => TIME_SLOTS.indexOf(a) - TIME_SLOTS.indexOf(b));
}

export function normalizeHours(hours: VendorHours | undefined): VendorHours {
  const normalized = createDefaultHours();

  if (!hours || typeof hours !== "object") {
    return normalized;
  }

  Object.entries(hours).forEach(([day, slots]) => {
    if (VALID_DAYS.has(day) && Array.isArray(slots)) {
      normalized[day] = sortTimeSlots(slots.filter((slot): slot is string => typeof slot === "string"));
    }
  });

  return normalized;
}

/**
 * Get opening and closing times from an array of time slots
 * @param slots - Array of time slot strings (e.g., ["9:00 AM", "10:00 AM", "5:00 PM"])
 * @returns Opening and closing times as a string (e.g., "9:00 AM - 5:00 PM") or "Closed"
 */
export function getOpeningClosingTimes(slots: string[]): string {
  if (!slots || slots.length === 0) {
    return "Closed";
  }

  const sortedSlots = sortTimeSlots(slots);
  
  if (sortedSlots.length === 0) {
    return "Closed";
  }

  if (sortedSlots.length === 1) {
    return sortedSlots[0];
  }

  const openingTime = sortedSlots[0];
  const closingTime = sortedSlots[sortedSlots.length - 1];

  return `${openingTime} - ${closingTime}`;
}
