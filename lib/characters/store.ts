import { randomUUID } from "crypto";
import { promises as fs } from "fs";
import path from "path";

import {
  CharacterPayload,
  StoredCharacter,
} from "./types";

const DATA_DIRECTORY = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIRECTORY, "characters.json");

async function ensureDataFile(): Promise<void> {
  try {
    await fs.mkdir(DATA_DIRECTORY, { recursive: true });
  } catch (error) {
    console.error("Failed to create data directory", error);
    throw error;
  }

  try {
    await fs.access(DATA_FILE);
  } catch {
    try {
      await fs.writeFile(DATA_FILE, "[]", "utf8");
    } catch (error) {
      console.error("Failed to create data file", error);
      throw error;
    }
  }
}

async function readCharactersFile(): Promise<StoredCharacter[]> {
  try {
    await ensureDataFile();

    const fileContents = await fs.readFile(DATA_FILE, "utf8");

    if (!fileContents.trim()) {
      return [];
    }

    const parsed = JSON.parse(fileContents) as StoredCharacter[];

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.map((character) => ({
      ...character,
      stats: Array.isArray(character.stats) 
        ? character.stats.map((stat) => ({ ...stat }))
        : [],
      skills: Array.isArray(character.skills)
        ? character.skills.map((skill) => ({ ...skill }))
        : [],
    }));
  } catch (error) {
    console.error("Failed to read characters file", error);
    return [];
  }
}

async function writeCharactersFile(characters: StoredCharacter[]): Promise<void> {
  try {
    await ensureDataFile();
    await fs.writeFile(DATA_FILE, JSON.stringify(characters, null, 2), "utf8");
  } catch (error) {
    console.error("Failed to write characters file", error);
    throw error;
  }
}

export async function listCharacters(): Promise<StoredCharacter[]> {
  const characters = await readCharactersFile();

  return characters.sort((a, b) => {
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });
}

export async function getCharacter(id: string): Promise<StoredCharacter | null> {
  const characters = await readCharactersFile();
  return characters.find((character) => character.id === id) ?? null;
}

export async function createCharacter(
  payload: CharacterPayload
): Promise<StoredCharacter> {
  const characters = await readCharactersFile();
  const timestamp = new Date().toISOString();

  const newCharacter: StoredCharacter = {
    id: randomUUID(),
    createdAt: timestamp,
    updatedAt: timestamp,
    ...payload,
    stats: payload.stats.map((stat) => ({ ...stat })),
    skills: payload.skills.map((skill) => ({ ...skill })),
  };

  characters.push(newCharacter);
  await writeCharactersFile(characters);

  return newCharacter;
}

export async function updateCharacter(
  id: string,
  payload: CharacterPayload
): Promise<StoredCharacter | null> {
  const characters = await readCharactersFile();
  const index = characters.findIndex((character) => character.id === id);

  if (index === -1) {
    return null;
  }

  const timestamp = new Date().toISOString();

  const updatedCharacter: StoredCharacter = {
    ...characters[index],
    ...payload,
    stats: payload.stats.map((stat) => ({ ...stat })),
    skills: payload.skills.map((skill) => ({ ...skill })),
    updatedAt: timestamp,
  };

  characters[index] = updatedCharacter;
  await writeCharactersFile(characters);

  return updatedCharacter;
}

export async function deleteCharacter(id: string): Promise<boolean> {
  const characters = await readCharactersFile();
  const filtered = characters.filter((character) => character.id !== id);

  if (filtered.length === characters.length) {
    return false;
  }

  await writeCharactersFile(filtered);
  return true;
}
