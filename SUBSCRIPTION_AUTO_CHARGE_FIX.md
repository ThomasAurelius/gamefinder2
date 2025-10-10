# Subscription Auto-Charging Fix

## Problem
Subscriptions were not auto-charging when users entered their card information on the portal. After entering card details and confirming payment, users had to go to the Stripe Customer Portal (via "Manage Subscriptions") to manually pay the invoice before the subscription would activate.

## Root Cause
When the Level 3 fallback was triggered (manually creating a PaymentIntent when Stripe doesn't automatically create one), the created PaymentIntent was not properly linked to the subscription invoice. While the PaymentIntent allowed users to enter card details and confirm payment, the confirmed payment was not being applied to the invoice, so the subscription remained in an incomplete state.

## Solution

### Changes Made

#### 1. Updated PaymentIntent Creation (Level 3 Fallback)
**File**: `app/api/stripe/create-payment-intent/route.ts`

Added `setup_future_usage: "off_session"` parameter to the manually created PaymentIntent:

```typescript
const createdPaymentIntent = await stripe.paymentIntents.create({
  amount: latestInvoice.amount_due ?? Math.round(amount * 100),
  currency: latestInvoice.currency ?? "usd",
  customer: customerId,
  payment_method_types: ["card"],
  setup_future_usage: "off_session", // NEW: Save payment method for future use
  metadata: {
    invoiceId: latestInvoice.id,
    subscriptionId: subscription.id,
    campaignId: campaignId || "",
    campaignName: campaignName || "",
    userId,
  },
});
```

**Why this matters**: The `setup_future_usage: "off_session"` parameter tells Stripe to save the payment method after the user confirms payment, making it available for subscription billing.

#### 2. Created Subscription Payment Finalization Endpoint
**File**: `app/api/stripe/finalize-subscription-payment/route.ts` (NEW)

This endpoint is called after the user successfully confirms payment on the frontend. It:

1. Retrieves the confirmed PaymentIntent
2. Gets the payment method from the PaymentIntent
3. Updates the subscription's `default_payment_method` with the payment method
4. If the invoice is still open, manually pays it using the payment method

```typescript
// Update subscription with payment method
const subscription = await stripe.subscriptions.update(subscriptionId, {
  default_payment_method: paymentMethodId,
});

// Pay the invoice if still open
if (invoice.status === "open" && invoice.amount_due > 0) {
  await stripe.invoices.pay(invoiceId, {
    payment_method: paymentMethodId,
  });
}
```

#### 3. Updated Frontend Payment Flow
**File**: `components/StripePaymentForm.tsx`

After successful payment confirmation, the frontend now calls the finalization endpoint for subscription payments:

```typescript
const { error, paymentIntent } = await stripe.confirmPayment({
  elements,
  confirmParams: {
    return_url: `${window.location.origin}/payment/success`,
  },
  redirect: "if_required",
});

if (!error && paymentMode === "subscription" && paymentIntent) {
  // Finalize subscription payment
  await fetch("/api/stripe/finalize-subscription-payment", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ paymentIntentId: paymentIntent.id }),
  });
}
```

## How It Works

### Complete Flow

1. **Backend creates subscription** (as before)
   - Subscription created with `payment_behavior: "default_incomplete"`
   - Level 3 fallback manually creates PaymentIntent with `setup_future_usage: "off_session"`
   - Client secret sent to frontend

2. **User enters payment details**
   - Stripe Payment Element collects card information
   - User submits payment form

3. **Frontend confirms payment**
   - `stripe.confirmPayment()` processes the payment
   - Payment method is attached to customer (due to `setup_future_usage`)
   - PaymentIntent status becomes "succeeded"

4. **Frontend finalizes subscription** (NEW)
   - Calls `/api/stripe/finalize-subscription-payment`
   - Endpoint updates subscription with payment method
   - Endpoint pays the invoice
   - Subscription becomes active immediately

5. **Future recurring payments**
   - Stripe automatically charges the saved payment method
   - No manual intervention needed

## Testing

### Manual Testing Steps

1. Create a campaign with multiple sessions (triggers subscription mode)
2. Navigate to the payment page for that campaign
3. Enter test card details: `4242 4242 4242 4242`
4. Confirm the payment
5. ✅ Verify the subscription activates immediately (no need to go to Stripe portal)
6. Check Stripe Dashboard:
   - Subscription should be in "active" status
   - Invoice should be "paid"
   - Payment method should be saved to customer

### Expected Behavior

**Before Fix:**
- User enters card details ✅
- Payment confirms ✅  
- Subscription status: "incomplete" ❌
- User must go to Stripe Portal to pay invoice manually ❌

**After Fix:**
- User enters card details ✅
- Payment confirms ✅
- Subscription status: "active" ✅
- Invoice status: "paid" ✅
- No manual action needed ✅

## Impact

### Files Modified
1. `app/api/stripe/create-payment-intent/route.ts` - Added `setup_future_usage` parameter (1 line)
2. `components/StripePaymentForm.tsx` - Added finalization call (22 lines)

### Files Added
1. `app/api/stripe/finalize-subscription-payment/route.ts` - New endpoint (140 lines)

### Backward Compatibility
- ✅ One-time payments continue to work unchanged
- ✅ Normal subscription flow (Levels 1 & 2) works unchanged
- ✅ Only affects subscriptions that trigger Level 3 fallback
- ✅ No database schema changes
- ✅ No changes to existing subscriptions

## Error Handling

The finalization endpoint includes comprehensive error handling:

1. **PaymentIntent not found**: Returns 400 error
2. **Payment not yet succeeded**: Returns status without failing
3. **No payment method**: Returns 400 error
4. **Subscription update fails**: Returns 500 error with details
5. **Invoice payment fails**: Logs error but doesn't fail request (subscription is already updated)

All errors are logged to the console for debugging.

## Monitoring

Check server logs for these messages:

### Success Path
```
Finalizing subscription payment for PaymentIntent: pi_xxx
PaymentIntent details: { id: 'pi_xxx', status: 'succeeded', ... }
Updating subscription with payment method: pm_xxx
Subscription updated: { id: 'sub_xxx', status: 'active', ... }
Invoice status: { id: 'in_xxx', status: 'open', ... }
Paying invoice with payment method...
Invoice paid successfully: { id: 'in_xxx', status: 'paid', ... }
```

### Error Indicators
```
PaymentIntent has not succeeded yet: processing
No payment method found on PaymentIntent
Error handling invoice payment: [error details]
```

## Alternative Approaches Considered

1. **Use SetupIntent instead of PaymentIntent**: Would require more significant frontend changes
2. **Use Stripe webhooks**: Would require webhook infrastructure and complicate the flow
3. **Attach PaymentIntent directly to invoice**: Not possible for existing invoices via Stripe API

The implemented solution was chosen for:
- Minimal code changes
- No infrastructure requirements (no webhooks needed)
- Works with existing frontend payment flow
- Clear error handling and debugging

## References

- [Stripe PaymentIntents API](https://stripe.com/docs/api/payment_intents)
- [Stripe Subscriptions with PaymentIntent](https://stripe.com/docs/billing/subscriptions/overview)
- [Stripe setup_future_usage parameter](https://stripe.com/docs/api/payment_intents/create#create_payment_intent-setup_future_usage)
