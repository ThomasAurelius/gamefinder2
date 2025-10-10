# Dashboard Enhancement: Campaign and Game Sessions

## Summary

Enhanced the `/dashboard` page to display both **one-time game sessions** and **multi-session campaigns** that a user is involved with (hosting, playing, or waitlisted).

## Changes Made

### 1. New API Endpoint: `/api/campaigns/my-campaigns`
**File:** `app/api/campaigns/my-campaigns/route.ts`

- Fetches all campaigns where the authenticated user is:
  - Hosting
  - A signed-up player
  - On the waitlist
  - A pending player
- Enriches campaign data with host information (name, avatar)
- Returns campaigns in the same format as game sessions for consistency

### 2. Updated Dashboard Page
**File:** `app/dashboard/page.tsx`

#### Type Definition Updates
- Extended `GameSession` type to include campaign-specific fields:
  - `sessionsLeft?: number`
  - `costPerSession?: number`
  - `meetingFrequency?: string`
  - `daysOfWeek?: string[]`
  - `isCampaign?: boolean`

#### Fetch Logic Updates
- Now fetches from both endpoints:
  - `/api/games/my-games` - for one-time game sessions
  - `/api/campaigns/my-campaigns` - for campaign sessions
- Marks each session type with `isCampaign` flag
- Combines and sorts all sessions by date (earliest first)

#### UI Updates
- **Visual Distinction:** Campaigns display an "Campaign" badge (indigo color)
- **Link Routing:** Games link to `/games/{id}`, campaigns link to `/campaigns/{id}`
- **Additional Information:** Campaigns show:
  - Number of sessions remaining
  - Cost per session (if paid)
- **Updated Text:**
  - Page subtitle now mentions "one-time games and campaigns"
  - Section title changed from "My Upcoming Games" to "My Upcoming Sessions"
  - Loading text updated to "Loading your sessions..."
  - Empty state text updated to "You don't have any upcoming sessions yet"

## User Experience

Users can now see all their upcoming gaming commitments in one place:
- **One-time games** appear without special badges
- **Campaigns** appear with a distinctive "Campaign" badge
- Both types show the user's role (Hosting, Playing, or Waitlisted)
- All sessions are sorted chronologically

## Technical Notes

- Maintains backward compatibility with existing game session functionality
- Leverages existing `listCampaigns` function with `userFilter` parameter
- Uses the same card component for both types, with conditional rendering for campaign-specific fields
- No breaking changes to existing APIs or data structures
