# Dashboard Upcoming Games Feature

## Overview
Implemented the dashboard feature to list upcoming game sessions that the user is hosting, playing in, or waitlisted for. The implementation follows the same design patterns as the Find Games page.

## Changes Made

### 1. New Database Function: `listUserGameSessions`
**File**: `lib/games/db.ts`

- Added `listUserGameSessions(userId)` function to fetch games where user is involved
- Queries sessions where user is:
  - The host (`userId` field)
  - A signed-up player (`signedUpPlayers` array)
  - On the waitlist (`waitlist` array)
- Sorts results by date (ascending) and creation time (descending)

### 2. New API Endpoint: `/api/games/my-games`
**File**: `app/api/games/my-games/route.ts`

- GET endpoint that returns the authenticated user's game sessions
- Requires authentication via `userId` cookie
- Returns 401 if user is not authenticated
- Returns array of game sessions where user is involved

### 3. Updated Dashboard Page
**File**: `app/dashboard/page.tsx`

- Converted from server component to client component
- Fetches user's game sessions from `/api/games/my-games` API
- Displays games in cards similar to Find Games page
- Added role badges to show user's relationship to each game:
  - **Purple badge "Hosting"**: User is the game host
  - **Green badge "Playing"**: User is a signed-up player
  - **Yellow badge "Waitlisted"**: User is on the waitlist
- Shows empty state with "Find Games" button when user has no games
- Displays game details including:
  - Game name (clickable link to detail page)
  - Date (formatted in user's timezone)
  - Time slots
  - Player count with availability indicator
  - Waitlist count (if applicable)
  - Game description

## Features

### User Role Indicators
Each game card shows the user's role with a color-coded badge:
- Purple for hosting
- Green for playing
- Yellow for waitlisted

### Consistent Design
- Reuses styling patterns from Find Games page
- Maintains consistent card layout and colors
- Follows the same dark theme and spacing

### Timezone Support
- Respects user's timezone settings
- Formats dates using `formatDateInTimezone()` utility

### Empty State
- Shows helpful message when user has no games
- Provides direct link to Find Games page

## Testing

The implementation has been:
- ✅ Built successfully with Next.js
- ✅ Linted successfully
- ✅ Type-checked successfully with TypeScript
- ✅ Manually tested with screenshots

## Screenshots

### Dashboard - No Games (Not Authenticated)
![Dashboard Empty State](https://github.com/user-attachments/assets/28b50d65-e997-4913-953c-6018f8585dfb)

Shows the empty state with "Find Games" call-to-action button.

### Find Games Page (For Comparison)
![Find Games Page](https://github.com/user-attachments/assets/21d1befd-f77c-4a05-8181-2424615e6c18)

The dashboard uses similar card styling to maintain consistency across the app.

## Integration with Existing System

This implementation:
1. **Uses existing authentication**: Leverages cookie-based userId authentication
2. **Follows existing patterns**: Matches the style and structure of Find Games page
3. **Reuses utilities**: Uses `formatDateInTimezone` and `DEFAULT_TIMEZONE` from lib/timezone
4. **Maintains consistency**: Uses the same GameSession type definition
5. **Follows API conventions**: Matches the pattern of other authenticated endpoints

## Future Enhancements

Potential improvements to consider:
- Add filtering/sorting options for user's games
- Add quick actions (leave game, edit game for hosts)
- Show past games in a separate section
- Add notifications for game updates
- Display game session status (confirmed, pending, etc.)
