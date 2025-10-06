# Admin Role Feature

This document describes the admin role functionality implemented in the application.

## Overview

The admin role allows designated users to:
1. Edit or delete any game session (not just their own)
2. Hide or show user profiles
3. Manage site-wide announcements

## Making a User an Admin

Admins are designated by setting the `isAdmin` field to `true` in the user's document in MongoDB.

To make a user an admin, you need to manually update their document in the MongoDB `users` collection:

```javascript
db.users.updateOne(
  { email: "admin@example.com" },
  { $set: { isAdmin: true } }
)
```

**Note:** There is no UI for setting admin status - it must be done directly in the database for security purposes.

## Admin Features

### 1. Game Session Management

Admins can edit or delete any game session, regardless of who created it.

**How it works:**
- When an admin views a game session, they see the same Edit/Delete buttons as the owner
- The API routes (`/api/games/[id]`) check if the user is an admin
- If admin, they bypass the ownership check

**Implementation:**
- `app/api/games/[id]/route.ts` - Updated PUT and DELETE methods
- Uses `isAdmin()` function from `lib/admin.ts`

### 2. Profile Visibility Management

Admins can hide user profiles from search results.

**How it works:**
- When viewing a player's profile page (`/players/[id]`), admins see an "Admin Controls" section
- Clicking "Hide Profile" will prevent the profile from appearing in search results
- The user can still access the site, but their profile won't be discoverable

**API Endpoints:**
- `POST /api/admin/profiles` - Hide or show a user profile
  ```json
  {
    "targetUserId": "507f1f77bcf86cd799439011",
    "isHidden": true
  }
  ```

**Implementation:**
- `components/ProfileAdminControls.tsx` - UI component for hiding/showing profiles
- `app/api/admin/profiles/route.ts` - API endpoint
- `app/api/players/route.ts` - Updated to filter out hidden profiles

### 3. Site-Wide Announcements

Admins can create announcements that appear as a popup on the homepage.

**How it works:**
- Admin goes to Settings page (`/settings`)
- If they are an admin, they see an "Admin: Site Announcement" section
- They can:
  - Toggle the announcement on/off
  - Edit the announcement message
  - Save changes
- When active, users see the announcement as a popup when they first visit the homepage
- The popup only shows once per announcement update (tracked via localStorage)

**API Endpoints:**
- `GET /api/announcements` - Get the active announcement (public)
- `POST /api/announcements` - Create/update announcement (admin only)
  ```json
  {
    "message": "Welcome to the new site!",
    "isActive": true
  }
  ```

**Implementation:**
- `app/settings/page.tsx` - Admin UI for managing announcements
- `components/AnnouncementPopup.tsx` - Popup component
- `app/page.tsx` - Homepage with announcement popup
- `app/api/announcements/route.ts` - API endpoint
- `lib/announcements/` - Database operations and types

## Database Schema Changes

### Users Collection

Added two new optional fields:

```typescript
{
  // ... existing fields ...
  isAdmin?: boolean;      // true if user is an admin
  isHidden?: boolean;     // true if profile is hidden by admin
}
```

### Announcements Collection (New)

```typescript
{
  _id: ObjectId;
  message: string;        // Announcement text
  isActive: boolean;      // Whether announcement is shown
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;      // userId of admin who created it
}
```

## API Endpoints Summary

### Admin Status
- `GET /api/admin/status` - Check if current user is admin (returns `{ isAdmin: boolean }`)

### Profile Management
- `POST /api/admin/profiles` - Hide/show user profiles (admin only)

### Announcements
- `GET /api/announcements` - Get active announcement (public)
- `POST /api/announcements` - Create/update announcement (admin only)

### Game Sessions
- `PUT /api/games/[id]` - Edit game session (owner or admin)
- `DELETE /api/games/[id]` - Delete game session (owner or admin)

## Security Considerations

1. **Admin Status:** Can only be set directly in the database, not through any API
2. **Authentication:** All admin operations require authentication (userId cookie)
3. **Authorization:** Admin-only endpoints verify admin status before allowing operations
4. **Ownership Preservation:** When admins edit game sessions, the original owner is maintained

## Testing the Feature

### Manual Testing Checklist

1. **Set up an admin user:**
   ```javascript
   db.users.updateOne(
     { email: "your@email.com" },
     { $set: { isAdmin: true } }
   )
   ```

2. **Test game management:**
   - Create a game session with a non-admin user
   - Log in as admin
   - Navigate to the game session
   - Verify you can edit/delete it

3. **Test profile hiding:**
   - Log in as admin
   - Navigate to a user's profile page (`/players/[id]`)
   - Verify "Admin Controls" section appears
   - Click "Hide Profile"
   - Search for the user in player search
   - Verify they don't appear in results

4. **Test announcements:**
   - Log in as admin
   - Navigate to Settings page
   - Verify "Admin: Site Announcement" section appears
   - Create an announcement and mark it as active
   - Save
   - Log out or open in incognito window
   - Visit homepage
   - Verify announcement popup appears

## Future Enhancements

Possible improvements:
1. Admin dashboard showing all users and their status
2. Ability to ban users (prevent login)
3. Content moderation queue for reported profiles/games
4. Audit log for admin actions
5. Multiple admin roles (super admin, moderator, etc.)
6. Email notifications to users when their profile is hidden
