/**
 * Dropdown options for specific game systems
 */

export type GameSystemDropdownOptions = {
  classes?: string[];
  backgrounds?: string[];
  races?: string[];
  alignments?: string[];
};

/**
 * Pathfinder 2e character options
 */
export const PATHFINDER_OPTIONS: GameSystemDropdownOptions = {
  classes: [
    "Alchemist",
    "Barbarian",
    "Bard",
    "Champion",
    "Cleric",
    "Druid",
    "Fighter",
    "Gunslinger",
    "Inventor",
    "Investigator",
    "Kineticist",
    "Magus",
    "Monk",
    "Oracle",
    "Psychic",
    "Ranger",
    "Rogue",
    "Sorcerer",
    "Summoner",
    "Swashbuckler",
    "Thaumaturge",
    "Witch",
    "Wizard",
  ],
  backgrounds: [
    "Acolyte",
    "Acrobat",
    "Animal Whisperer",
    "Artisan",
    "Artist",
    "Barkeep",
    "Barrister",
    "Bounty Hunter",
    "Charlatan",
    "Criminal",
    "Detective",
    "Emissary",
    "Entertainer",
    "Farmhand",
    "Field Medic",
    "Fortune Teller",
    "Gambler",
    "Gladiator",
    "Guard",
    "Herbalist",
    "Hermit",
    "Hunter",
    "Laborer",
    "Martial Disciple",
    "Merchant",
    "Miner",
    "Noble",
    "Nomad",
    "Prisoner",
    "Sailor",
    "Scholar",
    "Scout",
    "Street Urchin",
    "Tinker",
    "Warrior",
  ],
  races: [
    "Dwarf",
    "Elf",
    "Gnome",
    "Goblin",
    "Halfling",
    "Human",
    "Catfolk",
    "Kobold",
    "Leshy",
    "Lizardfolk",
    "Orc",
    "Ratfolk",
    "Tengu",
    "Anadi",
    "Android",
    "Azarketi",
    "Conrasu",
    "Fetchling",
    "Fleshwarp",
    "Ganzi",
    "Grippli",
    "Kitsune",
    "Nagaji",
    "Poppet",
    "Shisk",
    "Shoony",
    "Skeleton",
    "Sprite",
    "Strix",
    "Vishkanya",
  ],
  alignments: [
    "Lawful Good",
    "Neutral Good",
    "Chaotic Good",
    "Lawful Neutral",
    "Neutral",
    "Chaotic Neutral",
    "Lawful Evil",
    "Neutral Evil",
    "Chaotic Evil",
  ],
};

/**
 * Starfinder character options
 */
export const STARFINDER_OPTIONS: GameSystemDropdownOptions = {
  classes: [
    "Envoy",
    "Mechanic",
    "Mystic",
    "Operative",
    "Solarian",
    "Soldier",
    "Technomancer",
    "Biohacker",
    "Vanguard",
    "Witchwarper",
    "Evolutionist",
    "Nanocyte",
    "Precog",
  ],
  backgrounds: [
    "Ace Pilot",
    "Bounty Hunter",
    "Corporate Agent",
    "Cultist",
    "Cyberborn",
    "Diplomat",
    "Dreamer",
    "Free Trader",
    "Gladiator",
    "Hacker",
    "Icon",
    "Mercenary",
    "Outlaw",
    "Priest",
    "Scholar",
    "Spacefarer",
    "Street Rat",
    "Themeless",
    "Xenoseeker",
  ],
  races: [
    "Human",
    "Android",
    "Kasatha",
    "Lashunta",
    "Shirren",
    "Vesk",
    "Ysoki",
    "Dwarf",
    "Elf",
    "Gnome",
    "Half-Elf",
    "Half-Orc",
    "Halfling",
    "Barathu",
    "Contemplative",
    "Drow",
    "Formian",
    "Haan",
    "Ikeshti",
    "Kalo",
    "Maraquoi",
    "Nuar",
    "Ryphorian",
    "Sarcesian",
    "Skittermander",
    "Verthani",
    "Witchwyrd",
  ],
  alignments: [
    "Lawful Good",
    "Neutral Good",
    "Chaotic Good",
    "Lawful Neutral",
    "Neutral",
    "Chaotic Neutral",
    "Lawful Evil",
    "Neutral Evil",
    "Chaotic Evil",
  ],
};

/**
 * Shadowdark character options
 */
export const SHADOWDARK_OPTIONS: GameSystemDropdownOptions = {
  classes: [
    "Fighter",
    "Priest",
    "Thief",
    "Wizard",
  ],
  backgrounds: [
    "Urchin",
    "Wanted",
    "Cult Initiate",
    "Thieves' Guild",
    "Banished",
    "Orphaned",
    "Wizard's Apprentice",
    "Jeweler",
    "Herbalist",
    "Barbarian",
    "Mercenary",
    "Sailor",
    "Acolyte",
    "Soldier",
    "Ranger",
    "Squire",
    "Performer",
    "Tracker",
    "Outlaw",
    "Merchant",
  ],
  races: [
    "Human",
    "Dwarf",
    "Elf",
    "Goblin",
    "Half-Orc",
    "Halfling",
  ],
  alignments: [
    "Lawful",
    "Neutral",
    "Chaotic",
  ],
};

/**
 * Get dropdown options for a specific game system
 */
export function getGameSystemOptions(
  system: string
): GameSystemDropdownOptions | null {
  switch (system) {
    case "pathfinder":
      return PATHFINDER_OPTIONS;
    case "starfinder":
      return STARFINDER_OPTIONS;
    case "shadowdark":
      return SHADOWDARK_OPTIONS;
    default:
      return null;
  }
}
