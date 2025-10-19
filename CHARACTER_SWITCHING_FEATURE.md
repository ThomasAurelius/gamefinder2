# Character Switching Feature

This document describes the implementation of the character switching feature for campaigns and game sessions.

## Overview

Players can now:
1. Select a character when joining a campaign or game session
2. Join without a character (optional)
3. Switch their character after already joining
4. Select a character if they initially joined without one

## Implementation Details

### Database Changes

#### Campaigns (`lib/campaigns/db.ts`)
- Added `updatePlayerCharacter()` function
  - Allows players to update their character selection
  - Works for players in any status: signed up, waitlist, or pending
  - Updates `signedUpPlayersWithCharacters`, `waitlistWithCharacters`, or `pendingPlayersWithCharacters` arrays

#### Game Sessions (`lib/games/db.ts`)
- Added `updatePlayerCharacter()` function
  - Same functionality as campaigns
  - Allows players to switch characters for one-time game sessions

### API Endpoints

#### Campaign Character Update
- **Endpoint**: `POST /api/campaigns/[id]/update-character`
- **Body**: `{ characterId?: string, characterName?: string }`
- **Authentication**: Required (uses userId from cookies)
- **Returns**: Updated campaign object

#### Game Character Update
- **Endpoint**: `POST /api/games/[id]/update-character`
- **Body**: `{ characterId?: string, characterName?: string }`
- **Authentication**: Required (uses userId from cookies)
- **Returns**: Updated game session object

### UI Changes

#### CampaignDetail Component
- Added character selection dialog when joining campaigns
- Added "Switch Character" button for players already in the campaign
- Button layout: "Switch Character" | "Withdraw from Campaign"
- Both dialogs use the `CharacterSelectionDialog` component

#### JoinWithdrawButton Component (for Game Sessions)
- Updated to show "Switch Character" button for signed-up players
- Button layout: "Switch Character" | "Withdraw"
- Uses the existing `CharacterSelectionDialog` component

#### CharacterSelectionDialog Component
- Reused existing component
- Shows user's characters filtered by game system (optional)
- Allows joining/selecting without a character
- Shows helpful note about character importance for better gameplay

## Testing

### Manual Testing Steps

#### Test Character Selection on Join (Campaign)
1. Log in as a player
2. Navigate to a campaign detail page
3. Click "Request to Join Campaign"
4. Character selection dialog should appear
5. Select a character (or choose "No character")
6. Click "Confirm"
7. Verify your request appears in pending players with the correct character

#### Test Character Selection on Join (Game Session)
1. Log in as a player
2. Navigate to a game session detail page
3. Click "Request to Join"
4. Character selection dialog should appear
5. Select a character (or choose "No character")
6. Click "Confirm"
7. Verify your request appears in pending players with the correct character

#### Test Character Switching (Campaign)
1. Be a signed-up player in a campaign
2. Navigate to the campaign detail page
3. Look for the "Switch Character" button (next to "Withdraw from Campaign")
4. Click "Switch Character"
5. Character selection dialog should appear
6. Select a different character
7. Click "Confirm"
8. Verify your character has been updated in the player list

#### Test Character Switching (Game Session)
1. Be a signed-up player in a game session
2. Navigate to the game session detail page
3. Look for the "Switch Character" button (next to "Withdraw")
4. Click "Switch Character"
5. Character selection dialog should appear
6. Select a different character
7. Click "Confirm"
8. Verify your character has been updated in the player list

#### Test Adding Character After Joining Without One
1. Join a campaign or game without selecting a character
2. Get approved by the host
3. Navigate back to the campaign/game detail page
4. Click "Switch Character"
5. Select a character from the dialog
6. Verify your character now appears in the player list

#### Edge Cases to Test
1. Switching to "No character" (removing a character)
2. Switching while on the waitlist
3. Switching while in pending status
4. Character filtering by game system (e.g., D&D 5e campaigns should only show D&D characters)
5. Error handling when API calls fail

## Technical Notes

### Character Data Structure
```typescript
type PlayerSignup = {
  userId: string;
  characterId?: string;
  characterName?: string;
};
```

### Database Update Strategy
The `updatePlayerCharacter` function uses a two-step approach:
1. Remove old character entry from all arrays (`$pull`)
2. Add new character entry to the appropriate array(s) (`$push`)

This ensures no duplicate entries and handles the case where a player might be in multiple lists.

### Security
- All endpoints require authentication (userId from cookies)
- Players can only update their own character selection
- Players must be part of the campaign/game to update their character

## Future Enhancements

Potential improvements:
1. Add notifications when a player switches characters
2. Allow hosts to see character change history
3. Add character validation (e.g., level restrictions, class requirements)
4. Show character preview before switching
5. Add bulk character switching for multiple campaigns
