# MongoDB Integration for Profiles and Characters

## Overview

This document explains the MongoDB integration for storing user profiles and characters.

## Changes Made

### 1. Profile Storage
- **Old System**: Profiles were stored in local files (`data/profile.json`)
- **New System**: Profiles are stored in MongoDB `profiles` collection
- **File**: `lib/profile-db.ts` (new MongoDB implementation)

### 2. Character Storage
- **Old System**: Characters were stored in local files (`data/characters.json`)
- **New System**: Characters are stored in MongoDB `characters` collection
- **File**: `lib/characters/db.ts` (new MongoDB implementation)

### 3. API Routes Updated
- `app/api/profile/route.ts` - Now uses MongoDB storage
- `app/api/characters/route.ts` - Now uses MongoDB storage
- `app/api/characters/[id]/route.ts` - Now uses MongoDB storage

## Database Schema

### Profiles Collection
```typescript
{
  _id: ObjectId,
  userId: string,           // User identifier
  name: string,
  commonName: string,
  location: string,
  zipCode: string,
  bio: string,
  games: string[],
  favoriteGames: string[],
  availability: {
    Monday: string[],
    Tuesday: string[],
    // ... other days
  },
  primaryRole: string,
  createdAt: Date,
  updatedAt: Date
}
```

### Characters Collection
```typescript
{
  _id: ObjectId,
  id: string,               // UUID for the character
  userId: string,           // User identifier
  system: "dnd" | "pathfinder" | "starfinder" | "other",
  name: string,
  campaign: string,
  notes: string,
  stats: [{ name: string, value: string }],
  skills: [{ name: string, value: string }],
  createdAt: string,        // ISO timestamp
  updatedAt: string         // ISO timestamp
}
```

## User Identification

The API routes accept an optional `userId` query parameter:
- **Profile API**: `GET/POST /api/profile?userId={userId}`
- **Characters API**: `GET/POST /api/characters?userId={userId}`
- **Character by ID**: `GET/PUT/DELETE /api/characters/{id}?userId={userId}`

If no `userId` is provided, the system defaults to `"demo-user-1"` for backwards compatibility.

## Configuration Notes

- By default the driver will build a connection string using the standard `mongodb://` protocol when only `MONGODB_HOST`/`MONGODB_PORT` are supplied. Set `MONGODB_PROTOCOL` (or `MONGO_PROTOCOL`) to override the protocol, for example to `mongodb+srv` when connecting to Atlas clusters.

## Migration Notes

1. The old file-based storage systems (`lib/profile-storage.ts` and `lib/characters/store.ts`) are still present but no longer used.
2. Data from local files will NOT be automatically migrated to MongoDB.
3. Each user's profile and characters are isolated by their `userId`.

## Future Enhancements

To fully integrate with user authentication:
1. Add session management (cookies/JWT)
2. Extract `userId` from authenticated session instead of query parameters
3. Add middleware to enforce authentication on protected routes
4. Remove the fallback to "demo-user-1" when proper auth is in place
