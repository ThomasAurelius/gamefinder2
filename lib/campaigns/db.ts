import type { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";
import { CampaignPayload, StoredCampaign } from "./types";
import { getTodayDateString } from "@/lib/date-utils";

type CampaignDocument = Omit<StoredCampaign, 'id'> & {
  _id: ObjectId;
};

// Legacy document type for backward compatibility with old UUID-based campaigns
type LegacyCampaignDocument = StoredCampaign & {
  _id: ObjectId;
  id: string;
};

export async function listCampaigns(filters?: {
  game?: string;
  date?: string;
  times?: string[];
  userFilter?: string;
  hostId?: string;
}): Promise<StoredCampaign[]> {
  const db = await getDb();
  const campaignsCollection = db.collection<CampaignDocument>("campaigns");

  // Build query based on filters
  const query: Record<string, unknown> = {};
  
  // Filter out past events - only show events from today onwards
  const today = getTodayDateString();
  query.date = { $gte: today };
  
  if (filters?.game) {
    query.game = filters.game;
  }
  
  if (filters?.date) {
    // If a specific date is provided, use it instead of the $gte filter
    query.date = filters.date;
  }
  
  if (filters?.times && filters.times.length > 0) {
    // Find campaigns that have at least one matching time slot
    query.times = { $in: filters.times };
  }

  // If hostId is provided, filter by host
  if (filters?.hostId) {
    query.userId = filters.hostId;
  }

  // If userFilter is provided, find campaigns where the user is hosting or playing
  // Note: userFilter is used for "My Campaigns" type features
  if (filters?.userFilter) {
    query.$or = [
      { userId: filters.userFilter }, // Campaigns user is hosting
      { signedUpPlayers: filters.userFilter }, // Campaigns user is signed up for
      { waitlist: filters.userFilter }, // Campaigns user is on waitlist for
      { pendingPlayers: filters.userFilter }, // Campaigns user has requested to join
    ];
  }

  const campaigns = await campaignsCollection
    .find(query)
    .sort({ date: 1, createdAt: -1 })
    .toArray();

  return campaigns.map((campaign) => ({
    id: campaign._id.toString(),
    userId: campaign.userId,
    game: campaign.game,
    date: campaign.date,
    times: [...campaign.times],
    description: campaign.description,
    maxPlayers: campaign.maxPlayers || 4,
    signedUpPlayers: campaign.signedUpPlayers || [],
    signedUpPlayersWithCharacters: campaign.signedUpPlayersWithCharacters || [],
    waitlist: campaign.waitlist || [],
    waitlistWithCharacters: campaign.waitlistWithCharacters || [],
    pendingPlayers: campaign.pendingPlayers || [],
    pendingPlayersWithCharacters: campaign.pendingPlayersWithCharacters || [],
    createdAt: campaign.createdAt,
    updatedAt: campaign.updatedAt,
    imageUrl: campaign.imageUrl,
    location: campaign.location,
    zipCode: campaign.zipCode,
    latitude: campaign.latitude,
    longitude: campaign.longitude,
    sessionsLeft: campaign.sessionsLeft,
    classesNeeded: campaign.classesNeeded,
    costPerSession: campaign.costPerSession,
    meetingFrequency: campaign.meetingFrequency,
    daysOfWeek: campaign.daysOfWeek,
  }));
}

export async function getCampaign(id: string): Promise<StoredCampaign | null> {
  const db = await getDb();
  const campaignsCollection = db.collection<CampaignDocument>("campaigns");

  // Try to parse as ObjectId first (new format)
  let campaign;
  try {
    const { ObjectId } = await import("mongodb");
    if (ObjectId.isValid(id) && id.length === 24) {
      campaign = await campaignsCollection.findOne({ _id: new ObjectId(id) });
    }
  } catch (error) {
    console.error("Invalid ObjectId:", error);
  }

  // Fallback: try to find by old 'id' field (UUID format) for backward compatibility
  if (!campaign) {
    const legacyCollection = db.collection<LegacyCampaignDocument>("campaigns");
    campaign = await legacyCollection.findOne({ id });
  }

  if (!campaign) {
    return null;
  }

  return {
    id: campaign._id.toString(),
    userId: campaign.userId,
    game: campaign.game,
    date: campaign.date,
    times: [...campaign.times],
    description: campaign.description,
    maxPlayers: campaign.maxPlayers || 4,
    signedUpPlayers: campaign.signedUpPlayers || [],
    signedUpPlayersWithCharacters: campaign.signedUpPlayersWithCharacters || [],
    waitlist: campaign.waitlist || [],
    waitlistWithCharacters: campaign.waitlistWithCharacters || [],
    pendingPlayers: campaign.pendingPlayers || [],
    pendingPlayersWithCharacters: campaign.pendingPlayersWithCharacters || [],
    createdAt: campaign.createdAt,
    updatedAt: campaign.updatedAt,
    imageUrl: campaign.imageUrl,
    location: campaign.location,
    zipCode: campaign.zipCode,
    latitude: campaign.latitude,
    longitude: campaign.longitude,
    sessionsLeft: campaign.sessionsLeft,
    classesNeeded: campaign.classesNeeded,
    costPerSession: campaign.costPerSession,
    meetingFrequency: campaign.meetingFrequency,
    daysOfWeek: campaign.daysOfWeek,
  };
}

export async function createCampaign(
  userId: string,
  payload: CampaignPayload
): Promise<StoredCampaign> {
  const db = await getDb();
  const campaignsCollection = db.collection<CampaignDocument>("campaigns");

  const timestamp = new Date().toISOString();

  const newCampaign: Omit<CampaignDocument, '_id'> = {
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
    sessionsLeft: payload.sessionsLeft,
    classesNeeded: payload.classesNeeded,
    costPerSession: payload.costPerSession,
    meetingFrequency: payload.meetingFrequency,
    daysOfWeek: payload.daysOfWeek,
  };

  const result = await campaignsCollection.insertOne(newCampaign as CampaignDocument);

  return {
    id: result.insertedId.toString(),
    userId: newCampaign.userId,
    game: newCampaign.game,
    date: newCampaign.date,
    times: newCampaign.times,
    description: newCampaign.description,
    maxPlayers: newCampaign.maxPlayers,
    signedUpPlayers: newCampaign.signedUpPlayers,
    signedUpPlayersWithCharacters: newCampaign.signedUpPlayersWithCharacters,
    waitlist: newCampaign.waitlist,
    waitlistWithCharacters: newCampaign.waitlistWithCharacters,
    pendingPlayers: newCampaign.pendingPlayers,
    pendingPlayersWithCharacters: newCampaign.pendingPlayersWithCharacters,
    createdAt: newCampaign.createdAt,
    updatedAt: newCampaign.updatedAt,
    imageUrl: newCampaign.imageUrl,
    location: newCampaign.location,
    zipCode: newCampaign.zipCode,
    latitude: newCampaign.latitude,
    longitude: newCampaign.longitude,
    sessionsLeft: newCampaign.sessionsLeft,
    classesNeeded: newCampaign.classesNeeded,
    costPerSession: newCampaign.costPerSession,
    meetingFrequency: newCampaign.meetingFrequency,
    daysOfWeek: newCampaign.daysOfWeek,
  };
}

export async function updateCampaign(
  userId: string,
  id: string,
  payload: Partial<CampaignPayload>
): Promise<StoredCampaign | null> {
  const db = await getDb();
  const campaignsCollection = db.collection<CampaignDocument>("campaigns");

  const timestamp = new Date().toISOString();

  // Try to parse as ObjectId first (new format)
  let result;
  try {
    const { ObjectId } = await import("mongodb");
    if (ObjectId.isValid(id) && id.length === 24) {
      result = await campaignsCollection.findOneAndUpdate(
        { userId, _id: new ObjectId(id) },
        {
          $set: {
            ...payload,
            updatedAt: timestamp,
          },
        },
        { returnDocument: "after" }
      );
    }
  } catch (error) {
    console.error("Invalid ObjectId:", error);
  }

  // Fallback: try to find by old 'id' field (UUID format) for backward compatibility
  if (!result) {
    const legacyCollection = db.collection<LegacyCampaignDocument>("campaigns");
    result = await legacyCollection.findOneAndUpdate(
      { userId, id },
      {
        $set: {
          ...payload,
          updatedAt: timestamp,
        },
      },
      { returnDocument: "after" }
    );
  }

  if (!result) {
    return null;
  }

  return {
    id: result._id.toString(),
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
    sessionsLeft: result.sessionsLeft,
    classesNeeded: result.classesNeeded,
    costPerSession: result.costPerSession,
    meetingFrequency: result.meetingFrequency,
    daysOfWeek: result.daysOfWeek,
  };
}

export async function deleteCampaign(userId: string, id: string): Promise<boolean> {
  const db = await getDb();
  const campaignsCollection = db.collection<CampaignDocument>("campaigns");

  // Try to parse as ObjectId first (new format)
  let result;
  try {
    const { ObjectId } = await import("mongodb");
    if (ObjectId.isValid(id) && id.length === 24) {
      result = await campaignsCollection.deleteOne({ userId, _id: new ObjectId(id) });
    }
  } catch (error) {
    console.error("Invalid ObjectId:", error);
  }

  // Fallback: try to find by old 'id' field (UUID format) for backward compatibility
  if (!result || result.deletedCount === 0) {
    const legacyCollection = db.collection<LegacyCampaignDocument>("campaigns");
    result = await legacyCollection.deleteOne({ userId, id });
  }

  return result ? result.deletedCount > 0 : false;
}

export async function joinCampaign(
  campaignId: string,
  userId: string,
  characterId?: string,
  characterName?: string
): Promise<StoredCampaign | null> {
  const db = await getDb();
  const campaignsCollection = db.collection<CampaignDocument>("campaigns");
  
  // Try to parse as ObjectId first (new format)
  let campaign;
  try {
    const { ObjectId } = await import("mongodb");
    if (ObjectId.isValid(campaignId) && campaignId.length === 24) {
      campaign = await campaignsCollection.findOne({ _id: new ObjectId(campaignId) });
    }
  } catch (error) {
    console.error("Invalid ObjectId:", error);
  }

  // Fallback: try to find by old 'id' field (UUID format) for backward compatibility
  if (!campaign) {
    const legacyCollection = db.collection<LegacyCampaignDocument>("campaigns");
    campaign = await legacyCollection.findOne({ id: campaignId });
  }
  
  if (!campaign) {
    return null;
  }
  
  // Check if user is the host (DM) - hosts cannot join their own campaign as players
  if (campaign.userId === userId) {
    return null;
  }
  
  // Check if user is already signed up, on waitlist, or pending
  if (
    campaign.signedUpPlayers?.includes(userId) || 
    campaign.waitlist?.includes(userId) ||
    campaign.pendingPlayers?.includes(userId)
  ) {
    return null;
  }
  
  const timestamp = new Date().toISOString();
  
  // Prepare player signup data
  const playerSignup = { userId, characterId, characterName };
  
  // Add to pending players for host approval
  let result;
  try {
    const { ObjectId } = await import("mongodb");
    if (ObjectId.isValid(campaignId) && campaignId.length === 24) {
      result = await campaignsCollection.findOneAndUpdate(
        { _id: new ObjectId(campaignId) },
        {
          $push: { 
            pendingPlayers: userId,
            pendingPlayersWithCharacters: playerSignup
          },
          $set: { updatedAt: timestamp },
        },
        { returnDocument: "after" }
      );
    }
  } catch (error) {
    console.error("Invalid ObjectId:", error);
  }

  // Fallback: try to update by old 'id' field (UUID format) for backward compatibility
  if (!result) {
    const legacyCollection = db.collection<LegacyCampaignDocument>("campaigns");
    result = await legacyCollection.findOneAndUpdate(
      { id: campaignId },
      {
        $push: { 
          pendingPlayers: userId,
          pendingPlayersWithCharacters: playerSignup
        },
        $set: { updatedAt: timestamp },
      },
      { returnDocument: "after" }
    );
  }
  
  if (!result) {
    return null;
  }
  
  return {
    id: result._id.toString(),
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
    sessionsLeft: result.sessionsLeft,
    classesNeeded: result.classesNeeded,
    costPerSession: result.costPerSession,
    meetingFrequency: result.meetingFrequency,
    daysOfWeek: result.daysOfWeek,
  };
}

export async function leaveCampaign(
  campaignId: string,
  userId: string
): Promise<StoredCampaign | null> {
  const db = await getDb();
  const campaignsCollection = db.collection<CampaignDocument>("campaigns");
  
  // Try to parse as ObjectId first (new format)
  let campaign;
  try {
    const { ObjectId } = await import("mongodb");
    if (ObjectId.isValid(campaignId) && campaignId.length === 24) {
      campaign = await campaignsCollection.findOne({ _id: new ObjectId(campaignId) });
    }
  } catch (error) {
    console.error("Invalid ObjectId:", error);
  }

  // Fallback: try to find by old 'id' field (UUID format) for backward compatibility
  if (!campaign) {
    const legacyCollection = db.collection<LegacyCampaignDocument>("campaigns");
    campaign = await legacyCollection.findOne({ id: campaignId });
  }
  
  if (!campaign) {
    return null;
  }
  
  // Check if user is the host (DM) - hosts cannot leave their own campaign
  if (campaign.userId === userId) {
    return null;
  }
  
  const timestamp = new Date().toISOString();
  
  // Remove user from all possible lists (pending, signed up, or waitlist)
  let result;
  try {
    const { ObjectId } = await import("mongodb");
    if (ObjectId.isValid(campaignId) && campaignId.length === 24) {
      result = await campaignsCollection.findOneAndUpdate(
        { _id: new ObjectId(campaignId) },
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
    }
  } catch (error) {
    console.error("Invalid ObjectId:", error);
  }

  // Fallback: try to update by old 'id' field (UUID format) for backward compatibility
  if (!result) {
    const legacyCollection = db.collection<LegacyCampaignDocument>("campaigns");
    result = await legacyCollection.findOneAndUpdate(
      { id: campaignId },
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
  }
  
  if (!result) {
    return null;
  }
  
  return {
    id: result._id.toString(),
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
    sessionsLeft: result.sessionsLeft,
    classesNeeded: result.classesNeeded,
    costPerSession: result.costPerSession,
    meetingFrequency: result.meetingFrequency,
    daysOfWeek: result.daysOfWeek,
  };
}

export async function approvePlayer(
  campaignId: string,
  hostId: string,
  playerId: string
): Promise<StoredCampaign | null> {
  const db = await getDb();
  const campaignsCollection = db.collection<CampaignDocument>("campaigns");
  
  // Try to parse as ObjectId first (new format)
  let campaign;
  try {
    const { ObjectId } = await import("mongodb");
    if (ObjectId.isValid(campaignId) && campaignId.length === 24) {
      campaign = await campaignsCollection.findOne({ _id: new ObjectId(campaignId), userId: hostId });
    }
  } catch (error) {
    console.error("Invalid ObjectId:", error);
  }

  // Fallback: try to find by old 'id' field (UUID format) for backward compatibility
  if (!campaign) {
    const legacyCollection = db.collection<LegacyCampaignDocument>("campaigns");
    campaign = await legacyCollection.findOne({ id: campaignId, userId: hostId });
  }
  
  if (!campaign) {
    return null;
  }
  
  // Check if player is in pending list
  if (!campaign.pendingPlayers?.includes(playerId)) {
    return null;
  }
  
  // Find the player's character info from pending list
  const pendingPlayersWithCharacters = campaign.pendingPlayersWithCharacters || [];
  const playerSignup = pendingPlayersWithCharacters.find(p => p.userId === playerId);
  
  const timestamp = new Date().toISOString();
  const maxPlayers = campaign.maxPlayers || 4;
  const signedUpPlayers = campaign.signedUpPlayers || [];
  
  let result;
  const { ObjectId } = await import("mongodb");
  
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
    
    try {
      if (ObjectId.isValid(campaignId) && campaignId.length === 24) {
        result = await campaignsCollection.findOneAndUpdate(
          { _id: new ObjectId(campaignId), userId: hostId },
          updateDoc,
          { returnDocument: "after" }
        );
      }
    } catch (error) {
      console.error("Invalid ObjectId:", error);
    }

    // Fallback: try to update by old 'id' field (UUID format) for backward compatibility
    if (!result) {
      const legacyCollection = db.collection<LegacyCampaignDocument>("campaigns");
      result = await legacyCollection.findOneAndUpdate(
        { id: campaignId, userId: hostId },
        updateDoc,
        { returnDocument: "after" }
      );
    }
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
    
    try {
      if (ObjectId.isValid(campaignId) && campaignId.length === 24) {
        result = await campaignsCollection.findOneAndUpdate(
          { _id: new ObjectId(campaignId), userId: hostId },
          updateDoc,
          { returnDocument: "after" }
        );
      }
    } catch (error) {
      console.error("Invalid ObjectId:", error);
    }

    // Fallback: try to update by old 'id' field (UUID format) for backward compatibility
    if (!result) {
      const legacyCollection = db.collection<LegacyCampaignDocument>("campaigns");
      result = await legacyCollection.findOneAndUpdate(
        { id: campaignId, userId: hostId },
        updateDoc,
        { returnDocument: "after" }
      );
    }
  }
  
  if (!result) {
    return null;
  }
  
  return {
    id: result._id.toString(),
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
    sessionsLeft: result.sessionsLeft,
    classesNeeded: result.classesNeeded,
    costPerSession: result.costPerSession,
    meetingFrequency: result.meetingFrequency,
    daysOfWeek: result.daysOfWeek,
  };
}

export async function denyPlayer(
  campaignId: string,
  hostId: string,
  playerId: string
): Promise<StoredCampaign | null> {
  const db = await getDb();
  const campaignsCollection = db.collection<CampaignDocument>("campaigns");
  
  // Try to parse as ObjectId first (new format)
  let campaign;
  try {
    const { ObjectId } = await import("mongodb");
    if (ObjectId.isValid(campaignId) && campaignId.length === 24) {
      campaign = await campaignsCollection.findOne({ _id: new ObjectId(campaignId), userId: hostId });
    }
  } catch (error) {
    console.error("Invalid ObjectId:", error);
  }

  // Fallback: try to find by old 'id' field (UUID format) for backward compatibility
  if (!campaign) {
    const legacyCollection = db.collection<LegacyCampaignDocument>("campaigns");
    campaign = await legacyCollection.findOne({ id: campaignId, userId: hostId });
  }
  
  if (!campaign) {
    return null;
  }
  
  // Check if player is in pending list
  if (!campaign.pendingPlayers?.includes(playerId)) {
    return null;
  }
  
  const timestamp = new Date().toISOString();
  
  // Remove from pending players
  let result;
  try {
    const { ObjectId } = await import("mongodb");
    if (ObjectId.isValid(campaignId) && campaignId.length === 24) {
      result = await campaignsCollection.findOneAndUpdate(
        { _id: new ObjectId(campaignId), userId: hostId },
        {
          $pull: { 
            pendingPlayers: playerId,
            pendingPlayersWithCharacters: { userId: playerId }
          },
          $set: { updatedAt: timestamp },
        },
        { returnDocument: "after" }
      );
    }
  } catch (error) {
    console.error("Invalid ObjectId:", error);
  }

  // Fallback: try to update by old 'id' field (UUID format) for backward compatibility
  if (!result) {
    const legacyCollection = db.collection<LegacyCampaignDocument>("campaigns");
    result = await legacyCollection.findOneAndUpdate(
      { id: campaignId, userId: hostId },
      {
        $pull: { 
          pendingPlayers: playerId,
          pendingPlayersWithCharacters: { userId: playerId }
        },
        $set: { updatedAt: timestamp },
      },
      { returnDocument: "after" }
    );
  }
  
  if (!result) {
    return null;
  }
  
  return {
    id: result._id.toString(),
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
    sessionsLeft: result.sessionsLeft,
    classesNeeded: result.classesNeeded,
    costPerSession: result.costPerSession,
    meetingFrequency: result.meetingFrequency,
    daysOfWeek: result.daysOfWeek,
  };
}

export async function removePlayer(
  campaignId: string,
  hostId: string,
  playerId: string
): Promise<StoredCampaign | null> {
  const db = await getDb();
  const campaignsCollection = db.collection<CampaignDocument>("campaigns");
  
  // Try to parse as ObjectId first (new format)
  let campaign;
  try {
    const { ObjectId } = await import("mongodb");
    if (ObjectId.isValid(campaignId) && campaignId.length === 24) {
      campaign = await campaignsCollection.findOne({ _id: new ObjectId(campaignId), userId: hostId });
    }
  } catch (error) {
    console.error("Invalid ObjectId:", error);
  }

  // Fallback: try to find by old 'id' field (UUID format) for backward compatibility
  if (!campaign) {
    const legacyCollection = db.collection<LegacyCampaignDocument>("campaigns");
    campaign = await legacyCollection.findOne({ id: campaignId, userId: hostId });
  }
  
  if (!campaign) {
    return null;
  }
  
  // Check if player is in any of the lists (signedUpPlayers, waitlist, or pendingPlayers)
  const isInSignedUp = campaign.signedUpPlayers?.includes(playerId);
  const isInWaitlist = campaign.waitlist?.includes(playerId);
  const isInPending = campaign.pendingPlayers?.includes(playerId);
  
  if (!isInSignedUp && !isInWaitlist && !isInPending) {
    return null;
  }
  
  const timestamp = new Date().toISOString();
  
  // Remove player from all lists
  let result;
  try {
    const { ObjectId } = await import("mongodb");
    if (ObjectId.isValid(campaignId) && campaignId.length === 24) {
      result = await campaignsCollection.findOneAndUpdate(
        { _id: new ObjectId(campaignId), userId: hostId },
        {
          $pull: { 
            signedUpPlayers: playerId,
            signedUpPlayersWithCharacters: { userId: playerId },
            waitlist: playerId,
            waitlistWithCharacters: { userId: playerId },
            pendingPlayers: playerId,
            pendingPlayersWithCharacters: { userId: playerId }
          },
          $set: { updatedAt: timestamp },
        },
        { returnDocument: "after" }
      );
    }
  } catch (error) {
    console.error("Invalid ObjectId:", error);
  }

  // Fallback: try to update by old 'id' field (UUID format) for backward compatibility
  if (!result) {
    const legacyCollection = db.collection<LegacyCampaignDocument>("campaigns");
    result = await legacyCollection.findOneAndUpdate(
      { id: campaignId, userId: hostId },
      {
        $pull: { 
          signedUpPlayers: playerId,
          signedUpPlayersWithCharacters: { userId: playerId },
          waitlist: playerId,
          waitlistWithCharacters: { userId: playerId },
          pendingPlayers: playerId,
          pendingPlayersWithCharacters: { userId: playerId }
        },
        $set: { updatedAt: timestamp },
      },
      { returnDocument: "after" }
    );
  }
  
  if (!result) {
    return null;
  }
  
  // Handle both new and legacy formats
  const campaignId_final = '_id' in result && result._id ? result._id.toString() : ('id' in result ? result.id as string : campaignId);
  
  return {
    id: campaignId_final,
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
    sessionsLeft: result.sessionsLeft,
    classesNeeded: result.classesNeeded,
    costPerSession: result.costPerSession,
    meetingFrequency: result.meetingFrequency,
    daysOfWeek: result.daysOfWeek,
  };
}
