import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";
import { UserLibrary, UserLibraryEntry } from "./types";

type UserDocument = {
  _id?: ObjectId;
  library?: {
    owned?: UserLibraryEntry[];
    wishlist?: UserLibraryEntry[];
  };
};

export async function getUserLibrary(userId: string): Promise<UserLibrary> {
  const db = await getDb();
  const usersCollection = db.collection<UserDocument>("users");

  if (!ObjectId.isValid(userId)) {
    return { owned: [], wishlist: [] };
  }

  const user = await usersCollection.findOne({ _id: new ObjectId(userId) });

  if (!user || !user.library) {
    return { owned: [], wishlist: [] };
  }

  return {
    owned: user.library.owned || [],
    wishlist: user.library.wishlist || [],
  };
}

export async function addToLibrary(
  userId: string,
  gameId: string,
  gameName: string,
  type: "owned" | "wishlist"
): Promise<boolean> {
  const db = await getDb();
  const usersCollection = db.collection<UserDocument>("users");

  if (!ObjectId.isValid(userId)) {
    return false;
  }

  const entry: UserLibraryEntry = {
    gameId,
    gameName,
    addedAt: new Date().toISOString(),
  };

  const field = type === "owned" ? "library.owned" : "library.wishlist";

  const result = await usersCollection.updateOne(
    { 
      _id: new ObjectId(userId),
      [`${field}.gameId`]: { $ne: gameId }
    },
    {
      $push: { [field]: entry },
    }
  );

  return result.modifiedCount > 0;
}

export async function removeFromLibrary(
  userId: string,
  gameId: string,
  type: "owned" | "wishlist"
): Promise<boolean> {
  const db = await getDb();
  const usersCollection = db.collection<UserDocument>("users");

  if (!ObjectId.isValid(userId)) {
    return false;
  }

  const field = type === "owned" ? "library.owned" : "library.wishlist";

  const result = await usersCollection.updateOne(
    { _id: new ObjectId(userId) },
    {
      $pull: { [field]: { gameId } },
    }
  );

  return result.modifiedCount > 0;
}

export async function moveToLibrary(
  userId: string,
  gameId: string,
  gameName: string,
  fromType: "owned" | "wishlist",
  toType: "owned" | "wishlist"
): Promise<boolean> {
  // Remove from source and add to destination
  const removed = await removeFromLibrary(userId, gameId, fromType);
  if (!removed) return false;
  
  return await addToLibrary(userId, gameId, gameName, toType);
}

export async function toggleFavorite(
  userId: string,
  gameId: string,
  type: "owned" | "wishlist"
): Promise<boolean> {
  const db = await getDb();
  const usersCollection = db.collection<UserDocument>("users");

  if (!ObjectId.isValid(userId)) {
    return false;
  }

  const field = type === "owned" ? "library.owned" : "library.wishlist";

  // First, get the current library to find the game entry
  const user = await usersCollection.findOne({ _id: new ObjectId(userId) });
  if (!user || !user.library) {
    return false;
  }

  const libraryArray = type === "owned" ? user.library.owned : user.library.wishlist;
  if (!libraryArray) {
    return false;
  }

  const gameEntry = libraryArray.find((entry) => entry.gameId === gameId);
  if (!gameEntry) {
    return false;
  }

  // Toggle the favorite status
  const newFavoriteStatus = !gameEntry.isFavorite;

  // Update the specific game entry's favorite status
  const result = await usersCollection.updateOne(
    { 
      _id: new ObjectId(userId),
      [`${field}.gameId`]: gameId
    },
    {
      $set: { [`${field}.$.isFavorite`]: newFavoriteStatus },
    }
  );

  return result.modifiedCount > 0;
}
