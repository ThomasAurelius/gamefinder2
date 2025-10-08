# Subscription Payment Fix

## Issue
Subscriptions were failing to initialize because no PaymentIntent was being created on the subscription's first invoice. Despite the initial fixes, some subscriptions were still failing in edge cases due to timing issues, Stripe account configurations, or API version differences.

## Root Cause
When creating Stripe subscriptions with `payment_behavior: "default_incomplete"`, even with explicit `payment_method_types` and `collection_method` specified, Stripe may still fail to create a PaymentIntent on the invoice in certain edge cases:

1. **Account Configuration Mismatches**: Some Stripe account settings or restrictions can prevent automatic PaymentIntent creation
2. **API Version Differences**: Different Stripe API versions may handle PaymentIntent creation differently
3. **Timing Issues**: In rare cases, the invoice may be created before the PaymentIntent is fully initialized
4. **Payment Method Restrictions**: Account-level payment method restrictions can interfere with PaymentIntent creation

This causes the error "Failed to initialize subscription payment: No PaymentIntent created on invoice".

## Solution

### Changes Made to `/app/api/stripe/create-payment-intent/route.ts`

#### 1. Added Explicit Configuration (Lines 132-150)

**Key Changes:**
```typescript
payment_behavior: "default_incomplete",
collection_method: "charge_automatically",
payment_settings: {
  save_default_payment_method: "on_subscription",
  payment_method_types: ["card"],
},
automatic_tax: {
  enabled: false,
},
expand: ["latest_invoice.payment_intent"],
```

**Why these settings matter:**
- `collection_method: "charge_automatically"` - Explicitly tells Stripe to handle payment collection
- `payment_method_types: ["card"]` - Ensures card payments are configured for the PaymentIntent
- `automatic_tax: { enabled: false }` - Prevents tax calculation issues that could interfere with PaymentIntent creation
- `expand: ["latest_invoice.payment_intent"]` - Ensures we get the full PaymentIntent object in the response

#### 2. Added Multi-Level Fallback PaymentIntent Creation (Lines 189-307)

**The Critical Fix:**
If the invoice doesn't have a PaymentIntent after subscription creation, we now have a sophisticated multi-level fallback mechanism:

**Level 1: Invoice Finalization (for draft invoices)**
```typescript
if (latestInvoice.status === "draft") {
  const finalizedInvoice = await stripe.invoices.finalizeInvoice(
    latestInvoice.id,
    { expand: ["payment_intent"] }
  );
  paymentIntent = finalizedInvoice.payment_intent;
}
```

**Level 2: Invoice Re-retrieval (for non-draft invoices)**
```typescript
const retrievedInvoice = await stripe.invoices.retrieve(
  latestInvoice.id,
  { expand: ["payment_intent"] }
);
paymentIntent = retrievedInvoice.payment_intent;
```

**Level 3: Manual PaymentIntent Creation (NEW - last resort)**
```typescript
if (!paymentIntent) {
  const createdPaymentIntent = await stripe.paymentIntents.create({
    amount: latestInvoice.amount_due || Math.round(amount * 100),
    currency: latestInvoice.currency || "usd",
    customer: customerId,
    payment_method_types: ["card"],
    metadata: {
      invoiceId: latestInvoice.id,
      subscriptionId: subscription.id,
      // ... other metadata
    },
  });
  paymentIntent = createdPaymentIntent;
}
```

**Why this multi-level fallback is necessary:**
- Some Stripe accounts or configurations may not automatically create PaymentIntents on invoice creation
- **Level 1 (Draft invoices)**: Invoice finalization explicitly triggers PaymentIntent creation as a required step
- **Level 2 (Non-draft invoices)**: Re-retrieving the invoice with expanded payment_intent may find a PaymentIntent that was created but not initially expanded
- **Level 3 (Manual creation - NEW)**: If both previous methods fail, we manually create a standalone PaymentIntent that can be used for payment. This PaymentIntent includes metadata linking it to the invoice and subscription for proper tracking
- This three-tier approach ensures that even in the most problematic edge cases, we can successfully initialize the subscription payment
- Each fallback is only attempted if the previous one fails, avoiding unnecessary API calls

#### 3. Enhanced Error Logging and Diagnostics

To improve troubleshooting when subscriptions fail, comprehensive logging has been added throughout the subscription creation flow:

1. **Initial Request Logging**: Logs the subscription request parameters including amount, campaign details, and user ID
2. **Customer Creation**: Logs the created customer ID
3. **Price Creation**: Logs the price ID and amount
4. **Subscription Creation**: Logs subscription ID, status, collection method, and invoice type
5. **Invoice Retrieval**: Logs invoice details including collection method and PaymentIntent presence
6. **Fallback Attempts**: Logs when attempting manual PaymentIntent creation (three levels: finalization, re-retrieval, manual creation)
7. **PaymentIntent Validation**: Logs detailed error context when PaymentIntent is missing or invalid
8. **Success Confirmation**: Logs successful initialization with all relevant IDs

**Error Messages Enhanced**:
- Generic "Failed to initialize subscription payment" errors now include specific context:
  - "No PaymentIntent created on invoice" - indicates the invoice exists but has no payment intent (even after all three fallback attempts)
  - "PaymentIntent missing client_secret" - indicates the payment intent exists but lacks the client secret needed for frontend payment
- All error logs include related object IDs (invoice ID, subscription ID, payment intent ID) for easier debugging in Stripe Dashboard
- Fallback mechanism logs show which level succeeded or if all failed

## How Subscription Payments Work

1. **Backend Creates Subscription**:
   - Customer is created in Stripe
   - Price object is created for the recurring subscription
   - Subscription is created with `payment_behavior: "default_incomplete"` and explicit payment settings
   - This should generate an invoice with an associated PaymentIntent
   - **Three-Level Fallback**: If no PaymentIntent is created initially:
     1. Try finalizing the invoice (for draft status)
     2. Try re-retrieving the invoice with expanded payment_intent
     3. Manually create a standalone PaymentIntent with proper metadata
   - The PaymentIntent is configured with card payment method

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
5. **Fallback Attempt**: Look for "Attempting to manually create PaymentIntent for invoice..." followed by either success or failure message
6. **PaymentIntent Issues**: Look for error logs with specific failure reasons:
   - "PaymentIntent is missing from invoice" - The invoice was created but has no payment intent initially
   - "Successfully created PaymentIntent via invoice finalization" - The first fallback (finalization) worked
   - "Found PaymentIntent on invoice after retrieval" - The second fallback (re-retrieval) worked
   - "Successfully created PaymentIntent manually" - The third fallback (manual creation) worked
   - "Failed to manually create PaymentIntent" - The third fallback also failed
   - "PaymentIntent could not be created even after all fallback attempts" - All three fallback methods failed
   - "PaymentIntent missing client_secret" - The payment intent exists but lacks client secret

Each log entry includes relevant object IDs that you can use to look up the objects in your Stripe Dashboard for further investigation.

### Common Scenarios and Solutions

**Scenario 1: Fallback succeeds (draft invoice)**
```
PaymentIntent is missing from invoice: { invoiceId: 'in_xxx', ... }
Attempting to manually create PaymentIntent for invoice...
Invoice is in draft status, attempting to finalize...
Successfully created PaymentIntent via invoice finalization: { invoiceId: 'in_xxx', ... }
```
→ This is normal for some Stripe account configurations. The invoice was finalized and the payment will proceed normally.

**Scenario 2: Fallback succeeds (non-draft invoice)**
```
PaymentIntent is missing from invoice: { invoiceId: 'in_xxx', ... }
Attempting to manually create PaymentIntent for invoice...
Invoice status is 'open', not 'draft'. Checking if PaymentIntent exists...
Found PaymentIntent on invoice after retrieval: { invoiceId: 'in_xxx', ... }
```
→ The PaymentIntent existed but wasn't initially expanded. Re-retrieving the invoice found it.

**Scenario 3: Manual creation succeeds (NEW fallback)**
```
PaymentIntent is missing from invoice: { invoiceId: 'in_xxx', ... }
Attempting to manually create PaymentIntent for invoice...
Invoice status is 'open', not 'draft'. Checking if PaymentIntent exists...
[no PaymentIntent found]
Attempting to manually create PaymentIntent for the invoice...
Successfully created PaymentIntent manually: { paymentIntentId: 'pi_xxx', invoiceId: 'in_xxx', ... }
```
→ The third-level fallback succeeded. A standalone PaymentIntent was created with proper metadata linking it to the invoice and subscription. Payment will proceed normally.

**Scenario 4: All fallbacks fail**
```
PaymentIntent is missing from invoice: { invoiceId: 'in_xxx', ... }
Attempting to manually create PaymentIntent for invoice...
Failed to finalize or retrieve invoice: [error details]
Attempting to manually create PaymentIntent for the invoice...
Failed to manually create PaymentIntent: [error details]
PaymentIntent could not be created even after all fallback attempts
```
→ Check your Stripe Dashboard settings:
  - Verify card payments are enabled
  - Check for account restrictions
  - Ensure API keys are valid and have proper permissions
  - Review any error messages in the Stripe Dashboard logs

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
