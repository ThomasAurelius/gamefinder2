export type GameSessionPayload = {
  game: string;
  date: string;
  times: string[];
  description: string;
};

export type StoredGameSession = GameSessionPayload & {
  id: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
};
