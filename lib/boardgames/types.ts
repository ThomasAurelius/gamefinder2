export type BoardGame = {
  id: string;
  name: string;
  yearpublished: string;
  rank: number;
  bayesaverage: number;
  average: number;
  usersrated: number;
};

export type UserLibraryEntry = {
  gameId: string;
  gameName: string;
  addedAt: string;
};

export type UserLibrary = {
  owned: UserLibraryEntry[];
  wishlist: UserLibraryEntry[];
};
