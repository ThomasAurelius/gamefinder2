import { MongoClient, type Db } from "mongodb";

type MongoCache = {
  client: MongoClient | null;
  promise: Promise<MongoClient> | null;
};

const globalForMongo = globalThis as typeof globalThis & {
  __mongoCache?: MongoCache;
};

function getMongoCache(): MongoCache {
  if (!globalForMongo.__mongoCache) {
    globalForMongo.__mongoCache = { client: null, promise: null };
  }

  return globalForMongo.__mongoCache;
}

function resolveMongoUri(): string {
  const uri = process.env.MONGODB_URI;

  if (uri && uri.trim().length > 0) {
    return uri;
  }

  throw new Error("MongoDB connection details are not configured. Set MONGODB_URI.");
}

async function getClient(): Promise<MongoClient> {
  const cache = getMongoCache();

  if (cache.client) {
    return cache.client;
  }

  if (!cache.promise) {
    const uri = resolveMongoUri();
    const client = new MongoClient(uri, {
      serverSelectionTimeoutMS: 5000, // 5 second timeout for server selection
      connectTimeoutMS: 10000, // 10 second timeout for initial connection
      socketTimeoutMS: 45000, // 45 second timeout for socket operations
    });
    cache.promise = client.connect().then((connectedClient) => {
      cache.client = connectedClient;
      return connectedClient;
    });
  }

  cache.client = await cache.promise;
  return cache.client;
}

export async function getDb(): Promise<Db> {
  const dbName = process.env.MONGODB_DB ?? "gamefinder";
  const mongoClient = await getClient();
  return mongoClient.db(dbName);
}
