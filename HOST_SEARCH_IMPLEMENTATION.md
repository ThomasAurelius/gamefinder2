# Host Search Filter Implementation

## Summary
Added the ability to search for games and campaigns by host name in the "Find Games" and "Find Campaigns" pages.

## Changes Made

### Backend Changes

#### 1. New User Search Function (`lib/users.ts`)
- Added `searchUsersByName()` function that searches for users by name or commonName
- Returns up to 10 matching users with basic info (id, name, avatarUrl)
- Includes regex injection protection by escaping special characters

#### 2. New API Endpoint (`app/api/users/search/route.ts`)
- Created GET endpoint `/api/users/search?name={searchTerm}`
- Returns list of users matching the search term
- Minimum 2 characters required to search

#### 3. Database Query Updates

**`lib/games/db.ts`**
- Updated `listGameSessions()` to accept optional `hostId` parameter
- Filters game sessions by `userId` when hostId is provided

**`lib/campaigns/db.ts`**
- Updated `listCampaigns()` to accept optional `hostId` parameter  
- Filters campaigns by `userId` when hostId is provided
- Note: `hostId` is separate from `userFilter` (which is used for "My Campaigns" feature)

#### 4. API Route Updates

**`app/api/games/route.ts`**
- Added `hostId` query parameter extraction
- Passes `hostId` to `listGameSessions()`

**`app/api/campaigns/route.ts`**
- Added `hostId` query parameter extraction
- Passes `hostId` to `listCampaigns()`

### Frontend Changes

#### 5. Find Games Page (`app/find/page.tsx`)

**State Management:**
- Added state for host search: `hostSearch`, `hostSearchResults`, `selectedHostId`, `selectedHostName`, `showHostResults`

**Host Search Logic:**
- Added useEffect hook with 300ms debounce to search for hosts as user types
- Added useEffect to close dropdown when clicking outside
- Minimum 2 characters required to trigger search

**UI Components:**
- Added "Host Name" input field with autocomplete dropdown
- Dropdown shows matching hosts with avatars
- Selected host shows with "Clear" button
- Search button enabled when host is selected (along with other filters)
- Search results description includes host name when filtered

**Search Function:**
- Updated `handleSearch()` to include `hostId` parameter in API call

#### 6. Find Campaigns Page (`app/find-campaigns/page.tsx`)

**Same changes as Find Games page:**
- Added host search state management
- Added host search useEffect hooks
- Added host search UI with autocomplete
- Updated search function to include hostId
- Updated search results description

## User Experience

1. User can now click "Show search filters" on Find Games or Find Campaigns page
2. New "Host Name" field appears after the date selector
3. User types at least 2 characters of a host's name
4. Matching hosts appear in a dropdown with their avatar and name
5. User clicks on a host to select them
6. Selected host is shown with option to clear
7. User clicks "Search Games" or "Search Campaigns" 
8. Results are filtered to only show games/campaigns hosted by that user
9. Search results description shows "hosted by [Host Name]"

## Technical Notes

- Search is case-insensitive partial match on user's name or commonName
- Dropdown closes when clicking outside
- Search results are limited to 10 users to prevent performance issues
- Regex injection is prevented by escaping special characters
- Host filter can be combined with other filters (game, date, time, location)
- TypeScript types are properly maintained throughout

## Security Considerations

- Input sanitization: Regex special characters are escaped
- Result limiting: Search returns max 10 users
- No sensitive user data exposed (only id, name, avatarUrl)
- MongoDB ObjectId validation handled by existing infrastructure
