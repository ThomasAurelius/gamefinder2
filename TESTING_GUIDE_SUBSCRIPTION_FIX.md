# Testing Guide: Subscription Auto-Charging Fix

## Overview
This guide provides step-by-step instructions for testing the subscription auto-charging fix.

## Prerequisites
- Stripe test mode enabled
- Test API keys configured in `.env.local`:
  - `STRIPE_SECRET_KEY=sk_test_...`
  - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...`
- Campaign with multiple sessions (to trigger subscription mode)

## Test Scenarios

### Scenario 1: Normal Subscription Flow (No Fallback Needed)
**Objective**: Verify that subscriptions work normally when Stripe creates PaymentIntent automatically

**Steps**:
1. Create a new campaign with 4+ sessions and a cost per session (e.g., $10)
2. Navigate to the payment page: `/campaigns/{campaignId}/payment`
3. Verify the page shows "Subscribe to {Campaign Name}"
4. Enter test card: `4242 4242 4242 4242`, any future expiry, any CVC
5. Click "Subscribe Now"
6. Wait for payment confirmation

**Expected Results**:
- ✅ Payment form loads successfully
- ✅ "Subscription started successfully!" message appears
- ✅ In Stripe Dashboard:
  - Subscription status: "active"
  - Invoice status: "paid"
  - Payment method saved to customer

**Server Logs**:
```
Subscription created: { subscriptionId: 'sub_xxx', status: 'incomplete', ... }
Invoice retrieved: { invoiceId: 'in_xxx', hasPaymentIntent: true }
Subscription payment initialized successfully
```

---

### Scenario 2: Subscription with Level 3 Fallback (Manual PaymentIntent)
**Objective**: Verify that the fix works when manual PaymentIntent creation is needed

**Steps**:
1. Create a new campaign with 4+ sessions and a cost per session
2. Navigate to the payment page
3. Enter test card: `4242 4242 4242 4242`
4. Click "Subscribe Now"
5. Wait for payment confirmation

**Expected Results**:
- ✅ Payment form loads successfully
- ✅ "Subscription started successfully!" message appears
- ✅ In Stripe Dashboard:
  - Subscription status: "active"
  - Invoice status: "paid"  
  - Payment method saved to customer
- ✅ No need to visit Customer Portal

**Server Logs**:
```
PaymentIntent is missing from invoice: { invoiceId: 'in_xxx', ... }
Attempting to manually create PaymentIntent for the invoice...
Successfully created PaymentIntent manually: { paymentIntentId: 'pi_xxx', ... }
[Frontend calls finalization endpoint]
Finalizing subscription payment for PaymentIntent: pi_xxx
Updating subscription with payment method: pm_xxx
Subscription updated: { id: 'sub_xxx', status: 'active', ... }
Paying invoice with payment method...
Invoice paid successfully: { id: 'in_xxx', status: 'paid', ... }
```

**Browser Console Logs**:
```
Subscription payment finalized successfully: { 
  success: true, 
  subscriptionId: 'sub_xxx', 
  subscriptionStatus: 'active' 
}
```

---

### Scenario 3: Payment Failure
**Objective**: Verify error handling when payment fails

**Steps**:
1. Create a new campaign with multiple sessions
2. Navigate to the payment page
3. Enter declining test card: `4000 0000 0000 0002`
4. Click "Subscribe Now"

**Expected Results**:
- ✅ Error message displayed: "Your card was declined."
- ✅ No subscription created in Stripe
- ✅ No finalization endpoint called
- ✅ User can retry with different card

---

### Scenario 4: Network Error During Finalization
**Objective**: Verify graceful handling when finalization fails

**Steps**:
1. Create campaign with multiple sessions
2. Open browser DevTools → Network tab
3. Navigate to payment page
4. Enter test card: `4242 4242 4242 4242`
5. Before clicking "Subscribe Now", set Network throttling to "Offline"
6. Click "Subscribe Now"
7. Wait for payment to process
8. Check if finalization is called (it should fail)

**Expected Results**:
- ✅ Payment succeeds
- ✅ "Subscription started successfully!" message still appears
- ✅ Error logged to console: "Error finalizing subscription: { type: 'TypeError', message: 'Failed to fetch', ... }"
- ✅ User sees success message (payment was successful)
- ✅ Check Stripe Dashboard:
  - Subscription may be in "incomplete" or "active" status
  - If incomplete, can be manually activated via Customer Portal

**Note**: This scenario tests graceful degradation. The subscription may need manual activation if finalization fails.

---

### Scenario 5: Already Active Subscription
**Objective**: Verify handling of duplicate subscription attempts

**Steps**:
1. Create campaign and complete subscription (Scenario 1 or 2)
2. Navigate back to payment page for the same campaign
3. Observe the UI

**Expected Results**:
- ✅ No payment form shown
- ✅ Message: "You have an active subscription for this campaign."
- ✅ "Manage Subscription" button displayed
- ✅ Clicking button redirects to Stripe Customer Portal

---

### Scenario 6: One-Time Payment (Not a Subscription)
**Objective**: Verify that one-time payments are not affected

**Steps**:
1. Create campaign with only 1 session and cost per session
2. Navigate to payment page
3. Verify page shows "Pay for {Campaign Name}" (not "Subscribe to")
4. Enter test card and submit

**Expected Results**:
- ✅ Payment form loads
- ✅ "Payment successful!" message (not "Subscription started successfully!")
- ✅ Finalization endpoint NOT called
- ✅ Payment processed as one-time charge

---

## Verification Checklist

After testing all scenarios:

- [ ] All test scenarios pass as expected
- [ ] No TypeScript errors in build
- [ ] No console errors (except expected network errors in Scenario 4)
- [ ] Stripe Dashboard shows correct subscription/payment states
- [ ] No regression in existing functionality:
  - [ ] One-time payments work
  - [ ] Free campaigns work
  - [ ] Campaign creator doesn't see payment page
  - [ ] "Manage Subscription" button works for active subscriptions

## Debugging Tips

### Check Server Logs
Look for these key log messages:
```bash
# PaymentIntent creation (Level 3 fallback)
"Successfully created PaymentIntent manually"

# Finalization endpoint
"Finalizing subscription payment for PaymentIntent"
"Subscription updated"
"Invoice paid successfully"
```

### Check Browser Console
Look for:
```javascript
// Success
"Subscription payment finalized successfully"

// Errors
"Failed to finalize subscription payment"
"Error finalizing subscription"
```

### Check Stripe Dashboard
1. Go to Developers → Logs
2. Filter by API calls from your test session
3. Look for:
   - `paymentIntents.create` with `setup_future_usage: off_session`
   - `subscriptions.update` with `default_payment_method`
   - `invoices.pay` with payment method

### Common Issues

**Issue**: Subscription stays "incomplete" after payment
- **Check**: Was finalization endpoint called?
- **Check**: Server logs for errors
- **Fix**: Manually call finalization with PaymentIntent ID

**Issue**: "Payment method not found" error
- **Check**: PaymentIntent status is "succeeded"
- **Check**: `setup_future_usage` was set in PaymentIntent
- **Reason**: Payment method not attached to PaymentIntent

**Issue**: Invoice not paid after finalization
- **Check**: Invoice status in Stripe Dashboard
- **Check**: Server logs for "Invoice paid successfully"
- **Reason**: Invoice may have been paid automatically by Stripe

## Manual Verification in Stripe Dashboard

For each successful subscription test:

1. **Go to Customers**
   - Find the test customer
   - Verify payment method is saved
   - Check "Default payment method" is set

2. **Go to Subscriptions**
   - Find the subscription
   - Verify status is "Active"
   - Check "Default payment method" matches the card used

3. **Go to Invoices**
   - Find the invoice for the subscription
   - Verify status is "Paid"
   - Check payment method used

4. **Go to Payment Intents**
   - Find the PaymentIntent
   - Verify status is "Succeeded"
   - Check metadata includes subscriptionId and invoiceId

## Success Criteria

The fix is successful if:
1. ✅ Users can subscribe by entering card details on portal (no need for Customer Portal)
2. ✅ Subscription activates immediately after payment
3. ✅ Payment method is saved for future recurring charges
4. ✅ Invoice is paid automatically
5. ✅ No breaking changes to existing functionality
6. ✅ Graceful error handling when finalization fails

## Rollback Plan

If issues are found:
1. Revert the 3 file changes
2. Users will go back to manual invoice payment via Customer Portal
3. Document any specific edge cases encountered
