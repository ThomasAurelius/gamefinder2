# Subscription PaymentIntent Fallback Test Guide

This guide helps you test the three-level fallback mechanism for subscription PaymentIntent creation.

## Testing Scenarios

### Scenario 1: Normal Flow (No Fallback Needed)
**Expected Behavior**: PaymentIntent is created automatically with the subscription.

**Test Steps**:
1. Create a test subscription with a properly configured Stripe account
2. Check server logs for: `"Invoice retrieved: { ... hasPaymentIntent: true }"`
3. Payment should proceed without any fallback attempts

**Server Logs**:
```
Creating subscription for: { amount: 5, ... }
Customer created: cus_xxx
Price created: { priceId: 'price_xxx', amount: 500 }
Subscription created: { subscriptionId: 'sub_xxx', status: 'incomplete' }
Invoice retrieved: { invoiceId: 'in_xxx', hasPaymentIntent: true }
Subscription payment initialized successfully: { ... }
```

### Scenario 2: First Fallback (Draft Invoice Finalization)
**Expected Behavior**: Initial PaymentIntent is missing, invoice is finalized to create it.

**Test Steps**:
1. Trigger subscription creation in an environment where invoices are created in draft status
2. Check server logs for draft finalization attempt
3. Payment should succeed after finalization

**Server Logs**:
```
Invoice retrieved: { invoiceId: 'in_xxx', hasPaymentIntent: false }
PaymentIntent is missing from invoice: { invoiceId: 'in_xxx', invoiceStatus: 'draft', ... }
Attempting to manually create PaymentIntent for invoice...
Invoice is in draft status, attempting to finalize...
Successfully created PaymentIntent via invoice finalization: { invoiceId: 'in_xxx', paymentIntentId: 'pi_xxx' }
Subscription payment initialized successfully: { ... }
```

### Scenario 3: Second Fallback (Invoice Re-retrieval)
**Expected Behavior**: PaymentIntent exists but wasn't initially expanded, found on re-retrieval.

**Test Steps**:
1. Create subscription where PaymentIntent is created but not expanded initially
2. Check server logs for re-retrieval attempt
3. Payment should succeed after re-retrieval finds the PaymentIntent

**Server Logs**:
```
Invoice retrieved: { invoiceId: 'in_xxx', hasPaymentIntent: false }
PaymentIntent is missing from invoice: { invoiceId: 'in_xxx', invoiceStatus: 'open', ... }
Attempting to manually create PaymentIntent for invoice...
Invoice status is 'open', not 'draft'. Checking if PaymentIntent exists...
Found PaymentIntent on invoice after retrieval: { invoiceId: 'in_xxx', paymentIntentId: 'pi_xxx' }
Subscription payment initialized successfully: { ... }
```

### Scenario 4: Third Fallback (Manual Creation) - NEW
**Expected Behavior**: No PaymentIntent after finalization/retrieval, manually created as last resort.

**Test Steps**:
1. Create subscription in problematic Stripe configuration where automatic PaymentIntent creation fails
2. Check server logs for manual creation attempt
3. Payment should succeed with manually created PaymentIntent

**Server Logs**:
```
Invoice retrieved: { invoiceId: 'in_xxx', hasPaymentIntent: false }
PaymentIntent is missing from invoice: { invoiceId: 'in_xxx', invoiceStatus: 'open', ... }
Attempting to manually create PaymentIntent for invoice...
Invoice status is 'open', not 'draft'. Checking if PaymentIntent exists...
Attempting to manually create PaymentIntent for the invoice...
Successfully created PaymentIntent manually: { paymentIntentId: 'pi_xxx', invoiceId: 'in_xxx', amount: 500 }
Subscription payment initialized successfully: { ... }
```

### Scenario 5: All Fallbacks Fail
**Expected Behavior**: All three fallback levels fail, error is thrown with diagnostics.

**Test Steps**:
1. Create subscription with invalid Stripe configuration (e.g., card payments disabled)
2. Check server logs for all three fallback attempts failing
3. Should see detailed error diagnostics

**Server Logs**:
```
Invoice retrieved: { invoiceId: 'in_xxx', hasPaymentIntent: false }
PaymentIntent is missing from invoice: { invoiceId: 'in_xxx', invoiceStatus: 'draft', ... }
Attempting to manually create PaymentIntent for invoice...
Failed to finalize or retrieve invoice: [error details]
Attempting to manually create PaymentIntent for the invoice...
Failed to manually create PaymentIntent: [error details]
PaymentIntent could not be created even after all fallback attempts
Possible causes:
1. Card payments not enabled in Stripe Dashboard
2. Invalid API keys or key mismatch
3. Stripe account restrictions or configuration issues
4. Payment method types mismatch in account settings
See TEST_MODE_VERIFICATION.md for troubleshooting steps
Error creating payment intent: Error: Failed to initialize subscription payment: No PaymentIntent created on invoice
```

## Manual Testing with curl

Test the subscription endpoint directly:

```bash
# Set your test user ID
USER_ID="test-user-123"

# Test subscription creation
curl -X POST http://localhost:3000/api/stripe/create-payment-intent \
  -H "Content-Type: application/json" \
  -H "Cookie: userId=$USER_ID" \
  -d '{
    "amount": 5.00,
    "campaignId": "test-campaign-123",
    "campaignName": "Test Campaign",
    "paymentType": "subscription"
  }' | jq .
```

**Expected Success Response**:
```json
{
  "clientSecret": "pi_xxxxx_secret_xxxxx",
  "subscriptionId": "sub_xxxxx",
  "customerId": "cus_xxxxx",
  "priceId": "price_xxxxx",
  "mode": "subscription"
}
```

**Expected Error Response (if all fallbacks fail)**:
```json
{
  "error": "Failed to initialize subscription payment: No PaymentIntent created on invoice"
}
```

## Validation Checklist

After making the code changes, verify:

- [ ] Code compiles without TypeScript errors (`npm run build`)
- [ ] Server starts successfully (`npm run dev`)
- [ ] Normal subscription flow still works (Scenario 1)
- [ ] Fallback mechanisms are triggered in appropriate scenarios
- [ ] Error messages are clear and actionable
- [ ] All log messages include relevant IDs for debugging
- [ ] Payment succeeds even when fallbacks are needed
- [ ] Manual PaymentIntent includes proper metadata (invoice ID, subscription ID, etc.)

## Troubleshooting

If testing reveals issues:

1. **Check Stripe Dashboard**: Look for the subscription, invoice, and PaymentIntent objects
2. **Verify API Keys**: Ensure test mode keys are being used
3. **Check Card Payments**: Verify cards are enabled in payment methods
4. **Review Server Logs**: Look for detailed error messages at each fallback level
5. **Test with Different Cards**: Use various test card numbers to simulate different scenarios

## Success Criteria

The fix is successful if:

1. ✅ Subscriptions that previously failed now succeed
2. ✅ The third fallback (manual creation) successfully creates PaymentIntents
3. ✅ Error messages clearly indicate which fallback level was used
4. ✅ Payment flow completes successfully in all valid scenarios
5. ✅ Manually created PaymentIntents include proper linking metadata
