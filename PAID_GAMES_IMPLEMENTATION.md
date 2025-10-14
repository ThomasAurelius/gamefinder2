# Paid Games Feature Extension

## Overview

This implementation extends the paid game capability from campaigns to single game sessions, allowing hosts to charge for both campaigns and individual games with a seamless experience using the same Stripe infrastructure.

## Changes Made

### 1. Database & Type Updates

#### `lib/games/types.ts`
- Added payment-related fields to `GameSessionPayload`:
  - `costPerSession?: number` - Cost per game session in dollars
  - `stripeConnectAccountId?: string` - Host's Stripe Connect account ID for payment splitting

#### `lib/games/db.ts`
- Updated all database functions to handle the new payment fields:
  - `listGameSessions()` - Returns games with cost information
  - `getGameSession()` - Returns game with cost information
  - `createGameSession()` - Stores cost and Stripe Connect account ID
  - `updateGameSession()` - Updates payment fields
  - All return types now include `costPerSession` and `stripeConnectAccountId`

### 2. API Endpoints

#### `app/api/games/route.ts` (POST)
- Enhanced to accept `costPerSession` in request body
- Automatically fetches host's Stripe Connect account ID when cost is specified
- Stores payment information with the game session

#### `app/api/games/[id]/route.ts` (PUT)
- Inherits payment field support through `Partial<GameSessionPayload>`
- Allows updating cost information for existing games

### 3. User Interface Changes

#### Game Creation Form (`app/post/page.tsx`)
- Added `costPerSession` input field
- Shows cost field only if user has enabled paid games
- Includes Stripe Connect onboarding prompt
- Checks Stripe Connect status when cost is set
- Displays payment confirmation message when cost > 0

#### Game Edit Page (`app/games/[id]/edit/page.tsx`) - NEW
- Complete edit interface for game sessions
- Mirrors campaign edit functionality
- Includes payment field management
- Shows Stripe onboarding status
- Validates user is the game host

#### Game Detail Page (`app/games/[id]/page.tsx`)
- Displays cost badge in header section
- Shows payment section for non-host users
- Payment flow states:
  - **Signed Up Players**: Shows "Proceed to payment" button
  - **Pending Players**: Shows approval pending message
  - **Waitlist Players**: Shows waitlist status message
- Uses `isPaidGame()` utility for payment checks

#### Game Payment Page (`app/games/[id]/payment/page.tsx`) - NEW
- One-time payment interface (not subscriptions like campaigns)
- Integrates with Stripe Payment Intent API
- Handles payment completion
- Redirects users after successful payment
- Shows appropriate messages for different user states

#### Dashboard (`app/dashboard/page.tsx`)
- Updated to display cost for both games and campaigns
- Shows cost badge on game/campaign cards
- Format: "$X.XX per session"

#### GameActions Component (`components/GameActions.tsx`)
- Updated Edit button to link to new edit page
- Removed modal-based editing in favor of dedicated page

### 4. Utility Functions

#### `lib/game-utils.ts` - NEW
- `isPaidGame()` - Checks if a game requires payment
- Mirrors `isPaidCampaign()` from campaign utilities
- Used throughout the UI for conditional rendering

### 5. Payment Flow

The payment flow for paid games works as follows:

1. **Game Creation**:
   - Host creates game with `costPerSession > 0`
   - System automatically retrieves host's Stripe Connect account ID
   - Game is marked as paid

2. **Player Join Request**:
   - Player requests to join game → added to `pendingPlayers`
   - Host reviews and approves → moved to `signedUpPlayers`

3. **Payment**:
   - For paid games, approved players see "Proceed to payment" button
   - Clicking opens `/games/[id]/payment` page
   - Player completes one-time payment via Stripe
   - After successful payment, player's spot is confirmed

4. **Platform Fee**:
   - Platform retains 15% of payment (same as campaigns)
   - Host receives 85% minus Stripe processing fees
   - All payment splitting handled through Stripe Connect

## Integration Points

### Stripe Integration
- Uses existing Stripe infrastructure from campaigns
- Payment Intent API for one-time payments
- Stripe Connect for payment splitting to hosts
- Same 15% platform fee structure

### Database Schema
- No schema changes required
- Games collection already supports flexible fields
- New fields are optional and backward compatible
- **Payment Field Behavior**:
  - `costPerSession = undefined` - Free game (default)
  - `costPerSession = 0` - Explicitly free game
  - `costPerSession > 0` - Paid game requiring payment
  - Both undefined and 0 are treated as free games in the UI

### API Compatibility
- All changes are backward compatible
- Existing games without payment fields work normally
- Free games (costPerSession = 0 or undefined) behave as before

## Testing Checklist

- [x] Lint checks pass
- [x] Build completes successfully
- [ ] Create paid game session
- [ ] Edit paid game cost
- [ ] View paid game details (cost displayed)
- [ ] Join paid game (payment button appears)
- [ ] Complete payment flow
- [ ] View paid games on dashboard
- [ ] Ensure free games still work
- [ ] Test host approval flow with paid games
- [ ] Verify Stripe Connect integration
- [ ] Test payment page redirects

## Screenshots

**Note**: Screenshots will be added after manual testing of the complete flow.

### Planned Screenshots

1. **Game Creation Form with Payment Option** - Shows the cost per session field and payment-related UI
2. **Game Detail Page with Cost** - Displays the cost badge and payment section
3. **Payment Page** - Shows the Stripe payment interface for game sessions
4. **Dashboard with Paid Games** - Demonstrates cost display on game cards
5. **Game Edit Page** - Shows the edit interface with payment fields

## Notes

1. **Consistency with Campaigns**: The implementation closely mirrors the campaign payment flow to ensure a consistent user experience across the platform.

2. **One-time vs Subscription**: Unlike campaigns which use subscriptions, games use one-time payments since they represent single sessions.

3. **Backward Compatibility**: All changes are fully backward compatible. Existing games and free games continue to work exactly as before.

4. **Platform Fee**: The 15% platform fee is consistent with campaigns and clearly communicated to hosts.

5. **Stripe Connect**: Hosts must complete Stripe Connect onboarding to receive payments. The system gracefully handles cases where onboarding is incomplete.

6. **Security**: All payment processing goes through Stripe's secure infrastructure. No sensitive payment information is stored in the application database.
