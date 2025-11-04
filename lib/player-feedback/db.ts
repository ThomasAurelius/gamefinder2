import { randomUUID } from "crypto";
import type { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";
import { PlayerFeedbackPayload, StoredPlayerFeedback, PlayerFeedbackStats } from "./types";

type PlayerFeedbackDocument = StoredPlayerFeedback & {
  _id?: ObjectId;
};

/**
 * Submit feedback for a player
 */
export async function submitPlayerFeedback(
  hostId: string,
  payload: PlayerFeedbackPayload
): Promise<StoredPlayerFeedback> {
  const db = await getDb();
  const feedbackCollection = db.collection<PlayerFeedbackDocument>("playerFeedback");

  // Check if host already submitted feedback for this player in this session
  const existingFeedback = await feedbackCollection.findOne({
    hostId,
    playerId: payload.playerId,
    sessionId: payload.sessionId,
    sessionType: payload.sessionType,
  });

  if (existingFeedback) {
    // Update existing feedback
    const timestamp = new Date().toISOString();
    const result = await feedbackCollection.findOneAndUpdate(
      { id: existingFeedback.id },
      {
        $set: {
          rating: payload.rating,
          comment: payload.comment,
          createdAt: timestamp,
        },
      },
      { returnDocument: "after" }
    );

    if (!result) {
      throw new Error("Failed to update feedback");
    }

    return {
      id: result.id,
      hostId: result.hostId,
      playerId: result.playerId,
      sessionId: result.sessionId,
      sessionType: result.sessionType,
      rating: result.rating,
      comment: result.comment,
      createdAt: result.createdAt,
    };
  }

  // Create new feedback
  const timestamp = new Date().toISOString();

  const newFeedback: PlayerFeedbackDocument = {
    id: randomUUID(),
    hostId,
    playerId: payload.playerId,
    sessionId: payload.sessionId,
    sessionType: payload.sessionType,
    rating: payload.rating,
    comment: payload.comment,
    createdAt: timestamp,
  };

  await feedbackCollection.insertOne(newFeedback);

  return {
    id: newFeedback.id,
    hostId: newFeedback.hostId,
    playerId: newFeedback.playerId,
    sessionId: newFeedback.sessionId,
    sessionType: newFeedback.sessionType,
    rating: newFeedback.rating,
    comment: newFeedback.comment,
    createdAt: newFeedback.createdAt,
  };
}

/**
 * Get feedback statistics for a player
 */
export async function getPlayerFeedbackStats(playerId: string): Promise<PlayerFeedbackStats> {
  const db = await getDb();
  const feedbackCollection = db.collection<PlayerFeedbackDocument>("playerFeedback");

  const feedback = await feedbackCollection.find({ playerId }).toArray();

  const ratings = {
    1: feedback.filter((f) => f.rating === 1).length,
    2: feedback.filter((f) => f.rating === 2).length,
    3: feedback.filter((f) => f.rating === 3).length,
    4: feedback.filter((f) => f.rating === 4).length,
    5: feedback.filter((f) => f.rating === 5).length,
  };

  const totalRatings = feedback.length;
  const sumOfRatings = feedback.reduce((sum, f) => sum + f.rating, 0);
  const averageRating = totalRatings > 0 ? sumOfRatings / totalRatings : 0;

  return {
    playerId,
    totalRatings,
    averageRating,
    ratings,
  };
}

/**
 * Get all feedback for a player (public)
 * Optionally filter out flagged feedback if not admin
 */
export async function getPlayerFeedbackWithComments(
  playerId: string,
  includeAllFlagged = false
): Promise<StoredPlayerFeedback[]> {
  const db = await getDb();
  const feedbackCollection = db.collection<PlayerFeedbackDocument>("playerFeedback");

  const query: Record<string, unknown> = { playerId };
  
  // If not admin, exclude flagged feedback
  if (!includeAllFlagged) {
    query.isFlagged = { $ne: true };
  }

  const feedback = await feedbackCollection
    .find(query)
    .sort({ createdAt: -1 })
    .toArray();

  return feedback.map((f) => ({
    id: f.id,
    hostId: f.hostId,
    playerId: f.playerId,
    sessionId: f.sessionId,
    sessionType: f.sessionType,
    rating: f.rating,
    comment: f.comment,
    createdAt: f.createdAt,
    isFlagged: f.isFlagged,
    flagReason: f.flagReason,
    flaggedBy: f.flaggedBy,
    flaggedAt: f.flaggedAt,
    adminResolvedBy: f.adminResolvedBy,
    adminResolvedAt: f.adminResolvedAt,
    adminAction: f.adminAction,
  }));
}

/**
 * Check if a host has already submitted feedback for a player in a session
 */
export async function hasHostSubmittedFeedback(
  hostId: string,
  playerId: string,
  sessionId: string,
  sessionType: "game" | "campaign"
): Promise<boolean> {
  const db = await getDb();
  const feedbackCollection = db.collection<PlayerFeedbackDocument>("playerFeedback");

  const feedback = await feedbackCollection.findOne({
    hostId,
    playerId,
    sessionId,
    sessionType,
  });

  return feedback !== null;
}

/**
 * Get feedback stats for multiple players
 */
export async function getMultiplePlayersStats(
  playerIds: string[]
): Promise<Map<string, PlayerFeedbackStats>> {
  const result = new Map<string, PlayerFeedbackStats>();

  if (playerIds.length === 0) {
    return result;
  }

  const db = await getDb();
  const feedbackCollection = db.collection<PlayerFeedbackDocument>("playerFeedback");

  const feedback = await feedbackCollection
    .find({ playerId: { $in: playerIds } })
    .toArray();

  // Group by playerId
  for (const playerId of playerIds) {
    const playerFeedback = feedback.filter((f) => f.playerId === playerId);
    const ratings = {
      1: playerFeedback.filter((f) => f.rating === 1).length,
      2: playerFeedback.filter((f) => f.rating === 2).length,
      3: playerFeedback.filter((f) => f.rating === 3).length,
      4: playerFeedback.filter((f) => f.rating === 4).length,
      5: playerFeedback.filter((f) => f.rating === 5).length,
    };

    const totalRatings = playerFeedback.length;
    const sumOfRatings = playerFeedback.reduce((sum, f) => sum + f.rating, 0);
    const averageRating = totalRatings > 0 ? sumOfRatings / totalRatings : 0;

    result.set(playerId, {
      playerId,
      totalRatings,
      averageRating,
      ratings,
    });
  }

  return result;
}

/**
 * Flag feedback for admin review
 */
export async function flagFeedback(
  feedbackId: string,
  flaggedBy: string,
  flagReason: string
): Promise<StoredPlayerFeedback> {
  const db = await getDb();
  const feedbackCollection = db.collection<PlayerFeedbackDocument>("playerFeedback");

  const timestamp = new Date().toISOString();
  const result = await feedbackCollection.findOneAndUpdate(
    { id: feedbackId },
    {
      $set: {
        isFlagged: true,
        flagReason,
        flaggedBy,
        flaggedAt: timestamp,
      },
    },
    { returnDocument: "after" }
  );

  if (!result) {
    throw new Error("Feedback not found");
  }

  return {
    id: result.id,
    hostId: result.hostId,
    playerId: result.playerId,
    sessionId: result.sessionId,
    sessionType: result.sessionType,
    rating: result.rating,
    comment: result.comment,
    createdAt: result.createdAt,
    isFlagged: result.isFlagged,
    flagReason: result.flagReason,
    flaggedBy: result.flaggedBy,
    flaggedAt: result.flaggedAt,
  };
}

/**
 * Resolve flagged feedback (admin action)
 * Returns the feedback that was acted upon (null if deleted and not found)
 */
export async function resolveFlaggedFeedback(
  feedbackId: string,
  adminId: string,
  action: "accepted" | "deleted"
): Promise<StoredPlayerFeedback | null> {
  const db = await getDb();
  const feedbackCollection = db.collection<PlayerFeedbackDocument>("playerFeedback");

  const timestamp = new Date().toISOString();

  if (action === "deleted") {
    // Delete the feedback, returning all fields including flagging metadata
    const result = await feedbackCollection.findOneAndDelete({ id: feedbackId });
    return result
      ? {
          id: result.id,
          hostId: result.hostId,
          playerId: result.playerId,
          sessionId: result.sessionId,
          sessionType: result.sessionType,
          rating: result.rating,
          comment: result.comment,
          createdAt: result.createdAt,
          isFlagged: result.isFlagged,
          flagReason: result.flagReason,
          flaggedBy: result.flaggedBy,
          flaggedAt: result.flaggedAt,
        }
      : null;
  }

  // Accept the feedback (unflag it)
  const result = await feedbackCollection.findOneAndUpdate(
    { id: feedbackId },
    {
      $set: {
        isFlagged: false,
        adminResolvedBy: adminId,
        adminResolvedAt: timestamp,
        adminAction: action,
      },
    },
    { returnDocument: "after" }
  );

  if (!result) {
    throw new Error("Feedback not found");
  }

  return {
    id: result.id,
    hostId: result.hostId,
    playerId: result.playerId,
    sessionId: result.sessionId,
    sessionType: result.sessionType,
    rating: result.rating,
    comment: result.comment,
    createdAt: result.createdAt,
    isFlagged: result.isFlagged,
    adminResolvedBy: result.adminResolvedBy,
    adminResolvedAt: result.adminResolvedAt,
    adminAction: result.adminAction,
  };
}

/**
 * Get all flagged feedback (admin only)
 */
export async function getFlaggedFeedback(): Promise<StoredPlayerFeedback[]> {
  const db = await getDb();
  const feedbackCollection = db.collection<PlayerFeedbackDocument>("playerFeedback");

  const feedback = await feedbackCollection
    .find({ isFlagged: true })
    .sort({ flaggedAt: -1 })
    .toArray();

  return feedback.map((f) => ({
    id: f.id,
    hostId: f.hostId,
    playerId: f.playerId,
    sessionId: f.sessionId,
    sessionType: f.sessionType,
    rating: f.rating,
    comment: f.comment,
    createdAt: f.createdAt,
    isFlagged: f.isFlagged,
    flagReason: f.flagReason,
    flaggedBy: f.flaggedBy,
    flaggedAt: f.flaggedAt,
  }));
}
