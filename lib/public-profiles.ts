import { promises as fs } from "fs";
import path from "path";

import { StoredCharacter } from "./characters/types";
import { getDataDirectory } from "./storage-path";

export type PublicProfileDetails = {
  displayName: string;
  bio: string;
  location?: string;
  favoriteGames: string[];
  availability?: Record<string, string[]>;
  style?: string;
  idealTable?: string;
  preferences?: string[];
  gameStyle?: string[];
};

export type PublicCharacterRecord = StoredCharacter & {
  slug: string;
};

export type PublicProfileRecord = {
  username: string;
  userId?: string; // MongoDB ObjectId for linking to library
  profile: PublicProfileDetails;
  characters: PublicCharacterRecord[];
};

const DATA_DIRECTORY = getDataDirectory();
const PUBLIC_PROFILE_FILE = path.join(DATA_DIRECTORY, "public-profiles.json");

const FALLBACK_PROFILES: PublicProfileRecord[] = [
  {
    username: "adventurer-jane",
    userId: "507f1f77bcf86cd799439011", // Sample MongoDB ObjectId
    profile: {
      displayName: "Adventurer Jane",
      bio: "Story-driven GM and occasional player who loves weaving character-focused tales.",
      location: "Seattle, WA",
      favoriteGames: [
        "Dungeons & Dragons",
        "Blades in the Dark",
        "Monster of the Week",
      ],
      availability: {
        Monday: ["7:00 PM"],
        Wednesday: ["6:00 PM", "8:00 PM"],
        Saturday: ["2:00 PM"],
      },
    },
    characters: [
      {
        slug: "lirael-the-bold",
        id: "lirael-the-bold",
        name: "Lirael the Bold",
        system: "dnd",
        campaign: "Crown of the First Dawn",
        stats: [
          { name: "Strength", value: "+2" },
          { name: "Dexterity", value: "+3" },
          { name: "Constitution", value: "+1" },
          { name: "Intelligence", value: "+0" },
          { name: "Wisdom", value: "+1" },
          { name: "Charisma", value: "+4" },
        ],
        skills: [
          { name: "Acrobatics", value: "+5" },
          { name: "Persuasion", value: "+7" },
          { name: "Performance", value: "+6" },
        ],
        notes:
          "A traveling bard seeking the lost verses of the First Dawn to restore hope to her homeland.",
        createdAt: "2024-01-04T18:10:00.000Z",
        updatedAt: "2024-04-22T09:45:00.000Z",
      },
      {
        slug: "professor-ixion",
        id: "professor-ixion",
        name: "Professor Ixion",
        system: "other",
        campaign: "Echoes of the Liminal Lab",
        stats: [
          { name: "Reason", value: "d10" },
          { name: "Courage", value: "d8" },
          { name: "Adaptability", value: "d6" },
        ],
        skills: [
          { name: "Occult Theory", value: "+3" },
          { name: "Temporal Engineering", value: "+4" },
        ],
        notes:
          "A scientist-turned-occultist experimenting with planar echoes to seal a growing rift.",
        createdAt: "2024-02-15T16:00:00.000Z",
        updatedAt: "2024-05-05T12:30:00.000Z",
      },
    ],
  },
];

function cloneProfiles(source: PublicProfileRecord[]): PublicProfileRecord[] {
  return source.map((entry) => ({
    ...entry,
    profile: {
      displayName: entry.profile.displayName,
      bio: entry.profile.bio,
      location: entry.profile.location,
      favoriteGames: Array.isArray(entry.profile.favoriteGames)
        ? [...entry.profile.favoriteGames]
        : [],
      availability: entry.profile.availability
        ? { ...entry.profile.availability }
        : undefined,
      style: entry.profile.style,
      idealTable: entry.profile.idealTable,
      preferences: Array.isArray(entry.profile.preferences)
        ? [...entry.profile.preferences]
        : undefined,
      gameStyle: Array.isArray(entry.profile.gameStyle)
        ? [...entry.profile.gameStyle]
        : undefined,
    },
    characters: Array.isArray(entry.characters)
      ? entry.characters.map((character) => ({
          ...character,
          stats: character.stats.map((stat) => ({ ...stat })),
          skills: character.skills.map((skill) => ({ ...skill })),
        }))
      : [],
  }));
}

async function ensureDataFile(): Promise<void> {
  try {
    await fs.mkdir(DATA_DIRECTORY, { recursive: true });
  } catch (error) {
    console.error("Failed to create data directory", error);
    throw error;
  }

  try {
    await fs.access(PUBLIC_PROFILE_FILE);
  } catch {
    await fs.writeFile(
      PUBLIC_PROFILE_FILE,
      JSON.stringify(FALLBACK_PROFILES, null, 2),
      "utf8"
    );
  }
}

async function readAllPublicProfiles(): Promise<PublicProfileRecord[]> {
  await ensureDataFile();
  const fileContents = await fs.readFile(PUBLIC_PROFILE_FILE, "utf8");

  if (!fileContents.trim()) {
    return cloneProfiles(FALLBACK_PROFILES);
  }

  try {
    const parsed = JSON.parse(fileContents) as PublicProfileRecord[];
    if (!Array.isArray(parsed)) {
      return cloneProfiles(FALLBACK_PROFILES);
    }

    if (parsed.length === 0) {
      return cloneProfiles(FALLBACK_PROFILES);
    }

    return cloneProfiles(parsed);
  } catch (error) {
    console.error("Failed to parse public profiles", error);
    return cloneProfiles(FALLBACK_PROFILES);
  }
}

export async function getPublicProfile(
  username: string
): Promise<PublicProfileRecord | null> {
  const profiles = await readAllPublicProfiles();
  const normalized = username.trim().toLowerCase();

  return (
    profiles.find((profile) => profile.username.toLowerCase() === normalized) ??
    null
  );
}

export async function getPublicCharacter(
  username: string,
  slug: string
): Promise<{ owner: PublicProfileRecord; character: PublicCharacterRecord } | null> {
  const owner = await getPublicProfile(username);

  if (!owner) {
    return null;
  }

  const normalizedSlug = slug.trim().toLowerCase();
  const character = owner.characters.find(
    (entry) => entry.slug.toLowerCase() === normalizedSlug
  );

  if (!character) {
    return null;
  }

  return { owner, character };
}

export function formatGameSystem(system: string): string {
  switch (system) {
    case "dnd":
      return "Dungeons & Dragons";
    case "pathfinder":
      return "Pathfinder";
    case "starfinder":
      return "Starfinder";
    case "shadowdark":
      return "Shadowdark";
    default:
      return "Homebrew / Other";
  }
}
