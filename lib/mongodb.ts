import { MongoClient, type Db } from "mongodb";

let client: MongoClient | null = null;
let clientPromise: Promise<MongoClient> | null = null;

async function getClient(): Promise<MongoClient> {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error("MONGODB_URI is not defined in the environment");
  }

  if (client) {
    return client;
  }

  if (!clientPromise) {
    client = new MongoClient(uri);
    clientPromise = client.connect();
  }

  client = await clientPromise;
  return client;
}

export async function getDb(): Promise<Db> {
  const dbName = process.env.MONGODB_DB ?? "gamefinder";
  const mongoClient = await getClient();
  return mongoClient.db(dbName);
}
