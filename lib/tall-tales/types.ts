export type TallTalePayload = {
  title: string;
  content: string;
  imageUrls?: string[];
};

export type StoredTallTale = {
  id: string;
  userId: string;
  title: string;
  content: string;
  imageUrls: string[];
  createdAt: Date;
  updatedAt: Date;
  isDeleted?: boolean;
  deletedAt?: Date;
  deletedBy?: string;
};

export type FlagReason = "offtopic" | "inappropriate" | "spam" | "other";

export type ContentFlag = {
  id: string;
  taleId: string;
  flaggedBy: string;
  flagReason: FlagReason;
  flagComment?: string;
  flaggedAt: Date;
  resolvedAt?: Date;
  resolvedBy?: string;
  resolution?: "allowed" | "deleted";
};
