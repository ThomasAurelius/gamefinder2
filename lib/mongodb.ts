import { MongoClient, type Db, type MongoClientOptions } from "mongodb";

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
  const uri =
    process.env.MONGODB_URI ??
    process.env.MONGODB_URL ??
    process.env.MONGO_URI ??
    process.env.MONGO_URL ??
    process.env.DATABASE_URL;

  if (uri && uri.trim().length > 0) {
    return uri;
  }

  const hostValue = process.env.MONGODB_HOST ?? process.env.MONGO_HOST;

  if (!hostValue || hostValue.trim().length === 0) {
    throw new Error(
      "MongoDB connection details are not configured. Set MONGODB_URI or provide MONGODB_HOST.",
    );
  }

  const host = hostValue.trim();

  if (host.includes("://")) {
    return host;
  }

  const protocolInput = process.env.MONGODB_PROTOCOL ?? process.env.MONGO_PROTOCOL;
  const protocol = protocolInput ? protocolInput.replace(/:\/\//, "") : "mongodb";

  const port = process.env.MONGODB_PORT ?? process.env.MONGO_PORT;
  const needsPort = Boolean(port) && !host.includes(":") && !host.endsWith("]");
  const authority = needsPort ? `${host}:${port}` : host;

  return `${protocol}://${authority}`;
}

function resolveMongoOptions(): MongoClientOptions | undefined {
  const username = process.env.MONGODB_USERNAME ?? process.env.MONGODB_USER;
  const password = process.env.MONGODB_PASSWORD;
  const authSource = process.env.MONGODB_AUTH_SOURCE ?? process.env.MONGO_AUTH_SOURCE;
  const appName = process.env.MONGODB_APP_NAME ?? process.env.MONGODB_APPNAME;

  const options: MongoClientOptions = {};

  if (username || password) {
    if (!username || password === undefined) {
      throw new Error(
        "Incomplete MongoDB credentials. Provide both MONGODB_USERNAME (or MONGODB_USER) and MONGODB_PASSWORD.",
      );
    }

    options.auth = {
      username,
      password,
    };
  }

  if (authSource) {
    options.authSource = authSource;
  }

  if (appName) {
    options.appName = appName;
  }

  return Object.keys(options).length > 0 ? options : undefined;
}

async function getClient(): Promise<MongoClient> {
  const cache = getMongoCache();

  if (cache.client) {
    return cache.client;
  }

  if (!cache.promise) {
    const uri = resolveMongoUri();
    const options = resolveMongoOptions();
    const client = new MongoClient(uri, options);
    cache.promise = client.connect().then((connectedClient) => {
      cache.client = connectedClient;
      return connectedClient;
    });
  }

  cache.client = await cache.promise;
  return cache.client;
}

export async function getDb(): Promise<Db> {
  const dbName = process.env.MONGODB_DB ?? process.env.MONGO_DB ?? "gamefinder";
  const mongoClient = await getClient();
  return mongoClient.db(dbName);
}
