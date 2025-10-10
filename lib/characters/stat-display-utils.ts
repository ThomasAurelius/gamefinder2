/**
 * Utility functions for displaying character stats
 */

/**
 * Represents a single stat field with a name and value
 */
export type StatField = {
  name: string;
  value: string;
};

/**
 * Result of categorizing stats into physical, mental, and other groups
 */
export type CategorizedStats = {
  /** Physical ability scores: Strength, Dexterity, Constitution */
  physical: StatField[];
  /** Mental ability scores: Intelligence, Wisdom, Charisma */
  mental: StatField[];
  /** Non-standard stats that don't match the 6 standard D&D abilities */
  other: StatField[];
  /** Whether any standard D&D stats were found (if false, display should use fallback layout) */
  hasStandardStats: boolean;
};

/**
 * Standard D&D physical ability scores
 */
const PHYSICAL_STATS = ["Strength", "Dexterity", "Constitution"] as const;

/**
 * Standard D&D mental ability scores
 */
const MENTAL_STATS = ["Intelligence", "Wisdom", "Charisma"] as const;

/**
 * Categorizes stats into physical, mental, and other categories
 * for display purposes in the character detail view.
 * Uses a single pass through the stats array for efficiency.
 * 
 * @param stats - Array of stat fields with name and value
 * @returns Categorized stats with flags for display logic
 */
export function categorizeStats(stats: StatField[]): CategorizedStats {
  const result = stats.reduce(
    (acc, stat) => {
      if (PHYSICAL_STATS.includes(stat.name as typeof PHYSICAL_STATS[number])) {
        acc.physical.push(stat);
      } else if (MENTAL_STATS.includes(stat.name as typeof MENTAL_STATS[number])) {
        acc.mental.push(stat);
      } else {
        acc.other.push(stat);
      }
      return acc;
    },
    { physical: [] as StatField[], mental: [] as StatField[], other: [] as StatField[] }
  );

  return {
    ...result,
    hasStandardStats: result.physical.length > 0 || result.mental.length > 0,
  };
}
