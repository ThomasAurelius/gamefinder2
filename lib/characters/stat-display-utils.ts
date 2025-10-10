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
const PHYSICAL_STATS = ["Strength", "Dexterity", "Constitution"];

/**
 * Standard D&D mental ability scores
 */
const MENTAL_STATS = ["Intelligence", "Wisdom", "Charisma"];

/**
 * All standard D&D ability scores
 */
const ALL_STANDARD_STATS = [...PHYSICAL_STATS, ...MENTAL_STATS];

/**
 * Categorizes stats into physical, mental, and other categories
 * for display purposes in the character detail view.
 * 
 * @param stats - Array of stat fields with name and value
 * @returns Categorized stats with flags for display logic
 */
export function categorizeStats(stats: StatField[]): CategorizedStats {
  const physical = stats.filter((stat) => PHYSICAL_STATS.includes(stat.name));
  const mental = stats.filter((stat) => MENTAL_STATS.includes(stat.name));
  const other = stats.filter((stat) => !ALL_STANDARD_STATS.includes(stat.name));
  const hasStandardStats = physical.length > 0 || mental.length > 0;

  return {
    physical,
    mental,
    other,
    hasStandardStats,
  };
}
