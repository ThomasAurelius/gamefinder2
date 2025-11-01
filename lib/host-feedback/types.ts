export type HostFeedbackPayload = {
  hostId: string; // User ID of the host being rated
  sessionId: string; // Game or campaign session ID
  sessionType: "game" | "campaign"; // Type of session
  rating: 1 | 2 | 3 | 4 | 5; // 1-5 star rating (5 = perfectly amazing, 1 = horrible bad)
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
  averageRating: number; // Average of all ratings (1-5 scale)
  ratings: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
};
