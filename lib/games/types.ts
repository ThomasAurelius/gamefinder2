export type GameSessionPayload = {
  game: string;
  date: string;
  times: string[];
  description: string;
  maxPlayers: number;
};

export type StoredGameSession = GameSessionPayload & {
  id: string;
  userId: string;
  signedUpPlayers: string[];
  waitlist: string[];
  createdAt: string;
  updatedAt: string;
};
