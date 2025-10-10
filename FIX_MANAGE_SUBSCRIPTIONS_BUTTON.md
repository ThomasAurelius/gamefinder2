# Fix: Manage Subscriptions Button Issue

## Problem
The "Manage All Subscriptions" button in the Manage Subscriptions page (`/subscriptions`) was behaving the same as the individual subscription "Manage" buttons, instead of showing a general overview of all subscriptions.

## Root Cause
Both buttons were calling the same `handleManageSubscription()` function with identical parameters (no parameters), resulting in identical behavior. The Stripe Customer Portal API was being called without any `flow_data`, which shows the default portal homepage.

## Solution Implemented

### 1. Updated Frontend (`app/subscriptions/page.tsx`)
- Modified `handleManageSubscription` to accept an optional `subscriptionId` parameter
- **"Manage All Subscriptions" button**: Calls `handleManageSubscription()` without a subscription ID
- **Individual "Manage" buttons**: Call `handleManageSubscription(subscription.id)` with the specific subscription ID

### 2. Updated Backend (`app/api/stripe/create-portal-session/route.ts`)
- Added support for optional `subscriptionId` in request body
- When `subscriptionId` is provided:
  - Uses Stripe's `flow_data` parameter with type `subscription_update`
  - Navigates directly to that specific subscription in the portal
  - Configures `after_completion` to redirect back to the return URL
- When `subscriptionId` is NOT provided:
  - Opens the default portal homepage showing all customer information and subscriptions

## User Experience

### Before Fix
Both buttons → Same behavior (portal homepage or potentially last viewed page)

### After Fix
- **"Manage All Subscriptions"** → Opens Stripe Customer Portal to overview/homepage showing all subscriptions and account information
- **Individual "Manage"** → Opens Stripe Customer Portal directly to that specific subscription's management page

## Technical Details

### Stripe API Usage
```typescript
// For general portal access (no subscriptionId)
stripe.billingPortal.sessions.create({
  customer: customerId,
  return_url: returnUrl,
  configuration: configId,
});

// For specific subscription access (with subscriptionId)
stripe.billingPortal.sessions.create({
  customer: customerId,
  return_url: returnUrl,
  configuration: configId,
  flow_data: {
    type: 'subscription_update',
    subscription_update: {
      subscription: subscriptionId,
    },
    after_completion: {
      type: 'redirect',
      redirect: {
        return_url: returnUrl,
      },
    },
  },
});
```

## Backward Compatibility
All other usages of the `/api/stripe/create-portal-session` endpoint remain unaffected:
- Campaign detail page (`/campaigns/[id]`)
- Payment page (`/campaigns/[id]/payment`)
- Settings page (`/settings`)

These pages don't pass a `subscriptionId`, so they continue to open the portal homepage as before.

## Files Changed
- `app/subscriptions/page.tsx` - Updated button click handlers
- `app/api/stripe/create-portal-session/route.ts` - Added subscription-specific flow logic

## Testing Checklist
- [ ] "Manage All Subscriptions" button shows portal overview
- [ ] Individual subscription "Manage" buttons navigate to specific subscription
- [ ] Campaign page "Manage Subscription" button still works (shows overview)
- [ ] Settings page "Manage Billing" button still works (shows overview)
- [ ] Payment page "Manage Subscription" button still works (shows overview)
