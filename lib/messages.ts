import type { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";

export type MessageDocument = {
  _id?: ObjectId;
  senderId: string;
  senderName: string;
  recipientId: string;
  recipientName: string;
  subject: string;
  content: string;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type ConversationMessage = {
  id: string;
  senderId: string;
  senderName: string;
  recipientId: string;
  recipientName: string;
  subject: string;
  content: string;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
};

export type MessagePayload = {
  senderId: string;
  senderName: string;
  recipientId: string;
  recipientName: string;
  subject: string;
  content: string;
};

export async function createMessage(
  payload: MessagePayload
): Promise<ConversationMessage> {
  const db = await getDb();
  const messagesCollection = db.collection<MessageDocument>("messages");

  const now = new Date();
  const messageDoc: MessageDocument = {
    senderId: payload.senderId,
    senderName: payload.senderName,
    recipientId: payload.recipientId,
    recipientName: payload.recipientName,
    subject: payload.subject,
    content: payload.content,
    isRead: false,
    createdAt: now,
    updatedAt: now,
  };

  const result = await messagesCollection.insertOne(messageDoc);
  
  return {
    id: result.insertedId.toString(),
    senderId: messageDoc.senderId,
    senderName: messageDoc.senderName,
    recipientId: messageDoc.recipientId,
    recipientName: messageDoc.recipientName,
    subject: messageDoc.subject,
    content: messageDoc.content,
    isRead: messageDoc.isRead,
    createdAt: messageDoc.createdAt.toISOString(),
    updatedAt: messageDoc.updatedAt.toISOString(),
  };
}

export async function getUserMessages(
  userId: string
): Promise<ConversationMessage[]> {
  const db = await getDb();
  const messagesCollection = db.collection<MessageDocument>("messages");

  const messages = await messagesCollection
    .find({
      $or: [{ senderId: userId }, { recipientId: userId }],
    })
    .sort({ createdAt: -1 })
    .toArray();

  return messages.map((msg) => ({
    id: msg._id!.toString(),
    senderId: msg.senderId,
    senderName: msg.senderName,
    recipientId: msg.recipientId,
    recipientName: msg.recipientName,
    subject: msg.subject,
    content: msg.content,
    isRead: msg.isRead,
    createdAt: msg.createdAt.toISOString(),
    updatedAt: msg.updatedAt.toISOString(),
  }));
}

export async function getConversation(
  userId: string,
  otherUserId: string
): Promise<ConversationMessage[]> {
  const db = await getDb();
  const messagesCollection = db.collection<MessageDocument>("messages");

  const messages = await messagesCollection
    .find({
      $or: [
        { senderId: userId, recipientId: otherUserId },
        { senderId: otherUserId, recipientId: userId },
      ],
    })
    .sort({ createdAt: 1 })
    .toArray();

  return messages.map((msg) => ({
    id: msg._id!.toString(),
    senderId: msg.senderId,
    senderName: msg.senderName,
    recipientId: msg.recipientId,
    recipientName: msg.recipientName,
    subject: msg.subject,
    content: msg.content,
    isRead: msg.isRead,
    createdAt: msg.createdAt.toISOString(),
    updatedAt: msg.updatedAt.toISOString(),
  }));
}

export async function markMessageAsRead(messageId: string): Promise<boolean> {
  const db = await getDb();
  const messagesCollection = db.collection<MessageDocument>("messages");
  const { ObjectId } = await import("mongodb");

  const result = await messagesCollection.updateOne(
    { _id: new ObjectId(messageId) },
    { 
      $set: { 
        isRead: true,
        updatedAt: new Date()
      } 
    }
  );

  return result.modifiedCount > 0;
}

export async function getUnreadCount(userId: string): Promise<number> {
  const db = await getDb();
  const messagesCollection = db.collection<MessageDocument>("messages");

  return await messagesCollection.countDocuments({
    recipientId: userId,
    isRead: false,
  });
}
