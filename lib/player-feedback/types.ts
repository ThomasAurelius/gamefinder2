export type PlayerFeedbackPayload = {
  playerId: string; // User ID of the player being rated
  sessionId: string; // Game or campaign session ID
  sessionType: "game" | "campaign"; // Type of session
  rating: 1 | 2 | 3 | 4 | 5; // 1-5 star rating (5 = perfectly amazing, 1 = horribly bad)
  comment?: string; // Optional comment (visible only to player and admin)
};

export type StoredPlayerFeedback = PlayerFeedbackPayload & {
  id: string;
  hostId: string; // User ID of the host who gave the feedback
  createdAt: string;
  isFlagged?: boolean; // Whether feedback has been flagged for review
  flagReason?: string; // Reason for flagging
  flaggedBy?: string; // User ID who flagged the feedback
  flaggedAt?: string; // When it was flagged
  adminResolvedBy?: string; // Admin who resolved the flag
  adminResolvedAt?: string; // When admin resolved the flag
  adminAction?: "accepted" | "deleted"; // What action admin took
};

export type PlayerFeedbackStats = {
  playerId: string;
  totalRatings: number;
  averageRating: number; // Average of all ratings (1-5 scale)
  ratings: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
};
