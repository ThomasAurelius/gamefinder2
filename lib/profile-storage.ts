import { promises as fs } from "fs";
import path from "path";

const DATA_DIRECTORY = path.join(process.cwd(), "data");
const PROFILE_FILE_PATH = path.join(DATA_DIRECTORY, "profile.json");

export type ProfileRecord = {
  name: string;
  commonName: string;
  location: string;
  zipCode: string;
  bio: string;
  games: string[];
  favoriteGames: string[];
  availability: Record<string, string[]>;
  primaryRole: string;
};

const DEFAULT_PROFILE: ProfileRecord = {
  name: "",
  commonName: "",
  location: "",
  zipCode: "",
  bio: "",
  games: [],
  favoriteGames: [],
  availability: {
    Monday: [],
    Tuesday: [],
    Wednesday: [],
    Thursday: [],
    Friday: [],
    Saturday: [],
    Sunday: [],
  },
  primaryRole: "",
};

async function ensureDataDirectory() {
  try {
    await fs.mkdir(DATA_DIRECTORY, { recursive: true });
  } catch (error) {
    console.error("Failed to create data directory", error);
  }
}

export async function readProfile(): Promise<ProfileRecord> {
  await ensureDataDirectory();

  try {
    const file = await fs.readFile(PROFILE_FILE_PATH, "utf8");
    const parsed = JSON.parse(file) as ProfileRecord;
    return {
      ...DEFAULT_PROFILE,
      ...parsed,
      availability: {
        ...DEFAULT_PROFILE.availability,
        ...(parsed?.availability ?? {}),
      },
    };
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      await writeProfile(DEFAULT_PROFILE);
      return DEFAULT_PROFILE;
    }

    throw error;
  }
}

export async function writeProfile(profile: ProfileRecord): Promise<void> {
  await ensureDataDirectory();
  const payload = JSON.stringify(profile, null, 2);
  await fs.writeFile(PROFILE_FILE_PATH, payload, "utf8");
}
