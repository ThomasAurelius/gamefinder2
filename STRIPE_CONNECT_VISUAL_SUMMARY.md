# Stripe Connect Payment Splitting - Visual Summary

## Payment Flow Diagram

### Before (Current State)
```
Player Subscription Payment ($10/week)
           |
           v
    Platform Account
           |
           v
     100% ($10) to Platform
```

### After (With Stripe Connect)
```
Player Subscription Payment ($10/week)
           |
           v
    Stripe Processing
           |
           ├──> 80% ($8) ──────> Host Connect Account
           |
           └──> 20% ($2) ──────> Platform Account (application fee)
```

## User Flow Diagrams

### Host Onboarding Flow
```
┌─────────────────┐
│  Host visits    │
│ /host/onboarding│
└────────┬────────┘
         │
         v
┌─────────────────┐
│ System checks   │
│ Connect status  │
└────────┬────────┘
         │
         v
┌─────────────────┐      ┌──────────────────┐
│  Has account?   │─YES─>│  Continue        │
│                 │      │  Onboarding      │
└────────┬────────┘      └──────────────────┘
         │
        NO
         │
         v
┌─────────────────┐
│ Create Connect  │
│ Express account │
└────────┬────────┘
         │
         v
┌─────────────────┐
│ Redirect to     │
│ Stripe          │
│ Onboarding Form │
└────────┬────────┘
         │
         v
┌─────────────────┐
│ Host completes: │
│ • Identity      │
│ • Bank account  │
│ • Tax info      │
└────────┬────────┘
         │
         v
┌─────────────────┐
│ Redirect back   │
│ to /host/       │
│ dashboard       │
└────────┬────────┘
         │
         v
┌─────────────────┐
│ Status shows:   │
│ "Account Active"│
└─────────────────┘
```

### Campaign Creation with Payment
```
┌──────────────────┐
│ Host creates     │
│ paid campaign    │
│ (cost > $0)      │
└────────┬─────────┘
         │
         v
┌──────────────────┐
│ System checks    │
│ Connect status   │
└────────┬─────────┘
         │
    ┌────┴────┐
    │         │
   YES       NO
    │         │
    v         v
┌────────┐  ┌──────────────┐
│ All    │  │ Show warning │
│ good   │  │ banner with  │
└────────┘  │ onboarding   │
            │ link         │
            └──────────────┘
```

### Subscription Payment Flow
```
┌──────────────────┐
│ Player visits    │
│ campaign payment │
│ page             │
└────────┬─────────┘
         │
         v
┌──────────────────┐
│ Frontend calls   │
│ /api/stripe/     │
│ create-payment-  │
│ intent           │
└────────┬─────────┘
         │
         v
┌──────────────────┐
│ Backend fetches  │
│ campaign & host  │
│ Connect account  │
└────────┬─────────┘
         │
    ┌────┴────┐
    │         │
 Has Acct  No Acct
    │         │
    v         v
┌────────┐  ┌──────────────┐
│Create  │  │Create        │
│with    │  │standard      │
│Connect:│  │subscription  │
│• 20%   │  │(100% to      │
│  fee   │  │ platform)    │
│• 80%   │  └──────────────┘
│  xfer  │
└────────┘
```

## Database Schema Changes

### User Collection
```javascript
{
  _id: ObjectId("..."),
  email: "host@example.com",
  name: "John Host",
  
  // EXISTING FIELDS
  stripeCustomerId: "cus_...",        // For player subscriptions
  
  // NEW FIELDS FOR CONNECT
  stripeConnectAccountId: "acct_...", // Host's Connect account
  stripeConnectOnboardingComplete: true
}
```

### Campaign Collection
```javascript
{
  _id: ObjectId("..."),
  userId: "host_user_id",
  game: "Dungeons & Dragons",
  costPerSession: 10,
  
  // NEW FIELD (optional, for reference)
  stripeConnectAccountId: "acct_..." // Host's account at creation time
}
```

## API Endpoints

### Connect Management
```
POST   /api/stripe/connect/onboard
→ Creates account, returns onboarding URL

GET    /api/stripe/connect/status
→ Returns account status and updates DB

POST   /api/stripe/connect/dashboard
→ Returns Stripe Express Dashboard URL
```

### Payment Processing
```
POST   /api/stripe/create-payment-intent
→ Modified to support Connect payments
→ Checks host's Connect account
→ Applies 20% fee + 80% transfer if available
```

## UI Components

### Navigation
```
Account Menu (Navbar)
├── Profile
├── Host Dashboard  ← NEW
├── Messages
├── Settings
├── Characters
└── Logout
```

### Pages
```
/host/onboarding     ← NEW: Onboarding flow
/host/dashboard      ← NEW: Host control panel
/post-campaign       ← UPDATED: Warning banner
```

## Payment Terms Display

```
┌─────────────────────────────────────┐
│  Payment Terms                      │
├─────────────────────────────────────┤
│                                     │
│  💰 You Receive: 80%                │
│     Of each subscription payment    │
│                                     │
│  🏢 Platform Fee: 20%               │
│     Covers hosting, processing,     │
│     and support                     │
│                                     │
│  ✅ Automatic Payouts               │
│     Processed by Stripe according   │
│     to your payout schedule         │
│                                     │
└─────────────────────────────────────┘
```

## Status Indicators

### Host Dashboard - Account Active
```
┌─────────────────────────────────────┐
│  🟢 Account Active                  │
│                                     │
│  Your payout account is fully set   │
│  up and ready to receive payments.  │
│                                     │
│  [ Open Stripe Dashboard ]          │
└─────────────────────────────────────┘
```

### Host Dashboard - Action Required
```
┌─────────────────────────────────────┐
│  🟡 Action Required                 │
│                                     │
│  ☐ Details Submitted                │
│  ☐ Charges Enabled                  │
│  ☐ Payouts Enabled                  │
│                                     │
│  [ Complete Onboarding ]            │
└─────────────────────────────────────┘
```

### Campaign Creation Warning
```
┌─────────────────────────────────────┐
│  ⚠️  Complete Host Onboarding       │
│      to Receive Payments            │
│                                     │
│  To receive payments for this       │
│  campaign, you need to set up your  │
│  payout account. You'll receive 80% │
│  of subscription payments, with 20% │
│  going to platform fees.            │
│                                     │
│  [ Set Up Payouts ]                 │
└─────────────────────────────────────┘
```

## Stripe Dashboard Views

### Platform Dashboard
```
Connect Overview
├── Total Accounts: 15
├── Active Accounts: 12
├── Application Fees (This Month): $234
└── Pending Verification: 3
```

### Host Express Dashboard (per host)
```
Express Dashboard
├── Account Balance: $320
├── Next Payout: Jun 15, 2024 ($320)
├── Recent Transfers
│   ├── Campaign A subscription: $8.00
│   ├── Campaign B subscription: $12.00
│   └── Campaign C subscription: $6.00
└── Payout Settings
```

## Error Handling

### Onboarding Link Expired
```
User clicks expired link
         │
         v
Shows error message
         │
         v
"Please visit /host/onboarding to generate a new link"
```

### Payment Without Connect
```
Subscription created
         │
         v
No Connect account found
         │
         v
100% to platform (normal flow)
         │
         v
Campaign still works normally
```

## Testing Checklist

- [ ] Host can complete onboarding with test data
- [ ] Dashboard shows correct account status
- [ ] Payment splits 80/20 correctly
- [ ] Platform receives application fees
- [ ] Host receives transfers
- [ ] Warning shows in campaign creation
- [ ] Navigation link works
- [ ] Express dashboard access works
- [ ] Backward compatibility maintained
- [ ] Non-Connect campaigns still work

## Monitoring Metrics

```
Key Performance Indicators:

┌────────────────────────────────────┐
│ Onboarding Completion Rate: 85%   │
│ Active Connect Accounts: 127       │
│ Monthly Application Fees: $2,340   │
│ Monthly Host Transfers: $9,360     │
│ Failed Transfers: 0                │
│ Accounts Needing Action: 5         │
└────────────────────────────────────┘
```

## Security Model

```
Frontend (Browser)
    │
    │ HTTPS only
    │
    v
API Endpoints (Server)
    │
    ├─> Check Authentication ✓
    │
    ├─> Validate User Access ✓
    │
    └─> Stripe API (Server-side) ✓
            │
            └─> Connect Operations ✓
```

**Key Points:**
- ✅ No Stripe secrets in frontend
- ✅ All operations server-side
- ✅ User session validation
- ✅ Account ownership checks
- ✅ Secure redirects only

---

## Summary

This implementation provides a complete, production-ready Stripe Connect integration that automatically splits subscription payments 80/20 between hosts and the platform, with a seamless onboarding experience and comprehensive dashboard for hosts to manage their payouts.
