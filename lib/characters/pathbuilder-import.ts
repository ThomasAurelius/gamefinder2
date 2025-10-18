import { CharacterDetails, StatField, SkillField } from "./types";

/**
 * Pathbuilder2e JSON structure (from issue)
 */
interface Pathbuilder2eAbilities {
  str: number;
  dex: number;
  con: number;
  int: number;
  wis: number;
  cha: number;
  breakdown?: Record<string, unknown>;
}

interface Pathbuilder2eProficiencies {
  acrobatics: number;
  arcana: number;
  athletics: number;
  crafting: number;
  deception: number;
  diplomacy: number;
  intimidation: number;
  medicine: number;
  nature: number;
  occultism: number;
  performance: number;
  religion: number;
  society: number;
  stealth: number;
  survival: number;
  thievery: number;
  [key: string]: number;
}

interface Pathbuilder2eMoney {
  cp: number;
  sp: number;
  gp: number;
  pp: number;
}

interface Pathbuilder2eBuild {
  name: string;
  class: string;
  level: number;
  ancestry: string;
  heritage: string;
  background: string;
  alignment: string;
  gender: string;
  age: string;
  deity: string;
  abilities: Pathbuilder2eAbilities;
  proficiencies: Pathbuilder2eProficiencies;
  money: Pathbuilder2eMoney;
  equipment?: unknown[];
  weapons?: unknown[];
  armor?: unknown[];
  [key: string]: unknown;
}

interface Pathbuilder2eData {
  success: boolean;
  build: Pathbuilder2eBuild;
}

/**
 * Maps Pathbuilder2e proficiency values to displayable skill modifiers.
 * In Pathfinder 2e, proficiency is typically:
 * 0 = Untrained
 * 2 = Trained
 * 4 = Expert
 * 6 = Master
 * 8 = Legendary
 */
function formatProficiency(value: number): string {
  if (value === 0) return "Untrained";
  if (value === 2) return "Trained";
  if (value === 4) return "Expert";
  if (value === 6) return "Master";
  if (value === 8) return "Legendary";
  return value.toString();
}

/**
 * Formats money from Pathbuilder2e format to a display string
 */
function formatMoney(money: Pathbuilder2eMoney): string {
  const parts: string[] = [];
  if (money.pp > 0) parts.push(`${money.pp}pp`);
  if (money.gp > 0) parts.push(`${money.gp}gp`);
  if (money.sp > 0) parts.push(`${money.sp}sp`);
  if (money.cp > 0) parts.push(`${money.cp}cp`);
  return parts.join(", ") || "0gp";
}

/**
 * Parses Pathbuilder2e JSON export and converts it to CharacterDetails format
 */
export function parsePathbuilder2eJson(jsonString: string): CharacterDetails | null {
  try {
    const data: Pathbuilder2eData = JSON.parse(jsonString);

    if (!data.success || !data.build) {
      throw new Error("Invalid Pathbuilder2e JSON structure");
    }

    const { build } = data;

    // Map ability scores
    const stats: StatField[] = [
      { name: "Strength", value: build.abilities.str.toString() },
      { name: "Dexterity", value: build.abilities.dex.toString() },
      { name: "Constitution", value: build.abilities.con.toString() },
      { name: "Intelligence", value: build.abilities.int.toString() },
      { name: "Wisdom", value: build.abilities.wis.toString() },
      { name: "Charisma", value: build.abilities.cha.toString() },
    ];

    // Map skills with proficiency levels
    const skills: SkillField[] = [
      {
        name: "Acrobatics",
        value: formatProficiency(build.proficiencies.acrobatics),
      },
      {
        name: "Arcana",
        value: formatProficiency(build.proficiencies.arcana),
      },
      {
        name: "Athletics",
        value: formatProficiency(build.proficiencies.athletics),
      },
      {
        name: "Crafting",
        value: formatProficiency(build.proficiencies.crafting),
      },
      {
        name: "Deception",
        value: formatProficiency(build.proficiencies.deception),
      },
      {
        name: "Diplomacy",
        value: formatProficiency(build.proficiencies.diplomacy),
      },
      {
        name: "Intimidation",
        value: formatProficiency(build.proficiencies.intimidation),
      },
      {
        name: "Medicine",
        value: formatProficiency(build.proficiencies.medicine),
      },
      { name: "Nature", value: formatProficiency(build.proficiencies.nature) },
      {
        name: "Occultism",
        value: formatProficiency(build.proficiencies.occultism),
      },
      {
        name: "Performance",
        value: formatProficiency(build.proficiencies.performance),
      },
      {
        name: "Religion",
        value: formatProficiency(build.proficiencies.religion),
      },
      {
        name: "Society",
        value: formatProficiency(build.proficiencies.society),
      },
      { name: "Stealth", value: formatProficiency(build.proficiencies.stealth) },
      {
        name: "Survival",
        value: formatProficiency(build.proficiencies.survival),
      },
      {
        name: "Thievery",
        value: formatProficiency(build.proficiencies.thievery),
      },
    ];

    // Build character details
    const character: CharacterDetails = {
      name: build.name || "Unknown Adventurer",
      campaign: "", // Not in Pathbuilder2e export
      alignment: build.alignment || undefined,
      race: build.ancestry
        ? build.heritage
          ? `${build.ancestry} (${build.heritage})`
          : build.ancestry
        : undefined,
      background: build.background || undefined,
      level: build.level?.toString() || undefined,
      class: build.class || undefined,
      gold: formatMoney(build.money),
      age: build.age !== "Not set" ? build.age : undefined,
      stats,
      skills,
      notes: "", // Can be filled in manually
      items: [], // Equipment can be added separately
      isPublic: true,
    };

    return character;
  } catch (error) {
    console.error("Failed to parse Pathbuilder2e JSON:", error);
    return null;
  }
}
