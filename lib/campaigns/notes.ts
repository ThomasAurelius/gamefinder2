import type { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";

export type CampaignNoteDocument = {
  _id?: ObjectId;
  campaignId: string;
  userId: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
};

export type CampaignNote = {
  id: string;
  campaignId: string;
  userId: string;
  content: string;
  createdAt: string;
  updatedAt: string;
};

export type CampaignNotePayload = {
  campaignId: string;
  userId: string;
  content: string;
};

export async function createCampaignNote(
  payload: CampaignNotePayload
): Promise<CampaignNote> {
  const db = await getDb();
  const notesCollection = db.collection<CampaignNoteDocument>("campaign_notes");

  const now = new Date();
  const noteDoc: CampaignNoteDocument = {
    campaignId: payload.campaignId,
    userId: payload.userId,
    content: payload.content,
    createdAt: now,
    updatedAt: now,
  };

  const result = await notesCollection.insertOne(noteDoc);

  return {
    id: result.insertedId.toString(),
    campaignId: noteDoc.campaignId,
    userId: noteDoc.userId,
    content: noteDoc.content,
    createdAt: noteDoc.createdAt.toISOString(),
    updatedAt: noteDoc.updatedAt.toISOString(),
  };
}

export async function getCampaignNotes(
  campaignId: string
): Promise<CampaignNote[]> {
  const db = await getDb();
  const notesCollection = db.collection<CampaignNoteDocument>("campaign_notes");

  const notes = await notesCollection
    .find({ campaignId })
    .sort({ createdAt: -1 })
    .toArray();

  return notes.map((note) => ({
    id: note._id!.toString(),
    campaignId: note.campaignId,
    userId: note.userId,
    content: note.content,
    createdAt: note.createdAt.toISOString(),
    updatedAt: note.updatedAt.toISOString(),
  }));
}

export async function updateCampaignNote(
  noteId: string,
  userId: string,
  content: string
): Promise<CampaignNote | null> {
  const db = await getDb();
  const notesCollection = db.collection<CampaignNoteDocument>("campaign_notes");
  const { ObjectId } = await import("mongodb");

  const result = await notesCollection.findOneAndUpdate(
    { _id: new ObjectId(noteId), userId },
    {
      $set: {
        content,
        updatedAt: new Date(),
      },
    },
    { returnDocument: "after" }
  );

  if (!result) {
    return null;
  }

  return {
    id: result._id!.toString(),
    campaignId: result.campaignId,
    userId: result.userId,
    content: result.content,
    createdAt: result.createdAt.toISOString(),
    updatedAt: result.updatedAt.toISOString(),
  };
}

export async function deleteCampaignNote(
  noteId: string,
  userId: string
): Promise<boolean> {
  const db = await getDb();
  const notesCollection = db.collection<CampaignNoteDocument>("campaign_notes");
  const { ObjectId } = await import("mongodb");

  const result = await notesCollection.deleteOne({
    _id: new ObjectId(noteId),
    userId,
  });

  return result.deletedCount > 0;
}
