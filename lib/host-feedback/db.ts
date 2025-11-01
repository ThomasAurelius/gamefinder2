import { randomUUID } from "crypto";
import type { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";
import { HostFeedbackPayload, StoredHostFeedback, HostFeedbackStats } from "./types";

type HostFeedbackDocument = StoredHostFeedback & {
  _id?: ObjectId;
};

/**
 * Submit feedback for a host
 */
export async function submitHostFeedback(
  playerId: string,
  payload: HostFeedbackPayload
): Promise<StoredHostFeedback> {
  const db = await getDb();
  const feedbackCollection = db.collection<HostFeedbackDocument>("hostFeedback");

  // Check if player already submitted feedback for this session
  const existingFeedback = await feedbackCollection.findOne({
    playerId,
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
      playerId: result.playerId,
      hostId: result.hostId,
      sessionId: result.sessionId,
      sessionType: result.sessionType,
      rating: result.rating,
      comment: result.comment,
      createdAt: result.createdAt,
    };
  }

  // Create new feedback
  const timestamp = new Date().toISOString();

  const newFeedback: HostFeedbackDocument = {
    id: randomUUID(),
    playerId,
    hostId: payload.hostId,
    sessionId: payload.sessionId,
    sessionType: payload.sessionType,
    rating: payload.rating,
    comment: payload.comment,
    createdAt: timestamp,
  };

  await feedbackCollection.insertOne(newFeedback);

  return {
    id: newFeedback.id,
    playerId: newFeedback.playerId,
    hostId: newFeedback.hostId,
    sessionId: newFeedback.sessionId,
    sessionType: newFeedback.sessionType,
    rating: newFeedback.rating,
    comment: newFeedback.comment,
    createdAt: newFeedback.createdAt,
  };
}

/**
 * Get feedback statistics for a host
 */
export async function getHostFeedbackStats(hostId: string): Promise<HostFeedbackStats> {
  const db = await getDb();
  const feedbackCollection = db.collection<HostFeedbackDocument>("hostFeedback");

  const feedback = await feedbackCollection.find({ hostId }).toArray();

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
    hostId,
    totalRatings,
    averageRating,
    ratings,
  };
}

/**
 * Get all feedback for a host (admin and host only)
 */
export async function getHostFeedbackWithComments(
  hostId: string
): Promise<StoredHostFeedback[]> {
  const db = await getDb();
  const feedbackCollection = db.collection<HostFeedbackDocument>("hostFeedback");

  const feedback = await feedbackCollection
    .find({ hostId })
    .sort({ createdAt: -1 })
    .toArray();

  return feedback.map((f) => ({
    id: f.id,
    playerId: f.playerId,
    hostId: f.hostId,
    sessionId: f.sessionId,
    sessionType: f.sessionType,
    rating: f.rating,
    comment: f.comment,
    createdAt: f.createdAt,
  }));
}

/**
 * Check if a player has already submitted feedback for a session
 */
export async function hasPlayerSubmittedFeedback(
  playerId: string,
  sessionId: string,
  sessionType: "game" | "campaign"
): Promise<boolean> {
  const db = await getDb();
  const feedbackCollection = db.collection<HostFeedbackDocument>("hostFeedback");

  const feedback = await feedbackCollection.findOne({
    playerId,
    sessionId,
    sessionType,
  });

  return feedback !== null;
}

/**
 * Get feedback stats for multiple hosts
 */
export async function getMultipleHostsStats(
  hostIds: string[]
): Promise<Map<string, HostFeedbackStats>> {
  const result = new Map<string, HostFeedbackStats>();

  if (hostIds.length === 0) {
    return result;
  }

  const db = await getDb();
  const feedbackCollection = db.collection<HostFeedbackDocument>("hostFeedback");

  const feedback = await feedbackCollection
    .find({ hostId: { $in: hostIds } })
    .toArray();

  // Group by hostId
  for (const hostId of hostIds) {
    const hostFeedback = feedback.filter((f) => f.hostId === hostId);
    const ratings = {
      1: hostFeedback.filter((f) => f.rating === 1).length,
      2: hostFeedback.filter((f) => f.rating === 2).length,
      3: hostFeedback.filter((f) => f.rating === 3).length,
      4: hostFeedback.filter((f) => f.rating === 4).length,
      5: hostFeedback.filter((f) => f.rating === 5).length,
    };

    const totalRatings = hostFeedback.length;
    const sumOfRatings = hostFeedback.reduce((sum, f) => sum + f.rating, 0);
    const averageRating = totalRatings > 0 ? sumOfRatings / totalRatings : 0;

    result.set(hostId, {
      hostId,
      totalRatings,
      averageRating,
      ratings,
    });
  }

  return result;
}
