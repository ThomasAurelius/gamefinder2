export type PlayerFeedbackPayload = {
  playerId: string; // User ID of the player being rated
  sessionId: string; // Game or campaign session ID
  sessionType: "game" | "campaign"; // Type of session
  recommend: "yes" | "no" | "skip"; // Rating choice
  comment?: string; // Optional comment (visible only to player and admin)
};

export type StoredPlayerFeedback = PlayerFeedbackPayload & {
  id: string;
  hostId: string; // User ID of the host who gave the feedback
  createdAt: string;
};

export type PlayerFeedbackStats = {
  playerId: string;
  totalRatings: number;
  yesCount: number;
  noCount: number;
  skipCount: number;
  score: number; // yesCount - noCount
};
