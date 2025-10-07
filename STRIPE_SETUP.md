# Stripe Payment Integration

This application uses Stripe embedded components for payment processing. Campaign creators can set up paid campaigns, and players will need to pay when joining.

## Setup

### 1. Install Dependencies

The required Stripe packages are already installed:
- `stripe` - Node.js library for Stripe API
- `@stripe/stripe-js` - JavaScript library for loading Stripe.js
- `@stripe/react-stripe-js` - React components for Stripe

### 2. Configure Environment Variables

Add your Stripe API keys to your `.env.local` file:

```bash
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
```

**Important:** 
- Use test keys (starting with `sk_test_` and `pk_test_`) during development
- Never commit your actual Stripe keys to version control
- For production, use live keys (starting with `sk_live_` and `pk_live_`)

### 3. Get Your Stripe Keys

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/)
2. Navigate to **Developers** > **API keys**
3. Copy your **Publishable key** and **Secret key**
4. Paste them into your `.env.local` file

## Features

### For Campaign Creators

When creating a campaign:
1. Set a **Cost per Session** (e.g., $5.00)
2. If the cost is greater than $0, a payment setup section appears
3. Click "Set Up Stripe Payment" to initialize the payment form
4. The Stripe embedded payment form will appear with a test card interface
5. After setting up payment, the campaign will be marked as requiring payment

### For Players

When joining a paid campaign:
- Players will be prompted to complete payment using Stripe's secure payment form
- Stripe handles all sensitive payment data
- No credit card information is stored on your servers

## How It Works

### Payment Intent API

The `/api/stripe/create-payment-intent` endpoint:
- Creates a Stripe PaymentIntent for the specified amount
- Returns a `clientSecret` used to render the payment form
- Stores metadata about the campaign and user

### Stripe Payment Form Component

The `StripePaymentForm` component (`components/StripePaymentForm.tsx`):
- Uses Stripe's Payment Element for embedded payment UI
- Supports multiple payment methods automatically
- Styled to match the app's dark theme
- Handles payment confirmation and errors

### Campaign Types

New fields added to campaigns:
- `costPerSession` - The amount to charge per session
- `requiresPayment` - Boolean flag indicating if payment is required
- `stripePaymentIntentId` - Reference to the Stripe PaymentIntent (optional)
- `stripeClientSecret` - Client secret for payment form (optional)

## Testing

### Test Card Numbers

Use these test card numbers in development:

| Card Number | Scenario |
|------------|----------|
| 4242 4242 4242 4242 | Successful payment |
| 4000 0000 0000 9995 | Declined payment |
| 4000 0025 0000 3155 | Requires authentication (3D Secure) |

- Use any future expiration date (e.g., 12/34)
- Use any 3-digit CVC
- Use any ZIP code

### Testing the Integration

1. Start the development server: `npm run dev`
2. Navigate to **Post Campaign** page
3. Fill in campaign details
4. Set a cost per session (e.g., $5.00)
5. Click "Set Up Stripe Payment"
6. Enter a test card number from above
7. Complete the payment form
8. Submit the campaign

## Security

- **PCI Compliance**: By using Stripe's embedded components, you don't need to handle sensitive card data directly
- **Server-side validation**: All payment intents are created server-side with proper authentication
- **Metadata**: Campaign and user information is attached to each payment for tracking

## Production Deployment

Before going live:

1. **Switch to Live Keys**:
   - Replace test keys with live keys in production environment
   - Keep test keys for development/staging environments

2. **Enable Payment Methods**:
   - Configure which payment methods to accept in your [Stripe Dashboard](https://dashboard.stripe.com/settings/payment_methods)
   - Common options: Cards, Apple Pay, Google Pay, etc.

3. **Set Up Webhooks** (Optional but recommended):
   - Configure webhook endpoints to receive payment status updates
   - Handle events like `payment_intent.succeeded` and `payment_intent.failed`

4. **Test in Production**:
   - Make test purchases using live keys
   - Verify the full payment flow works correctly

## Troubleshooting

### "STRIPE_SECRET_KEY is not configured" Error

Make sure you've added the Stripe secret key to your `.env.local` file and restarted your development server.

### "Please call Stripe() with your publishable key" Error

This error occurs when `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` is not properly set or accessible. To fix:

1. Ensure you've added the key to your `.env.local` file:
   ```bash
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
   ```

2. **Restart your development server** after adding or changing environment variables. Next.js only loads environment variables at startup.

3. Verify the key is being loaded by checking the browser console. You should see a warning if the key is missing.

4. The application uses a dedicated `lib/stripe-config.ts` file to properly expose the environment variable to client-side components.

### Payment Form Not Appearing

Check your browser console for errors. Common issues:
- Publishable key not set or invalid
- Network errors loading Stripe.js
- CORS issues (should not occur with Stripe's CDN)

### Build Errors

If you encounter build errors related to Stripe types, ensure you're using compatible versions:
- `stripe`: Latest version
- `@stripe/stripe-js`: Latest version
- `@stripe/react-stripe-js`: Latest version

## Resources

- [Stripe Documentation](https://stripe.com/docs)
- [Stripe Payment Element](https://stripe.com/docs/payments/payment-element)
- [Stripe React Docs](https://stripe.com/docs/stripe-js/react)
- [Test Cards](https://stripe.com/docs/testing)
