# Subscription Payment Fix

## Issue
Subscriptions were failing to initialize because no PaymentIntent was being created on the subscription's first invoice.

## Root Cause
When creating Stripe subscriptions with `payment_behavior: "default_incomplete"` without specifying `payment_method_types` in `payment_settings`, Stripe attempts to automatically determine which payment methods to enable for the invoice's PaymentIntent. However, since we're creating a fresh customer without any payment methods attached, Stripe cannot auto-determine the payment method types, resulting in no PaymentIntent being created on the invoice. This causes the error "Failed to initialize subscription payment".

## Solution

### Changes Made to `/app/api/stripe/create-payment-intent/route.ts`

#### Added Explicit Payment Method Types (Line 112)
**Before:**
```typescript
payment_settings: {
  save_default_payment_method: "on_subscription",
},
```

**After:**
```typescript
payment_settings: {
  save_default_payment_method: "on_subscription",
  payment_method_types: ["card"],
},
```

**Why this helps**: Explicitly specifying `payment_method_types: ["card"]` ensures that Stripe creates a PaymentIntent on the subscription's first invoice with card payments enabled. Without this explicit specification, Stripe attempts to auto-determine payment methods by looking at the customer's default payment method, subscription's default payment method, or invoice template settings. Since we're creating a fresh customer without any payment methods attached, Stripe fails to auto-determine them, resulting in no PaymentIntent being created. By explicitly specifying card payments, we guarantee the PaymentIntent is created and can be used with the Payment Element on the frontend.

## How Subscription Payments Work

1. **Backend Creates Subscription**:
   - Customer is created in Stripe
   - Price object is created for the recurring subscription
   - Subscription is created with `payment_behavior: "default_incomplete"`
   - This generates an invoice with an associated PaymentIntent
   - The PaymentIntent is automatically configured with appropriate payment methods since we don't restrict `payment_method_types`

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
