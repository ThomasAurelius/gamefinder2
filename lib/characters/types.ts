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
  stats: StatField[];
  skills: SkillField[];
  notes: string;
};

export type CharacterPayload = CharacterDetails & {
  system: GameSystemKey;
};

export type StoredCharacter = CharacterPayload & {
  id: string;
  createdAt: string;
  updatedAt: string;
};
