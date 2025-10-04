import { randomUUID } from "crypto";
import type { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";
import { CharacterPayload, StoredCharacter } from "./types";

type CharacterDocument = StoredCharacter & {
  _id?: ObjectId;
  userId: string;
};

export async function listCharacters(userId: string): Promise<StoredCharacter[]> {
  const db = await getDb();
  const charactersCollection = db.collection<CharacterDocument>("characters");

  const characters = await charactersCollection
    .find({ userId })
    .sort({ updatedAt: -1 })
    .toArray();

  return characters.map((char) => ({
    id: char.id,
    system: char.system,
    name: char.name,
    campaign: char.campaign,
    level: char.level,
    notes: char.notes,
    stats: char.stats.map((stat) => ({ ...stat })),
    skills: char.skills.map((skill) => ({ ...skill })),
    avatarUrl: char.avatarUrl,
    isPublic: char.isPublic ?? false,
    createdAt: char.createdAt,
    updatedAt: char.updatedAt,
  }));
}

export async function listPublicCharacters(userId: string): Promise<StoredCharacter[]> {
  const db = await getDb();
  const charactersCollection = db.collection<CharacterDocument>("characters");

  const characters = await charactersCollection
    .find({ userId, isPublic: true })
    .sort({ updatedAt: -1 })
    .toArray();

  return characters.map((char) => ({
    id: char.id,
    system: char.system,
    name: char.name,
    campaign: char.campaign,
    level: char.level,
    notes: char.notes,
    stats: char.stats.map((stat) => ({ ...stat })),
    skills: char.skills.map((skill) => ({ ...skill })),
    avatarUrl: char.avatarUrl,
    isPublic: char.isPublic ?? false,
    createdAt: char.createdAt,
    updatedAt: char.updatedAt,
  }));
}

export async function getCharacter(
  userId: string,
  id: string
): Promise<StoredCharacter | null> {
  const db = await getDb();
  const charactersCollection = db.collection<CharacterDocument>("characters");

  const character = await charactersCollection.findOne({ userId, id });

  if (!character) {
    return null;
  }

  return {
    id: character.id,
    system: character.system,
    name: character.name,
    campaign: character.campaign,
    level: character.level,
    notes: character.notes,
    stats: character.stats.map((stat) => ({ ...stat })),
    skills: character.skills.map((skill) => ({ ...skill })),
    avatarUrl: character.avatarUrl,
    isPublic: character.isPublic ?? false,
    createdAt: character.createdAt,
    updatedAt: character.updatedAt,
  };
}

export async function createCharacter(
  userId: string,
  payload: CharacterPayload
): Promise<StoredCharacter> {
  const db = await getDb();
  const charactersCollection = db.collection<CharacterDocument>("characters");

  const timestamp = new Date().toISOString();

  const newCharacter: CharacterDocument = {
    id: randomUUID(),
    userId,
    createdAt: timestamp,
    updatedAt: timestamp,
    ...payload,
    stats: payload.stats.map((stat) => ({ ...stat })),
    skills: payload.skills.map((skill) => ({ ...skill })),
  };

  await charactersCollection.insertOne(newCharacter);

  return {
    id: newCharacter.id,
    system: newCharacter.system,
    name: newCharacter.name,
    campaign: newCharacter.campaign,
    level: newCharacter.level,
    notes: newCharacter.notes,
    stats: newCharacter.stats,
    skills: newCharacter.skills,
    avatarUrl: newCharacter.avatarUrl,
    isPublic: newCharacter.isPublic ?? false,
    createdAt: newCharacter.createdAt,
    updatedAt: newCharacter.updatedAt,
  };
}

export async function updateCharacter(
  userId: string,
  id: string,
  payload: CharacterPayload
): Promise<StoredCharacter | null> {
  const db = await getDb();
  const charactersCollection = db.collection<CharacterDocument>("characters");

  const timestamp = new Date().toISOString();

  const result = await charactersCollection.findOneAndUpdate(
    { userId, id },
    {
      $set: {
        ...payload,
        stats: payload.stats.map((stat) => ({ ...stat })),
        skills: payload.skills.map((skill) => ({ ...skill })),
        updatedAt: timestamp,
      },
    },
    { returnDocument: "after" }
  );

  if (!result) {
    return null;
  }

  return {
    id: result.id,
    system: result.system,
    name: result.name,
    campaign: result.campaign,
    level: result.level,
    notes: result.notes,
    stats: result.stats,
    skills: result.skills,
    avatarUrl: result.avatarUrl,
    isPublic: result.isPublic ?? false,
    createdAt: result.createdAt,
    updatedAt: result.updatedAt,
  };
}

export async function deleteCharacter(userId: string, id: string): Promise<boolean> {
  const db = await getDb();
  const charactersCollection = db.collection<CharacterDocument>("characters");

  const result = await charactersCollection.deleteOne({ userId, id });

  return result.deletedCount > 0;
}
