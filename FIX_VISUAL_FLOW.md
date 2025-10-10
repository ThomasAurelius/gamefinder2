# Visual Flow Diagram: Manage Subscriptions Button Fix

## Before Fix

```
User on /subscriptions page with 3 subscriptions
│
├─► Clicks "Manage All Subscriptions" (top button)
│   └─► handleManageSubscription()
│       └─► API: POST /api/stripe/create-portal-session
│           └─► No flow_data
│               └─► Stripe Portal: Homepage
│
└─► Clicks "Manage" on Subscription #2 (individual button)
    └─► handleManageSubscription()
        └─► API: POST /api/stripe/create-portal-session
            └─► No flow_data
                └─► Stripe Portal: Homepage (same as above!)
```

**Problem**: Both buttons behaved identically, causing confusion.

## After Fix

```
User on /subscriptions page with 3 subscriptions
│
├─► Clicks "Manage All Subscriptions" (top button)
│   └─► handleManageSubscription()
│       └─► API: POST /api/stripe/create-portal-session
│           ├─► subscriptionId: undefined
│           └─► No flow_data
│               └─► Stripe Portal: Homepage
│                   └─► Shows all subscriptions, account info, invoices
│
└─► Clicks "Manage" on Subscription #2 (individual button)
    └─► handleManageSubscription(subscription.id)
        └─► API: POST /api/stripe/create-portal-session
            ├─► subscriptionId: "sub_xxx"
            └─► flow_data: {
                    type: 'subscription_update',
                    subscription_update: { subscription: "sub_xxx" }
                }
                └─► Stripe Portal: Subscription #2 Update Page
                    └─► Direct access to manage that specific subscription
```

**Solution**: Different behaviors for different contexts!

## API Logic Flow

```typescript
POST /api/stripe/create-portal-session
{
  returnUrl: "https://app.com/subscriptions",
  subscriptionId?: "sub_xxx" // Optional
}

↓

if (subscriptionId) {
  // Individual subscription management
  Create session WITH flow_data
  └─► User lands on specific subscription page
} else {
  // General portal access
  Create session WITHOUT flow_data
  └─► User lands on portal homepage
}

↓

Return: { url: "https://billing.stripe.com/..." }
```

## User Experience Comparison

### Scenario: User has 3 subscriptions (A, B, C)

#### "Manage All Subscriptions" Button
**Before**: Portal homepage (possibly showing last viewed subscription)
**After**: Portal homepage with overview of subscriptions A, B, and C

#### "Manage" Button on Subscription B
**Before**: Portal homepage (user must find subscription B)
**After**: Directly opens subscription B management page

## Code Changes Summary

### Frontend (app/subscriptions/page.tsx)

```diff
- const handleManageSubscription = async () => {
+ const handleManageSubscription = async (subscriptionId?: string) => {
    const response = await fetch("/api/stripe/create-portal-session", {
      body: JSON.stringify({
        returnUrl: `${window.location.origin}/subscriptions`,
+       subscriptionId,
      }),
    });
  };

  // Top button - shows all subscriptions
- <button onClick={handleManageSubscription}>
+ <button onClick={() => handleManageSubscription()}>

  // Individual button - shows specific subscription  
- <button onClick={handleManageSubscription}>
+ <button onClick={() => handleManageSubscription(subscription.id)}>
```

### Backend (app/api/stripe/create-portal-session/route.ts)

```diff
  const body = await request.json();
  const returnUrl = body.returnUrl || `${request.headers.get("origin")}/subscriptions`;
+ const subscriptionId = body.subscriptionId;

  const sessionParams: Stripe.BillingPortal.SessionCreateParams = {
    customer: customerId,
    return_url: returnUrl,
  };

+ // Navigate directly to specific subscription if ID provided
+ if (subscriptionId) {
+   sessionParams.flow_data = {
+     type: 'subscription_update',
+     subscription_update: {
+       subscription: subscriptionId,
+     },
+     after_completion: {
+       type: 'redirect',
+       redirect: { return_url: returnUrl },
+     },
+   };
+ }

  const session = await stripe.billingPortal.sessions.create(sessionParams);
```

## Backward Compatibility

Other pages that use the same API remain unaffected:

```
Campaign Page (/campaigns/[id])
  └─► handleManageSubscription()
      └─► No subscriptionId
          └─► Portal homepage ✅

Payment Page (/campaigns/[id]/payment)  
  └─► handleManageSubscription()
      └─► No subscriptionId
          └─► Portal homepage ✅

Settings Page (/settings)
  └─► handleManageBilling()
      └─► No subscriptionId
          └─► Portal homepage ✅
```

All existing functionality preserved! 🎉
