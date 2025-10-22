# Firebase Authentication Setup Guide

This application now uses Google Firebase Authentication for user login and registration with email/password.

## Configuration

### Environment Variables

Add the following environment variables to your `.env.local` file:

#### Client-Side Firebase Configuration
```
NEXT_PUBLIC_FIREBASE_API_KEY=your-firebase-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
NEXT_PUBLIC_FIREBASE_APP_ID=your-firebase-app-id
```

#### Server-Side Firebase Admin Configuration
```
FIREBASE_SERVICE_ACCOUNT_JSON='{"type":"service_account", "project_id": "...", ...}'
```
Or alternatively use:
```
FIREBASE_SERVICE_ACCOUNT_BASE64=<base64-encoded-service-account-json>
```
Or:
```
FIREBASE_SERVICE_ACCOUNT_PATH=./firebase-service-account.json
```

### Getting Your Firebase Credentials

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Select your project (or create a new one)
3. Go to Project Settings (gear icon)
4. Under "General" tab, scroll down to "Your apps" section
5. Click on the web app icon (</>) or add a new web app
6. Copy the Firebase configuration values to your environment variables

For the service account (server-side):
1. Go to Project Settings > Service Accounts
2. Click "Generate new private key"
3. Save the JSON file securely
4. Use one of the three methods to provide the credentials (JSON string, Base64, or file path)

## How It Works

### User Registration Flow

1. User fills out registration form at `/auth/register`
2. Client-side: Firebase Authentication creates a new user account
3. Client-side: Gets an ID token from Firebase
4. Client-side: Sends ID token to `/api/auth/register`
5. Server-side: Verifies ID token with Firebase Admin
6. Server-side: Creates user profile in MongoDB with Firebase UID
7. User is redirected to login page

### User Login Flow

1. User fills out login form at `/auth/login`
2. Client-side: Firebase Authentication signs in the user
3. Client-side: Gets an ID token from Firebase
4. Client-side: Sends ID token to `/api/auth/login`
5. Server-side: Verifies ID token with Firebase Admin
6. Server-side: Finds or creates user in MongoDB, sets session cookie
7. User is redirected to dashboard

### Password Reset Flow

1. User requests password reset at `/auth/reset-password`
2. Client-side: Firebase Authentication sends password reset email
3. User clicks link in email (handled by Firebase)
4. Firebase provides a password reset page where user sets new password
5. User can now login with new password

## Key Features

- **Email/Password Authentication**: Simple username and password login
- **Password Reset**: Handled entirely by Firebase (no custom email infrastructure needed)
- **Secure Token Verification**: ID tokens are verified server-side using Firebase Admin SDK
- **MongoDB Integration**: User profiles stored in MongoDB with Firebase UID reference
- **Session Management**: HttpOnly cookies for authenticated requests
- **Error Handling**: User-friendly error messages for common scenarios

## Files Modified

### Client-Side
- `lib/firebase-auth.ts` - Firebase Authentication utilities
- `app/auth/login/page.tsx` - Login page using Firebase Auth
- `app/auth/register/page.tsx` - Registration page using Firebase Auth
- `app/auth/reset-password/page.tsx` - Password reset page using Firebase Auth

### Server-Side
- `app/api/auth/login/route.ts` - Verifies Firebase ID tokens and creates sessions
- `app/api/auth/register/route.ts` - Verifies Firebase ID tokens and creates user profiles
- `lib/user-types.ts` - Updated to include `firebaseUid` field

### Configuration
- `.env.example` - Added Firebase Auth environment variables

## Security Notes

- Firebase ID tokens are verified server-side on every authentication request
- Passwords are never sent to or stored on your backend
- Firebase handles password hashing and security
- Session cookies are HttpOnly, Secure (in production), and SameSite
- User profiles in MongoDB include `firebaseUid` for linking to Firebase Authentication

## Migration from Old System

The old password-based authentication system is still partially in place:
- `passwordHash` field in MongoDB is now optional
- Users with existing `passwordHash` will need to use the password reset flow to migrate to Firebase Auth
- The old password reset API routes (`/api/auth/request-reset` and `/api/auth/reset`) are still available but not used by the new UI

## Testing

To test the authentication system:

1. Set up your Firebase project and add the credentials to `.env.local`
2. Start the development server: `npm run dev`
3. Navigate to `/auth/register` to create a new account
4. Check Firebase Console > Authentication to see the new user
5. Navigate to `/auth/login` to sign in
6. Test password reset at `/auth/reset-password`

## Troubleshooting

### "Firebase: Error (auth/invalid-api-key)" or "Firebase Auth configuration not found"
- Ensure all `NEXT_PUBLIC_FIREBASE_*` environment variables are set in your `.env.local` file
- **Important**: The environment variables must be set exactly as shown in `.env.example` with the `NEXT_PUBLIC_` prefix
- Verify that your API key is correct (no extra spaces or quotes)
- Restart the development server after adding or modifying environment variables
- Check browser console for any CSP (Content Security Policy) errors
- If you see "Authentication service is not properly configured", double-check your Firebase API key in the Firebase Console

### "Failed to verify ID token"
- Ensure Firebase Admin credentials are properly configured
- Check that the service account has the correct permissions
- Verify that the project ID matches in both client and server configs

### "No account found with this email"
- The user needs to register first at `/auth/register`
- Check Firebase Console > Authentication to see if user exists

### Password reset email not received
- Check spam/junk folder
- Verify email configuration in Firebase Console > Authentication > Templates
- Ensure the auth domain is properly configured

### Network or CSP errors in browser console
- Firebase Auth requires network access to several Google APIs
- The CSP headers in `next.config.ts` have been configured to allow:
  - `*.googleapis.com` (All Google API services including Firebase Auth, token verification, etc.)
  - `*.firebaseapp.com` (Auth domain)
- If you see CSP violations, ensure these wildcard patterns are in the `connect-src` directive
