# Stripe Connect Setup Guide

This guide explains how the Stripe Connect integration works for payment splitting between the platform and hosts.

## Overview

The platform uses **Stripe Connect with Express accounts** to enable hosts to receive payments directly. When a player subscribes to a campaign:

- **80%** goes to the host (via their Connect account)
- **20%** stays with the platform (application fee)

## Architecture

### Database Schema

The user collection stores Connect account information:

```typescript
{
  stripeConnectAccountId?: string;           // Stripe Connect account ID
  stripeConnectOnboardingComplete?: boolean; // Onboarding completion status
}
```

### API Endpoints

#### 1. `/api/stripe/connect/onboard` (POST)
Creates or retrieves a Connect account and generates an onboarding link.

**Response:**
```json
{
  "url": "https://connect.stripe.com/setup/...",
  "accountId": "acct_..."
}
```

#### 2. `/api/stripe/connect/status` (GET)
Checks the Connect account status and updates the database.

**Response:**
```json
{
  "hasAccount": true,
  "accountId": "acct_...",
  "onboardingComplete": true,
  "detailsSubmitted": true,
  "chargesEnabled": true,
  "payoutsEnabled": true,
  "requirements": []
}
```

#### 3. `/api/stripe/connect/dashboard` (POST)
Generates a login link to the Stripe Express Dashboard.

**Response:**
```json
{
  "url": "https://connect.stripe.com/express/..."
}
```

## Host Onboarding Flow

1. Host visits `/host/onboarding`
2. System checks if they have a Connect account
3. If not, creates a new Express account linked to their user ID
4. Redirects to Stripe's onboarding flow
5. Host completes required information (identity, bank account, tax info)
6. Stripe redirects back to `/host/dashboard`
7. System verifies onboarding completion via `/api/stripe/connect/status`

## Payment Flow

### For Subscriptions with Connect

When creating a subscription for a campaign where the host has completed Connect onboarding:

```typescript
const subscription = await stripe.subscriptions.create({
  customer: customerId,
  items: [{ price: priceId }],
  application_fee_percent: 20,  // Platform takes 20%
  transfer_data: {
    destination: hostConnectAccountId  // 80% goes to host
  },
  // ... other options
});
```

### For Subscriptions without Connect

If the host hasn't completed onboarding, subscriptions are created normally without the Connect parameters. The full payment goes to the platform account.

## Host Dashboard

Located at `/host/dashboard`, provides:

- **Account Status**: Shows onboarding completion state
- **Payment Terms**: Displays the 80/20 split clearly
- **Stripe Dashboard Access**: One-click link to Stripe Express Dashboard
- **Quick Actions**: Links to view campaigns and create new ones

## Security Considerations

1. **Server-Side Only**: All Stripe Connect operations are server-side
2. **Authentication Required**: All API endpoints check for valid user session
3. **Account Ownership**: Users can only access their own Connect account
4. **Secure Redirects**: All redirect URLs use HTTPS and are validated

## Testing

### Test Mode Setup

1. Use test mode API keys in `.env`:
   ```
   STRIPE_SECRET_KEY=sk_test_...
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
   ```

2. Complete onboarding with test data:
   - Use test phone numbers: `000-000-0000`
   - Use test SSN: `000-00-0000`
   - Use test bank account: routing `110000000`, account `000123456789`

3. Test subscription creation:
   - Create a paid campaign
   - Subscribe as a different user
   - Verify payment split in Stripe Dashboard

### Verification

1. Check platform dashboard for application fees
2. Check host Express dashboard for transfers
3. Verify metadata on subscriptions includes `hostConnectAccountId`

## Troubleshooting

### Onboarding Issues

**Problem**: Onboarding link expired
- **Solution**: Visit `/host/onboarding` again to generate a new link

**Problem**: Account shows as incomplete after onboarding
- **Solution**: Check `/api/stripe/connect/status` for missing requirements
- May need additional information from Stripe

### Payment Issues

**Problem**: Subscription created but no Connect transfer
- **Solution**: Verify host completed onboarding before subscription was created
- Check that `hostConnectAccountId` is in subscription metadata

**Problem**: Application fee not appearing
- **Solution**: Verify `application_fee_percent` is set to 20
- Check Stripe Dashboard under "Connect" > "Application fees"

## Monitoring

### Key Metrics to Track

1. **Onboarding Completion Rate**: % of hosts who complete onboarding
2. **Payment Split Volume**: Total amount split via Connect
3. **Failed Transfers**: Monitor for any transfer failures
4. **Account Status**: Track accounts needing additional verification

### Stripe Dashboard Views

- **Connect > Accounts**: View all connected accounts
- **Connect > Transfers**: See all transfers to hosts
- **Connect > Application fees**: View platform's 20% fees
- **Payments > Subscriptions**: View all subscriptions with metadata

## Migration Notes

### Existing Campaigns

Campaigns created before Connect implementation will continue to work normally. When the host completes onboarding:

1. Future subscriptions to their campaigns will use Connect
2. Existing subscriptions remain unchanged
3. No action required from existing subscribers

### Backward Compatibility

The system is fully backward compatible:
- Hosts without Connect accounts can still create paid campaigns
- Payments go to the platform account without splitting
- Hosts can complete onboarding at any time to enable split payments

## Support Resources

- [Stripe Connect Documentation](https://stripe.com/docs/connect)
- [Express Dashboard Guide](https://stripe.com/docs/connect/express-dashboard)
- [Testing Connect](https://stripe.com/docs/connect/testing)
- [Account Requirements](https://stripe.com/docs/connect/required-verification-information)

## Next Steps

1. **Production Setup**: Switch to live mode API keys
2. **Webhook Integration**: Set up webhooks for Connect events
3. **Email Notifications**: Notify hosts of payouts and issues
4. **Analytics Dashboard**: Build reporting for hosts and admins
5. **Automated Reminders**: Remind hosts to complete onboarding
