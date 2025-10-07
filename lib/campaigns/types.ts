export type CampaignPayload = {
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
  // Campaign-specific fields
  sessionsLeft?: number;
  classesNeeded?: string[];
  costPerSession?: number;
  paymentMethod?: string;
  stripePaymentIntentId?: string;
  stripeClientSecret?: string;
  requiresPayment?: boolean;
  meetingFrequency?: string;
  daysOfWeek?: string[];
};

export type PlayerSignup = {
  userId: string;
  characterId?: string;
  characterName?: string;
};

export type StoredCampaign = CampaignPayload & {
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
