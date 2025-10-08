# UI Changes: Subscription Management Link

## Before Implementation

When a user with an active subscription visited the payment page:

```
┌─────────────────────────────────────────────────────────┐
│  Subscribe to Dungeons & Dragons                        │
│                                                          │
│  This campaign runs for multiple sessions. Subscribe    │
│  to keep your seat reserved.                            │
│                                                          │
│  Amount due: $10.00                                     │
│  Sessions: 5 sessions                                   │
│                                                          │
│  ┌────────────────────────────────────────────────┐    │
│  │  [Payment Form - Stripe Elements]              │    │
│  │  • Card Number: [___________________]          │    │
│  │  • Expiry: [____] CVC: [____]                  │    │
│  │  • [Subscribe Now] Button                      │    │
│  └────────────────────────────────────────────────┘    │
│                                                          │
└─────────────────────────────────────────────────────────┘

ISSUE: User already has subscription but sees payment form again
RISK: Could create duplicate subscription
```

## After Implementation

When a user with an active subscription visits the payment page:

```
┌─────────────────────────────────────────────────────────┐
│  Subscribe to Dungeons & Dragons                        │
│                                                          │
│  This campaign runs for multiple sessions. Subscribe    │
│  to keep your seat reserved.                            │
│                                                          │
│  Amount due: $10.00                                     │
│  Sessions: 5 sessions                                   │
│                                                          │
│  ┌────────────────────────────────────────────────┐    │
│  │  ✓ You have an active subscription for this    │    │
│  │    campaign.                                    │    │
│  └────────────────────────────────────────────────┘    │
│                    (emerald/green box)                   │
│                                                          │
│  ┌──────────────────────────────────────────┐           │
│  │  Manage Subscription (Stripe Dashboard)  │           │
│  └──────────────────────────────────────────┘           │
│             (sky-blue button)                            │
│                                                          │
└─────────────────────────────────────────────────────────┘

SOLUTION: Clear message + link to Stripe dashboard
BENEFIT: User can manage subscription, no duplicate risk
```

## When User Clicks "Manage Subscription"

Opens Stripe Customer Portal in a new tab:
- User can view subscription details
- User can update payment method
- User can cancel subscription
- User can view billing history

Same link as in Settings page:
`https://billing.stripe.com/p/login/00w4gy3Jmad7bDT6k273G00`

## Color Scheme

- **Info Box**: Emerald border and background (border-emerald-500/20 bg-emerald-500/10)
- **Text**: Emerald text (text-emerald-400)
- **Button**: Sky blue background (bg-sky-600 hover:bg-sky-700)
- **Button Text**: White (text-white)

## Responsive Design

All elements use the existing responsive classes from the payment page:
- Rounded corners (rounded-xl, rounded-lg)
- Proper spacing (space-y-4, px-4, py-2)
- Consistent with app's design system

## Accessibility

- Link opens in new tab with `target="_blank"`
- Includes `rel="noopener noreferrer"` for security
- Clear, descriptive text
- High contrast colors for readability
- Button has hover state for feedback
