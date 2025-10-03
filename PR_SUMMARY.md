# Fix: Profile and Character MongoDB Persistence

## Problem
Profile and Character data were being stored in local files instead of MongoDB database. Only user authentication data was being persisted to MongoDB.

## Solution
Migrated profile and character storage from file-based system to MongoDB:

### Changes Made

1. **Created MongoDB Storage Modules**
   - `lib/profile-db.ts` - MongoDB implementation for profile storage
   - `lib/characters/db.ts` - MongoDB implementation for character storage

2. **Updated API Routes**
   - Modified `/api/profile` to use MongoDB storage
   - Modified `/api/characters` to use MongoDB storage  
   - Modified `/api/characters/[id]` to use MongoDB storage

3. **Key Features**
   - Profiles stored in `profiles` collection with userId association
   - Characters stored in `characters` collection with userId association
   - Supports optional `userId` query parameter (defaults to "demo-user-1")
   - Backward compatible with existing API interface
   - Uses MongoDB upsert for profile updates
   - Maintains data isolation per user

### Database Collections

**Profiles Collection:**
- Stores user profile data (name, bio, games, availability, etc.)
- Uses `userId` for user association
- Includes `createdAt` and `updatedAt` timestamps

**Characters Collection:**
- Stores character sheets with stats and skills
- Uses `userId` for user association  
- Each character has unique UUID (`id` field)
- Supports multiple game systems (D&D, Pathfinder, etc.)

### API Changes

The API routes now accept an optional `userId` query parameter:

```
GET  /api/profile?userId={userId}
POST /api/profile?userId={userId}
GET  /api/characters?userId={userId}
POST /api/characters?userId={userId}
GET  /api/characters/{id}?userId={userId}
PUT  /api/characters/{id}?userId={userId}
DELETE /api/characters/{id}?userId={userId}
```

If `userId` is not provided, it defaults to `"demo-user-1"` for backward compatibility.

## Testing

The changes have been:
- ✅ Linted successfully
- ✅ Built successfully  
- ✅ Type-checked successfully

## Migration Notes

- Old file-based storage (`lib/profile-storage.ts` and `lib/characters/store.ts`) remain but are unused
- Existing file data will NOT be automatically migrated
- Each user's data is isolated by their `userId` in MongoDB

## Future Improvements

For complete integration with authentication:
1. Add session management to extract userId from authenticated session
2. Remove fallback to "demo-user-1" 
3. Add authentication middleware to protect routes
4. Consider migrating existing file data to MongoDB if needed
