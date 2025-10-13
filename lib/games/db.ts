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
  hostId?: string;
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
  
  if (filters?.hostId) {
    query.userId = filters.hostId;
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
    signedUpPlayersWithCharacters: session.signedUpPlayersWithCharacters || [],
    waitlist: session.waitlist || [],
    waitlistWithCharacters: session.waitlistWithCharacters || [],
    pendingPlayers: session.pendingPlayers || [],
    pendingPlayersWithCharacters: session.pendingPlayersWithCharacters || [],
    createdAt: session.createdAt,
    updatedAt: session.updatedAt,
    imageUrl: session.imageUrl,
    location: session.location,
    zipCode: session.zipCode,
    latitude: session.latitude,
    longitude: session.longitude,
    costPerSession: session.costPerSession,
    stripeConnectAccountId: session.stripeConnectAccountId,
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
    signedUpPlayersWithCharacters: session.signedUpPlayersWithCharacters || [],
    waitlist: session.waitlist || [],
    waitlistWithCharacters: session.waitlistWithCharacters || [],
    pendingPlayers: session.pendingPlayers || [],
    pendingPlayersWithCharacters: session.pendingPlayersWithCharacters || [],
    createdAt: session.createdAt,
    updatedAt: session.updatedAt,
    imageUrl: session.imageUrl,
    location: session.location,
    zipCode: session.zipCode,
    latitude: session.latitude,
    longitude: session.longitude,
    costPerSession: session.costPerSession,
    stripeConnectAccountId: session.stripeConnectAccountId,
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
    signedUpPlayersWithCharacters: [],
    waitlist: [],
    waitlistWithCharacters: [],
    pendingPlayers: [],
    pendingPlayersWithCharacters: [],
    createdAt: timestamp,
    updatedAt: timestamp,
    imageUrl: payload.imageUrl,
    location: payload.location,
    zipCode: payload.zipCode,
    latitude: payload.latitude,
    longitude: payload.longitude,
    costPerSession: payload.costPerSession,
    stripeConnectAccountId: payload.stripeConnectAccountId,
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
    signedUpPlayersWithCharacters: newSession.signedUpPlayersWithCharacters,
    waitlist: newSession.waitlist,
    waitlistWithCharacters: newSession.waitlistWithCharacters,
    pendingPlayers: newSession.pendingPlayers,
    pendingPlayersWithCharacters: newSession.pendingPlayersWithCharacters,
    createdAt: newSession.createdAt,
    updatedAt: newSession.updatedAt,
    imageUrl: newSession.imageUrl,
    location: newSession.location,
    zipCode: newSession.zipCode,
    latitude: newSession.latitude,
    longitude: newSession.longitude,
    costPerSession: newSession.costPerSession,
    stripeConnectAccountId: newSession.stripeConnectAccountId,
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
    signedUpPlayersWithCharacters: result.signedUpPlayersWithCharacters || [],
    waitlist: result.waitlist || [],
    waitlistWithCharacters: result.waitlistWithCharacters || [],
    pendingPlayers: result.pendingPlayers || [],
    pendingPlayersWithCharacters: result.pendingPlayersWithCharacters || [],
    createdAt: result.createdAt,
    updatedAt: result.updatedAt,
    imageUrl: result.imageUrl,
    location: result.location,
    zipCode: result.zipCode,
    latitude: result.latitude,
    longitude: result.longitude,
    costPerSession: result.costPerSession,
    stripeConnectAccountId: result.stripeConnectAccountId,
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
  userId: string,
  characterId?: string,
  characterName?: string
): Promise<StoredGameSession | null> {
  const db = await getDb();
  const gamesCollection = db.collection<GameSessionDocument>("gameSessions");
  
  const session = await gamesCollection.findOne({ id: sessionId });
  
  if (!session) {
    return null;
  }
  
  // Check if user is the host (DM) - hosts cannot join their own game as players
  if (session.userId === userId) {
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
  
  // Prepare player signup data
  const playerSignup = { userId, characterId, characterName };
  
  // Add to pending players for host approval
  const result = await gamesCollection.findOneAndUpdate(
    { id: sessionId },
    {
      $push: { 
        pendingPlayers: userId,
        pendingPlayersWithCharacters: playerSignup
      },
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
    signedUpPlayersWithCharacters: result.signedUpPlayersWithCharacters || [],
    waitlist: result.waitlist || [],
    waitlistWithCharacters: result.waitlistWithCharacters || [],
    pendingPlayers: result.pendingPlayers || [],
    pendingPlayersWithCharacters: result.pendingPlayersWithCharacters || [],
    createdAt: result.createdAt,
    updatedAt: result.updatedAt,
    imageUrl: result.imageUrl,
    location: result.location,
    zipCode: result.zipCode,
    latitude: result.latitude,
    longitude: result.longitude,
    costPerSession: result.costPerSession,
    stripeConnectAccountId: result.stripeConnectAccountId,
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
    signedUpPlayersWithCharacters: session.signedUpPlayersWithCharacters || [],
    waitlist: session.waitlist || [],
    waitlistWithCharacters: session.waitlistWithCharacters || [],
    pendingPlayers: session.pendingPlayers || [],
    pendingPlayersWithCharacters: session.pendingPlayersWithCharacters || [],
    createdAt: session.createdAt,
    updatedAt: session.updatedAt,
    imageUrl: session.imageUrl,
    location: session.location,
    zipCode: session.zipCode,
    latitude: session.latitude,
    longitude: session.longitude,
    costPerSession: session.costPerSession,
    stripeConnectAccountId: session.stripeConnectAccountId,
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
  
  // Find the player's character info from pending list
  const pendingPlayersWithCharacters = session.pendingPlayersWithCharacters || [];
  const playerSignup = pendingPlayersWithCharacters.find(p => p.userId === playerId);
  
  const timestamp = new Date().toISOString();
  const maxPlayers = session.maxPlayers || 4;
  const signedUpPlayers = session.signedUpPlayers || [];
  
  let result;
  if (signedUpPlayers.length < maxPlayers) {
    // Move from pending to signed up players
    const updateDoc: Record<string, unknown> = {
      $pull: { 
        pendingPlayers: playerId,
        pendingPlayersWithCharacters: { userId: playerId }
      },
      $push: { signedUpPlayers: playerId } as Record<string, unknown>,
      $set: { updatedAt: timestamp },
    };
    
    // Add character info if available
    if (playerSignup) {
      (updateDoc.$push as Record<string, unknown>).signedUpPlayersWithCharacters = playerSignup;
    }
    
    result = await gamesCollection.findOneAndUpdate(
      { id: sessionId, userId: hostId },
      updateDoc,
      { returnDocument: "after" }
    );
  } else {
    // Move from pending to waitlist if full
    const updateDoc: Record<string, unknown> = {
      $pull: { 
        pendingPlayers: playerId,
        pendingPlayersWithCharacters: { userId: playerId }
      },
      $push: { waitlist: playerId } as Record<string, unknown>,
      $set: { updatedAt: timestamp },
    };
    
    // Add character info if available
    if (playerSignup) {
      (updateDoc.$push as Record<string, unknown>).waitlistWithCharacters = playerSignup;
    }
    
    result = await gamesCollection.findOneAndUpdate(
      { id: sessionId, userId: hostId },
      updateDoc,
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
    signedUpPlayersWithCharacters: result.signedUpPlayersWithCharacters || [],
    waitlist: result.waitlist || [],
    waitlistWithCharacters: result.waitlistWithCharacters || [],
    pendingPlayers: result.pendingPlayers || [],
    pendingPlayersWithCharacters: result.pendingPlayersWithCharacters || [],
    createdAt: result.createdAt,
    updatedAt: result.updatedAt,
    imageUrl: result.imageUrl,
    location: result.location,
    zipCode: result.zipCode,
    latitude: result.latitude,
    longitude: result.longitude,
    costPerSession: result.costPerSession,
    stripeConnectAccountId: result.stripeConnectAccountId,
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
      $pull: { 
        pendingPlayers: playerId,
        pendingPlayersWithCharacters: { userId: playerId }
      },
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
    signedUpPlayersWithCharacters: result.signedUpPlayersWithCharacters || [],
    waitlist: result.waitlist || [],
    waitlistWithCharacters: result.waitlistWithCharacters || [],
    pendingPlayers: result.pendingPlayers || [],
    pendingPlayersWithCharacters: result.pendingPlayersWithCharacters || [],
    createdAt: result.createdAt,
    updatedAt: result.updatedAt,
    imageUrl: result.imageUrl,
    location: result.location,
    zipCode: result.zipCode,
    latitude: result.latitude,
    longitude: result.longitude,
    costPerSession: result.costPerSession,
    stripeConnectAccountId: result.stripeConnectAccountId,
  };
}

export async function leaveGameSession(
  sessionId: string,
  userId: string
): Promise<StoredGameSession | null> {
  const db = await getDb();
  const gamesCollection = db.collection<GameSessionDocument>("gameSessions");
  
  const session = await gamesCollection.findOne({ id: sessionId });
  
  if (!session) {
    return null;
  }
  
  // Check if user is the host (DM) - hosts cannot leave their own game
  if (session.userId === userId) {
    return null;
  }
  
  const timestamp = new Date().toISOString();
  
  // Remove user from all possible lists (pending, signed up, or waitlist)
  const result = await gamesCollection.findOneAndUpdate(
    { id: sessionId },
    {
      $pull: { 
        pendingPlayers: userId,
        pendingPlayersWithCharacters: { userId: userId },
        signedUpPlayers: userId,
        signedUpPlayersWithCharacters: { userId: userId },
        waitlist: userId,
        waitlistWithCharacters: { userId: userId }
      },
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
    signedUpPlayersWithCharacters: result.signedUpPlayersWithCharacters || [],
    waitlist: result.waitlist || [],
    waitlistWithCharacters: result.waitlistWithCharacters || [],
    pendingPlayers: result.pendingPlayers || [],
    pendingPlayersWithCharacters: result.pendingPlayersWithCharacters || [],
    createdAt: result.createdAt,
    updatedAt: result.updatedAt,
    imageUrl: result.imageUrl,
    location: result.location,
    zipCode: result.zipCode,
    latitude: result.latitude,
    longitude: result.longitude,
    costPerSession: result.costPerSession,
    stripeConnectAccountId: result.stripeConnectAccountId,
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
