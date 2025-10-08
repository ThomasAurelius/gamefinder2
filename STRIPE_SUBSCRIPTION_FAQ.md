# Stripe Subscription FAQ

This document answers common questions about setting up and troubleshooting Stripe subscriptions in GameFinder2.

## General Questions

### Q: What do I need to configure in my Stripe Dashboard to enable subscriptions?

**A:** Very little! You only need:

1. **Valid API keys** configured in your `.env.local` file
2. **Card payments enabled** in Stripe Dashboard (enabled by default)

Everything else is handled automatically by the application. You don't need to:
- Create products manually
- Set up price plans
- Configure invoice templates
- Set up payment method collection

The application dynamically creates all necessary Stripe resources (customers, products, prices, and subscriptions) through the API.

### Q: Why am I getting "Failed to initialize subscription payment" errors?

**A:** This error occurs when a PaymentIntent cannot be created for the subscription. The most common causes are:

1. **Card payments not enabled**: Go to [Settings > Payment methods](https://dashboard.stripe.com/settings/payment_methods) and ensure Cards is enabled
2. **Invalid API keys**: Verify your `STRIPE_SECRET_KEY` is correct and matches your test/live mode
3. **Account restrictions**: Ensure your Stripe account is fully activated (especially in Live Mode)

See the [STRIPE_SETUP.md Troubleshooting section](./STRIPE_SETUP.md#troubleshooting) for detailed steps.

### Q: How do I know if subscriptions are working?

**A:** Follow these verification steps:

1. **Create a test campaign** with multiple sessions (2 or more triggers subscription mode)
2. **Set up payment** during campaign creation
3. **Check for the payment form** - if it appears, API connection is working
4. **Complete a test payment** using card `4242 4242 4242 4242`
5. **Verify in Stripe Dashboard**:
   - Go to [Stripe Dashboard](https://dashboard.stripe.com/)
   - Navigate to **Payments** > **Subscriptions**
   - You should see your test subscription listed

### Q: Do I need to create products in my Stripe Dashboard?

**A:** No! The application automatically creates products via the Stripe API. Each campaign generates a unique product with its own pricing based on the campaign's cost per session.

### Q: What's the difference between one-time payments and subscriptions in this app?

**A:** 
- **One-time payment**: Used when a campaign has exactly 1 session
- **Subscription**: Used when a campaign has 2 or more sessions
  - Charged weekly
  - Automatically renews
  - Can be cancelled anytime

The application automatically determines which payment type to use based on the number of sessions in the campaign.

## Setup Questions

### Q: Where do I get my Stripe API keys?

**A:**

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/)
2. Navigate to **Developers** > **API keys**
3. Copy both the **Publishable key** (starts with `pk_test_`) and **Secret key** (starts with `sk_test_`)
4. Add them to your `.env.local` file:
   ```bash
   STRIPE_SECRET_KEY=sk_test_...
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
   ```
5. Restart your development server

### Q: Should I use test keys or live keys?

**A:**
- **During development**: Use test keys (`sk_test_` and `pk_test_`)
- **In production**: Use live keys (`sk_live_` and `pk_live_`)

Test mode allows you to simulate payments without actual money changing hands. Always test thoroughly in test mode before switching to live keys.

### Q: Do I need to enable any special payment methods?

**A:** No. The application only requires card payments to be enabled, which is the default setting for all Stripe accounts. If you want to accept additional payment methods in the future, you can enable them in your Stripe Dashboard, but it's not necessary for subscriptions to work.

## Troubleshooting Questions

### Q: I created a subscription but can't see it in my Stripe Dashboard. Where is it?

**A:** Check these common issues:

1. **Test vs Live Mode**: Make sure you're viewing the correct mode in your dashboard (toggle in top-right corner)
2. **Wait a moment**: It can take a few seconds for subscriptions to appear
3. **Check Customers section**: The subscription might be visible under the customer record
4. **Verify creation**: Check your server logs to confirm the subscription was actually created

### Q: Can I test subscriptions without a real credit card?

**A:** Yes! Use these test card numbers:

| Card Number | Result |
|------------|--------|
| `4242 4242 4242 4242` | Successful payment |
| `4000 0000 0000 9995` | Declined payment |
| `4000 0025 0000 3155` | Requires 3D Secure authentication |

Use any future expiration date, any 3-digit CVC, and any ZIP code.

### Q: What happens if a subscription payment fails?

**A:** Stripe automatically handles payment retries according to your [Smart Retries settings](https://dashboard.stripe.com/settings/billing/automatic). By default:
- Stripe will retry failed payments automatically
- Customers receive email notifications about failed payments
- You can configure retry logic and notification preferences in your Stripe Dashboard

### Q: How do I cancel a subscription?

**A:** Currently, subscription cancellation must be done through the Stripe Dashboard:

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/)
2. Navigate to **Payments** > **Subscriptions**
3. Find the subscription you want to cancel
4. Click on it and select **Cancel subscription**

You can choose to cancel immediately or at the end of the billing period.

### Q: I'm getting "STRIPE_SECRET_KEY is not configured" errors

**A:** This means your environment variables aren't being loaded. Fix it by:

1. Verify `.env.local` exists in your project root
2. Verify it contains: `STRIPE_SECRET_KEY=sk_test_...`
3. **Restart your development server** (environment variables are only loaded at startup)
4. Check for typos in the variable name

### Q: The payment form isn't showing up

**A:** This usually means the publishable key isn't loaded on the client side:

1. Verify `.env.local` contains: `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...`
2. Note the `NEXT_PUBLIC_` prefix - it's required for client-side variables in Next.js
3. **Restart your development server**
4. Check browser console for errors
5. Verify the key is accessible in your browser's network tab

## Technical Questions

### Q: What Stripe API version does this application use?

**A:** The application uses Stripe API version `2025-09-30.clover`. This is specified in the code and should be compatible with all recent Stripe accounts.

### Q: Why does the code specify `payment_method_types: ["card"]`?

**A:** This is critical for subscriptions to work correctly. Without explicitly specifying the payment method type, Stripe attempts to auto-determine which payment methods to enable by looking at the customer's saved payment methods. Since we create fresh customers without any saved payment methods, Stripe can't auto-determine them, resulting in no PaymentIntent being created. By explicitly specifying card payments, we guarantee the PaymentIntent is created.

For more details, see [SUBSCRIPTION_FIX.md](./SUBSCRIPTION_FIX.md).

### Q: How does the subscription billing work?

**A:**
- **Billing frequency**: Weekly
- **First payment**: Collected immediately when the subscription is created
- **Subsequent payments**: Automatically charged every week
- **Payment method**: The payment method used for the first payment is saved and used for future charges

### Q: Can I change the billing frequency from weekly to monthly?

**A:** Yes, but it requires a code change. In `/app/api/stripe/create-payment-intent/route.ts`, line 92, change:
```typescript
recurring: { interval: "week" },
```
to:
```typescript
recurring: { interval: "month" },
```

Valid intervals are: `day`, `week`, `month`, or `year`.

## Production Questions

### Q: What do I need to do before going to production?

**A:**

1. **Switch to live keys**: Replace test keys with live keys in your production environment
2. **Complete Stripe account activation**: Ensure all required business information is submitted
3. **Test thoroughly**: Make test purchases in test mode before going live
4. **Consider webhooks**: Set up webhook endpoints to receive payment notifications (optional but recommended)
5. **Review payment method settings**: Decide which payment methods to accept

See [STRIPE_SETUP.md Production Deployment](./STRIPE_SETUP.md#production-deployment) for detailed steps.

### Q: Do I need to set up webhooks?

**A:** Webhooks are optional but recommended for production. They allow you to:
- Receive real-time notifications when subscriptions are cancelled
- Get notified when payments fail
- Track subscription lifecycle events
- Update your application state based on Stripe events

Without webhooks, the application still works, but you'll need to manually check the Stripe Dashboard for subscription status changes.

## Additional Resources

- [STRIPE_SETUP.md](./STRIPE_SETUP.md) - Complete setup guide
- [SUBSCRIPTION_FIX.md](./SUBSCRIPTION_FIX.md) - Technical details about the subscription fix
- [Stripe Documentation](https://stripe.com/docs)
- [Stripe Subscriptions Guide](https://stripe.com/docs/billing/subscriptions/overview)
- [Stripe Test Cards](https://stripe.com/docs/testing)
