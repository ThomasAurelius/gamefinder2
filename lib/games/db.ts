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
    maxPlayers: session.maxPlayers || 4,
    signedUpPlayers: session.signedUpPlayers || [],
    waitlist: session.waitlist || [],
    pendingPlayers: session.pendingPlayers || [],
    createdAt: session.createdAt,
    updatedAt: session.updatedAt,
    imageUrl: session.imageUrl,
    location: session.location,
    zipCode: session.zipCode,
    latitude: session.latitude,
    longitude: session.longitude,
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
    maxPlayers: session.maxPlayers || 4,
    signedUpPlayers: session.signedUpPlayers || [],
    waitlist: session.waitlist || [],
    pendingPlayers: session.pendingPlayers || [],
    createdAt: session.createdAt,
    updatedAt: session.updatedAt,
    imageUrl: session.imageUrl,
    location: session.location,
    zipCode: session.zipCode,
    latitude: session.latitude,
    longitude: session.longitude,
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
    maxPlayers: payload.maxPlayers,
    signedUpPlayers: [],
    waitlist: [],
    pendingPlayers: [],
    createdAt: timestamp,
    updatedAt: timestamp,
    imageUrl: payload.imageUrl,
    location: payload.location,
    zipCode: payload.zipCode,
    latitude: payload.latitude,
    longitude: payload.longitude,
  };

  await gamesCollection.insertOne(newSession);

  return {
    id: newSession.id,
    userId: newSession.userId,
    game: newSession.game,
    date: newSession.date,
    times: newSession.times,
    description: newSession.description,
    maxPlayers: newSession.maxPlayers,
    signedUpPlayers: newSession.signedUpPlayers,
    waitlist: newSession.waitlist,
    pendingPlayers: newSession.pendingPlayers,
    createdAt: newSession.createdAt,
    updatedAt: newSession.updatedAt,
    imageUrl: newSession.imageUrl,
    location: newSession.location,
    zipCode: newSession.zipCode,
    latitude: newSession.latitude,
    longitude: newSession.longitude,
  };
}

export async function updateGameSession(
  userId: string,
  id: string,
  payload: Partial<GameSessionPayload>
): Promise<StoredGameSession | null> {
  const db = await getDb();
  const gamesCollection = db.collection<GameSessionDocument>("gameSessions");

  const timestamp = new Date().toISOString();

  const result = await gamesCollection.findOneAndUpdate(
    { userId, id },
    {
      $set: {
        ...payload,
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
    userId: result.userId,
    game: result.game,
    date: result.date,
    times: [...result.times],
    description: result.description,
    maxPlayers: result.maxPlayers || 4,
    signedUpPlayers: result.signedUpPlayers || [],
    waitlist: result.waitlist || [],
    pendingPlayers: result.pendingPlayers || [],
    createdAt: result.createdAt,
    updatedAt: result.updatedAt,
    imageUrl: result.imageUrl,
    location: result.location,
    zipCode: result.zipCode,
    latitude: result.latitude,
    longitude: result.longitude,
  };
}

export async function deleteGameSession(userId: string, id: string): Promise<boolean> {
  const db = await getDb();
  const gamesCollection = db.collection<GameSessionDocument>("gameSessions");

  const result = await gamesCollection.deleteOne({ userId, id });

  return result.deletedCount > 0;
}

export async function joinGameSession(
  sessionId: string,
  userId: string
): Promise<StoredGameSession | null> {
  const db = await getDb();
  const gamesCollection = db.collection<GameSessionDocument>("gameSessions");
  
  const session = await gamesCollection.findOne({ id: sessionId });
  
  if (!session) {
    return null;
  }
  
  // Check if user is already signed up, on waitlist, or pending
  if (
    session.signedUpPlayers?.includes(userId) || 
    session.waitlist?.includes(userId) ||
    session.pendingPlayers?.includes(userId)
  ) {
    return null;
  }
  
  const timestamp = new Date().toISOString();
  
  // Add to pending players for host approval
  const result = await gamesCollection.findOneAndUpdate(
    { id: sessionId },
    {
      $push: { pendingPlayers: userId },
      $set: { updatedAt: timestamp },
    },
    { returnDocument: "after" }
  );
  
  if (!result) {
    return null;
  }
  
  return {
    id: result.id,
    userId: result.userId,
    game: result.game,
    date: result.date,
    times: [...result.times],
    description: result.description,
    maxPlayers: result.maxPlayers || 4,
    signedUpPlayers: result.signedUpPlayers || [],
    waitlist: result.waitlist || [],
    pendingPlayers: result.pendingPlayers || [],
    createdAt: result.createdAt,
    updatedAt: result.updatedAt,
    imageUrl: result.imageUrl,
    location: result.location,
    zipCode: result.zipCode,
    latitude: result.latitude,
    longitude: result.longitude,
  };
}

export async function listUserGameSessions(userId: string): Promise<StoredGameSession[]> {
  const db = await getDb();
  const gamesCollection = db.collection<GameSessionDocument>("gameSessions");

  // Find sessions where user is the host, signed up player, on waitlist, or pending
  const sessions = await gamesCollection
    .find({
      $or: [
        { userId },
        { signedUpPlayers: userId },
        { waitlist: userId },
        { pendingPlayers: userId },
      ],
    })
    .sort({ date: 1, createdAt: -1 })
    .toArray();

  return sessions.map((session) => ({
    id: session.id,
    userId: session.userId,
    game: session.game,
    date: session.date,
    times: [...session.times],
    description: session.description,
    maxPlayers: session.maxPlayers || 4,
    signedUpPlayers: session.signedUpPlayers || [],
    waitlist: session.waitlist || [],
    pendingPlayers: session.pendingPlayers || [],
    createdAt: session.createdAt,
    updatedAt: session.updatedAt,
    imageUrl: session.imageUrl,
    location: session.location,
    zipCode: session.zipCode,
    latitude: session.latitude,
    longitude: session.longitude,
  }));
}

export async function approvePlayer(
  sessionId: string,
  hostId: string,
  playerId: string
): Promise<StoredGameSession | null> {
  const db = await getDb();
  const gamesCollection = db.collection<GameSessionDocument>("gameSessions");
  
  const session = await gamesCollection.findOne({ id: sessionId, userId: hostId });
  
  if (!session) {
    return null;
  }
  
  // Check if player is in pending list
  if (!session.pendingPlayers?.includes(playerId)) {
    return null;
  }
  
  const timestamp = new Date().toISOString();
  const maxPlayers = session.maxPlayers || 4;
  const signedUpPlayers = session.signedUpPlayers || [];
  
  let result;
  if (signedUpPlayers.length < maxPlayers) {
    // Move from pending to signed up players
    result = await gamesCollection.findOneAndUpdate(
      { id: sessionId, userId: hostId },
      {
        $pull: { pendingPlayers: playerId },
        $push: { signedUpPlayers: playerId },
        $set: { updatedAt: timestamp },
      },
      { returnDocument: "after" }
    );
  } else {
    // Move from pending to waitlist if full
    result = await gamesCollection.findOneAndUpdate(
      { id: sessionId, userId: hostId },
      {
        $pull: { pendingPlayers: playerId },
        $push: { waitlist: playerId },
        $set: { updatedAt: timestamp },
      },
      { returnDocument: "after" }
    );
  }
  
  if (!result) {
    return null;
  }
  
  return {
    id: result.id,
    userId: result.userId,
    game: result.game,
    date: result.date,
    times: [...result.times],
    description: result.description,
    maxPlayers: result.maxPlayers || 4,
    signedUpPlayers: result.signedUpPlayers || [],
    waitlist: result.waitlist || [],
    pendingPlayers: result.pendingPlayers || [],
    createdAt: result.createdAt,
    updatedAt: result.updatedAt,
    imageUrl: result.imageUrl,
    location: result.location,
    zipCode: result.zipCode,
    latitude: result.latitude,
    longitude: result.longitude,
  };
}

export async function denyPlayer(
  sessionId: string,
  hostId: string,
  playerId: string
): Promise<StoredGameSession | null> {
  const db = await getDb();
  const gamesCollection = db.collection<GameSessionDocument>("gameSessions");
  
  const session = await gamesCollection.findOne({ id: sessionId, userId: hostId });
  
  if (!session) {
    return null;
  }
  
  // Check if player is in pending list
  if (!session.pendingPlayers?.includes(playerId)) {
    return null;
  }
  
  const timestamp = new Date().toISOString();
  
  // Remove from pending players
  const result = await gamesCollection.findOneAndUpdate(
    { id: sessionId, userId: hostId },
    {
      $pull: { pendingPlayers: playerId },
      $set: { updatedAt: timestamp },
    },
    { returnDocument: "after" }
  );
  
  if (!result) {
    return null;
  }
  
  return {
    id: result.id,
    userId: result.userId,
    game: result.game,
    date: result.date,
    times: [...result.times],
    description: result.description,
    maxPlayers: result.maxPlayers || 4,
    signedUpPlayers: result.signedUpPlayers || [],
    waitlist: result.waitlist || [],
    pendingPlayers: result.pendingPlayers || [],
    createdAt: result.createdAt,
    updatedAt: result.updatedAt,
    imageUrl: result.imageUrl,
    location: result.location,
    zipCode: result.zipCode,
    latitude: result.latitude,
    longitude: result.longitude,
  };
}

/**
 * Count new game sessions created since a given date
 */
export async function countNewGamesSinceDate(sinceDate: Date): Promise<number> {
  const db = await getDb();
  const gamesCollection = db.collection<GameSessionDocument>("gameSessions");

  const count = await gamesCollection.countDocuments({
    createdAt: { $gte: sinceDate.toISOString() }
  });

  return count;
}
