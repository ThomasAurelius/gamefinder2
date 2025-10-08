# How To Verify The Fix Works

## Prerequisites
1. Have the repository running locally with `npm run dev`
2. Have Stripe test keys configured in `.env.local`
3. Have a user account created and logged in

## Step-by-Step Verification

### Test 1: First Subscription (Creates New Customer)

1. **Create a campaign** with 2 or more sessions
   - Go to "Post Campaign" page
   - Set sessions to 2 or higher
   - Set cost per session (e.g., $10.00)
   - Submit the campaign

2. **Navigate to payment page**
   - Click "Set Up Stripe Payment" or similar
   - This will trigger the subscription flow

3. **Check server console logs**
   - Look for these log messages:
   ```
   Creating subscription for: { amount: 10, campaignId: '...', userId: '...' }
   Customer created: cus_xxxxxxxxxxxxx
   Price created: { priceId: 'price_...', amount: 1000 }
   Subscription created: { subscriptionId: 'sub_...' }
   ```
   
4. **Note the customer ID** (e.g., `cus_abc123xyz`)

5. **Complete the test payment**
   - Use test card: `4242 4242 4242 4242`
   - Any future expiry date
   - Any 3-digit CVC

### Test 2: Second Subscription (Reuses Existing Customer)

1. **Create another campaign** with 2+ sessions (while still logged in as the same user)

2. **Navigate to payment page** for this new campaign

3. **Check server console logs** - THIS IS THE KEY TEST
   - You should see:
   ```
   Creating subscription for: { amount: 10, campaignId: '...', userId: '...' }
   Reusing existing Stripe customer: cus_xxxxxxxxxxxxx  ← SAME CUSTOMER ID!
   Price created: { priceId: 'price_...', amount: 1000 }
   Subscription created: { subscriptionId: 'sub_...' }
   ```
   
4. **Verify the customer ID matches** the one from Test 1

### Test 3: Verify in Stripe Dashboard

1. **Go to Stripe Dashboard**
   - Navigate to: https://dashboard.stripe.com/test/customers

2. **Search for the user's email**
   - You should see **only ONE customer record**

3. **Click on that customer**
   - You should see **TWO subscriptions** under the same customer
   - Both subscriptions should show the campaign names

### Test 4: Verify in MongoDB

1. **Connect to your MongoDB instance**

2. **Query the users collection**
   ```javascript
   db.users.findOne(
     { email: "test@example.com" },
     { stripeCustomerId: 1, email: 1 }
   )
   ```

3. **Expected result**
   ```json
   {
     "_id": ObjectId("..."),
     "email": "test@example.com",
     "stripeCustomerId": "cus_xxxxxxxxxxxxx"
   }
   ```

## Expected vs Actual Results

### ✅ PASS Criteria

| Test | Expected Behavior | How To Verify |
|------|------------------|---------------|
| First subscription | "Customer created: cus_xxx" in logs | Check server console |
| Second subscription | "Reusing existing Stripe customer: cus_xxx" | Check server console |
| Customer ID match | Same customer ID in both subscriptions | Compare log output |
| Stripe Dashboard | Only 1 customer for the user email | Search in Stripe |
| Multiple subscriptions | 2+ subscriptions under 1 customer | Check customer details |
| MongoDB storage | User document has stripeCustomerId field | Query database |

### ❌ FAIL Indicators

If you see any of these, the fix is NOT working:

1. **Two "Customer created" messages** for the same user
   ```
   Customer created: cus_abc123
   Customer created: cus_def456  ← BAD: Should reuse cus_abc123
   ```

2. **Multiple customers in Stripe Dashboard** for same email
   ```
   Customer 1: cus_abc123
   Customer 2: cus_def456  ← BAD: Should be only 1
   ```

3. **No stripeCustomerId in MongoDB** after first subscription
   ```json
   {
     "_id": ObjectId("..."),
     "email": "test@example.com"
     // Missing: stripeCustomerId field  ← BAD
   }
   ```

## Troubleshooting

### Issue: "Customer created" appears twice for same user

**Possible Causes:**
1. The helper functions aren't being called correctly
2. Database connection issue
3. User ID not being passed correctly

**Solution:**
- Check that `getStripeCustomerId()` is being called before customer creation
- Verify MongoDB connection is working
- Check server logs for any errors

### Issue: Customer ID not saved to database

**Possible Causes:**
1. `setStripeCustomerId()` failed
2. Database permissions issue
3. Invalid ObjectId

**Solution:**
- Check server logs for MongoDB errors
- Verify database write permissions
- Check that userId is a valid ObjectId string

### Issue: Customer not reused even though ID exists in database

**Possible Causes:**
1. `getStripeCustomerId()` returning null
2. Customer ID was deleted from Stripe
3. Database query issue

**Solution:**
- Add additional logging in `getStripeCustomerId()`
- Verify customer exists in Stripe Dashboard
- Check database query is working correctly

## Rollback Plan

If the fix causes issues, revert with:

```bash
git revert HEAD~3..HEAD
git push
```

This will undo the three commits:
1. Implement customer ID reuse for subscriptions
2. Add comprehensive documentation for customer ID fix
3. Add visual summary of customer ID fix

## Success Metrics

After deploying this fix, you should see:

- ✅ No duplicate customer records in Stripe for the same user
- ✅ All subscriptions for a user under one customer ID
- ✅ User emails visible in Stripe customer records
- ✅ Faster subscription creation (skips customer API call when ID exists)
- ✅ Better organized Stripe Dashboard
