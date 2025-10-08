# Test Mode Verification Guide

## Yes, Subscriptions Work in Test Mode! 

Subscriptions work perfectly in test mode when properly configured. This guide helps you verify your setup.

## Quick Verification Checklist

### ✅ Step 1: Verify Environment Variables

Check that your `.env.local` file exists and contains both required keys:

```bash
# Required for test mode
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

**Common mistakes:**
- ❌ Using `sk_live_` keys instead of `sk_test_` keys
- ❌ Missing the `NEXT_PUBLIC_` prefix on the publishable key
- ❌ Having `undefined` or empty string values
- ❌ Not restarting the dev server after adding keys

### ✅ Step 2: Verify Card Payments Are Enabled

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/test/settings/payment_methods) (Test Mode)
2. Ensure **Cards** is enabled under Payment Methods
3. This should be enabled by default, but verify it

### ✅ Step 3: Test Subscription Creation

Run this test to verify your Stripe configuration:

```bash
npm run test:stripe
```

If you get an error that this script doesn't exist, you can test manually:

1. Start your dev server: `npm run dev`
2. Create a test campaign with 2+ sessions
3. Set cost per session to $5.00
4. Click "Set Up Stripe Payment"
5. You should see the Stripe payment form appear

### ✅ Step 4: Complete a Test Payment

Use these test card numbers:

| Card Number | Purpose |
|------------|---------|
| `4242 4242 4242 4242` | ✅ Successful payment (USE THIS) |
| `4000 0000 0000 9995` | ❌ Declined payment |
| `4000 0025 0000 3155` | 🔐 Requires authentication |

**Card details:**
- Expiration: Any future date (e.g., 12/34)
- CVC: Any 3 digits (e.g., 123)
- ZIP: Any 5 digits (e.g., 12345)

### ✅ Step 5: Verify in Stripe Dashboard

After completing a test payment:

1. Go to [Stripe Dashboard - Test Mode](https://dashboard.stripe.com/test/subscriptions)
2. You should see your new subscription listed
3. Click on it to see details (customer, payment method, next billing date)

## Troubleshooting: Common Issues

### Issue: "STRIPE_SECRET_KEY is not configured"

**Solution:**
```bash
# 1. Verify .env.local exists in project root
ls -la .env.local

# 2. Verify it contains the key
grep STRIPE_SECRET_KEY .env.local

# 3. Restart your dev server (REQUIRED!)
npm run dev
```

### Issue: "Failed to initialize subscription payment: No PaymentIntent created on invoice"

This error means the subscription was created but the invoice has no PaymentIntent. This happens when:

**Solution 1: Verify Card Payments Are Enabled**
- Go to [Payment Methods Settings](https://dashboard.stripe.com/test/settings/payment_methods)
- Ensure **Cards** is enabled
- Restart your dev server

**Solution 2: Check Your Stripe API Keys**
- Ensure you're using `sk_test_` keys (not `sk_live_`)
- Verify the keys are valid and not revoked
- Go to [API Keys](https://dashboard.stripe.com/test/apikeys) to check

**Solution 3: Check Server Logs**
Look for detailed error messages in your server console:
```
Customer created: cus_xxx
Price created: { priceId: 'price_xxx', amount: 500 }
Subscription created: { subscriptionId: 'sub_xxx', status: 'incomplete' }
Invoice retrieved: { invoiceId: 'in_xxx', hasPaymentIntent: false }
```

If `hasPaymentIntent: false`, the issue is with Stripe configuration (usually card payments).

### Issue: Payment form not appearing

**Solution:**
```bash
# Verify the publishable key includes NEXT_PUBLIC_ prefix
grep NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY .env.local

# Restart dev server
npm run dev

# Check browser console for errors
# Should NOT see: "Missing NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY"
```

## Environment Variable Validation

Add this to your `.env.local` file and verify:

```bash
# Test Mode Keys (for development)
STRIPE_SECRET_KEY=sk_test_51XXXXX
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_51XXXXX
```

Both keys should:
- ✅ Start with `sk_test_` or `pk_test_` for test mode
- ✅ Be from the same Stripe account
- ✅ Not be revoked or expired
- ✅ Have the correct prefix (`NEXT_PUBLIC_` for publishable key)

## Advanced: Test with curl

You can test the API endpoint directly:

```bash
# Replace YOUR_USER_ID with a test user ID
curl -X POST http://localhost:3000/api/stripe/create-payment-intent \
  -H "Content-Type: application/json" \
  -H "Cookie: userId=YOUR_USER_ID" \
  -d '{
    "amount": 5.00,
    "campaignId": "test-campaign",
    "campaignName": "Test Campaign",
    "paymentType": "subscription"
  }'
```

Expected response (success):
```json
{
  "clientSecret": "pi_xxxxx_secret_xxxxx",
  "subscriptionId": "sub_xxxxx",
  "customerId": "cus_xxxxx",
  "priceId": "price_xxxxx",
  "mode": "subscription"
}
```

Expected error (no keys):
```json
{
  "error": "Payments are currently unavailable because Stripe is not configured. Please contact support."
}
```

## Still Having Issues?

1. **Check the full error message** in server logs
2. **Verify test mode** - make sure you're using test keys
3. **Check Stripe Dashboard** - look for any account restrictions
4. **Review SUBSCRIPTION_FIX.md** for technical details
5. **See STRIPE_SUBSCRIPTION_FAQ.md** for common questions

## Confirmation: It Works!

When everything is configured correctly, you should:
- ✅ See the payment form appear
- ✅ Be able to enter card details
- ✅ Successfully complete payment
- ✅ See the subscription in Stripe Dashboard
- ✅ See "Subscription payment initialized successfully" in server logs

**Subscriptions DO work in test mode!** If you're still having issues after following this guide, the problem is likely with your Stripe account configuration or environment variables, not with the subscription code itself.
