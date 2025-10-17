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
    alignment: char.alignment,
    race: char.race,
    background: char.background,
    level: char.level,
    class: char.class,
    role: char.role,
    gold: char.gold,
    experience: char.experience,
    age: char.age,
    height: char.height,
    weight: char.weight,
    eyes: char.eyes,
    skin: char.skin,
    hair: char.hair,
    items: char.items,
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
    alignment: char.alignment,
    race: char.race,
    background: char.background,
    level: char.level,
    class: char.class,
    role: char.role,
    gold: char.gold,
    experience: char.experience,
    age: char.age,
    height: char.height,
    weight: char.weight,
    eyes: char.eyes,
    skin: char.skin,
    hair: char.hair,
    items: char.items,
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
    alignment: character.alignment,
    race: character.race,
    background: character.background,
    level: character.level,
    class: character.class,
    role: character.role,
    gold: character.gold,
    experience: character.experience,
    age: character.age,
    height: character.height,
    weight: character.weight,
    eyes: character.eyes,
    skin: character.skin,
    hair: character.hair,
    items: character.items,
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
    alignment: newCharacter.alignment,
    race: newCharacter.race,
    background: newCharacter.background,
    level: newCharacter.level,
    class: newCharacter.class,
    role: newCharacter.role,
    gold: newCharacter.gold,
    experience: newCharacter.experience,
    age: newCharacter.age,
    height: newCharacter.height,
    weight: newCharacter.weight,
    eyes: newCharacter.eyes,
    skin: newCharacter.skin,
    hair: newCharacter.hair,
    items: newCharacter.items,
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
    alignment: result.alignment,
    race: result.race,
    background: result.background,
    level: result.level,
    class: result.class,
    role: result.role,
    gold: result.gold,
    experience: result.experience,
    age: result.age,
    height: result.height,
    weight: result.weight,
    eyes: result.eyes,
    skin: result.skin,
    hair: result.hair,
    items: result.items,
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

export async function getCharactersPublicStatus(
  characterIds: { userId: string; characterId: string }[]
): Promise<Map<string, boolean>> {
  const result = new Map<string, boolean>();
  
  if (characterIds.length === 0) {
    return result;
  }

  const db = await getDb();
  const charactersCollection = db.collection<CharacterDocument>("characters");

  // Build query to find all requested characters
  const orConditions = characterIds.map(({ userId, characterId }) => ({
    userId,
    id: characterId,
  }));

  const characters = await charactersCollection
    .find(
      { $or: orConditions },
      { projection: { id: 1, userId: 1, isPublic: 1 } }
    )
    .toArray();

  for (const char of characters) {
    // Use characterId as the key for easy lookup
    result.set(char.id, char.isPublic ?? false);
  }

  return result;
}
