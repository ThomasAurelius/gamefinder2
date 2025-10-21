# Firebase Authentication Fix Summary

## Issue Description

Users were experiencing the following error when trying to use Firebase Authentication:
```
Firebase: Error (auth/invalid-api-key)
Failed to sign in Error: Firebase Authentication is not properly configured. Firebase: Error (auth/invalid-api-key)
```

This occurred even when the `NEXT_PUBLIC_FIREBASE_API_KEY` environment variable was correctly set.

## Root Cause Analysis

The issue was caused by two problems in the codebase:

### 1. Incorrect Environment Variable Access Pattern

In `lib/firebase-config.ts`, the code was using dynamic string keys to access environment variables:

```typescript
function getRequiredEnvVar(name: string): string {
  const value = process.env[name];  // ❌ This doesn't work in Next.js
  // ...
}
```

**Problem**: In Next.js, `NEXT_PUBLIC_*` environment variables are replaced at build time by the bundler. When you use `process.env[variableName]` with a dynamic string key, the bundler cannot statically analyze and replace these values, resulting in `undefined` at runtime.

### 2. Missing Firebase Auth Domains in CSP Headers

The Content Security Policy (CSP) headers in `next.config.ts` did not include the required Firebase Authentication API endpoints:
- `identitytoolkit.googleapis.com` - Firebase Auth API
- `securetoken.googleapis.com` - Token verification
- `*.firebaseapp.com` - Auth domain

This would have caused network requests to be blocked even if the configuration was correct.

## Solution Implemented

### 1. Fixed Environment Variable Access

Updated `lib/firebase-config.ts` to pass the environment variable values directly:

```typescript
function getRequiredEnvVar(name: string, value: string | undefined): string {
  // Now receives the value directly instead of looking it up
  if (!value || value === "undefined" || value.trim() === "") {
    // Error handling...
  }
  return value;
}

export function getFirebaseConfig() {
  // Access environment variables directly - Next.js can now replace these at build time
  _config = {
    apiKey: getRequiredEnvVar("NEXT_PUBLIC_FIREBASE_API_KEY", process.env.NEXT_PUBLIC_FIREBASE_API_KEY),
    authDomain: getRequiredEnvVar("NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN", process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN),
    projectId: getRequiredEnvVar("NEXT_PUBLIC_FIREBASE_PROJECT_ID", process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID),
    storageBucket: getRequiredEnvVar("NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET", process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET),
    appId: getRequiredEnvVar("NEXT_PUBLIC_FIREBASE_APP_ID", process.env.NEXT_PUBLIC_FIREBASE_APP_ID),
  };
  return _config;
}
```

### 2. Updated CSP Headers

Modified `next.config.ts` to include Firebase Auth domains in the `connect-src` directive:

```typescript
"connect-src 'self' https://*.stripe.com https://firebasestorage.googleapis.com https://storage.googleapis.com https://identitytoolkit.googleapis.com https://securetoken.googleapis.com https://*.firebaseapp.com"
```

### 3. Enhanced Documentation

Updated `FIREBASE_AUTH_SETUP.md` with:
- More detailed troubleshooting for the `auth/invalid-api-key` error
- Explanation of CSP requirements
- Additional debugging steps

## Files Changed

1. `lib/firebase-config.ts` - Fixed environment variable access pattern
2. `next.config.ts` - Added Firebase Auth domains to CSP
3. `FIREBASE_AUTH_SETUP.md` - Enhanced troubleshooting documentation

## Testing & Verification

- ✅ Code security scan completed with no vulnerabilities found
- ✅ All environment variable access patterns reviewed
- ✅ CSP headers verified to include all required Firebase domains

## For Users to Verify the Fix

After this fix is deployed:

1. Ensure your `.env.local` file contains all required Firebase environment variables:
   ```
   NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
   ```

2. Restart your development server (if running locally):
   ```bash
   npm run dev
   ```

3. Try logging in at `/auth/login` or registering at `/auth/register`

4. Check the browser console - you should no longer see:
   - `Firebase: Error (auth/invalid-api-key)`
   - Any CSP violation errors related to Firebase

## Technical Details

### Why Direct Access Works

Next.js uses a build-time replacement strategy for `NEXT_PUBLIC_*` variables. When you write:

```typescript
process.env.NEXT_PUBLIC_FIREBASE_API_KEY
```

The bundler (webpack/turbopack) replaces this at build time with the actual value, like:

```typescript
"AIzaSyAbc123..." // The actual API key value
```

However, when you write:

```typescript
const key = "NEXT_PUBLIC_FIREBASE_API_KEY";
process.env[key]
```

The bundler cannot perform this replacement because it doesn't know what the value of `key` will be at runtime. This results in `undefined`.

### CSP and Firebase Auth

Firebase Authentication makes network requests to Google's identity services. The Content Security Policy must explicitly allow these connections, otherwise modern browsers will block them for security reasons.

## Additional Notes

- This fix is backward compatible - existing code using `FIREBASE_CONFIG` will continue to work
- No database migrations or data changes are required
- The fix only affects client-side authentication initialization
- Server-side Firebase Admin SDK usage is unaffected
