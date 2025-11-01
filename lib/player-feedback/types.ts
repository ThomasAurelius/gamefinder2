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
