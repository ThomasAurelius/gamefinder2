export interface Tale {
  id: string;
  userId: string;
  title: string;
  content: string;
  imageUrls?: string[];
  createdAt: Date;
  authorName: string;
  authorAvatarUrl?: string;
}

export interface TaleFromAPI {
  id: string;
  userId: string;
  title: string;
  content: string;
  imageUrls?: string[];
  createdAt: string;
  authorName: string;
  authorAvatarUrl?: string;
}
