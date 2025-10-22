# Fix for Firebase "auth/invalid-api-key" Error

## Problem

If you're seeing this error in your browser console:

```
hook.js:608 Failed to initialize Firebase Auth: Firebase: Error (auth/invalid-api-key).
hook.js:608 Failed to sign in Error: Firebase Authentication is not properly configured. Firebase: Error (auth/invalid-api-key).
```

This means the Firebase configuration environment variables are either missing or empty.

## Solution

### Step 1: Create or Update Your `.env.local` File

In the root directory of your project, create a file named `.env.local` (if it doesn't already exist) and add the following environment variables:

```env
# Firebase Authentication Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your-firebase-api-key-here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
NEXT_PUBLIC_FIREBASE_APP_ID=your-firebase-app-id-here
```

### Step 2: Get Your Firebase Credentials

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Select your project (or create a new one if needed)
3. Click on the gear icon ⚙️ for "Project settings"
4. Scroll down to the "Your apps" section
5. If you don't have a web app yet, click "Add app" and select the web icon (`</>`)
6. Copy the configuration values from the Firebase SDK snippet
7. Paste them into your `.env.local` file

**Example Firebase Config:**
```javascript
const firebaseConfig = {
  apiKey: "AIzaSyAbc123...",              // Copy this to NEXT_PUBLIC_FIREBASE_API_KEY
  authDomain: "myproject.firebaseapp.com", // Copy this to NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
  projectId: "myproject",                  // Copy this to NEXT_PUBLIC_FIREBASE_PROJECT_ID
  storageBucket: "myproject.appspot.com",  // Copy this to NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
  appId: "1:123456789:web:abc123..."      // Copy this to NEXT_PUBLIC_FIREBASE_APP_ID
};
```

### Step 3: Restart Your Development Server

After adding or updating the `.env.local` file, you **must** restart your development server:

```bash
# Stop the current server (Ctrl+C or Cmd+C)
# Then start it again:
npm run dev
```

**Important**: Next.js only reads environment variables when the development server starts. Changes to `.env.local` will not take effect until you restart the server.

### Step 4: Verify the Fix

1. Open your browser and navigate to your app
2. Try to log in or register at `/auth/login` or `/auth/register`
3. Open the browser console (F12 or Cmd+Option+I on Mac)
4. You should no longer see the `auth/invalid-api-key` error

## What Was Fixed

The application now includes multiple layers of validation to prevent Firebase from being initialized with missing or invalid configuration:

1. **Immediate validation**: The app now throws clear error messages when environment variables are missing, instead of silently failing
2. **No empty string initialization**: Firebase is never initialized with empty strings, which would cause the `auth/invalid-api-key` error
3. **Better error messages**: You'll see helpful error messages that tell you exactly which environment variables are missing and where to find them
4. **Configuration retry**: If you fix the configuration later, the app will retry initialization

## Common Issues

### "I added the variables but still see the error"

**Solution**: Make sure you restarted the development server after adding the environment variables. Next.js only reads `.env.local` at startup.

### "My .env.local file exists but variables aren't being read"

**Checklist**:
- [ ] Ensure the file is named `.env.local` (not `.env` or `.env.production`)
- [ ] Ensure the file is in the root directory of your project (same level as `package.json`)
- [ ] Ensure there are no spaces around the `=` sign: `KEY=value` not `KEY = value`
- [ ] Ensure there are no quotes around the values unless they contain spaces
- [ ] Ensure all variable names start with `NEXT_PUBLIC_` for client-side access
- [ ] Restart the development server after making changes

### "I'm getting CSP (Content Security Policy) errors"

The CSP headers have already been configured to allow Firebase Authentication. If you see CSP errors, make sure you're using the latest version of the code.

## Need More Help?

- See [FIREBASE_AUTH_SETUP.md](./FIREBASE_AUTH_SETUP.md) for complete Firebase setup instructions
- See [FIREBASE_FIX_SUMMARY.md](./FIREBASE_FIX_SUMMARY.md) for technical details about what was fixed
- Check the [Firebase Console](https://console.firebase.google.com/) to verify your project settings
- Review the `.env.example` file for a template of required environment variables

## Security Note

⚠️ **Never commit your `.env.local` file to git!** This file contains sensitive credentials and should remain private. The `.gitignore` file is already configured to exclude it.
