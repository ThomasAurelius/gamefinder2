# DM Dashboard: Player Subscription Status Feature

## Overview
This feature allows DMs/hosts to see which players have active subscriptions for their paid campaigns directly in the campaign detail page.

## What Changed

### 1. New API Endpoint
**File**: `app/api/stripe/check-players-subscriptions/route.ts`

A new POST endpoint that accepts a campaign ID and list of player IDs, then returns the subscription status for each player:

```typescript
POST /api/stripe/check-players-subscriptions
Body: {
  campaignId: string,
  playerIds: string[]
}

Response: {
  [playerId: string]: boolean
}
```

**Features**:
- Checks Stripe subscriptions for multiple players in a single request
- Returns `false` for players without Stripe customer IDs
- Gracefully handles Stripe configuration issues
- Requires authentication

### 2. Campaign Detail Page Updates
**File**: `app/campaigns/[id]/page.tsx`

#### Type Updates
Added `hasActiveSubscription` property to `PlayerWithInfo` type:
```typescript
type PlayerWithInfo = {
  userId: string;
  name: string;
  avatarUrl?: string;
  characterName?: string;
  hasActiveSubscription?: boolean;  // NEW
};
```

#### Subscription Status Fetching
Added a new `useEffect` hook that:
- Only runs when the current user is the campaign creator
- Only checks for paid campaigns (costPerSession > 0)
- Fetches subscription status for all signed-up players
- Updates the player list with subscription information

#### UI Enhancements
Added subscription status badges next to each player in the "Current Players" section:

**Active Subscription Badge**:
- Green/emerald color scheme
- Checkmark icon
- Text: "Active Sub"
- Only shows for paid campaigns

**No Subscription Badge**:
- Gray/slate color scheme
- Warning icon
- Text: "No Sub"
- Only shows for paid campaigns

## How It Works

1. When a DM/host views their campaign detail page:
   - The page checks if the campaign has a cost per session
   - If it's a paid campaign, it fetches subscription status for all players

2. The subscription check:
   - Calls the new API endpoint with campaign ID and player IDs
   - API queries Stripe for each player's active subscriptions
   - Returns a map of player IDs to subscription status

3. The UI displays:
   - Green "Active Sub" badge for players with active subscriptions
   - Gray "No Sub" badge for players without subscriptions
   - No badges for free campaigns

## Visual Layout

For paid campaigns, the Current Players section now looks like:

```
Current Players
┌─────────────────────────────────────────────────┐
│ [1] Player Name                    [Active Sub] │
│     Character: Character Name                   │
└─────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────┐
│ [2] Another Player                 [No Sub]     │
│     Character: Their Character                  │
└─────────────────────────────────────────────────┘
```

## Use Cases

1. **Payment Tracking**: DMs can quickly see which players have paid/subscribed
2. **Campaign Management**: Identify players who need payment reminders
3. **Session Planning**: Verify all players are subscribed before a session
4. **Financial Overview**: Understand subscription coverage at a glance

## Technical Notes

- Subscription status is fetched only when needed (DM view + paid campaign)
- The check is performed client-side after player data loads
- Errors in subscription checking are logged but don't affect the UI
- The feature gracefully handles missing Stripe configuration
- No subscription badges appear for free campaigns (costPerSession = 0)

## Security

- Only authenticated users can call the subscription check API
- Campaign creators can check any player in their campaigns
- Player subscription data is not exposed to non-creators
- Uses existing Stripe customer ID lookup from the users collection

## Performance

- Batched API call: One request checks all players
- Subscription status is cached in component state
- Re-fetches only when player list length changes
- Minimal impact on page load time (runs after initial render)
