export type GameSessionPayload = {
  game: string;
  date: string;
  times: string[];
  description: string;
  maxPlayers: number;
  imageUrl?: string;
  location?: string;
  zipCode?: string;
  latitude?: number;
  longitude?: number;
};

export type StoredGameSession = GameSessionPayload & {
  id: string;
  userId: string;
  signedUpPlayers: string[];
  waitlist: string[];
  pendingPlayers: string[];
  createdAt: string;
  updatedAt: string;
};
