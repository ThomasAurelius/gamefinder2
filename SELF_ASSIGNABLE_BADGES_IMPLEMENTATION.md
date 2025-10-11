# Self-Assignable Badges Implementation

## Overview
This update extends the badge system to allow users to self-assign specific badges (like "Host" and "Players") without requiring admin intervention, while maintaining the ability to toggle visibility of any awarded badges (including "OG" badges).

## Features Implemented

### 1. Self-Assignable Badge Flag
- Badges can now be marked as "self-assignable" by admins during creation or editing
- The `isSelfAssignable` boolean field is stored in the database
- Only badges marked as self-assignable can be assigned by users themselves

### 2. User Self-Assignment
- Users can view self-assignable badges they don't currently have
- New "Available Badges" section in Settings page shows these badges
- "Assign to Me" button allows instant self-assignment
- Users cannot self-assign badges not marked as self-assignable

### 3. Badge Visibility Control
- All badges (admin-awarded or self-assigned) can have their visibility toggled
- "My Badges" section shows all user's badges with Display checkbox
- This satisfies the requirement for OG badge toggle (and any other badge)

## Changes Made

### Database Layer

#### `lib/badges/types.ts`
- Added `isSelfAssignable?: boolean` to `BadgeDocument` type

#### `lib/badges/db.ts`
- Updated `createBadge()` - accepts `isSelfAssignable` parameter
- Updated `updateBadge()` - accepts `isSelfAssignable` parameter  
- Added `selfAssignBadge()` - new function that:
  - Validates badge exists and is self-assignable
  - Checks user doesn't already have the badge
  - Assigns badge with user as both recipient and awarder

### API Layer

#### `app/api/badges/route.ts`
- `GET /api/badges` - returns `isSelfAssignable` field
- `POST /api/badges` - accepts and validates `isSelfAssignable` field
- `PUT /api/badges` - accepts and validates `isSelfAssignable` field

#### `app/api/user-badges/route.ts`
- `POST /api/user-badges` - NEW endpoint for self-assignment
  - Requires authentication
  - Validates `badgeId` parameter
  - Calls `selfAssignBadge()` function
  - Returns 400 if badge not self-assignable or already assigned

### UI Layer

#### `app/settings/page.tsx`

**Admin Features:**
- Added "Self-Assignable" checkbox in badge creation/edit form
- Checkbox appears after color field
- Defaults to `false` for new badges
- Persists value when editing existing badges

**User Features:**
1. **Available Badges Section** (new)
   - Shows self-assignable badges not yet assigned to user
   - Displays badge image, name, and description
   - "Assign to Me" button for each badge
   - Only visible if there are available self-assignable badges
   - Emerald color theme to distinguish from other sections

2. **My Badges Section** (existing)
   - Shows all badges user has been awarded (any method)
   - Display checkbox toggles visibility on profile
   - Works for admin-awarded, self-assigned, and special badges like OG

## Usage Guide

### For Admins

#### Creating Self-Assignable Badges
1. Navigate to Settings → "Admin: Badge Management"
2. Click "Create New Badge"
3. Fill in name (e.g., "Host", "Players")
4. Add description
5. Upload badge image
6. ✅ Check "Allow users to self-assign this badge"
7. Click "Save Badge"

#### Editing Existing Badges
1. Find badge in "Existing Badges" list
2. Click "Edit"
3. Toggle "Allow users to self-assign this badge" as needed
4. Click "Save Badge"

### For Users

#### Assigning Badges to Yourself
1. Navigate to Settings page
2. Scroll to "Available Badges" section (if visible)
3. Click "Assign to Me" for desired badge (e.g., Host, Players)
4. Badge immediately appears in "My Badges" section
5. Badge is displayed by default on profile

#### Managing Badge Visibility
1. Navigate to Settings page
2. Scroll to "My Badges" section
3. Check/uncheck "Display" for any badge
4. Changes save automatically
5. Unchecked badges hidden from profile and search results

**Note:** This includes the OG badge - users with OG badge can toggle it on/off as requested.

## API Endpoints

### New Endpoint

#### `POST /api/user-badges`
Self-assign a badge to the authenticated user.

**Request:**
```json
{
  "badgeId": "string"
}
```

**Response (201):**
```json
{
  "id": "string",
  "userId": "string", 
  "badgeId": "string",
  "awardedAt": "date",
  "isDisplayed": true
}
```

**Errors:**
- 401: Not authenticated
- 400: Badge not self-assignable or already assigned
- 500: Server error

### Modified Endpoints

#### `GET /api/badges`
Now includes `isSelfAssignable` field in response.

#### `POST /api/badges` (admin)
Now accepts `isSelfAssignable` boolean field.

#### `PUT /api/badges` (admin)
Now accepts `isSelfAssignable` boolean field.

## Database Schema Update

### `badges` Collection
```typescript
{
  _id: ObjectId,
  name: string,
  description: string,
  imageUrl: string,
  color?: string,
  createdAt: Date,
  updatedAt: Date,
  createdBy: string,
  isSelfAssignable?: boolean  // NEW FIELD
}
```

**Note:** Existing badges without this field default to `false` (not self-assignable).

## Security Considerations

- ✅ Self-assignment requires authentication
- ✅ Only badges explicitly marked as self-assignable can be self-assigned
- ✅ Server validates badge properties before allowing self-assignment
- ✅ Users cannot self-assign badges multiple times
- ✅ Admin-only badges (OG, special achievements) cannot be self-assigned
- ✅ Only admins can mark badges as self-assignable

## Testing Recommendations

### Admin Testing
1. Create a badge without "Self-Assignable" checked → Should not appear in user's Available Badges
2. Create a badge with "Self-Assignable" checked → Should appear in user's Available Badges
3. Edit existing badge to toggle self-assignable → Should update availability
4. Delete a self-assignable badge → Should remove from all users

### User Testing
1. Self-assign a badge → Should appear in My Badges
2. Try to assign same badge twice → Should show error message
3. Toggle display on self-assigned badge → Should update visibility
4. Toggle display on admin-awarded badge → Should update visibility
5. Toggle display on OG badge → Should update visibility
6. Reload page → Assigned badges should persist

### API Testing
```bash
# Self-assign badge (requires auth cookie)
curl -X POST http://localhost:3000/api/user-badges \
  -H "Content-Type: application/json" \
  -d '{"badgeId": "BADGE_ID_HERE"}'

# Try to self-assign non-self-assignable badge
# Should return 400 error

# Get all badges (check isSelfAssignable field)
curl http://localhost:3000/api/badges
```

## Migration Notes

**No database migration required.**

Existing badges will continue to work without the `isSelfAssignable` field:
- Field defaults to `undefined` in existing documents
- Logic treats `undefined` as `false` (not self-assignable)
- Admins can edit existing badges to add self-assignable flag if desired

## Future Enhancements

Potential improvements:
- Badge assignment history (who assigned, when)
- Limit self-assignable badges per user (e.g., max 1 role badge)
- Badge prerequisites (must have X to assign Y)
- Bulk badge assignment for admin
- Badge expiration/renewal for time-limited roles
- Badge analytics (how many users have each badge)
