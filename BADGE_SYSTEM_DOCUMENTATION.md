# Badge System Implementation

## Overview
The badge system allows administrators to create, manage, and award badges to users. Users can then control which badges are displayed on their profile and in search results.

## Features

### Admin Features
1. **Badge Management** (Settings page)
   - Create new badges with name, description, image, and optional color
   - Edit existing badges
   - Delete badges (removes from all users)
   - Upload badge images (recommended: square, 64x64 to 256x256 pixels)

2. **Badge Awarding** (Settings page)
   - Search for users by username
   - Award badges to specific users
   - Remove badges from users

### User Features
1. **Badge Display Control** (Settings page)
   - View all badges awarded to them
   - Toggle visibility of each badge
   - Badges set to "Display" will appear on profile and in search results

### Public Display
1. **User Profiles** (`/user/[userId]`)
   - Displayed badges appear next to user's name
   - Hover over badges to see their name

2. **Player Search** (`/players`)
   - Displayed badges appear next to each player's name in search results
   - Helps identify special roles or achievements

## Database Schema

### Collections

#### `badges`
- `_id`: ObjectId (auto-generated)
- `name`: string - Display name of the badge
- `description`: string - Description of what the badge represents
- `imageUrl`: string - URL to badge icon/image
- `color`: string (optional) - Hex color code for badge border
- `createdAt`: Date - Creation timestamp
- `updatedAt`: Date - Last update timestamp
- `createdBy`: string - Admin user ID who created the badge

#### `userBadges`
- `_id`: ObjectId (auto-generated)
- `userId`: string - User who received the badge
- `badgeId`: string - Badge ID
- `awardedAt`: Date - When the badge was awarded
- `awardedBy`: string - Admin user ID who awarded the badge
- `isDisplayed`: boolean - Whether the user wants to display this badge

## API Endpoints

### Badge Management (Admin Only)

#### `GET /api/badges`
Get all badges (public endpoint)
- **Response**: Array of badge objects

#### `POST /api/badges`
Create a new badge (admin only)
- **Body**: `{ name, description, imageUrl, color? }`
- **Response**: Created badge object

#### `PUT /api/badges`
Update a badge (admin only)
- **Body**: `{ id, name, description, imageUrl, color? }`
- **Response**: Success message

#### `DELETE /api/badges?id={badgeId}`
Delete a badge (admin only)
- **Response**: Success message

### User Badge Management (Admin Only)

#### `POST /api/admin/user-badges`
Award a badge to a user (admin only)
- **Body**: `{ userId, badgeId }`
- **Response**: User badge assignment object

#### `DELETE /api/admin/user-badges?userId={userId}&badgeId={badgeId}`
Remove a badge from a user (admin only)
- **Response**: Success message

#### `GET /api/admin/user-badges?badgeId={badgeId}`
Get all users who have a specific badge (admin only)
- **Response**: `{ userIds: string[] }`

### User Badge Preferences

#### `GET /api/user-badges?userId={userId}`
Get all badges for a user (authenticated)
- **Response**: Array of user badges with badge details

#### `PUT /api/user-badges`
Update badge display preference (authenticated)
- **Body**: `{ badgeId, isDisplayed }`
- **Response**: Success message

### User Search

#### `GET /api/public/users/search?username={username}`
Search for a user by username (for badge awarding)
- **Response**: `{ userId, name, commonName }`

## Implementation Details

### Files Created/Modified

#### New Files
- `lib/badges/types.ts` - Badge type definitions
- `lib/badges/db.ts` - Database operations for badges
- `app/api/badges/route.ts` - Badge CRUD API endpoints
- `app/api/admin/user-badges/route.ts` - Badge awarding API
- `app/api/user-badges/route.ts` - User badge preferences API
- `app/api/public/users/search/route.ts` - User search API
- `components/Badge.tsx` - Badge display component

#### Modified Files
- `app/settings/page.tsx` - Added badge management and user badge selection UI
- `app/user/[userId]/page.tsx` - Added badge display to user profiles
- `app/players/page.tsx` - Added badge display to player search results
- `app/api/players/route.ts` - Added badge fetching to player search API

## Usage Guide

### For Admins

#### Creating a Badge
1. Navigate to Settings page
2. Scroll to "Admin: Badge Management" section
3. Click "Create New Badge"
4. Fill in name, description, and optional color
5. Upload a badge image (recommended: square, 64x64 to 256x256 pixels)
6. Click "Save Badge"

#### Awarding a Badge
1. Navigate to Settings page
2. Scroll to "Award Badge to User" section
3. Enter the username to search
4. Click "Search"
5. Click "Award" next to the badge you want to give

#### Editing/Deleting Badges
1. Navigate to Settings page
2. Scroll to "Existing Badges" list
3. Click "Edit" to modify a badge or "Delete" to remove it
4. Note: Deleting a badge removes it from all users

### For Users

#### Managing Badge Display
1. Navigate to Settings page
2. Scroll to "My Badges" section
3. Check/uncheck "Display" for each badge
4. Changes are saved immediately
5. Only checked badges will appear on your profile and in search results

## Component API

### Badge Component
```tsx
import Badge from "@/components/Badge";

<Badge
  name="Badge Name"           // Required: Badge name for tooltip
  imageUrl="/badge.png"       // Required: Badge image URL
  size="sm" | "md" | "lg"    // Optional: Badge size (default: "md")
  showTooltip={true}         // Optional: Show name on hover (default: true)
/>
```

### Sizes
- `sm`: 20x20 pixels (h-5 w-5)
- `md`: 24x24 pixels (h-6 w-6)
- `lg`: 32x32 pixels (h-8 w-8)

## Security Considerations

- All badge management endpoints require admin authentication
- Badge awarding requires admin authentication
- User badge preference updates require authentication
- Badge display respects user privacy settings
- Badge images are validated on upload (type and size)

## Future Enhancements

Potential future improvements:
- Badge categories or types
- Badge rarity levels
- Automatic badge awarding based on achievements
- Badge statistics (how many users have each badge)
- Badge history/timeline for users
- Bulk badge awarding
- Badge templates library
