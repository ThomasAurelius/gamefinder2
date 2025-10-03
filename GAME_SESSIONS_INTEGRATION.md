# Game Sessions Database Integration

## Overview

This document explains the implementation of game sessions database persistence, enabling users to post game sessions to MongoDB and search/find those sessions.

## Problem Solved

Previously, the "Post a Game" page (`/app/post`) only saved game session data to local state with a TODO comment to implement actual submission logic. Game sessions were not persisted to the database, so users could not find or view posted games.

## Solution

Implemented a complete database-backed game sessions feature following the existing patterns used for profiles and characters in this repository.

## Changes Made

### 1. Game Session Types (`lib/games/types.ts`)

Created TypeScript type definitions for game sessions:

```typescript
export type GameSessionPayload = {
  game: string;
  date: string;
  times: string[];
  description: string;
};

export type StoredGameSession = GameSessionPayload & {
  id: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
};
```

### 2. Database Operations (`lib/games/db.ts`)

Created MongoDB operations for game sessions:

- **`listGameSessions(filters?)`** - Query sessions with optional filters:
  - `game`: Filter by specific game name
  - `date`: Filter by specific date
  - `times`: Filter by time slots (finds sessions with at least one matching time)
  - Sorts results by date ascending, then creation time descending

- **`getGameSession(id)`** - Fetch a single session by its unique ID

- **`createGameSession(userId, payload)`** - Create a new game session:
  - Generates a unique UUID for the session
  - Associates session with the authenticated user
  - Stores timestamps for creation and updates

- **`deleteGameSession(userId, id)`** - Delete a session (requires ownership)

### 3. API Endpoints (`app/api/games/route.ts`)

Created REST API endpoints for game sessions:

- **`GET /api/games`** - Search game sessions
  - Query parameters: `game`, `date`, `times` (comma-separated)
  - Returns array of matching sessions
  - Public endpoint (no authentication required for searching)

- **`POST /api/games`** - Create a new game session
  - Requires authentication via userId cookie
  - Validates payload structure
  - Returns created session with HTTP 201 status

### 4. Post Page Updates (`app/post/page.tsx`)

Enhanced the post game form to save to database:

- Added async submission handler that POSTs to `/api/games`
- Added loading state (`isSubmitting`) during submission
- Added error handling and error message display
- Form resets after successful submission
- Success message shows for 5 seconds after posting
- Improved UX with disabled state during submission

### 5. Find Page Updates (`app/find/page.tsx`)

Enhanced the find games page to search database:

- Added `handleSearch()` function to query the API
- Added state management for:
  - `gameSessions`: Array of search results
  - `isLoading`: Loading state during search
  - `hasSearched`: Tracks if a search has been performed
- Enhanced search results display:
  - Shows game name, date, and available times
  - Displays session description if provided
  - Shows loading state during search
  - Handles empty results gracefully
  - Only shows results after search is performed

## Database Schema

### Game Sessions Collection (`gameSessions`)

```typescript
{
  _id: ObjectId,            // MongoDB ObjectId
  id: string,               // UUID for the session
  userId: string,           // User who created the session
  game: string,             // Game name (e.g., "Dungeons & Dragons")
  date: string,             // ISO date string
  times: string[],          // Array of time slots (e.g., ["Morning", "Afternoon"])
  description: string,      // Optional session description
  createdAt: string,        // ISO timestamp
  updatedAt: string         // ISO timestamp
}
```

## Authentication

The POST endpoint requires authentication:
- Uses HttpOnly cookie-based authentication (consistent with profiles and characters)
- userId is extracted from the `userId` cookie set during login
- Returns 401 Unauthorized if not authenticated
- GET endpoint is public (no authentication required for searching)

## API Examples

### Creating a Game Session

```bash
POST /api/games
Content-Type: application/json
Cookie: userId={userId}

{
  "game": "Dungeons & Dragons",
  "date": "2024-01-15",
  "times": ["Evening", "Night"],
  "description": "Looking for experienced players for a one-shot campaign"
}
```

### Searching Game Sessions

```bash
# Search for all D&D games
GET /api/games?game=Dungeons%20%26%20Dragons

# Search for games on a specific date
GET /api/games?date=2024-01-15

# Search for games at specific times
GET /api/games?times=Evening,Night

# Combine filters
GET /api/games?game=Dungeons%20%26%20Dragons&date=2024-01-15&times=Evening
```

## Testing

The changes have been:
- ✅ Linted successfully (only pre-existing warnings remain)
- ✅ Built successfully with Next.js
- ✅ Type-checked successfully with TypeScript

## Integration with Existing System

This implementation follows the same patterns as the existing character and profile systems:

1. **Database Layer**: Uses `getDb()` from `lib/mongodb.ts`
2. **Authentication**: Uses cookie-based userId authentication
3. **API Structure**: Follows Next.js 15 App Router conventions
4. **Type Safety**: Full TypeScript type definitions
5. **Error Handling**: Consistent error responses with meaningful messages

## Future Enhancements

Potential improvements to consider:

1. Add user information to search results (display who posted each session)
2. Implement session updates (PUT endpoint)
3. Add pagination for search results
4. Add more advanced filtering (e.g., date ranges, multiple games)
5. Add ability to RSVP or join sessions
6. Add notifications when someone joins a session
7. Add session capacity limits
8. Display user profile links in search results
