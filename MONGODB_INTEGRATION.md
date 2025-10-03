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
- `app/api/profile/route.ts` - Now uses MongoDB storage with cookie-based auth
- `app/api/characters/route.ts` - Now uses MongoDB storage with cookie-based auth
- `app/api/characters/[id]/route.ts` - Now uses MongoDB storage with cookie-based auth
- `app/api/auth/login/route.ts` - Sets secure HttpOnly userId cookie on login
- `app/api/auth/logout/route.ts` - Clears userId cookie on logout (NEW)

## Database Schema

### Users Collection
```typescript
{
  _id: ObjectId,           // MongoDB ObjectId used as userId
  email: string,           // User's email (unique)
  passwordHash: string,    // Hashed password
  name: string,            // Display name
  createdAt: Date,
  updatedAt: Date
}
```

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

### Authentication Flow

1. **User Login**:
   - User submits credentials to `/api/auth/login`
   - Server validates credentials against MongoDB `users` collection
   - On success, server sets an HttpOnly cookie named `userId` with the user's MongoDB `_id`
   - Cookie is secure (HTTPS-only in production), has 7-day expiration, and sameSite: 'lax'

2. **Authenticated Requests**:
   - API routes (characters, profile) automatically read `userId` from the cookie
   - If cookie exists, it's used to fetch user-specific data
   - Query parameter `?userId={userId}` can still be used (for backward compatibility or admin purposes)

3. **User Logout**:
   - User calls `/api/auth/logout`
   - Server clears the `userId` cookie

### API Endpoint Access

The API routes now support cookie-based authentication:
- When a user logs in via `/api/auth/login`, a secure HttpOnly cookie containing the `userId` is set
- API routes automatically read the `userId` from the cookie for authenticated requests
- **Profile API**: `GET/POST /api/profile` (uses cookie by default, or optional `?userId={userId}` query param)
- **Characters API**: `GET/POST /api/characters` (uses cookie by default, or optional `?userId={userId}` query param)
- **Character by ID**: `GET/PUT/DELETE /api/characters/{id}` (uses cookie by default, or optional `?userId={userId}` query param)

If no `userId` is found in either the cookie or query parameter, the system defaults to `"demo-user-1"` for backwards compatibility.

## Migration Notes

1. The old file-based storage systems (`lib/profile-storage.ts` and `lib/characters/store.ts`) are still present but no longer used.
2. Data from local files will NOT be automatically migrated to MongoDB.
3. Each user's profile and characters are isolated by their `userId`.

## Future Enhancements

Additional improvements to consider:
1. ✅ Add session management (cookies/JWT) - **COMPLETED**: HttpOnly cookies are now used for session management
2. ✅ Extract `userId` from authenticated session - **COMPLETED**: userId is now extracted from cookies
3. Add middleware to enforce authentication on protected routes
4. Remove the fallback to "demo-user-1" when proper auth is fully enforced
5. Add logout functionality to clear session cookies - **COMPLETED**: `/api/auth/logout` endpoint added
