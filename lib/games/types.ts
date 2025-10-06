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

export type PlayerSignup = {
  userId: string;
  characterId?: string;
  characterName?: string;
};

export type StoredGameSession = GameSessionPayload & {
  id: string;
  userId: string;
  signedUpPlayers: string[];
  signedUpPlayersWithCharacters?: PlayerSignup[];
  waitlist: string[];
  waitlistWithCharacters?: PlayerSignup[];
  pendingPlayers: string[];
  pendingPlayersWithCharacters?: PlayerSignup[];
  createdAt: string;
  updatedAt: string;
};
