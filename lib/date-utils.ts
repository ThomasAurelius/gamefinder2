/**
 * Get today's date in YYYY-MM-DD format
 * This is useful for filtering events to show only future dates
 */
export function getTodayDateString(): string {
  return new Date().toISOString().split('T')[0];
}

/**
 * Check if a date string (YYYY-MM-DD) is in the past
 */
export function isPastDate(dateStr: string): boolean {
  const today = getTodayDateString();
  return dateStr < today;
}

/**
 * Check if a date string (YYYY-MM-DD) is today or in the future
 */
export function isTodayOrFuture(dateStr: string): boolean {
  const today = getTodayDateString();
  return dateStr >= today;
}
