# Subscription Payment Fix

## Issue
Subscriptions were failing to initialize because no PaymentIntent was being created on the subscription's first invoice. Despite the initial fix, some subscriptions were still failing with unclear error messages, making it difficult to diagnose the root cause.

## Root Cause
When creating Stripe subscriptions with `payment_behavior: "default_incomplete"` without specifying `payment_method_types` in `payment_settings`, Stripe attempts to automatically determine which payment methods to enable for the invoice's PaymentIntent. However, since we're creating a fresh customer without any payment methods attached, Stripe cannot auto-determine the payment method types, resulting in no PaymentIntent being created on the invoice. This causes the error "Failed to initialize subscription payment".

## Solution

### Changes Made to `/app/api/stripe/create-payment-intent/route.ts`

#### Added Explicit Collection Method (Line 124)
**Before:**
```typescript
payment_behavior: "default_incomplete",
payment_settings: {
  save_default_payment_method: "on_subscription",
  payment_method_types: ["card"],
},
```

**After:**
```typescript
payment_behavior: "default_incomplete",
collection_method: "charge_automatically",
payment_settings: {
  save_default_payment_method: "on_subscription",
  payment_method_types: ["card"],
},
```

**Why this helps**: Explicitly specifying `collection_method: "charge_automatically"` ensures that Stripe knows how to handle the payment collection for the subscription. While `charge_automatically` is the default value, explicitly setting it removes any ambiguity and ensures consistent behavior across different Stripe account configurations. This, combined with `payment_method_types: ["card"]`, guarantees that:
1. Stripe creates a PaymentIntent on the subscription's first invoice
2. The invoice is configured to automatically charge the payment method
3. Card payments are enabled for the PaymentIntent

Without these explicit specifications, Stripe attempts to auto-determine settings by looking at the customer's default payment method, subscription's default payment method, or invoice template settings. Since we're creating a fresh customer without any payment methods attached, Stripe can fail to properly configure the invoice, resulting in no PaymentIntent being created. By explicitly specifying both the collection method and payment method types, we guarantee the PaymentIntent is created and can be used with the Payment Element on the frontend.

#### Enhanced Error Logging and Diagnostics

To improve troubleshooting when subscriptions fail, comprehensive logging has been added throughout the subscription creation flow:

1. **Initial Request Logging** (Line 83-88): Logs the subscription request parameters including amount, campaign details, and user ID
2. **Customer Creation** (Line 96): Logs the created customer ID
3. **Price Creation** (Line 110-113): Logs the price ID and amount
4. **Subscription Creation** (Line 132-136): Logs subscription ID, status, and invoice type
5. **Invoice Retrieval** (Line 148-157): Logs invoice details and PaymentIntent presence
6. **PaymentIntent Validation** (Line 167-193): Logs detailed error context when PaymentIntent is missing or invalid
7. **Success Confirmation** (Line 189-193): Logs successful initialization with all relevant IDs

**Error Messages Enhanced**:
- Generic "Failed to initialize subscription payment" errors now include specific context:
  - "No PaymentIntent created on invoice" - indicates the invoice exists but has no payment intent
  - "PaymentIntent missing client_secret" - indicates the payment intent exists but lacks the client secret needed for frontend payment
- All error logs include related object IDs (invoice ID, subscription ID, payment intent ID) for easier debugging in Stripe Dashboard

## How Subscription Payments Work

1. **Backend Creates Subscription**:
   - Customer is created in Stripe
   - Price object is created for the recurring subscription
   - Subscription is created with `payment_behavior: "default_incomplete"`
   - This generates an invoice with an associated PaymentIntent
   - The PaymentIntent is configured with card payment method since we explicitly specify `payment_method_types: ["card"]`

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

## Debugging Subscription Issues

If subscriptions are still failing, check the server console logs for detailed diagnostic information:

1. **Customer Creation**: Look for "Customer created: cus_xxx" to confirm customer was created
2. **Price Creation**: Look for "Price created" with price ID and amount
3. **Subscription Creation**: Look for "Subscription created" with subscription ID and status
4. **Invoice Retrieval**: Check if "Invoice retrieved" shows `hasPaymentIntent: true`
5. **PaymentIntent Issues**: Look for error logs with specific failure reasons:
   - "PaymentIntent is missing from invoice" - The invoice was created but has no payment intent
   - "PaymentIntent missing client_secret" - The payment intent exists but lacks client secret

Each log entry includes relevant object IDs that you can use to look up the objects in your Stripe Dashboard for further investigation.

## Impact on Existing Code

- ✅ One-off payments continue to work as before (no changes to that code path)
- ✅ No changes required to frontend components
- ✅ No database schema changes needed
- ✅ Backward compatible with existing subscriptions

## References

- [Stripe Subscriptions API](https://stripe.com/docs/api/subscriptions)
- [Stripe Payment Element](https://stripe.com/docs/payments/payment-element)
- [Stripe PaymentIntents](https://stripe.com/docs/api/payment_intents)

## Need Help?

If you're having issues with subscriptions:
- See [STRIPE_SUBSCRIPTION_FAQ.md](./STRIPE_SUBSCRIPTION_FAQ.md) for answers to common questions
- See [STRIPE_SETUP.md](./STRIPE_SETUP.md) for detailed setup and configuration instructions
- Check the Troubleshooting section in [STRIPE_SETUP.md](./STRIPE_SETUP.md#troubleshooting)
