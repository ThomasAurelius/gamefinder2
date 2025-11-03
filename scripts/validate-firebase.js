#!/usr/bin/env node

/**
 * Firebase Configuration Validator
 * 
 * This script validates Firebase Admin configuration and reports which method is being used.
 * Run with: node scripts/validate-firebase.js
 */

require('dotenv').config({ path: '.env.local' });

console.log('\n🔥 Firebase Configuration Validator\n');
console.log('=' .repeat(50));

// Check for each credential method
const methods = [
  {
    name: 'Method 1: FIREBASE_SERVICE_ACCOUNT_JSON',
    check: () => !!process.env.FIREBASE_SERVICE_ACCOUNT_JSON,
    priority: 1,
    env: 'FIREBASE_SERVICE_ACCOUNT_JSON'
  },
  {
    name: 'Method 2: FIREBASE_SERVICE_ACCOUNT_BASE64',
    check: () => !!process.env.FIREBASE_SERVICE_ACCOUNT_BASE64,
    priority: 2,
    env: 'FIREBASE_SERVICE_ACCOUNT_BASE64'
  },
  {
    name: 'Method 3: File Path',
    check: () => !!(process.env.FIREBASE_SERVICE_ACCOUNT_PATH || process.env.GOOGLE_APPLICATION_CREDENTIALS),
    priority: 3,
    env: 'FIREBASE_SERVICE_ACCOUNT_PATH or GOOGLE_APPLICATION_CREDENTIALS'
  },
  {
    name: 'Method 4: Individual Variables',
    check: () => !!(
      process.env.FIREBASE_PROJECT_ID &&
      process.env.FIREBASE_CLIENT_EMAIL &&
      process.env.FIREBASE_PRIVATE_KEY
    ),
    priority: 4,
    env: 'FIREBASE_PROJECT_ID + FIREBASE_CLIENT_EMAIL + FIREBASE_PRIVATE_KEY'
  }
];

// Check which methods are configured
const configuredMethods = methods.filter(m => m.check());

console.log('\n📋 Configuration Status:\n');

if (configuredMethods.length === 0) {
  console.log('❌ No Firebase Admin credentials configured!');
  console.log('\nPlease configure Firebase Admin credentials using one of these methods:');
  methods.forEach(m => {
    console.log(`  ${m.priority}. ${m.name}`);
  });
  console.log('\nSee FIREBASE_CONFIGURATION_GUIDE.md for detailed instructions.');
  process.exit(1);
}

// Show all configured methods
configuredMethods.forEach(method => {
  console.log(`✅ ${method.name}`);
  console.log(`   Priority: ${method.priority} | Variable: ${method.env}`);
});

// Show which method will be used
const activeMethod = configuredMethods.sort((a, b) => a.priority - b.priority)[0];
console.log('\n' + '='.repeat(50));
console.log(`\n🎯 Active Method (Highest Priority):\n   ${activeMethod.name}`);
console.log(`   Variable: ${activeMethod.env}`);

// Warnings for multiple methods
if (configuredMethods.length > 1) {
  console.log('\n⚠️  Warning: Multiple credential methods are configured.');
  console.log('   Only the highest priority method will be used.');
  console.log('\n   Configured methods (in priority order):');
  configuredMethods
    .sort((a, b) => a.priority - b.priority)
    .forEach(m => {
      const isActive = m === activeMethod;
      console.log(`   ${isActive ? '➡️' : '  '} ${m.priority}. ${m.name} ${isActive ? '(ACTIVE)' : '(ignored)'}`);
    });
  console.log('\n   Recommendation: Configure only ONE method to avoid confusion.');
}

// Validate individual variables if they're the active method
if (activeMethod.priority === 4) {
  console.log('\n' + '='.repeat(50));
  console.log('\n🔍 Validating Individual Variables:\n');
  
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY;
  const storageBucket = process.env.FIREBASE_STORAGE_BUCKET;
  
  // Check project ID
  if (projectId) {
    console.log(`✅ FIREBASE_PROJECT_ID: ${projectId}`);
  } else {
    console.log('❌ FIREBASE_PROJECT_ID: Not set');
  }
  
  // Check client email
  if (clientEmail) {
    const isValidFormat = clientEmail.includes('@') && clientEmail.endsWith('.iam.gserviceaccount.com');
    if (isValidFormat) {
      console.log(`✅ FIREBASE_CLIENT_EMAIL: ${clientEmail}`);
    } else {
      console.log(`⚠️  FIREBASE_CLIENT_EMAIL: ${clientEmail}`);
      console.log('   Warning: Email format may be incorrect (should end with .iam.gserviceaccount.com)');
    }
  } else {
    console.log('❌ FIREBASE_CLIENT_EMAIL: Not set');
  }
  
  // Check private key
  if (privateKey) {
    const hasBegin = privateKey.includes('BEGIN PRIVATE KEY');
    const hasEnd = privateKey.includes('END PRIVATE KEY');
    const length = privateKey.length;
    
    if (hasBegin && hasEnd) {
      console.log(`✅ FIREBASE_PRIVATE_KEY: Set (${length} characters)`);
      console.log('   Contains proper BEGIN and END markers');
    } else {
      console.log(`⚠️  FIREBASE_PRIVATE_KEY: Set (${length} characters)`);
      if (!hasBegin) console.log('   ❌ Missing "BEGIN PRIVATE KEY" marker');
      if (!hasEnd) console.log('   ❌ Missing "END PRIVATE KEY" marker');
    }
  } else {
    console.log('❌ FIREBASE_PRIVATE_KEY: Not set');
  }
  
  // Check storage bucket (optional but recommended)
  if (storageBucket) {
    console.log(`✅ FIREBASE_STORAGE_BUCKET: ${storageBucket}`);
  } else {
    console.log('⚠️  FIREBASE_STORAGE_BUCKET: Not set (will be inferred from project ID)');
  }
}

// Check client-side config
console.log('\n' + '='.repeat(50));
console.log('\n🌐 Client-Side Firebase Configuration:\n');

const clientVars = [
  'NEXT_PUBLIC_FIREBASE_API_KEY',
  'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
  'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
  'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
  'NEXT_PUBLIC_FIREBASE_APP_ID'
];

let clientConfigComplete = true;
clientVars.forEach(varName => {
  if (process.env[varName]) {
    console.log(`✅ ${varName}: Set`);
  } else {
    console.log(`❌ ${varName}: Not set`);
    clientConfigComplete = false;
  }
});

if (!clientConfigComplete) {
  console.log('\n⚠️  Warning: Client-side Firebase configuration is incomplete.');
  console.log('   Authentication and client-side features may not work properly.');
}

// Final summary
console.log('\n' + '='.repeat(50));
console.log('\n📊 Summary:\n');

if (configuredMethods.length > 0 && clientConfigComplete) {
  console.log('✅ Firebase configuration looks good!');
  console.log(`   Server-side: ${activeMethod.name}`);
  console.log('   Client-side: All required variables set');
} else {
  console.log('⚠️  Firebase configuration needs attention:');
  if (configuredMethods.length === 0) {
    console.log('   - No server-side credentials configured');
  }
  if (!clientConfigComplete) {
    console.log('   - Client-side configuration incomplete');
  }
}

console.log('\n📚 Resources:');
console.log('   - Configuration Guide: FIREBASE_CONFIGURATION_GUIDE.md');
console.log('   - Environment Example: .env.example');
console.log('   - Auth Setup: FIREBASE_AUTH_SETUP.md');
console.log('\n' + '='.repeat(50) + '\n');

process.exit(configuredMethods.length > 0 && clientConfigComplete ? 0 : 1);
