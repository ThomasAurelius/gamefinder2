# Notification Badges Implementation

## Overview
This document describes the implementation of notification badges for the Settings and Messages menu items in the navbar.

## Features Implemented

### 1. Profile Notification Badge
- Shows a red circle on the Profile menu item when required profile settings are incomplete
- Required fields: commonName, location, zipCode, bio, availability, games, primaryRole
- Appears on both desktop and mobile menu views

### 2. Messages Notification Badge  
- Shows a red badge with the count of unread messages
- Count is fetched from the database using the existing `getUnreadCount` function
- Appears on both desktop and mobile menu views

## Technical Implementation

### API Endpoint: `/api/notifications`

**Request**: GET (requires authentication via userId cookie)

**Response**:
```json
{
  "hasIncompleteSettings": boolean,
  "unreadMessageCount": number
}
```

**Error Responses**:
- 401: Authentication required
- 500: Internal server error

### Navbar Component Changes

**New State Variables**:
- `hasIncompleteSettings`: boolean - tracks if profile settings are incomplete
- `unreadMessageCount`: number - tracks unread message count

**New Component**:
```tsx
function NotificationBadge({ count }: { count?: number }) {
  return (
    <span className="ml-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1.5 text-xs font-medium text-white">
      {count !== undefined ? count : ""}
    </span>
  );
}
```

**Notification Fetching**:
- Triggered when user is authenticated
- Refetches on pathname change to keep notifications up-to-date
- Handles errors gracefully without breaking the UI

### Visual Design

**Badge Styling**:
- Background: `bg-red-600` (red)
- Color: `text-white`
- Shape: `rounded-full` (circular)
- Size: `h-5 min-w-5` (20px minimum)
- Font: `text-xs font-medium` (12px, medium weight)
- Spacing: `ml-1.5 px-1.5` (margin and padding for proper spacing)

**Menu Item Layout**:
- Changed from `block` to `flex items-center justify-between`
- Label wrapped in `<span>` for proper layout
- Badge appears on the right side

## User Experience

### Desktop View
1. User opens the "Account" dropdown menu
2. If there are unread messages, the Messages item shows a badge with the count
3. If profile settings are incomplete, the Profile item shows a red circle
4. Badges are visible immediately when the menu opens

### Mobile View  
1. User taps the hamburger menu
2. Scrolls to the Account section
3. Badges appear next to Messages and Profile items
4. Same visual appearance as desktop view

## Integration Points

### Existing Code Reused
- `getUnreadCount(userId)` from `lib/messages.ts`
- `readProfile(userId)` from `lib/profile-db.ts`
- Authentication check via userId cookie

### Profile Fields Checked
From `ProfileRecord` type in `lib/profile-db.ts`:
- `commonName`: Display name
- `location`: Location
- `zipCode`: Zip code
- `bio`: Biography
- `availability`: Weekly availability schedule
- `games`: Selected games
- `primaryRole`: Primary role preference

## Testing

### Manual Testing Steps
1. Log in with a user that has incomplete profile settings
2. Verify red circle appears on Profile menu item
3. Complete profile settings
4. Verify red circle disappears
5. Send yourself a message
6. Verify badge with count appears on Messages menu item
7. Mark message as read
8. Verify badge updates or disappears
9. Test both desktop and mobile views

### Build & Lint
- `npm run lint`: Passes (only pre-existing warnings)
- `npm run build`: Successful
- All TypeScript types properly defined

## Future Enhancements

Potential improvements that could be added later:
- Real-time updates using WebSockets or polling
- Animation when badge count changes
- Different colors for different notification types
- Toast notifications when new messages arrive
- Badge on the Account button itself (showing total notification count)
