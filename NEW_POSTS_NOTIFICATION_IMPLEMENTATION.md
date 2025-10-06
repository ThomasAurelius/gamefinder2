# New Posts Notification Badge Implementation

## Overview
This document describes the implementation of a notification badge that shows users how many new game posts have been created since their last login. The badge appears on the "Find Games" link in the navbar.

## Features Implemented

### 1. Last Login Tracking
- Added `lastLoginAt` field to user documents in MongoDB
- Automatically updates on each successful login
- Provides the baseline timestamp for counting new posts

### 2. New Posts Count
- Shows a red badge with the count of new game posts created since the user's last login
- Count is fetched from the database using the user's `lastLoginAt` timestamp
- Appears on both desktop and mobile menu views

## Technical Implementation

### User Schema Update (`lib/user-types.ts`)

Added `lastLoginAt` field to track when users log in:

```typescript
export type UserDocument = {
  _id?: ObjectId;
  email: string;
  passwordHash: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;  // NEW FIELD
  profile?: ProfileRecord;
};
```

### Login API Enhancement (`app/api/auth/login/route.ts`)

When a user successfully logs in, the API now updates the `lastLoginAt` timestamp:

```typescript
// Update lastLoginAt timestamp
await usersCollection.updateOne(
  { _id: user._id },
  { $set: { lastLoginAt: new Date() } }
);
```

**Behavior**:
- Updates on every successful login
- Provides accurate tracking of when users were last active
- Used as baseline for counting new posts

### Database Function (`lib/games/db.ts`)

Added `countNewGamesSinceDate` function:

```typescript
export async function countNewGamesSinceDate(sinceDate: Date): Promise<number> {
  const db = await getDb();
  const gamesCollection = db.collection<GameSessionDocument>("gameSessions");

  const count = await gamesCollection.countDocuments({
    createdAt: { $gte: sinceDate.toISOString() }
  });

  return count;
}
```

**Behavior**:
- Counts game sessions created on or after the specified date
- Uses ISO string comparison for accurate date filtering
- Returns 0 if no new posts found

### Notifications API Enhancement (`app/api/notifications/route.ts`)

**Request**: GET (requires authentication via userId cookie)

**Response**:
```json
{
  "hasIncompleteSettings": boolean,
  "unreadMessageCount": number,
  "newPostsCount": number
}
```

**Logic**:
1. Retrieves user's `lastLoginAt` from database
2. If `lastLoginAt` exists, counts posts created after that time
3. Subtracts 1 second from `lastLoginAt` to avoid counting posts from the exact login moment
4. Returns `newPostsCount` (defaults to 0 if user has never logged in or on error)

**Error Handling**:
- Gracefully handles missing `lastLoginAt` field
- Defaults to 0 count on errors
- Logs errors without breaking the API response

### Navbar Component Changes (`components/navbar.tsx`)

**New State Variable**:
- `newPostsCount`: number - tracks count of new posts since last login

**Notification Fetching**:
```typescript
const data = await response.json();
setHasIncompleteSettings(data.hasIncompleteSettings);
setUnreadMessageCount(data.unreadMessageCount);
setNewPostsCount(data.newPostsCount || 0);
```

**Badge Display (Desktop)**:
- Shows badge in the Games dropdown menu
- Appears next to "Find Games" link
- Only displays when `newPostsCount > 0`

**Badge Display (Mobile)**:
- Shows badge in the mobile menu
- Same behavior as desktop view
- Consistent visual appearance

**Visual Design**:
- Reuses existing `NotificationBadge` component
- Red circular badge with white text
- Displays the count number
- Matches the style of message notification badges

## User Experience

### Desktop View
1. User opens the "Games" dropdown menu
2. If there are new posts since last login, the "Find Games" item shows a red badge with the count
3. Badge is visible immediately when the menu opens
4. Badge remains until user logs in again (at which point the counter resets)

### Mobile View  
1. User taps the hamburger menu
2. Scrolls to the Games section
3. Badge appears next to "Find Games" item
4. Same visual appearance as desktop view

## Integration Points

### Existing Code Reused
- `NotificationBadge` component for consistent UI
- Cookie-based authentication via userId
- Existing notifications API pattern

### Database Collections Used
- `users` collection: stores `lastLoginAt` timestamp
- `gameSessions` collection: stores game posts with `createdAt` timestamps

## How It Works

### User Login Flow
1. User submits credentials to `/api/auth/login`
2. Server validates credentials
3. On success, server updates `lastLoginAt` to current timestamp
4. Server sets `userId` cookie for authenticated requests
5. User is now authenticated and baseline is set for counting new posts

### Notification Count Flow
1. User navigates through the app (pathname changes)
2. Navbar fetches notifications from `/api/notifications`
3. API retrieves user's `lastLoginAt` from database
4. API counts game posts created after `lastLoginAt`
5. Count is returned and displayed in the navbar badge

### Badge Reset Flow
1. When user logs in, `lastLoginAt` is updated to current time
2. On next page load, notification count is recalculated
3. Only posts created after the new login time are counted
4. Badge disappears if no new posts (count = 0)

## Edge Cases Handled

### First-Time Login
- If user has never logged in before (no `lastLoginAt`), count defaults to 0
- Badge won't appear until after second login when baseline is established

### No New Posts
- Badge is hidden when `newPostsCount === 0`
- Keeps navbar clean when no notifications

### API Errors
- Gracefully handles database connection errors
- Defaults to 0 count instead of breaking the UI
- Logs errors for debugging

### Time Precision
- Subtracts 1 second from `lastLoginAt` to avoid edge cases
- Ensures posts created at exact login moment are counted as "new"

## Security Considerations
- Requires authentication (userId cookie) to access notification counts
- Returns 401 if not authenticated
- Uses ObjectId validation for userId
- No sensitive data exposed in the count

## Performance Considerations
- Efficient MongoDB `countDocuments` query with date filter
- Indexed on `createdAt` field in gameSessions collection (recommended)
- Minimal overhead on notification API calls
- Count is cached on client until pathname changes

## Future Enhancements
- Add ability to mark posts as "seen" separately from login
- Show which posts are new with visual indicator on Find Games page
- Add notification preferences (enable/disable new posts notifications)
- Implement real-time updates using WebSockets or polling
- Track "new to you" instead of "new since login" for better UX
- Add admin/moderator view with flagged posts (as mentioned in original issue)

## Testing Performed
- ✅ Build successful
- ✅ Type checking passed
- ✅ No linting errors

## Files Modified
- `lib/user-types.ts` - Added lastLoginAt field
- `app/api/auth/login/route.ts` - Update lastLoginAt on login
- `lib/games/db.ts` - Added countNewGamesSinceDate function
- `app/api/notifications/route.ts` - Added newPostsCount to response
- `components/navbar.tsx` - Added badge display for new posts

## Migration Impact
- No breaking changes
- Existing users without `lastLoginAt` will see count of 0 until next login
- Field is optional, so existing user documents remain valid
- New logins automatically populate the field

## Backward Compatibility
- API remains backward compatible
- New `newPostsCount` field is added to response without breaking existing clients
- Clients ignoring the new field will continue to work
- No database migration required (field is optional)
