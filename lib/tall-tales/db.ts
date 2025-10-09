import { randomUUID } from "crypto";
import type { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";
import { TallTalePayload, StoredTallTale } from "./types";

type TallTaleDocument = StoredTallTale & {
  _id?: ObjectId;
};

export async function listTallTales(): Promise<StoredTallTale[]> {
  const db = await getDb();
  const tallTalesCollection = db.collection<TallTaleDocument>("tallTales");

  const tales = await tallTalesCollection
    .find({})
    .sort({ createdAt: -1 })
    .toArray();

  return tales.map((tale) => ({
    id: tale.id,
    userId: tale.userId,
    title: tale.title,
    content: tale.content,
    imageUrls: tale.imageUrls || [],
    createdAt: tale.createdAt,
    updatedAt: tale.updatedAt,
  }));
}

export async function getTallTale(id: string): Promise<StoredTallTale | null> {
  const db = await getDb();
  const tallTalesCollection = db.collection<TallTaleDocument>("tallTales");

  const tale = await tallTalesCollection.findOne({ id });

  if (!tale) {
    return null;
  }

  return {
    id: tale.id,
    userId: tale.userId,
    title: tale.title,
    content: tale.content,
    imageUrls: tale.imageUrls || [],
    createdAt: tale.createdAt,
    updatedAt: tale.updatedAt,
  };
}

export async function createTallTale(
  userId: string,
  payload: TallTalePayload
): Promise<StoredTallTale> {
  const db = await getDb();
  const tallTalesCollection = db.collection<TallTaleDocument>("tallTales");

  const now = new Date();
  const tale: StoredTallTale = {
    id: randomUUID(),
    userId,
    title: payload.title,
    content: payload.content,
    imageUrls: payload.imageUrls || [],
    createdAt: now,
    updatedAt: now,
  };

  await tallTalesCollection.insertOne(tale as TallTaleDocument);

  return tale;
}

export async function updateTallTale(
  id: string,
  userId: string,
  payload: TallTalePayload
): Promise<StoredTallTale | null> {
  const db = await getDb();
  const tallTalesCollection = db.collection<TallTaleDocument>("tallTales");

  const existingTale = await tallTalesCollection.findOne({ id, userId });

  if (!existingTale) {
    return null;
  }

  const updatedTale: StoredTallTale = {
    ...existingTale,
    title: payload.title,
    content: payload.content,
    imageUrls: payload.imageUrls || [],
    updatedAt: new Date(),
  };

  await tallTalesCollection.updateOne(
    { id, userId },
    { $set: {
      title: updatedTale.title,
      content: updatedTale.content,
      imageUrls: updatedTale.imageUrls,
      updatedAt: updatedTale.updatedAt,
    } }
  );

  return updatedTale;
}

export async function deleteTallTale(
  id: string,
  userId: string
): Promise<boolean> {
  const db = await getDb();
  const tallTalesCollection = db.collection<TallTaleDocument>("tallTales");

  const result = await tallTalesCollection.deleteOne({ id, userId });

  return result.deletedCount > 0;
}
