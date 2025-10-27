# Private Campaigns Feature - Testing Guide

## Changes Made

### 1. Data Model Changes
- Added `isPrivate?: boolean` field to `CampaignPayload` type in `lib/campaigns/types.ts`
- Updated all database functions in `lib/campaigns/db.ts` to handle the `isPrivate` field

### 2. API Changes
- Updated `parseCampaignPayload` in `app/api/campaigns/route.ts` to accept and validate `isPrivate` parameter
- Modified `listCampaigns` function to exclude private campaigns from public feed (when `userFilter` is not provided)

### 3. UI Changes
- Added "Private Campaign" checkbox to the post-campaign form (`app/post-campaign/page.tsx`)
- Checkbox includes helpful description: "Private campaigns won't appear in the public campaign feed. Only you and invited players will be able to see and join it."

## How It Works

### Creating a Private Campaign
1. Go to `/post-campaign`
2. Fill out the campaign form
3. Check the "Make this campaign private (invite-only)" checkbox
4. Submit the form
5. The campaign will be created with `isPrivate: true`

### Filtering Logic

#### Public Feed (`/find-campaigns`)
- When `listCampaigns` is called WITHOUT `userFilter`, it adds `query.isPrivate = { $ne: true }` to exclude private campaigns
- Private campaigns will NOT appear in search results

#### My Campaigns (`/my-campaigns`)
- When `listCampaigns` is called WITH `userFilter` (userId), it searches for campaigns where:
  - User is hosting (userId matches)
  - User is signed up (in signedUpPlayers array)
  - User is on waitlist (in waitlist array)
  - User has requested to join (in pendingPlayers array)
- Private campaigns WILL appear if the user is involved in any of these ways

#### Dashboard (`/dashboard`)
- Uses the same logic as My Campaigns via the `/api/campaigns/my-campaigns` endpoint
- Private campaigns WILL appear for hosts and participants

## Manual Testing Checklist

### Test 1: Create a Private Campaign
- [ ] Navigate to `/post-campaign`
- [ ] Fill out all required fields
- [ ] Check the "Make this campaign private" checkbox
- [ ] Submit the form
- [ ] Verify success message appears
- [ ] Note the campaign ID for later tests

### Test 2: Verify Private Campaign Excluded from Public Feed
- [ ] Navigate to `/find-campaigns`
- [ ] Check if the private campaign appears in "All Upcoming Events" section
- [ ] Expected: Private campaign should NOT appear
- [ ] Try searching with various filters
- [ ] Expected: Private campaign should NOT appear in any search results

### Test 3: Verify Host Can See Private Campaign in My Campaigns
- [ ] Navigate to `/my-campaigns` (while logged in as the host)
- [ ] Check the "All My Campaigns" section
- [ ] Expected: Private campaign SHOULD appear with all details
- [ ] Verify you can manage the campaign (click through to details page)

### Test 4: Verify Host Can See Private Campaign in Dashboard
- [ ] Navigate to `/dashboard` (while logged in as the host)
- [ ] Check the "My Upcoming Sessions" section
- [ ] Expected: Private campaign SHOULD appear
- [ ] Verify it shows "Hosting" badge

### Test 5: Create a Public Campaign for Comparison
- [ ] Navigate to `/post-campaign`
- [ ] Fill out all required fields
- [ ] Leave "Make this campaign private" checkbox UNCHECKED
- [ ] Submit the form
- [ ] Note the campaign ID

### Test 6: Verify Public Campaign Appears Everywhere
- [ ] Navigate to `/find-campaigns`
- [ ] Expected: Public campaign SHOULD appear in the feed
- [ ] Navigate to `/my-campaigns`
- [ ] Expected: Public campaign SHOULD appear (for host)
- [ ] Navigate to `/dashboard`
- [ ] Expected: Public campaign SHOULD appear (for host)

### Test 7: Verify Private Campaign Behavior for Other Users
- [ ] Log in as a different user (not the host)
- [ ] Navigate to `/find-campaigns`
- [ ] Expected: Private campaign should NOT appear
- [ ] Navigate to `/my-campaigns`
- [ ] Expected: Private campaign should NOT appear (user not involved)
- [ ] Navigate to `/dashboard`
- [ ] Expected: Private campaign should NOT appear (user not involved)

### Test 8: Database Query Validation
If you have access to the MongoDB database, verify:
- [ ] Private campaigns have `isPrivate: true` field
- [ ] Public campaigns either have `isPrivate: false` or no `isPrivate` field (backward compatible)

## Edge Cases to Consider

1. **Existing Campaigns**: Campaigns created before this feature will not have the `isPrivate` field. The code handles this by treating `undefined` and `false` as public.

2. **User Joins Private Campaign**: If a user is invited and joins a private campaign (by other means), they should see it in their My Campaigns and Dashboard.

3. **Search with Filters**: Even when applying game/date/time/location filters, private campaigns should not appear in the public feed.

4. **Host Filter**: When filtering by a specific host in the public feed, their private campaigns should still be excluded (this is intentional - the public feed is for discovering new campaigns).

## API Behavior

### GET `/api/campaigns` (Public Feed)
- Without `userFilter`: Returns only public campaigns
- With `userFilter`: Returns all campaigns where user is involved (including private ones)

### GET `/api/campaigns/my-campaigns`
- Always passes `userFilter` internally
- Returns all campaigns where user is involved (including private ones)

### POST `/api/campaigns`
- Accepts `isPrivate` boolean in request body
- Stores it in the database
- Returns the created campaign with all fields

## Notes

- The feature is backward compatible - existing campaigns without `isPrivate` field will be treated as public
- Private campaigns can still be accessed directly via their URL (`/campaigns/[id]`) if someone has the link
- The filtering only applies to list views and search results
- Future enhancement: Consider adding invite system for sharing private campaign links
