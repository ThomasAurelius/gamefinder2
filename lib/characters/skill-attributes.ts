import type { GameSystemKey } from "./types";

/**
 * Skill-to-attribute mappings for different game systems
 */
export const SKILL_ATTRIBUTES: Record<GameSystemKey, Record<string, string> | undefined> = {
  dnd: {
    "Acrobatics": "Dex",
    "Animal Handling": "Wis",
    "Arcana": "Int",
    "Athletics": "Str",
    "Deception": "Cha",
    "History": "Int",
    "Insight": "Wis",
    "Intimidation": "Cha",
    "Investigation": "Int",
    "Medicine": "Wis",
    "Nature": "Int",
    "Perception": "Wis",
    "Performance": "Cha",
    "Persuasion": "Cha",
    "Religion": "Int",
    "Sleight of Hand": "Dex",
    "Stealth": "Dex",
    "Survival": "Wis",
  },
  pathfinder: {
    "Acrobatics": "Dex",
    "Arcana": "Int",
    "Athletics": "Str",
    "Crafting": "Int",
    "Deception": "Cha",
    "Diplomacy": "Cha",
    "Intimidation": "Cha",
    "Medicine": "Wis",
    "Nature": "Wis",
    "Occultism": "Int",
    "Performance": "Cha",
    "Religion": "Wis",
    "Society": "Int",
    "Stealth": "Dex",
    "Survival": "Wis",
    "Thievery": "Dex",
  },
  starfinder: {
    "Acrobatics": "Dex",
    "Athletics": "Str",
    "Bluff": "Cha",
    "Computers": "Int",
    "Culture": "Int",
    "Diplomacy": "Cha",
    "Disguise": "Cha",
    "Engineering": "Int",
    "Intimidate": "Cha",
    "Life Science": "Int",
    "Medicine": "Int",
    "Mysticism": "Wis",
    "Perception": "Wis",
    "Physical Science": "Int",
    "Piloting": "Dex",
    "Profession": "Cha/Int/Wis",
    "Sense Motive": "Wis",
    "Sleight of Hand": "Dex",
    "Stealth": "Dex",
    "Survival": "Wis",
  },
  shadowdark: undefined,
  other: undefined,
};

/**
 * Get the display name for a skill with its parent attribute in parentheses
 * @param skillName - The name of the skill
 * @param system - The game system key
 * @returns The skill name with attribute in parentheses if applicable
 */
export function getSkillDisplayName(skillName: string, system: GameSystemKey): string {
  const attributes = SKILL_ATTRIBUTES[system];
  const attribute = attributes?.[skillName];
  
  if (attribute) {
    return `${skillName} (${attribute})`;
  }
  
  return skillName;
}
