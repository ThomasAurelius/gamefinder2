import { randomUUID } from "crypto";
import type { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";
import { TallTalePayload, StoredTallTale, ContentFlag, FlagReason } from "./types";

type TallTaleDocument = StoredTallTale & {
  _id?: ObjectId;
};

type ContentFlagDocument = ContentFlag & {
  _id?: ObjectId;
};

export async function listTallTales(): Promise<StoredTallTale[]> {
  const db = await getDb();
  const tallTalesCollection = db.collection<TallTaleDocument>("tallTales");

  const tales = await tallTalesCollection
    .find({ $or: [{ isDeleted: { $exists: false } }, { isDeleted: false }] })
    .sort({ createdAt: -1 })
    .toArray();

  return tales.map((tale) => ({
    id: tale.id,
    userId: tale.userId,
    title: tale.title,
    content: tale.content,
    imageUrls: tale.imageUrls || [],
    gameSystem: tale.gameSystem,
    customGameSystem: tale.customGameSystem,
    createdAt: tale.createdAt,
    updatedAt: tale.updatedAt,
    isDeleted: tale.isDeleted,
    deletedAt: tale.deletedAt,
    deletedBy: tale.deletedBy,
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
    gameSystem: tale.gameSystem,
    customGameSystem: tale.customGameSystem,
    createdAt: tale.createdAt,
    updatedAt: tale.updatedAt,
    isDeleted: tale.isDeleted,
    deletedAt: tale.deletedAt,
    deletedBy: tale.deletedBy,
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
    gameSystem: payload.gameSystem,
    customGameSystem: payload.customGameSystem,
    createdAt: now,
    updatedAt: now,
    isDeleted: false,
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
    gameSystem: payload.gameSystem,
    customGameSystem: payload.customGameSystem,
    updatedAt: new Date(),
  };

  await tallTalesCollection.updateOne(
    { id, userId },
    { $set: {
      title: updatedTale.title,
      content: updatedTale.content,
      imageUrls: updatedTale.imageUrls,
      gameSystem: updatedTale.gameSystem,
      customGameSystem: updatedTale.customGameSystem,
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

export async function softDeleteTallTale(
  id: string,
  deletedBy: string
): Promise<boolean> {
  const db = await getDb();
  const tallTalesCollection = db.collection<TallTaleDocument>("tallTales");

  const result = await tallTalesCollection.updateOne(
    { id },
    { 
      $set: { 
        isDeleted: true,
        deletedAt: new Date(),
        deletedBy,
      } 
    }
  );

  return result.modifiedCount > 0;
}

// Flag operations
export async function createFlag(
  taleId: string,
  flaggedBy: string,
  flagReason: FlagReason,
  flagComment?: string
): Promise<ContentFlag> {
  const db = await getDb();
  const flagsCollection = db.collection<ContentFlagDocument>("contentFlags");

  const flag: ContentFlag = {
    id: randomUUID(),
    taleId,
    flaggedBy,
    flagReason,
    flagComment,
    flaggedAt: new Date(),
  };

  await flagsCollection.insertOne(flag as ContentFlagDocument);

  return flag;
}

export async function listUnresolvedFlags(): Promise<Array<ContentFlag & { tale?: StoredTallTale }>> {
  const db = await getDb();
  const flagsCollection = db.collection<ContentFlagDocument>("contentFlags");

  const flags = await flagsCollection
    .find({ resolvedAt: { $exists: false } })
    .sort({ flaggedAt: -1 })
    .toArray();

  // Fetch associated tales
  const taleIds = [...new Set(flags.map(f => f.taleId))];
  const tallTalesCollection = db.collection<TallTaleDocument>("tallTales");
  const tales = await tallTalesCollection.find({ id: { $in: taleIds } }).toArray();
  const talesMap = new Map(tales.map(t => [t.id, t]));

  return flags.map(flag => ({
    id: flag.id,
    taleId: flag.taleId,
    flaggedBy: flag.flaggedBy,
    flagReason: flag.flagReason,
    flagComment: flag.flagComment,
    flaggedAt: flag.flaggedAt,
    resolvedAt: flag.resolvedAt,
    resolvedBy: flag.resolvedBy,
    resolution: flag.resolution,
    tale: talesMap.get(flag.taleId),
  }));
}

export async function resolveFlag(
  flagId: string,
  resolvedBy: string,
  resolution: "allowed" | "deleted"
): Promise<boolean> {
  const db = await getDb();
  const flagsCollection = db.collection<ContentFlagDocument>("contentFlags");

  const result = await flagsCollection.updateOne(
    { id: flagId },
    { 
      $set: { 
        resolvedAt: new Date(),
        resolvedBy,
        resolution,
      } 
    }
  );

  return result.modifiedCount > 0;
}
