#!/usr/bin/env node

/**
 * Stripe Configuration Validator
 * 
 * This script checks if your Stripe API keys are properly configured
 * and can connect to Stripe's API successfully.
 * 
 * Usage: node scripts/validate-stripe.js
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Stripe Configuration Validator\n');
console.log('='.repeat(50));

// Check for .env.local file
const envPath = path.join(process.cwd(), '.env.local');
const hasEnvFile = fs.existsSync(envPath);

if (!hasEnvFile) {
  console.log('❌ ERROR: .env.local file not found');
  console.log('   Create a .env.local file in your project root with:');
  console.log('   STRIPE_SECRET_KEY=sk_test_...');
  console.log('   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...\n');
  process.exit(1);
}

console.log('✅ .env.local file found');

// Load environment variables
require('dotenv').config({ path: envPath });

// Check STRIPE_SECRET_KEY
const secretKey = process.env.STRIPE_SECRET_KEY;
if (!secretKey) {
  console.log('❌ ERROR: STRIPE_SECRET_KEY not set in .env.local');
  console.log('   Add: STRIPE_SECRET_KEY=sk_test_...\n');
  process.exit(1);
}

console.log('✅ STRIPE_SECRET_KEY is set');

// Validate secret key format
const isTestKey = secretKey.startsWith('sk_test_');
const isLiveKey = secretKey.startsWith('sk_live_');

if (!isTestKey && !isLiveKey) {
  console.log('❌ ERROR: STRIPE_SECRET_KEY has invalid format');
  console.log('   Expected: sk_test_... (test mode) or sk_live_... (live mode)');
  console.log(`   Got: ${secretKey.substring(0, 10)}...\n`);
  process.exit(1);
}

console.log(`✅ Using ${isTestKey ? 'TEST' : 'LIVE'} mode keys`);

if (isLiveKey) {
  console.log('⚠️  WARNING: You are using LIVE mode keys!');
  console.log('   Make sure this is intentional. Use TEST keys for development.\n');
}

// Check NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
if (!publishableKey) {
  console.log('❌ ERROR: NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY not set');
  console.log('   Add: NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...');
  console.log('   Note the NEXT_PUBLIC_ prefix is required!\n');
  process.exit(1);
}

console.log('✅ NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is set');

// Validate publishable key format
const isTestPubKey = publishableKey.startsWith('pk_test_');
const isLivePubKey = publishableKey.startsWith('pk_live_');

if (!isTestPubKey && !isLivePubKey) {
  console.log('❌ ERROR: Publishable key has invalid format');
  console.log('   Expected: pk_test_... (test mode) or pk_live_... (live mode)');
  console.log(`   Got: ${publishableKey.substring(0, 10)}...\n`);
  process.exit(1);
}

// Check if both keys are in the same mode
if ((isTestKey && !isTestPubKey) || (isLiveKey && !isLivePubKey)) {
  console.log('❌ ERROR: Key mode mismatch!');
  console.log(`   Secret key is in ${isTestKey ? 'TEST' : 'LIVE'} mode`);
  console.log(`   Publishable key is in ${isTestPubKey ? 'TEST' : 'LIVE'} mode`);
  console.log('   Both keys must be from the same mode.\n');
  process.exit(1);
}

console.log('✅ Both keys are in the same mode');

// Try to initialize Stripe and make a test API call
console.log('\n🔌 Testing Stripe API connection...');

const Stripe = require('stripe');
const stripe = new Stripe(secretKey, {
  // Match the stable API version used by the application so validation
  // mirrors runtime behaviour.
  apiVersion: '2024-04-10',
});

// Test API call - list products (lightweight operation)
stripe.products.list({ limit: 1 })
  .then(() => {
    console.log('✅ Successfully connected to Stripe API');
    console.log('\n' + '='.repeat(50));
    console.log('✨ All checks passed! Your Stripe configuration is valid.');
    console.log('\nYou can now:');
    console.log('1. Start your dev server: npm run dev');
    console.log('2. Create a test campaign with 2+ sessions');
    console.log('3. Set up payment using test card: 4242 4242 4242 4242');
    console.log('\nFor more help, see TEST_MODE_VERIFICATION.md\n');
  })
  .catch((error) => {
    console.log('❌ ERROR: Failed to connect to Stripe API');
    console.log(`   ${error.message}`);
    console.log('\nPossible causes:');
    console.log('1. Invalid or revoked API key');
    console.log('2. Network connectivity issue');
    console.log('3. Stripe account restrictions');
    console.log('\nVerify your keys at: https://dashboard.stripe.com/test/apikeys\n');
    process.exit(1);
  });
