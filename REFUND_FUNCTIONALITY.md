# Refund Functionality for Hosts

## Overview

This document describes the refund functionality that allows game hosts (DMs) to issue refunds to players when they need to cancel a campaign or session.

## Features

### 1. Refund API Endpoint

**Endpoint:** `POST /api/stripe/refund`

Allows campaign hosts to issue refunds to players who have paid for the campaign.

#### Request Body

```json
{
  "campaignId": "string (required)",
  "playerId": "string (required)",
  "subscriptionId": "string (optional)",
  "reason": "string (optional)"
}
```

#### Authorization

- Only the campaign host (the user who created the campaign) can issue refunds
- The requesting user must be authenticated

#### Functionality

**For Subscriptions:**
1. Verifies the subscription belongs to the specified player
2. Cancels the subscription immediately (no waiting for period end)
3. Retrieves the latest invoice for the subscription
4. Issues a refund if the invoice has been paid
5. Returns details about the canceled subscription and refund

**For One-Time Payments:**
1. Searches for payment intents for the campaign and player
2. Finds all successful payments
3. Issues refunds for all successful charges
4. Returns details about all refunds issued

#### Response Format

**Success Response (Subscription):**
```json
{
  "success": true,
  "refund": {
    "id": "re_xxx",
    "amount": 10.00,
    "status": "succeeded"
  },
  "subscription": {
    "id": "sub_xxx",
    "status": "canceled"
  },
  "message": "Subscription canceled and refund issued successfully"
}
```

**Success Response (One-Time Payment):**
```json
{
  "success": true,
  "refunds": [
    {
      "id": "re_xxx",
      "amount": 10.00,
      "status": "succeeded"
    }
  ],
  "message": "Successfully issued 1 refund(s)"
}
```

**Error Responses:**
- `401 Unauthorized` - User not authenticated
- `403 Forbidden` - User is not the campaign host
- `404 Not Found` - Campaign, player, or payment not found
- `500 Internal Server Error` - Stripe API error or other server error

### 2. Campaign Payments API Endpoint

**Endpoint:** `GET /api/stripe/campaign-payments?campaignId={id}&playerId={id}`

Allows campaign hosts to view payment details for their campaigns.

#### Query Parameters

- `campaignId` (required) - The ID of the campaign
- `playerId` (optional) - If provided, only returns payments for this specific player

#### Authorization

- Only the campaign host can view payment details
- The requesting user must be authenticated

#### Response Format

```json
{
  "campaignId": "xxx",
  "payments": [
    {
      "playerId": "xxx",
      "type": "subscription",
      "subscriptionId": "sub_xxx",
      "status": "active",
      "amount": 10.00,
      "currency": "usd",
      "created": 1234567890,
      "cancelAtPeriodEnd": false
    },
    {
      "playerId": "xxx",
      "type": "one_time",
      "paymentIntentId": "pi_xxx",
      "status": "succeeded",
      "amount": 15.00,
      "currency": "usd",
      "created": 1234567890
    }
  ]
}
```

## Usage Examples

### Issuing a Refund for a Subscription

```javascript
async function refundSubscription(campaignId, playerId, subscriptionId, reason) {
  const response = await fetch('/api/stripe/refund', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      campaignId,
      playerId,
      subscriptionId,
      reason: reason || 'Campaign canceled by host',
    }),
  });

  const data = await response.json();
  
  if (data.success) {
    console.log('Refund successful:', data.refund);
    console.log('Subscription canceled:', data.subscription);
  } else {
    console.error('Refund failed:', data.error);
  }
}
```

### Issuing a Refund for One-Time Payments

```javascript
async function refundOneTimePayment(campaignId, playerId, reason) {
  const response = await fetch('/api/stripe/refund', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      campaignId,
      playerId,
      reason: reason || 'Campaign canceled by host',
    }),
  });

  const data = await response.json();
  
  if (data.success) {
    console.log('Refunds issued:', data.refunds);
  } else {
    console.error('Refund failed:', data.error);
  }
}
```

### Viewing Campaign Payments

```javascript
async function viewCampaignPayments(campaignId) {
  const response = await fetch(
    `/api/stripe/campaign-payments?campaignId=${campaignId}`
  );
  
  const data = await response.json();
  
  if (data.payments) {
    console.log('Payments for campaign:', data.payments);
  } else {
    console.error('Failed to fetch payments:', data.error);
  }
}
```

## Security Considerations

1. **Host Verification:** The API verifies that the requesting user is the campaign host before processing any refund
2. **Player Verification:** The API verifies that subscriptions and payments belong to the specified player
3. **Authentication Required:** All endpoints require user authentication via cookies
4. **Stripe Customer Validation:** The API verifies player payment profiles exist before processing refunds

## Error Handling

The refund API includes comprehensive error handling:

1. **Invalid Request:** Returns 400 if required parameters are missing
2. **Authentication Errors:** Returns 401 if user is not authenticated
3. **Authorization Errors:** Returns 403 if user is not the campaign host
4. **Not Found Errors:** Returns 404 if campaign, player, or payment not found
5. **Stripe Errors:** Returns 500 with detailed error messages for Stripe API failures

## Logging

The API logs the following events:

- Refund requests (campaign, player, subscription, reason)
- Subscription cancellations (subscription ID, status, canceled timestamp)
- Refunds issued (refund ID, amount, status)
- Payment intent processing (payment ID, amount)
- Errors (with detailed error information)

## Testing

To test the refund functionality in Stripe test mode:

1. Create a test campaign with payment enabled
2. Have a test player join and pay (using test credit card: 4242 4242 4242 4242)
3. As the host, use the refund API to issue a refund
4. Verify in Stripe Dashboard that:
   - The subscription is canceled (if applicable)
   - The refund is created
   - The refund status is "succeeded"

## UI Component

### CampaignRefundManager Component

**Location:** `components/CampaignRefundManager.tsx`

A React component that provides a user interface for hosts to manage refunds.

#### Props

```typescript
{
  campaignId: string;
  playerIds: string[];
  onRefundIssued?: () => void;
}
```

#### Features

- Automatically fetches payment information for all players
- Displays subscriptions and one-time payments
- Shows payment status and amount
- Provides "Issue Refund" button for each payment
- Displays success/error messages
- Refreshes payment data after refund

#### Usage Example

```tsx
import CampaignRefundManager from "@/components/CampaignRefundManager";

export default function CampaignManagementPage({ campaign }) {
  const handleRefundIssued = () => {
    // Optional callback when refund is issued
    console.log("Refund issued, refreshing campaign data...");
  };

  return (
    <div>
      <h1>Manage Campaign</h1>
      
      {/* Show refund manager only to campaign host */}
      {campaign.userId === currentUserId && (
        <CampaignRefundManager
          campaignId={campaign.id}
          playerIds={campaign.signedUpPlayers}
          onRefundIssued={handleRefundIssued}
        />
      )}
    </div>
  );
}
```

## Future Enhancements

Possible future improvements:

1. **Partial Refunds:** Allow hosts to issue partial refunds
2. **Refund History:** Track all refunds in the database
3. **Automatic Refunds:** Automatically refund all players when a campaign is deleted
4. **Refund Notifications:** Send email notifications to players when refunds are issued
5. **Bulk Refunds:** Allow hosts to refund all players at once with a single action
6. **Refund Reason Field:** Add a text field for hosts to provide custom refund reasons

## Related Documentation

- [STRIPE_SETUP.md](./STRIPE_SETUP.md) - Stripe configuration guide
- [CUSTOMER_ID_FIX.md](./CUSTOMER_ID_FIX.md) - Customer ID management
- [app/terms-paid-games/page.tsx](./app/terms-paid-games/page.tsx) - Terms of service including refund policy
