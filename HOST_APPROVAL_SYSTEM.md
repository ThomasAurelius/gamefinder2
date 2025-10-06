# Host Approval System Implementation

## Overview
Implemented a host approval system where game hosts must approve or deny player join requests before players can join their game sessions.

## Changes Made

### 1. Database Schema Update (`lib/games/types.ts`)
- Added `pendingPlayers: string[]` field to `StoredGameSession` type
- This array holds user IDs of players waiting for host approval

### 2. Database Functions (`lib/games/db.ts`)
Updated all functions to handle the new `pendingPlayers` field:
- `listGameSessions()` - Returns pending players with all sessions
- `getGameSession()` - Returns pending players with session details
- `createGameSession()` - Initializes empty `pendingPlayers` array
- `joinGameSession()` - Modified to add players to `pendingPlayers` instead of directly to `signedUpPlayers`
- `listUserGameSessions()` - Includes sessions where user is in `pendingPlayers`

Added new functions:
- **`approvePlayer(sessionId, hostId, playerId)`** - Moves player from pending to signed up (or waitlist if full)
- **`denyPlayer(sessionId, hostId, playerId)`** - Removes player from pending list

### 3. API Routes
Created two new endpoints:

#### `/api/games/[id]/approve` (POST)
- Requires authentication (host must be logged in)
- Validates that the requester is the host
- Moves player from pending to signed up players (or waitlist if full)
- Returns updated session data

#### `/api/games/[id]/deny` (POST)
- Requires authentication (host must be logged in)
- Validates that the requester is the host
- Removes player from pending list
- Returns updated session data

### 4. UI Components

#### `PendingPlayersManager` Component (`components/PendingPlayersManager.tsx`)
- Client-side component for managing pending players
- Only visible to the host
- Shows list of players awaiting approval
- Provides "Approve" and "Deny" buttons for each pending player
- Uses Next.js router refresh to update page after actions
- Displays error messages if approval/denial fails
- Styled with yellow/orange theme to indicate pending status

#### Game Detail Page Updates (`app/games/[id]/page.tsx`)
- Fetches current user ID to determine if viewer is the host
- Includes pending players in user data fetch
- Shows `PendingPlayersManager` component when:
  - User is the host (isHost = true)
  - There are pending players (pendingPlayersList.length > 0)
- Component appears between Host Information and Signed Up Players sections

#### Find Games Page Updates (`app/find/page.tsx`)
- Updated `GameSession` type to include `pendingPlayers` field
- Changed "Join Game" button to "Request to Join" 
- Changed loading text from "Joining..." to "Requesting..."
- Added tooltip: "Request to join - requires host approval"

## User Flow

### For Players:
1. Player clicks "Request to Join" on a game session
2. Player is added to the `pendingPlayers` list
3. Player sees their status as pending in their game list
4. Once host approves:
   - If spots available: Player moves to signed up players
   - If session full: Player moves to waitlist

### For Hosts:
1. Host views their game session detail page
2. Host sees "Pending Approval" section with list of players
3. For each player, host can:
   - Click "Approve" to accept the player
   - Click "Deny" to reject the player
4. Page automatically refreshes after action
5. Approved players appear in "Signed Up Players" or "Waitlist"

## Benefits
- **Control**: Hosts can curate their player groups
- **Quality**: Prevents unwanted players from joining
- **Flexibility**: Hosts can review player profiles before accepting
- **Transparency**: Clear communication of approval requirement to players

## Backward Compatibility
- All existing functions updated to handle empty `pendingPlayers` arrays
- Existing game sessions will work without issues (empty pending list)
- No breaking changes to API contracts

## Security
- Only the host can approve/deny players (validated by hostId in database queries)
- Authentication required for all approval actions
- Player ID validation prevents manipulation

## Testing Performed
- ✅ TypeScript compilation successful
- ✅ Build successful with no errors
- ✅ Linting passed (only pre-existing warnings)
- ✅ All new API routes visible in build output

## Visual Changes

### Find Games Page
**Before**: Button says "Join Game"
**After**: Button says "Request to Join" with tooltip explaining approval requirement

### Game Detail Page (Host View)
**New Section**: "Pending Approval" section appears between Host Information and Signed Up Players
- Shows count of pending players
- Lists each player with their name
- Provides green "Approve" and red "Deny" buttons
- Displays helpful message: "Players are waiting for your approval to join this game."
- Styled with yellow/orange border and background to stand out

## Files Modified
- `lib/games/types.ts` - Added pendingPlayers to type
- `lib/games/db.ts` - Updated all functions + added approve/deny functions
- `app/games/[id]/page.tsx` - Added pending players UI
- `app/find/page.tsx` - Updated button text and type
- `components/PendingPlayersManager.tsx` - New client component

## Files Created
- `app/api/games/[id]/approve/route.ts` - Approve endpoint
- `app/api/games/[id]/deny/route.ts` - Deny endpoint
- `components/PendingPlayersManager.tsx` - UI component
- `HOST_APPROVAL_SYSTEM.md` - This documentation
