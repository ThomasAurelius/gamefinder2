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
