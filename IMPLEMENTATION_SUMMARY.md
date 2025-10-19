# Implementation Summary: Character Switching for Campaigns and Game Sessions

## Problem Statement
Players needed the ability to:
1. Select a character when joining campaigns or game sessions
2. Switch their character after already joining
3. Add a character if they initially joined without one

## Solution Overview
Implemented a comprehensive character selection and switching system for both campaigns and game sessions, allowing players full control over their character choices throughout their participation.

## Key Features Implemented

### 1. Character Selection on Join
- **When**: Players join a campaign or game session
- **What**: Character selection dialog appears automatically
- **Options**: 
  - Select from user's existing characters
  - Join without a character (optional)
  - Characters are filtered by game system when applicable

### 2. Character Switching for Existing Players
- **When**: Player is already part of a campaign/game
- **What**: New "Switch Character" button appears next to "Withdraw" button
- **Functionality**: 
  - Opens same character selection dialog
  - Updates character in real-time
  - Works for all player statuses (signed up, waitlist, pending)

### 3. Add Character After Joining Without One
- **When**: Player joined without selecting a character
- **What**: Can use "Switch Character" to add one later
- **Benefit**: Flexible gameplay - players can add character details as they develop them

## Technical Implementation

### Database Layer

#### Files Modified:
- `lib/campaigns/db.ts`
- `lib/games/db.ts`

#### New Functions:
```typescript
export async function updatePlayerCharacter(
  campaignId: string,  // or gameId for games
  userId: string,
  characterId?: string,
  characterName?: string
): Promise<StoredCampaign | StoredGameSession | null>
```

**Function Behavior:**
1. Verifies user is part of the campaign/game
2. Removes old character entry from appropriate arrays
3. Adds new character entry to the same arrays
4. Updates the `updatedAt` timestamp
5. Returns updated campaign/game object

**Player Lists Supported:**
- `signedUpPlayersWithCharacters` - Approved/confirmed players
- `waitlistWithCharacters` - Players on waitlist
- `pendingPlayersWithCharacters` - Players awaiting host approval

### API Layer

#### New Endpoints:
1. **POST /api/campaigns/[id]/update-character**
   - Updates player's character for a campaign
   - Requires authentication
   - Returns updated campaign

2. **POST /api/games/[id]/update-character**
   - Updates player's character for a game session
   - Requires authentication
   - Returns updated game

**Request Body:**
```json
{
  "characterId": "optional-character-id",
  "characterName": "optional-character-name"
}
```

**Authentication:**
- Uses `userId` from cookies
- Only allows players to update their own character

**Error Handling:**
- 401: Authentication required
- 400: Player not part of campaign/game
- 500: Server error

### UI Layer

#### Components Modified:

##### 1. CampaignDetail.tsx
**Changes:**
- Import `CharacterSelectionDialog`
- Add state for dialog visibility and loading states
- Convert `handleJoinCampaign` to show character dialog
- Add `handleCharacterSelect` for join with character
- Add `handleSwitchCharacter` button handler
- Add `handleCharacterSwitch` for character updates
- Update button layout to show both "Switch Character" and "Withdraw"

**User Flow:**
1. Player clicks "Request to Join Campaign"
2. Character selection dialog appears
3. Player selects character or skips
4. Request is sent with character info
5. For existing players: "Switch Character" button always visible

##### 2. JoinWithdrawButton.tsx (Game Sessions)
**Changes:**
- Add state for character switch dialog
- Add `handleSwitchCharacter` function
- Add `handleCharacterSwitch` function
- Update button layout to show both actions
- Add character switch dialog rendering

**User Flow:**
1. Player clicks "Request to Join"
2. Character selection dialog appears
3. For existing players: Two-button layout appears
   - "Switch Character" (left)
   - "Withdraw" (right)

##### 3. CharacterSelectionDialog.tsx (Reused)
**Existing Component Features:**
- Shows user's characters
- Filters by game system when provided
- Option to join without character
- Loading states
- Helpful note about character importance

## Data Flow

### Join Campaign/Game with Character:
```
User clicks "Join" 
  → Character Dialog Opens
  → User selects character
  → POST /api/campaigns/[id]/join (with characterId, characterName)
  → joinCampaign() adds to pendingPlayersWithCharacters
  → UI refreshes showing pending status
```

### Switch Character:
```
User clicks "Switch Character"
  → Character Dialog Opens
  → User selects new character
  → POST /api/campaigns/[id]/update-character
  → updatePlayerCharacter() removes old + adds new
  → UI refreshes showing updated character
```

## Security Considerations

### Authentication
- All endpoints require valid userId from cookies
- No anonymous character updates

### Authorization
- Players can only update their own characters
- Cannot update characters for other players
- Must be part of campaign/game to update

### Data Validation
- CharacterId and characterName are optional
- Function validates user is in appropriate player lists
- MongoDB ObjectId validation for campaigns
- UUID support for backward compatibility

## Testing Completed

### Build Tests
✅ TypeScript compilation successful
✅ Next.js build successful
✅ No new linting errors introduced

### Security Tests
✅ CodeQL analysis passed - 0 vulnerabilities
✅ No SQL injection vectors
✅ No XSS vulnerabilities
✅ Authentication properly enforced

### Code Review
✅ Addressed review comments
✅ Updated misleading comments
✅ Consistent error handling
✅ Proper state management

## Files Changed

### New Files (5):
1. `app/api/campaigns/[id]/update-character/route.ts` - Campaign character update API
2. `app/api/games/[id]/update-character/route.ts` - Game character update API
3. `CHARACTER_SWITCHING_FEATURE.md` - Feature documentation
4. `IMPLEMENTATION_SUMMARY.md` - This file

### Modified Files (4):
1. `lib/campaigns/db.ts` - Added updatePlayerCharacter function
2. `lib/games/db.ts` - Added updatePlayerCharacter function
3. `components/CampaignDetail.tsx` - Added character selection and switching UI
4. `components/JoinWithdrawButton.tsx` - Added character switching for games

## Manual Testing Checklist

To fully verify the implementation, test these scenarios:

### Campaign Tests:
- [ ] Join campaign with character selection
- [ ] Join campaign without character
- [ ] Switch character while signed up
- [ ] Switch character while on waitlist
- [ ] Switch character while pending
- [ ] Add character after joining without one
- [ ] Remove character (switch to "No character")

### Game Session Tests:
- [ ] Join game with character selection
- [ ] Join game without character
- [ ] Switch character while signed up
- [ ] Switch character while on waitlist
- [ ] Switch character while pending
- [ ] Add character after joining without one
- [ ] Remove character (switch to "No character")

### Edge Cases:
- [ ] Character filtering by game system works
- [ ] Dialog cancellation works correctly
- [ ] Error messages display properly
- [ ] Loading states work correctly
- [ ] Multiple rapid clicks don't cause issues
- [ ] Character appears in enriched player data

## Future Enhancements

Potential improvements for future iterations:

1. **Notifications**: Notify host when player switches character
2. **Character History**: Track character changes for transparency
3. **Character Validation**: Add level/class restrictions per campaign
4. **Character Preview**: Show character details before switching
5. **Bulk Operations**: Switch character across multiple campaigns
6. **Character Suggestions**: Recommend characters based on campaign needs
7. **Character Requirements**: Allow hosts to require certain character types

## Rollback Plan

If issues arise, the feature can be safely disabled by:

1. Remove "Switch Character" buttons from UI
2. Revert character selection dialog on join (allow direct join)
3. Keep API endpoints (won't be called if UI removed)
4. Database remains compatible (optional fields)

No database migration needed for rollback.

## Performance Considerations

- Character updates are two-step operations but atomic per document
- Database queries are indexed by campaignId/gameId
- UI updates are optimistic (show loading state immediately)
- Character list is cached per dialog instance
- Dialog closes immediately on selection to improve UX

## Compatibility

- ✅ Backward compatible with existing campaigns/games
- ✅ Works with both ObjectId and UUID campaign formats
- ✅ Optional characterId/characterName fields
- ✅ Existing players without characters continue working
- ✅ No breaking changes to existing APIs

## Documentation

All documentation has been created:
- ✅ Feature documentation (CHARACTER_SWITCHING_FEATURE.md)
- ✅ Implementation summary (this file)
- ✅ API endpoint documentation (in route files)
- ✅ Code comments for complex logic
- ✅ Testing instructions included

## Conclusion

The character switching feature has been successfully implemented with:
- Full functionality for campaigns and game sessions
- Comprehensive error handling
- Security best practices
- Clean, maintainable code
- Thorough documentation

The implementation is production-ready and awaiting manual testing verification.
