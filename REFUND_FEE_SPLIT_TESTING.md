# Refund Fee Split Testing Guide

## Overview
This guide helps test the new refund fee split functionality that distributes refund costs proportionally between the host (80%) and the platform (20%).

## Prerequisites
- Stripe account in test mode
- Two test accounts: one host, one player
- Host must have completed Stripe Connect onboarding

## Test Scenarios

### Scenario 1: Subscription Refund with Stripe Connect

**Setup:**
1. Host completes Stripe Connect onboarding
2. Host creates a paid campaign with subscription ($10/week)
3. Player signs up and subscribes to the campaign

**Test Steps:**
1. Navigate to campaign management page as host
2. Locate the player in the refund manager
3. Click "Issue Refund" for the subscription
4. Wait for success message

**Verify in Stripe Dashboard:**
1. Go to Payments → find the refund
2. Check refund details:
   - Status should be "Succeeded"
   - Full amount ($10.00) refunded to customer
3. Go to Connect → Transfers
4. Verify transfer reversal shows $8.00 reversed from host's Connect account
5. Verify $2.00 application fee was automatically refunded from platform account

**Expected Behavior:**
- Customer receives full $10.00 refund
- Host's Connect account is debited $8.00
- Platform absorbs $2.00 (the original application fee)

### Scenario 2: One-Time Payment Refund with Stripe Connect

**Setup:**
1. Host completes Stripe Connect onboarding
2. Host creates a paid campaign with one-time payment ($15)
3. Player signs up and pays for the campaign

**Test Steps:**
1. Navigate to campaign management page as host
2. Locate the player in the refund manager
3. Click "Issue Refund" for the payment
4. Wait for success message

**Verify in Stripe Dashboard:**
1. Go to Payments → find the refund
2. Check refund details:
   - Status should be "Succeeded"
   - Full amount ($15.00) refunded to customer
3. Go to Connect → Transfers
4. Verify transfer reversal shows $12.00 reversed from host's Connect account
5. Verify $3.00 application fee was automatically refunded from platform account

**Expected Behavior:**
- Customer receives full $15.00 refund
- Host's Connect account is debited $12.00 (80%)
- Platform absorbs $3.00 (20% - the original application fee)

### Scenario 3: Refund without Stripe Connect

**Setup:**
1. Host has NOT completed Stripe Connect onboarding
2. Host creates a paid campaign ($10)
3. Player signs up and pays

**Test Steps:**
1. Navigate to campaign management page as host
2. Locate the player in the refund manager
3. Click "Issue Refund"
4. Wait for success message

**Verify in Stripe Dashboard:**
1. Go to Payments → find the refund
2. Check refund details:
   - Status should be "Succeeded"
   - Full amount ($10.00) refunded to customer
3. No transfer reversal (payment was not transferred to a Connect account)

**Expected Behavior:**
- Customer receives full $10.00 refund
- Entire refund comes from platform account (existing behavior)
- Host is not affected (they never received the payment)

## Verification Checklist

After each test:
- [ ] Customer received full refund amount
- [ ] Refund appears in Stripe Dashboard with "Succeeded" status
- [ ] For Connect payments: Transfer reversal is visible in Dashboard
- [ ] For Connect payments: Correct proportion reversed (80% from host)
- [ ] For Connect payments: Application fee automatically refunded (20% from platform)
- [ ] Application logs show "Refunding with Connect transfer reversal" message for Connect payments
- [ ] No errors in browser console or server logs

## Troubleshooting

### Issue: "Subscription canceled but refund failed"
- Check if the invoice was actually paid
- Verify the charge ID exists
- Check Stripe Dashboard for more details

### Issue: Transfer reversal not showing expected amount
- Verify the original payment used Stripe Connect
- Check that `application_fee_percent: 20` was set on the original subscription
- Review the transfer_data in the original payment

### Issue: Refund fails entirely
- Check that the charge is not already fully refunded
- Verify host has sufficient funds in Connect account (for Connect payments)
- Check Stripe API logs for detailed error messages

## Additional Notes

- Test mode uses test card: `4242 4242 4242 4242`
- All amounts are in USD
- Refunds are immediate in test mode but may take days in production
- Application fees are automatically handled by Stripe - no manual calculation needed
