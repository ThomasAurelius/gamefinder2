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
};
