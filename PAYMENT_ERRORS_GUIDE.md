# Payment Errors Troubleshooting Guide

## Common Error Messages

### 1. "Unable to download payment manifest" (Google Pay)

**What it is:**
- Browser console warning from Google Pay
- Appears as: `Unable to download payment manifest "https://pay.google.com/about/redirect/"`
- This is a **harmless browser warning**, NOT an error

**Why it happens:**
- The Stripe Payment Element attempts to check if Google Pay is available
- The browser tries to fetch a Google Pay manifest file
- If the manifest is unavailable or blocked, the browser logs a warning
- This does NOT prevent payments from working

**Impact:**
- ✅ Payment functionality is NOT affected
- ✅ Users can still pay with credit/debit cards
- ✅ Google Pay may still work if properly configured
- ❌ Only affects browser console (not visible to users)

**Solution:**
- **No action required** - This is expected behavior
- The warning can be safely ignored
- Users will not see this warning (it's developer-only)

---

### 2. "POST /api/stripe/create-payment-intent 500 (Internal Server Error)"

**What it is:**
- Server-side error when creating payment intents
- Returns HTTP 500 status code
- Prevents payment initialization

**Why it happens:**
Common causes include:
1. **Malformed request** - Invalid JSON in request body
2. **Stripe API errors** - Issues with Stripe account or API keys
3. **Database errors** - MongoDB connection issues
4. **Configuration errors** - Missing or invalid Stripe keys
5. **Network errors** - Timeouts or connectivity issues

**Solution:**
The codebase now includes comprehensive error handling:
- ✅ Validates request format before processing
- ✅ Catches and handles each Stripe API call separately
- ✅ Provides specific error messages for each failure type
- ✅ Logs detailed information for debugging

**Specific Error Messages:**

| Error Message | Cause | Status Code |
|--------------|-------|-------------|
| "Invalid request format" | Malformed JSON in request body | 400 |
| "Authentication required" | Missing user session | 401 |
| "Valid amount is required" | Missing or invalid amount | 400 |
| "You already have an active subscription" | Duplicate subscription attempt | 409 |
| "Payments are currently unavailable" | Stripe not configured | 503 |
| "Failed to create payment profile" | Customer creation failed | 500 |
| "Failed to create subscription product" | Product creation failed | 500 |
| "Failed to create subscription pricing" | Price creation failed | 500 |
| "Failed to retrieve subscription invoice" | Invoice retrieval failed | 500 |
| "No invoice created for subscription" | Invoice missing | 500 |
| "Failed to initialize payment" | General payment intent failure | 500 |

**For Developers:**
Check server logs for detailed error information:
```bash
# Look for these log patterns:
- "Failed to parse request body"
- "Failed to retrieve campaign or Connect account"
- "Failed to check existing subscriptions"
- "Failed to create Stripe customer"
- "Failed to create Stripe product"
- "Failed to create Stripe price"
- "Invoice retrieval failed"
- "Failed to create one-time payment intent"
```

---

## Debugging Steps

### For Users

1. **Check payment details:**
   - Ensure amount is valid and greater than 0
   - Verify you're not already subscribed to this campaign

2. **Try again:**
   - Refresh the page
   - Clear browser cache
   - Try a different browser

3. **Contact support:**
   - If error persists, contact the platform administrator
   - Provide the specific error message shown

### For Developers

1. **Check server logs:**
   ```bash
   # Look for error logs from create-payment-intent route
   grep "Error creating payment intent" server.log
   grep "Failed to" server.log
   ```

2. **Verify Stripe configuration:**
   ```bash
   # Run the Stripe validator
   npm run validate:stripe
   ```

3. **Test Stripe API keys:**
   - Ensure `STRIPE_SECRET_KEY` is set in `.env.local`
   - Ensure `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` is set
   - Keys must match mode (both test or both live)
   - Keys must be valid and not revoked

4. **Check database connection:**
   - Verify MongoDB is running and accessible
   - Check `MONGODB_URI` in `.env.local`

5. **Test API endpoint:**
   ```bash
   # Test with curl
   curl -X POST http://localhost:3000/api/stripe/create-payment-intent \
     -H "Content-Type: application/json" \
     -H "Cookie: userId=YOUR_USER_ID" \
     -d '{"amount": 10, "campaignId": "test", "campaignName": "Test Campaign"}'
   ```

6. **Review error response:**
   - Check the JSON error response
   - Look for specific error message
   - Check HTTP status code for error type

---

## Prevention

### Best Practices

1. **Always validate input:**
   - Check amount is positive number
   - Verify campaign ID exists
   - Ensure user is authenticated

2. **Handle all Stripe errors:**
   - Wrap all Stripe API calls in try-catch
   - Log detailed error information
   - Return user-friendly error messages

3. **Test in Stripe test mode:**
   - Use test API keys during development
   - Use Stripe test cards for testing
   - Monitor Stripe Dashboard logs

4. **Monitor production:**
   - Set up error tracking (e.g., Sentry)
   - Monitor server logs
   - Track payment success rates

---

## Recent Improvements

### Error Handling Enhancements (Current Release)

**Changes Made:**
- Added comprehensive try-catch blocks around all Stripe API calls
- Added JSON parsing error handling
- Improved error messages for better user experience
- Added detailed logging for debugging
- Implemented graceful degradation for non-critical failures

**Benefits:**
- ✅ More specific error messages
- ✅ Better error recovery
- ✅ Improved debugging capabilities
- ✅ Reduced 500 errors from edge cases
- ✅ Better user experience during failures

**Migration Notes:**
- No breaking changes
- Backward compatible with existing code
- No database migrations required
- No configuration changes needed

---

## Additional Resources

- [Stripe API Documentation](https://stripe.com/docs/api)
- [Stripe Payment Intents Guide](https://stripe.com/docs/payments/payment-intents)
- [Stripe Testing Guide](https://stripe.com/docs/testing)
- [STRIPE_SETUP.md](./STRIPE_SETUP.md) - Setup instructions
- [SUBSCRIPTION_FIX.md](./SUBSCRIPTION_FIX.md) - Subscription-specific fixes
- [FIX_SUMMARY.md](./FIX_SUMMARY.md) - PaymentIntent creation fixes

---

## Support

If you continue experiencing issues:
1. Check this guide for solutions
2. Review server logs for detailed errors
3. Run the Stripe validator: `npm run validate:stripe`
4. Contact support with:
   - Error message
   - Server logs
   - Steps to reproduce
   - Browser and environment details
