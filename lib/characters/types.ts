export type GameSystemKey = "dnd" | "pathfinder" | "starfinder" | "shadowdark" | "other";

export type StatField = {
  name: string;
  value: string;
};

export type SkillField = {
  name: string;
  value: string;
};

export type CharacterDetails = {
  name: string;
  campaign: string;
  alignment?: string;
  race?: string;
  background?: string;
  level?: string;
  class?: string;
  role?: string;
  gold?: string;
  experience?: string;
  age?: string;
  height?: string;
  weight?: string;
  eyes?: string;
  skin?: string;
  hair?: string;
  items?: string[];
  stats: StatField[];
  skills: SkillField[];
  notes: string;
  avatarUrl?: string;
  isPublic?: boolean;
  pdfUrls?: string[];
};

export type CharacterPayload = CharacterDetails & {
  system: GameSystemKey;
};

export type StoredCharacter = CharacterPayload & {
  id: string;
  createdAt: string;
  updatedAt: string;
};
