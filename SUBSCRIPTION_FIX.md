# Subscription Payment Fix

## Issue
Subscriptions were failing while one-off card payments worked correctly.

## Root Cause
When creating Stripe subscriptions with `payment_behavior: "default_incomplete"`, one configuration issue prevented successful payment:

1. **Explicit payment method types**: The subscription creation had `payment_method_types: ["card"]` explicitly set in the `payment_settings`, which can limit Stripe's ability to dynamically handle payment methods and may cause compatibility issues with the Payment Element.

## Solution

### Changes Made to `/app/api/stripe/create-payment-intent/route.ts`

**Before:**
```typescript
payment_settings: {
  save_default_payment_method: "on_subscription",
  payment_method_types: ["card"],
},
```

**After:**
```typescript
payment_settings: {
  save_default_payment_method: "on_subscription",
},
```

**Why this helps**: Removing the explicit `payment_method_types` allows Stripe to automatically determine which payment methods should be available based on your Stripe account configuration and the Payment Element's capabilities. This makes the integration more flexible and compatible with Stripe's recommended practices.

## Important Note

A previous version of this fix included code to update the PaymentIntent with `automatic_payment_methods`, but this was removed because:
- The `automatic_payment_methods` parameter can only be set when **creating** a PaymentIntent, not when updating it
- Attempting to update a PaymentIntent with this parameter causes a TypeScript compilation error
- The PaymentIntent created by Stripe when the subscription is initialized already has the correct configuration for the Payment Element to work properly

## How Subscription Payments Work

1. **Backend Creates Subscription**:
   - Customer is created in Stripe
   - Price object is created for the recurring subscription
   - Subscription is created with `payment_behavior: "default_incomplete"`
   - This generates an invoice with an associated PaymentIntent
   - The PaymentIntent is automatically configured by Stripe to work with the Payment Element

2. **Frontend Collects Payment**:
   - Client secret from the PaymentIntent is sent to the frontend
   - Stripe Payment Element is rendered with the client secret
   - User enters payment details
   - `stripe.confirmPayment()` is called to process the payment

3. **Subscription Activates**:
   - Once the payment is confirmed, the subscription becomes active
   - Future payments will be automatically charged based on the saved payment method

## Testing

To test subscription payments:

1. Create a campaign with multiple sessions (triggers subscription mode)
2. Navigate to the payment page for that campaign
3. Enter test card details (e.g., 4242 4242 4242 4242)
4. Confirm the payment
5. Verify the subscription is created successfully in your Stripe Dashboard

## Impact on Existing Code

- ✅ One-off payments continue to work as before (no changes to that code path)
- ✅ No changes required to frontend components
- ✅ No database schema changes needed
- ✅ Backward compatible with existing subscriptions

## References

- [Stripe Subscriptions API](https://stripe.com/docs/api/subscriptions)
- [Stripe Payment Element](https://stripe.com/docs/payments/payment-element)
- [Stripe PaymentIntents](https://stripe.com/docs/api/payment_intents)
