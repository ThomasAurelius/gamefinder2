# Refund Feature - Visual Summary

## Feature Overview

This feature allows game hosts (DMs) to issue refunds to players when they need to cancel a campaign or session.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    Campaign Host (DM)                        │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │  Campaign Management Page                           │    │
│  │                                                      │    │
│  │  ┌────────────────────────────────────────────┐   │    │
│  │  │  CampaignRefundManager Component           │   │    │
│  │  │                                             │   │    │
│  │  │  Player: John Doe                          │   │    │
│  │  │  ┌─────────────────────────────────────┐  │   │    │
│  │  │  │ Subscription: $10.00 USD - active   │  │   │    │
│  │  │  │ [Issue Refund]                      │  │   │    │
│  │  │  └─────────────────────────────────────┘  │   │    │
│  │  │                                             │   │    │
│  │  │  Player: Jane Smith                        │   │    │
│  │  │  ┌─────────────────────────────────────┐  │   │    │
│  │  │  │ One-Time: $15.00 USD - succeeded    │  │   │    │
│  │  │  │ [Issue Refund]                      │  │   │    │
│  │  │  └─────────────────────────────────────┘  │   │    │
│  │  └────────────────────────────────────────────┘   │    │
│  └────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ HTTP POST
                              ▼
┌─────────────────────────────────────────────────────────────┐
│               Backend API (/api/stripe/refund)               │
│                                                              │
│  1. ✓ Verify host is authenticated                          │
│  2. ✓ Verify user is campaign host                          │
│  3. ✓ Get player's Stripe customer ID                       │
│  4. ✓ Process refund:                                       │
│     - For subscriptions:                                     │
│       • Cancel subscription immediately                      │
│       • Retrieve latest invoice                             │
│       • Issue refund for paid charges                       │
│     - For one-time payments:                                │
│       • Find payment intents                                │
│       • Issue refunds for all charges                       │
│  5. ✓ Return success/error response                         │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      Stripe API                              │
│                                                              │
│  • stripe.subscriptions.cancel()                            │
│  • stripe.invoices.list()                                   │
│  • stripe.refunds.create()                                  │
│  • stripe.paymentIntents.list()                             │
│                                                              │
│  Result: Refund processed, money returned to player         │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   Player's Bank Account                      │
│                                                              │
│  💰 Refund received (usually within 5-10 business days)     │
└─────────────────────────────────────────────────────────────┘
```

## Data Flow Diagram

```
┌──────────────┐
│   Browser    │
└──────┬───────┘
       │
       │ 1. User clicks "Issue Refund"
       │
       ▼
┌──────────────────────────────────────┐
│  CampaignRefundManager Component     │
│                                       │
│  • Gets campaignId, playerId          │
│  • Gets subscriptionId (if applicable)│
└──────┬───────────────────────────────┘
       │
       │ 2. POST /api/stripe/refund
       │    {campaignId, playerId, subscriptionId}
       │
       ▼
┌──────────────────────────────────────┐
│  Refund API Endpoint                 │
│                                       │
│  ┌────────────────────────────────┐  │
│  │ Authentication Check            │  │
│  │ ✓ User is logged in?           │  │
│  └────────────────────────────────┘  │
│           │                           │
│           ▼                           │
│  ┌────────────────────────────────┐  │
│  │ Authorization Check             │  │
│  │ ✓ User is campaign host?       │  │
│  └────────────────────────────────┘  │
│           │                           │
│           ▼                           │
│  ┌────────────────────────────────┐  │
│  │ Get Campaign from Database      │  │
│  │ getCampaign(campaignId)        │  │
│  └────────────────────────────────┘  │
│           │                           │
│           ▼                           │
│  ┌────────────────────────────────┐  │
│  │ Get Player Stripe Customer ID   │  │
│  │ getStripeCustomerId(playerId)  │  │
│  └────────────────────────────────┘  │
│           │                           │
│           ▼                           │
│  ┌────────────────────────────────┐  │
│  │ Process Refund via Stripe       │  │
│  │ • Cancel subscription (if any)  │  │
│  │ • Get invoice/payment intent    │  │
│  │ • Create refund                 │  │
│  └────────────────────────────────┘  │
│           │                           │
│           ▼                           │
│  ┌────────────────────────────────┐  │
│  │ Return Success Response         │  │
│  │ {success, refund, subscription} │  │
│  └────────────────────────────────┘  │
└──────┬───────────────────────────────┘
       │
       │ 3. Response with refund details
       │
       ▼
┌──────────────────────────────────────┐
│  CampaignRefundManager Component     │
│                                       │
│  • Display success message            │
│  • Refresh payment data               │
│  • Update UI state                    │
└──────────────────────────────────────┘
```

## API Request/Response Examples

### Example 1: Refund a Subscription

**Request:**
```http
POST /api/stripe/refund
Content-Type: application/json

{
  "campaignId": "507f1f77bcf86cd799439011",
  "playerId": "507f191e810c19729de860ea",
  "subscriptionId": "sub_1234567890",
  "reason": "Campaign canceled by host"
}
```

**Response (Success):**
```json
{
  "success": true,
  "refund": {
    "id": "re_1234567890",
    "amount": 10.00,
    "status": "succeeded"
  },
  "subscription": {
    "id": "sub_1234567890",
    "status": "canceled"
  },
  "message": "Subscription canceled and refund issued successfully"
}
```

### Example 2: Refund a One-Time Payment

**Request:**
```http
POST /api/stripe/refund
Content-Type: application/json

{
  "campaignId": "507f1f77bcf86cd799439011",
  "playerId": "507f191e810c19729de860ea",
  "reason": "Campaign canceled by host"
}
```

**Response (Success):**
```json
{
  "success": true,
  "refunds": [
    {
      "id": "re_1234567890",
      "amount": 15.00,
      "status": "succeeded"
    }
  ],
  "message": "Successfully issued 1 refund(s)"
}
```

### Example 3: View Campaign Payments

**Request:**
```http
GET /api/stripe/campaign-payments?campaignId=507f1f77bcf86cd799439011
```

**Response:**
```json
{
  "campaignId": "507f1f77bcf86cd799439011",
  "payments": [
    {
      "playerId": "507f191e810c19729de860ea",
      "type": "subscription",
      "subscriptionId": "sub_1234567890",
      "status": "active",
      "amount": 10.00,
      "currency": "usd",
      "created": 1634567890,
      "cancelAtPeriodEnd": false
    },
    {
      "playerId": "507f191e810c19729de860eb",
      "type": "one_time",
      "paymentIntentId": "pi_1234567890",
      "status": "succeeded",
      "amount": 15.00,
      "currency": "usd",
      "created": 1634567890
    }
  ]
}
```

## UI Component States

### Loading State
```
┌─────────────────────────────────────┐
│  Player Payments                     │
│                                      │
│  Loading payment information...      │
└─────────────────────────────────────┘
```

### Loaded with Payments
```
┌─────────────────────────────────────────────────────────┐
│  Player Payments & Refunds                               │
│                                                          │
│  ┌───────────────────────────────────────────────────┐ │
│  │  😊 John Doe                                       │ │
│  │                                                     │ │
│  │  ┌─────────────────────────────────────────────┐  │ │
│  │  │ Subscription                                 │  │ │
│  │  │ $10.00 USD - active                         │  │ │
│  │  │                          [Issue Refund]      │  │ │
│  │  └─────────────────────────────────────────────┘  │ │
│  └───────────────────────────────────────────────────┘ │
│                                                          │
│  ┌───────────────────────────────────────────────────┐ │
│  │  😊 Jane Smith                                     │ │
│  │                                                     │ │
│  │  ┌─────────────────────────────────────────────┐  │ │
│  │  │ One-Time Payment                             │  │ │
│  │  │ $15.00 USD - succeeded                      │  │ │
│  │  │                          [Issue Refund]      │  │ │
│  │  └─────────────────────────────────────────────┘  │ │
│  └───────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

### Processing State
```
┌─────────────────────────────────────────────────────────┐
│  Player Payments & Refunds                               │
│                                                          │
│  ┌───────────────────────────────────────────────────┐ │
│  │  😊 John Doe                                       │ │
│  │                                                     │ │
│  │  ┌─────────────────────────────────────────────┐  │ │
│  │  │ Subscription                                 │  │ │
│  │  │ $10.00 USD - active                         │  │ │
│  │  │                          [Processing...]     │  │ │
│  │  └─────────────────────────────────────────────┘  │ │
│  └───────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

### Success State
```
┌─────────────────────────────────────────────────────────┐
│  Player Payments & Refunds                               │
│                                                          │
│  ┌───────────────────────────────────────────────────┐ │
│  │ ✅ Subscription canceled and refund issued         │ │
│  │    successfully                                     │ │
│  └───────────────────────────────────────────────────┘ │
│                                                          │
│  ┌───────────────────────────────────────────────────┐ │
│  │  😊 John Doe                                       │ │
│  │                                                     │ │
│  │  ┌─────────────────────────────────────────────┐  │ │
│  │  │ Subscription                                 │  │ │
│  │  │ $10.00 USD - canceled                       │  │ │
│  │  │                    [Already Canceled]        │  │ │
│  │  └─────────────────────────────────────────────┘  │ │
│  └───────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

### Error State
```
┌─────────────────────────────────────────────────────────┐
│  Player Payments & Refunds                               │
│                                                          │
│  ┌───────────────────────────────────────────────────┐ │
│  │ ❌ Failed to process refund. Please try again.     │ │
│  └───────────────────────────────────────────────────┘ │
│                                                          │
│  ┌───────────────────────────────────────────────────┐ │
│  │  😊 John Doe                                       │ │
│  │                                                     │ │
│  │  ┌─────────────────────────────────────────────┐  │ │
│  │  │ Subscription                                 │  │ │
│  │  │ $10.00 USD - active                         │  │ │
│  │  │                          [Issue Refund]      │  │ │
│  │  └─────────────────────────────────────────────┘  │ │
│  └───────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

## Security Flow

```
Request
   │
   ▼
┌─────────────────────────┐
│ Cookie-based Auth Check │ ──── ❌ Not logged in → 401 Unauthorized
└─────────────────────────┘
   │ ✓ Authenticated
   ▼
┌─────────────────────────┐
│ Get Campaign from DB    │ ──── ❌ Not found → 404 Not Found
└─────────────────────────┘
   │ ✓ Campaign exists
   ▼
┌─────────────────────────┐
│ Verify Host Ownership   │ ──── ❌ Not host → 403 Forbidden
└─────────────────────────┘
   │ ✓ User is host
   ▼
┌─────────────────────────┐
│ Get Player Customer ID  │ ──── ❌ Not found → 404 Not Found
└─────────────────────────┘
   │ ✓ Customer exists
   ▼
┌─────────────────────────┐
│ Verify Payment Belongs  │ ──── ❌ Wrong customer → 400 Bad Request
│ to Player               │
└─────────────────────────┘
   │ ✓ Payment verified
   ▼
┌─────────────────────────┐
│ Process Refund          │
└─────────────────────────┘
   │
   ▼
✅ Success Response
```

## Files Changed

```
gamefinder2/
├── app/
│   └── api/
│       └── stripe/
│           ├── refund/
│           │   └── route.ts (NEW)
│           └── campaign-payments/
│               └── route.ts (NEW)
├── components/
│   └── CampaignRefundManager.tsx (NEW)
├── REFUND_FUNCTIONALITY.md (NEW)
├── REFUND_IMPLEMENTATION_SUMMARY.md (NEW)
└── REFUND_VISUAL_SUMMARY.md (NEW)
```

## Integration Example

Add to your campaign management page:

```tsx
// app/campaigns/[id]/page.tsx

import CampaignRefundManager from "@/components/CampaignRefundManager";

export default function CampaignDetailPage() {
  // ... existing code ...
  
  return (
    <div>
      <h1>Campaign: {campaign.name}</h1>
      
      {/* Other campaign details */}
      
      {/* Show refund manager only to campaign host */}
      {campaign.userId === currentUserId && (
        <CampaignRefundManager
          campaignId={campaign.id}
          playerIds={campaign.signedUpPlayers}
          onRefundIssued={() => {
            // Optional: refresh campaign data
            router.refresh();
          }}
        />
      )}
    </div>
  );
}
```

## Testing Checklist

- [ ] Install Stripe test API keys
- [ ] Create a test campaign with payment
- [ ] Have test player join and pay with test card (4242 4242 4242 4242)
- [ ] Load campaign page as host
- [ ] Verify payments are displayed
- [ ] Click "Issue Refund" button
- [ ] Verify success message appears
- [ ] Check Stripe Dashboard for refund
- [ ] Verify player no longer has active subscription
- [ ] Test error cases (non-host trying to refund)

## Next Steps

1. Test in Stripe test mode
2. Integrate component into campaign pages
3. Add email notifications for refunds (future enhancement)
4. Add refund tracking in database (future enhancement)
5. Deploy to production with live Stripe keys
