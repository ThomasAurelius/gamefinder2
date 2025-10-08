# Subscription Management Feature Implementation

## Overview
This document describes the implementation of the subscription management feature that displays a "Manage Subscription" link instead of a payment form when a user already has an active subscription for a campaign.

## Problem Statement
Previously, when a user visited a campaign payment page, they would always see the payment form, even if they already had an active subscription. This could lead to confusion and potential duplicate subscriptions.

## Solution
The payment page now checks if the user has an active subscription for the campaign and, if so, displays a "Manage Subscription" link that directs them to the Stripe billing portal (same URL used in the Settings page).

## Implementation Details

### 1. New API Endpoint: `/api/stripe/check-subscription`

**Location:** `app/api/stripe/check-subscription/route.ts`

**Purpose:** Check if the authenticated user has an active subscription for a specific campaign.

**Request:**
- Method: GET
- Query Parameters: `campaignId` (required)
- Authentication: Required (via cookies)

**Response:**
```typescript
{
  hasActiveSubscription: boolean;
  subscriptionId?: string; // Only present if subscription exists
}
```

**Logic:**
1. Validates that user is authenticated and campaignId is provided
2. Checks if Stripe is configured (returns `false` if not)
3. Retrieves user's Stripe customer ID from database
4. Queries Stripe for active subscriptions for that customer
5. Searches subscriptions for one with matching `campaignId` in metadata
6. Returns whether an active subscription was found

**Error Handling:**
- Returns 400 if campaignId is missing
- Returns 401 if user is not authenticated
- Returns 500 for server errors
- Gracefully handles missing Stripe configuration

### 2. Payment Page Updates

**Location:** `app/campaigns/[id]/payment/page.tsx`

**New State Variables:**
```typescript
const [hasActiveSubscription, setHasActiveSubscription] = useState(false);
const [isCheckingSubscription, setIsCheckingSubscription] = useState(false);
```

**New useEffect Hook:**
- Triggers when campaign data is loaded and payment mode is "subscription"
- Calls the check-subscription API endpoint
- Updates `hasActiveSubscription` state based on response
- Silently fails (logs error but doesn't show to user) if check fails

**Payment Initialization Updates:**
- Now skips payment initialization if `hasActiveSubscription` is `true`
- Depends on `isCheckingSubscription` to avoid race conditions

**UI Updates:**
When `hasActiveSubscription` is `true`:
- Displays emerald-colored info box: "You have an active subscription for this campaign."
- Shows "Manage Subscription (Stripe Dashboard)" button
- Button links to: `https://billing.stripe.com/p/login/00w4gy3Jmad7bDT6k273G00`
- Uses same styling as other buttons (sky-600 background)

## User Experience Flow

### Without Active Subscription
1. User visits campaign payment page
2. Page checks for active subscription → Not found
3. Payment form is displayed
4. User can complete payment/subscription

### With Active Subscription
1. User visits campaign payment page
2. Page checks for active subscription → Found
3. Info message displayed: "You have an active subscription for this campaign."
4. "Manage Subscription" link displayed instead of payment form
5. User clicks link → Opens Stripe billing portal in new tab
6. User can manage/cancel subscription in Stripe portal

## Edge Cases Handled

1. **Stripe Not Configured**: Returns `hasActiveSubscription: false`, allows normal flow
2. **User Has No Customer ID**: Returns `hasActiveSubscription: false`
3. **User Not Authenticated**: Returns 401 error (gracefully handled by page)
4. **API Call Fails**: Logs error, assumes no subscription, shows payment form
5. **One-time Payment Campaign**: Check is skipped (only runs for subscription mode)
6. **Multiple Subscriptions**: Searches all active subscriptions for campaign match

## Testing Recommendations

### Manual Testing Steps

1. **Test Without Subscription:**
   - Create a multi-session campaign (subscription mode)
   - Visit payment page
   - Verify payment form is displayed
   - Complete subscription

2. **Test With Active Subscription:**
   - Using same user from step 1
   - Visit the same campaign's payment page
   - Verify "Manage Subscription" link is shown instead of payment form
   - Click link and verify it opens Stripe billing portal

3. **Test One-Time Payment:**
   - Create a single-session campaign
   - Visit payment page
   - Verify subscription check is skipped
   - Verify payment form is displayed normally

4. **Test Without Stripe Configuration:**
   - Remove STRIPE_SECRET_KEY from environment
   - Visit payment page
   - Verify graceful degradation (error message about Stripe not configured)

### Integration Testing Considerations

- Test with test Stripe API keys
- Verify metadata is correctly stored on subscriptions during creation
- Test canceling subscription and revisiting payment page
- Test with expired subscriptions (should not show "Manage Subscription")

## Security Considerations

1. **Authentication Required**: All endpoints require valid user session
2. **User Isolation**: Users can only check their own subscriptions
3. **No Sensitive Data Exposure**: Only returns boolean flag, not subscription details
4. **Stripe API Keys**: Properly secured in environment variables
5. **External Link Safety**: Stripe billing portal link uses `target="_blank"` with `rel="noopener noreferrer"`

## Performance Considerations

1. **Additional API Call**: Adds one API call per page load for subscription campaigns
2. **Stripe API Call**: One Stripe API call per subscription check
3. **Caching Opportunity**: Could cache subscription status for short period
4. **Race Condition Prevention**: Uses `isCheckingSubscription` flag to prevent payment initialization during check

## Future Enhancements

1. **Cache Subscription Status**: Cache in session/local storage to reduce API calls
2. **Show Subscription Details**: Display subscription period, next billing date
3. **Direct Cancellation**: Allow cancellation directly from payment page
4. **Subscription Status Badge**: Show subscription status on campaign cards
5. **Email Notifications**: Notify users when subscription needs attention

## Related Files

- `app/api/stripe/check-subscription/route.ts` - New API endpoint
- `app/campaigns/[id]/payment/page.tsx` - Updated payment page
- `app/settings/page.tsx` - Original Manage Subscription link location
- `app/api/stripe/create-payment-intent/route.ts` - Subscription creation logic
- `lib/users.ts` - Customer ID retrieval functions

## References

- Stripe Dashboard Link: `https://billing.stripe.com/p/login/00w4gy3Jmad7bDT6k273G00`
- Stripe Subscriptions API: https://stripe.com/docs/api/subscriptions
- Stripe Customer Portal: https://stripe.com/docs/billing/subscriptions/integrating-customer-portal
