export type HostFeedbackPayload = {
  hostId: string; // User ID of the host being rated
  sessionId: string; // Game or campaign session ID
  sessionType: "game" | "campaign"; // Type of session
  recommend: "yes" | "no" | "skip"; // Rating choice
  comment?: string; // Optional comment (visible only to host and admin)
};

export type StoredHostFeedback = HostFeedbackPayload & {
  id: string;
  playerId: string; // User ID of the player who gave the feedback
  createdAt: string;
};

export type HostFeedbackStats = {
  hostId: string;
  totalRatings: number;
  yesCount: number;
  noCount: number;
  skipCount: number;
  score: number; // yesCount - noCount
};
