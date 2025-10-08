# Fix: Subscription Button Display Issue

## Issue Description
Users with active subscriptions were incorrectly seeing "Proceed to payment" instead of "Manage Subscription" button on campaign pages.

## Root Cause Analysis

The subscription check logic in both the campaign detail page and payment page was conditional:
- It only checked for active subscriptions on campaigns where `sessionsLeft > 1`
- This meant campaigns with `sessionsLeft <= 1`, `sessionsLeft = 0`, or missing `sessionsLeft` property would skip the subscription check
- Users with active subscriptions to these campaigns would see incorrect UI

### Why This Was Problematic

1. **Dynamic Campaign State**: A campaign that starts with multiple sessions (`sessionsLeft = 10`) might later have fewer sessions as they're completed
2. **Subscription Persistence**: The user's subscription remains active in Stripe regardless of the campaign's current `sessionsLeft` value
3. **Mismatch**: The UI logic assumed "no subscription check needed" meant "no subscription exists", but this wasn't always true

## Solution

Changed both pages to check for active subscriptions on **all paid campaigns** (where `costPerSession > 0`), not just multi-session campaigns.

### Changes Made

#### File: `app/campaigns/[id]/page.tsx`
- **Line 260-264**: Removed the condition that checked `sessionsLeft > 1`
- **Result**: Subscription check now runs for any campaign with `costPerSession > 0`

```typescript
// Before
if (!campaign || !campaign.sessionsLeft || campaign.sessionsLeft <= 1) {
  setHasActiveSubscription(false);
  return;
}
if (!campaign.costPerSession || campaign.costPerSession <= 0) {
  setHasActiveSubscription(false);
  return;
}

// After
if (!campaign || !campaign.costPerSession || campaign.costPerSession <= 0) {
  setHasActiveSubscription(false);
  return;
}
```

#### File: `app/campaigns/[id]/payment/page.tsx`
- **Line 69-72**: Changed condition from checking `paymentMode === "subscription"` to checking `costPerSession > 0`
- **Line 94**: Updated dependency array to remove `paymentMode` (no longer needed)

```typescript
// Before
if (!campaign || paymentMode !== "subscription") {
  return;
}

// After
if (!campaign || !campaign.costPerSession || campaign.costPerSession <= 0) {
  return;
}
```

## Impact

### Positive Changes
1. ✅ Users with active subscriptions always see "Manage Subscription" button
2. ✅ Works correctly regardless of campaign's current `sessionsLeft` value
3. ✅ Handles edge cases where `sessionsLeft` is missing or incorrect
4. ✅ Prevents attempts to create duplicate subscriptions

### No Breaking Changes
- Free campaigns (`costPerSession = 0`) continue to work as before (no subscription check)
- New subscriptions can still be created for campaigns without existing subscriptions
- Existing fallback logic in payment page (lines 142-148) remains as additional safety net

## User Experience Flow

### Scenario 1: User with Active Subscription
1. User visits campaign detail page
2. **Subscription check runs** (because `costPerSession > 0`)
3. API returns `hasActiveSubscription: true`
4. UI shows "Manage Subscription" button ✅
5. If user clicks, they're taken to Stripe billing portal

### Scenario 2: User without Subscription
1. User visits campaign detail page
2. **Subscription check runs** (because `costPerSession > 0`)
3. API returns `hasActiveSubscription: false`
4. UI shows "Proceed to payment" button ✅
5. User can complete payment/subscription as normal

### Scenario 3: Edge Case - Direct Payment Page Access
1. User with subscription navigates directly to `/campaigns/[id]/payment`
2. **Subscription check runs** (because `costPerSession > 0`)
3. Payment initialization is skipped (line 108)
4. UI shows "Manage Subscription" button ✅
5. If somehow the check fails, fallback logic (lines 142-148) catches it

## Testing Checklist

To verify this fix works correctly:

- [ ] User with active subscription sees "Manage Subscription" on `/campaigns/[id]`
- [ ] User with active subscription sees "Manage Subscription" on `/campaigns/[id]/payment`
- [ ] User without subscription sees "Proceed to payment" as expected
- [ ] Free campaigns (`costPerSession = 0`) don't show payment buttons
- [ ] Works for campaigns with `sessionsLeft > 1`
- [ ] Works for campaigns with `sessionsLeft = 1`
- [ ] Works for campaigns with `sessionsLeft = 0`
- [ ] Works for campaigns with missing `sessionsLeft` property
- [ ] No duplicate subscriptions can be created

## Technical Details

### API Endpoint
The subscription check uses `/api/stripe/check-subscription?campaignId={id}` which:
1. Authenticates the user via cookies
2. Fetches user's Stripe customer ID from database
3. Queries Stripe for active subscriptions
4. Searches subscriptions for one with matching `campaignId` in metadata
5. Returns `{ hasActiveSubscription: boolean, subscriptionId?: string }`

### Error Handling
Both pages handle subscription check failures gracefully:
- Network errors: Assumes no subscription (safe default)
- API errors: Assumes no subscription (safe default)
- Missing Stripe config: Returns `hasActiveSubscription: false`
- No customer ID: Returns `hasActiveSubscription: false`

## Related Files
- `app/campaigns/[id]/page.tsx` - Campaign detail page
- `app/campaigns/[id]/payment/page.tsx` - Payment page
- `app/api/stripe/check-subscription/route.ts` - Subscription check API
- `SUBSCRIPTION_STATUS_FEATURE.md` - Original feature documentation

## Verification
Build Status: ✅ Passed
TypeScript Errors: ✅ None
Lint Warnings: ✅ None (only pre-existing img tag warnings)
