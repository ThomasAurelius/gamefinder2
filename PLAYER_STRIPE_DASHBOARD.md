# Player Stripe Dashboard Feature

## Overview
This feature provides a dedicated subscription management dashboard for players to view and manage their campaign subscriptions through Stripe's embedded Customer Portal.

## Components

### 1. Subscriptions Page (`/subscriptions`)
A dedicated page where players can:
- View all their active and past subscriptions
- See subscription details (amount, billing cycle, next billing date, status)
- Access quick links to campaign pages
- Manage subscriptions through the Stripe Customer Portal

### 2. API Endpoints

#### `/api/stripe/create-portal-session` (POST)
Creates a Stripe Customer Portal session and returns a URL to redirect the user.

**Request Body:**
```json
{
  "returnUrl": "https://yourapp.com/path/to/return"
}
```

**Response:**
```json
{
  "url": "https://billing.stripe.com/p/session/..."
}
```

**Features:**
- Automatically creates a Stripe customer if one doesn't exist
- Generates a secure session URL
- Handles return URL for redirecting back after portal session
- Configures portal with subscription cancellation enabled
- Allows users to cancel subscriptions at period end (no immediate loss of access)

#### `/api/stripe/list-subscriptions` (GET)
Fetches and formats all subscriptions for the authenticated user.

**Response:**
```json
{
  "subscriptions": [
    {
      "id": "sub_...",
      "status": "active",
      "campaignId": "campaign_id",
      "campaignName": "Campaign Name",
      "amount": 10.00,
      "currency": "usd",
      "interval": "week",
      "currentPeriodStart": 1234567890,
      "currentPeriodEnd": 1234567890,
      "cancelAtPeriodEnd": false,
      "canceledAt": null,
      "created": 1234567890
    }
  ]
}
```

### 3. UI Changes

#### Navigation
- Added "Subscriptions" link to the Account menu in the navbar
- Link is visible to all authenticated users

#### Payment Page
- "Manage Subscription" button now uses the portal session API
- Shows loading state while redirecting to portal

#### Campaign Detail Page
- "Manage Subscription" button now uses the portal session API
- Replaces hardcoded external Stripe link

#### Settings Page
- Added new "Subscriptions" section with link to subscriptions page
- "Manage Billing" button now uses portal session API for paid game hosts

## User Flow

### Viewing Subscriptions
1. User clicks "Subscriptions" in the Account menu
2. App fetches all subscriptions via `/api/stripe/list-subscriptions`
3. Subscriptions are displayed with full details and status

### Managing Subscriptions
1. User clicks "Manage Subscription" or "Manage All Subscriptions"
2. App requests portal session via `/api/stripe/create-portal-session`
3. User is redirected to Stripe Customer Portal
4. User can:
   - **Cancel subscription** (remains active until end of billing period)
   - Update payment methods
   - View billing history and invoices
   - Update billing information
5. User is redirected back to the app via the return URL

## Security

- All endpoints require authentication (via cookies)
- Portal sessions are generated server-side with secret key
- Sessions are single-use and time-limited
- Users can only access their own subscriptions
- No sensitive Stripe data is exposed in the frontend

## Error Handling

- Gracefully handles missing Stripe configuration
- Returns empty subscription list if user has no Stripe customer ID
- Shows user-friendly error messages for failed operations
- Loading states prevent multiple simultaneous requests

## Benefits

1. **Centralized Management**: All subscription management in one place
2. **No External Links**: Users stay within the app experience
3. **Secure**: Uses Stripe's hosted portal for sensitive operations
4. **Comprehensive**: Shows all subscription details and history
5. **Easy Access**: Multiple entry points (navbar, payment page, campaign page, settings)

## Technical Details

- Uses Stripe API version: `2025-09-30.clover`
- Portal sessions expire after a short time (Stripe default)
- Subscriptions list includes expanded product information
- Type-safe implementation with proper TypeScript types
- Handles both active and canceled subscriptions

## Future Enhancements

Potential improvements documented in `SUBSCRIPTION_STATUS_FEATURE.md`:
- Cache subscription status locally
- Show subscription details directly on campaign cards
- Add email notifications for subscription events
- Display upcoming billing amounts
- Show subscription usage/session tracking
