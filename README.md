This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## ⭐ Does Subscriptions Work in Test Mode?

**YES!** See [SUBSCRIPTIONS_WORK_IN_TEST_MODE.md](./SUBSCRIPTIONS_WORK_IN_TEST_MODE.md) for the complete answer and troubleshooting guide.

## Payment Integration

This application integrates Stripe for payment processing, including support for both one-time payments and recurring subscriptions.

### 🆕 Stripe Connect Payment Splitting

The platform now supports **automatic payment splitting** for subscription-based campaigns using Stripe Connect:

- **80%** goes directly to campaign hosts (via their Stripe Connect account)
- **20%** stays with the platform as an application fee

**Host Features:**
- Simple onboarding flow via Stripe Express
- Dedicated Host Dashboard at `/host/dashboard`
- Automatic payout management through Stripe
- View account status and payment terms
- One-click access to Stripe Express Dashboard

**Quick Links:**
- [Stripe Connect Setup Guide](./STRIPE_CONNECT_GUIDE.md) - Complete technical guide
- [Visual Summary](./STRIPE_CONNECT_VISUAL_SUMMARY.md) - Flowcharts and diagrams

**Quick Links:**
- [Test Mode Verification](./TEST_MODE_VERIFICATION.md) - ⭐ **YES, subscriptions work in test mode!** Verify your setup here
- [Stripe Setup Guide](./STRIPE_SETUP.md) - Complete setup instructions
- [Subscription FAQ](./STRIPE_SUBSCRIPTION_FAQ.md) - Common questions and troubleshooting
- [Subscription Fix Details](./SUBSCRIPTION_FIX.md) - Technical details about subscription implementation

### Verify Your Stripe Configuration

Before starting development, validate your Stripe setup:

```bash
npm run validate:stripe
```

This will check:
- ✅ Environment variables are properly set
- ✅ API keys have correct format (test vs live)
- ✅ Both keys are in the same mode
- ✅ Connection to Stripe API works

If you get errors about missing keys, see [STRIPE_SETUP.md](./STRIPE_SETUP.md) for setup instructions.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
