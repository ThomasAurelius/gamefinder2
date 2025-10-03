# Fix: Profile and Character MongoDB Persistence

## Problem
Profile data was being stored in a separate `profiles` collection instead of being embedded within user documents in the `users` collection.

## Solution
Migrated profile storage to be embedded within user documents in the `users` collection:

### Changes Made

1. **Created Shared User Type**
   - `lib/user-types.ts` - Centralized UserDocument type definition with optional profile field

2. **Updated Profile Storage**
   - Modified `lib/profile-db.ts` to read/write profiles from the `users` collection
   - Profile data is now stored as an embedded object in the user document

3. **Updated Registration**
   - Modified `/api/auth/register` to initialize empty profile when creating new users
   - Uses shared UserDocument type for consistency

4. **Key Features**
   - Profiles stored as embedded objects in `users` collection
   - Handles both ObjectId (authenticated users) and string IDs (demo users)
   - Backward compatible with existing API interface
   - Profile is initialized on user registration
   - Maintains data isolation per user

### Database Collections

**Users Collection:**
- Stores user authentication data (email, passwordHash, name)
- Now includes embedded `profile` object with user profile data
- Profile fields: name, commonName, location, zipCode, bio, games, favoriteGames, availability, primaryRole
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

- Old `profiles` collection is no longer used
- Profile data is now embedded in user documents
- Existing profile data in the `profiles` collection will NOT be automatically migrated
- Each user's data is isolated by their `userId` in MongoDB

## Future Improvements

For complete integration with authentication:
1. Add session management to extract userId from authenticated session
2. Remove fallback to "demo-user-1" 
3. Add authentication middleware to protect routes
4. Consider migrating existing file data to MongoDB if needed
