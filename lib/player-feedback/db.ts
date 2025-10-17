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
          recommend: payload.recommend,
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
      recommend: result.recommend,
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
    recommend: payload.recommend,
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
    recommend: newFeedback.recommend,
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

  const yesCount = feedback.filter((f) => f.recommend === "yes").length;
  const noCount = feedback.filter((f) => f.recommend === "no").length;
  const skipCount = feedback.filter((f) => f.recommend === "skip").length;

  return {
    playerId,
    totalRatings: feedback.length,
    yesCount,
    noCount,
    skipCount,
    score: yesCount - noCount,
  };
}

/**
 * Get all feedback for a player (admin and player only)
 */
export async function getPlayerFeedbackWithComments(
  playerId: string
): Promise<StoredPlayerFeedback[]> {
  const db = await getDb();
  const feedbackCollection = db.collection<PlayerFeedbackDocument>("playerFeedback");

  const feedback = await feedbackCollection
    .find({ playerId })
    .sort({ createdAt: -1 })
    .toArray();

  return feedback.map((f) => ({
    id: f.id,
    hostId: f.hostId,
    playerId: f.playerId,
    sessionId: f.sessionId,
    sessionType: f.sessionType,
    recommend: f.recommend,
    comment: f.comment,
    createdAt: f.createdAt,
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
    const yesCount = playerFeedback.filter((f) => f.recommend === "yes").length;
    const noCount = playerFeedback.filter((f) => f.recommend === "no").length;
    const skipCount = playerFeedback.filter((f) => f.recommend === "skip").length;

    result.set(playerId, {
      playerId,
      totalRatings: playerFeedback.length,
      yesCount,
      noCount,
      skipCount,
      score: yesCount - noCount,
    });
  }

  return result;
}
