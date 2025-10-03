import { randomUUID } from "crypto";
import type { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";
import { GameSessionPayload, StoredGameSession } from "./types";

type GameSessionDocument = StoredGameSession & {
  _id?: ObjectId;
};

export async function listGameSessions(filters?: {
  game?: string;
  date?: string;
  times?: string[];
}): Promise<StoredGameSession[]> {
  const db = await getDb();
  const gamesCollection = db.collection<GameSessionDocument>("gameSessions");

  // Build query based on filters
  const query: Record<string, unknown> = {};
  
  if (filters?.game) {
    query.game = filters.game;
  }
  
  if (filters?.date) {
    query.date = filters.date;
  }
  
  if (filters?.times && filters.times.length > 0) {
    // Find sessions that have at least one matching time slot
    query.times = { $in: filters.times };
  }

  const sessions = await gamesCollection
    .find(query)
    .sort({ date: 1, createdAt: -1 })
    .toArray();

  return sessions.map((session) => ({
    id: session.id,
    userId: session.userId,
    game: session.game,
    date: session.date,
    times: [...session.times],
    description: session.description,
    createdAt: session.createdAt,
    updatedAt: session.updatedAt,
  }));
}

export async function getGameSession(id: string): Promise<StoredGameSession | null> {
  const db = await getDb();
  const gamesCollection = db.collection<GameSessionDocument>("gameSessions");

  const session = await gamesCollection.findOne({ id });

  if (!session) {
    return null;
  }

  return {
    id: session.id,
    userId: session.userId,
    game: session.game,
    date: session.date,
    times: [...session.times],
    description: session.description,
    createdAt: session.createdAt,
    updatedAt: session.updatedAt,
  };
}

export async function createGameSession(
  userId: string,
  payload: GameSessionPayload
): Promise<StoredGameSession> {
  const db = await getDb();
  const gamesCollection = db.collection<GameSessionDocument>("gameSessions");

  const timestamp = new Date().toISOString();

  const newSession: GameSessionDocument = {
    id: randomUUID(),
    userId,
    game: payload.game,
    date: payload.date,
    times: [...payload.times],
    description: payload.description,
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  await gamesCollection.insertOne(newSession);

  return {
    id: newSession.id,
    userId: newSession.userId,
    game: newSession.game,
    date: newSession.date,
    times: newSession.times,
    description: newSession.description,
    createdAt: newSession.createdAt,
    updatedAt: newSession.updatedAt,
  };
}

export async function deleteGameSession(userId: string, id: string): Promise<boolean> {
  const db = await getDb();
  const gamesCollection = db.collection<GameSessionDocument>("gameSessions");

  const result = await gamesCollection.deleteOne({ userId, id });

  return result.deletedCount > 0;
}
