# Player ID Clarification

## Issue #83: ID Location in Data Structure

This document clarifies how player IDs are used in the application, specifically addressing the issue that **the player ID is in the `users` object, not in the `users.profile` object**.

## Database Schema

The MongoDB `users` collection has the following structure:

```javascript
{
  _id: ObjectId("..."),        // ← This is the player ID used in /players/[id]
  name: "User Name",
  email: "user@example.com",
  profile: {                   // ← Profile is a subdocument
    name: "Display Name",
    commonName: "Nickname",
    location: "City, State",
    bio: "About me...",
    games: ["Game 1", "Game 2"],
    favoriteGames: ["Favorite Game"],
    primaryRole: "Healer",
    availability: {...},
    timezone: "America/New_York",
    avatarUrl: "https://..."
    // Note: There is NO id field in the profile subdocument
  }
}
```

## How Player IDs Work

### 1. Players List API (`/api/players`)

The API returns player search results with the `id` field set to the user document's `_id`:

```typescript
const players: PlayerSearchResult[] = users.map((user) => ({
  // ID is from the users collection _id, not from the profile subdocument
  id: user._id.toString(),
  name: user.profile?.name || user.name || "Unknown Player",
  // ... other fields from profile subdocument
}));
```

### 2. Player Detail Page (`/players/[id]`)

The dynamic route receives the user's `_id` as the `id` parameter:

```typescript
const { id } = await params;  // This is users._id, not profile.id

// Validate and query using this ID
if (!ObjectId.isValid(id)) {
  notFound();
}
const profile = await readProfile(id);
```

### 3. Profile Database Function

The `readProfile` function queries the users collection by `_id`:

```typescript
export async function readProfile(userId: string): Promise<ProfileRecord> {
  // userId is the user document's _id from the users collection
  const user = await usersCollection.findOne({ _id: new ObjectId(userId) });
  
  // Returns the profile subdocument data (without the user's _id)
  return user.profile;
}
```

## Key Points

1. **Player ID = User Document `_id`**: The ID used in `/players/[id]` URLs is always the MongoDB `_id` of the user document in the `users` collection.

2. **Profile Has No ID**: The `ProfileRecord` type and the `profile` subdocument do NOT contain an `id` field. The profile is identified by its parent user document's `_id`.

3. **Correct Flow**:
   - Players API returns `id: user._id.toString()`
   - Player detail page receives this ID as a URL parameter
   - `readProfile(id)` queries `{ _id: new ObjectId(id) }` to find the user
   - The function returns the `profile` subdocument data

4. **Why This Design?**: 
   - The profile is a subdocument of the user, not a separate collection
   - Having the ID at the user document level (not in the profile) is MongoDB best practice
   - This prevents duplication and ensures referential integrity

## Related Code

- `/app/api/players/route.ts` - Returns player IDs from `user._id`
- `/app/players/[id]/page.tsx` - Receives user `_id` as route parameter
- `/lib/profile-db.ts` - Queries users by `_id`, returns profile subdocument
- `/lib/users.ts` - Helper functions that also use user document `_id`

## Migration Notes

If you need to work with player IDs in the future:

- ✅ **DO**: Use `user._id` when querying or referencing users
- ✅ **DO**: Pass user `_id` in URLs like `/players/[id]`
- ✅ **DO**: Query `{ _id: new ObjectId(userId) }` to find users
- ❌ **DON'T**: Look for an `id` field in the `profile` subdocument
- ❌ **DON'T**: Store duplicate IDs in the profile object
- ❌ **DON'T**: Assume `ProfileRecord` type includes an `id` field
