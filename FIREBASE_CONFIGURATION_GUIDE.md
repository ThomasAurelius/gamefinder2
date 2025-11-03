# Firebase Configuration Guide

This guide explains how to configure Firebase Admin credentials for The Gathering Call application.

## Overview

The application uses **Firebase Admin SDK** for:
- User authentication and token verification
- File uploads (avatars, game images, character sheets, etc.)
- Server-side Firebase operations

All Firebase Admin operations now use a **unified configuration system** that supports multiple credential methods.

## Important: Unified Configuration

As of the latest update, the application uses a single, centralized Firebase Admin initialization. This means:

✅ **You only need to configure credentials ONCE**  
✅ **All features (auth, uploads, storage) use the same configuration**  
✅ **No confusion about which variables to set**  

## Credential Methods (Priority Order)

The system checks for credentials in the following priority order. **Choose ONE method** that works best for your deployment:

### Method 1: Service Account JSON String (Highest Priority)
**Best for:** Vercel, Netlify, or any platform that supports multi-line environment variables

Set the entire service account JSON as a single environment variable:

```bash
FIREBASE_SERVICE_ACCOUNT_JSON='{"type":"service_account","project_id":"your-project","private_key":"-----BEGIN PRIVATE KEY-----\n...","client_email":"...@your-project.iam.gserviceaccount.com"}'
```

**How to get it:**
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project → Project Settings (gear icon)
3. Go to "Service Accounts" tab
4. Click "Generate New Private Key"
5. Copy the entire JSON content from the downloaded file
6. Set it as `FIREBASE_SERVICE_ACCOUNT_JSON`

**Pros:**
- ✅ Simple - just one variable to set
- ✅ No file management needed
- ✅ Works well with deployment platforms

**Cons:**
- ❌ Long variable value (can be hard to read)
- ❌ May have issues with certain shells if not properly quoted

---

### Method 2: Base64 Encoded Service Account
**Best for:** When JSON string method has escaping issues

Encode your service account JSON to base64:

```bash
# Create the base64 encoded value
cat firebase-service-account.json | base64 -w 0

# Then set it:
FIREBASE_SERVICE_ACCOUNT_BASE64=eyJ0eXBlIjoic2VydmljZV9hY2NvdW50IiwicHJvamVjdF9pZCI6InlvdXItcHJvamVjdCIsInByaXZhdGVfa2V5IjoiLS0tLS1CRUdJTiBQUklWQVRFIEtFWS0tLS0tXG4uLi4=
```

**Pros:**
- ✅ Avoids JSON escaping issues
- ✅ Single variable like Method 1
- ✅ Works universally

**Cons:**
- ❌ Requires base64 encoding step
- ❌ Not human-readable

---

### Method 3: Service Account File Path
**Best for:** Local development, Docker containers, or VMs

Point to a file containing your service account credentials:

```bash
# Option A:
FIREBASE_SERVICE_ACCOUNT_PATH=./firebase-service-account.json

# Option B (also supported):
GOOGLE_APPLICATION_CREDENTIALS=./firebase-service-account.json
```

**Pros:**
- ✅ Clean - no long environment variables
- ✅ Easy to update (just replace the file)
- ✅ Human-readable credentials

**Cons:**
- ❌ Requires file management
- ❌ File must be deployed with your application
- ❌ Not ideal for serverless platforms

---

### Method 4: Individual Environment Variables (Lowest Priority)
**Best for:** Maximum compatibility, when you need fine-grained control

Set each credential component separately:

```bash
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project-id.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBg...\n-----END PRIVATE KEY-----"
FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
```

**Important notes for `FIREBASE_PRIVATE_KEY`:**
- Use literal `\n` (backslash + n) for line breaks, NOT actual newlines
- Wrap the entire key in double quotes
- The key MUST include the BEGIN and END markers
- For Vercel: You can paste the key with actual newlines directly in the UI

**Pros:**
- ✅ Maximum compatibility
- ✅ Easy to update individual components
- ✅ Clear which project you're using

**Cons:**
- ❌ Most variables to set (4 required)
- ❌ Private key can be tricky to format correctly

---

## Private Key Formatting (Method 4)

When using individual environment variables, the private key format is critical. The system includes **automatic normalization** that handles various formats, but here's what you need to know:

### ✅ Correct Format

```bash
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...\n-----END PRIVATE KEY-----"
```

### ❌ Common Mistakes

**Missing quotes:**
```bash
# BAD - will cause shell parsing issues
FIREBASE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\nMIIE...
```

**Using actual newlines in .env file:**
```bash
# BAD - literal newlines don't work in .env files
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEA
-----END PRIVATE KEY-----"
```

**All on one line without \n:**
```bash
# BAD - markers must be on separate lines
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----MIIEvQI...-----END PRIVATE KEY-----"
```

### Automatic Normalization

The system automatically handles:
- ✅ Removing wrapping quotes (single or double)
- ✅ Converting `\n` to actual newlines
- ✅ Converting `\r\n` (Windows) to `\n`
- ✅ Converting `\\n` (double-escaped) to `\n`
- ✅ Trimming whitespace and empty lines
- ✅ Validating PEM structure

So even if your formatting is slightly off, the system will try to fix it!

---

## Configuration Priority

If you set multiple methods, the system uses the **highest priority** one:

```
Priority 1: FIREBASE_SERVICE_ACCOUNT_JSON
    ↓
Priority 2: FIREBASE_SERVICE_ACCOUNT_BASE64
    ↓
Priority 3: FIREBASE_SERVICE_ACCOUNT_PATH or GOOGLE_APPLICATION_CREDENTIALS
    ↓
Priority 4: FIREBASE_PROJECT_ID + FIREBASE_CLIENT_EMAIL + FIREBASE_PRIVATE_KEY
```

**Recommendation:** Choose ONE method and only set those environment variables to avoid confusion.

---

## Quick Setup Guide

### For Local Development

1. **Download service account JSON:**
   - Go to Firebase Console → Project Settings → Service Accounts
   - Click "Generate New Private Key"
   - Save as `firebase-service-account.json` in your project root

2. **Choose a method:**
   ```bash
   # Option A: Use file path (easiest for local dev)
   FIREBASE_SERVICE_ACCOUNT_PATH=./firebase-service-account.json
   
   # Option B: Use individual variables (if you prefer)
   # Extract values from the JSON file and set:
   FIREBASE_PROJECT_ID=your-project-id
   FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"
   FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
   ```

3. **Add to `.env.local`** (don't commit this file!)

4. **Restart your dev server:**
   ```bash
   npm run dev
   ```

### For Vercel Deployment

1. **Go to Vercel Dashboard** → Your Project → Settings → Environment Variables

2. **Choose a method:**
   
   **Recommended: Method 1 (JSON String)**
   - Copy entire service account JSON
   - Create variable `FIREBASE_SERVICE_ACCOUNT_JSON`
   - Paste the JSON (Vercel handles multi-line values)
   
   **Alternative: Method 4 (Individual Variables)**
   - Create `FIREBASE_PROJECT_ID` → paste project ID
   - Create `FIREBASE_CLIENT_EMAIL` → paste email
   - Create `FIREBASE_PRIVATE_KEY` → paste key with actual newlines (Vercel UI supports this)
   - Create `FIREBASE_STORAGE_BUCKET` → paste bucket name

3. **Redeploy** your application

---

## Client-Side Firebase Configuration

In addition to server-side (Firebase Admin) configuration, you also need client-side Firebase configuration for authentication:

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=your-firebase-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
NEXT_PUBLIC_FIREBASE_APP_ID=your-firebase-app-id
```

These are found in Firebase Console → Project Settings → General → Your apps → SDK setup and configuration.

---

## Troubleshooting

### "Firebase Admin credentials not found"

**Cause:** None of the credential methods are properly configured.

**Solution:**
1. Check which environment variables are set
2. Verify you've chosen ONE complete method
3. Restart your application after setting variables

### "Failed to parse private key: Error: Invalid PEM formatted message"

**Cause:** Private key doesn't have proper PEM structure (only relevant for Method 4).

**Solution:**
1. Ensure key starts with `-----BEGIN PRIVATE KEY-----`
2. Ensure key ends with `-----END PRIVATE KEY-----`
3. Use literal `\n` between sections (or paste with actual newlines in Vercel)
4. Wrap in double quotes
5. Check the error message for specific guidance

Example of correct format:
```bash
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...\n-----END PRIVATE KEY-----"
```

### "Firebase upload failed" or "Authentication service is not properly configured"

**Cause:** Mismatch between server-side and client-side configuration, or credentials are invalid.

**Solution:**
1. Verify that `FIREBASE_PROJECT_ID` (server) matches `NEXT_PUBLIC_FIREBASE_PROJECT_ID` (client)
2. Regenerate service account key if it's old or may have been revoked
3. Check Firebase Console that the service account still exists
4. Verify the service account has proper permissions (Firebase Admin SDK Service Agent)

### "The service account credentials are invalid or the account doesn't exist"

**Cause:** The credentials are from a deleted service account or wrong project.

**Solution:**
1. Go to Firebase Console → Project Settings → Service Accounts
2. Verify the service account email exists in the list
3. Generate a new private key
4. Update your environment variables with the new credentials
5. Ensure `FIREBASE_PROJECT_ID` matches the actual Firebase project

### Login works but upload fails (or vice versa)

**Cause:** Before the fix, different parts of the app used different initialization methods.

**Solution:**
✅ **This is now fixed!** All Firebase Admin operations use the same unified configuration. If you're still experiencing this:
1. Clear your build cache: `rm -rf .next`
2. Rebuild: `npm run build`
3. Restart your application

---

## Testing Your Configuration

### Test Authentication
1. Go to `/auth/register` and create a test account
2. Check Firebase Console → Authentication to verify user was created
3. Try logging in at `/auth/login`

### Test File Upload
1. Log in to your account
2. Go to your profile or create a game
3. Try uploading an avatar or game image
4. Verify the file appears correctly

### Test Both Together
1. Register → Login → Upload Image
2. If all three work, your configuration is correct! ✅

---

## Security Best Practices

1. **Never commit credentials to git:**
   - Add `.env.local` to `.gitignore`
   - Never commit service account JSON files

2. **Use environment-specific credentials:**
   - Different Firebase projects for dev, staging, production
   - Rotate keys periodically

3. **Restrict service account permissions:**
   - Only grant necessary Firebase roles
   - Review service account permissions in IAM & Admin

4. **Secure your environment variables:**
   - Use platform secrets management (Vercel, Heroku, etc.)
   - Don't share credentials via chat or email
   - Use `.env.local` for local development only

---

## Migration Guide

If you're updating from an older version that had inconsistent Firebase initialization:

1. **No code changes needed** - the fix is automatic!
2. **Verify your environment variables** - ensure they're using ONE method
3. **Rebuild your application:**
   ```bash
   rm -rf .next
   npm run build
   ```
4. **Test both authentication and uploads** to verify everything works

---

## Summary

| Method | Best For | Complexity | Variables Needed |
|--------|----------|------------|------------------|
| 1. JSON String | Vercel, Netlify | Low | 1 |
| 2. Base64 | Platform issues | Medium | 1 |
| 3. File Path | Local dev, Docker | Low | 1 |
| 4. Individual Vars | Max compatibility | High | 4 |

**Recommendation:** Start with Method 3 (file path) for local development, and Method 1 (JSON string) for production deployments.

---

## Additional Resources

- [Firebase Admin SDK Documentation](https://firebase.google.com/docs/admin/setup)
- [Firebase Service Account Documentation](https://firebase.google.com/docs/admin/setup#initialize-sdk)
- [Application's Firebase Auth Setup Guide](./FIREBASE_AUTH_SETUP.md)
- [PEM Key Fix Summary](./PEM_KEY_FIX_SUMMARY.md)

---

## Need Help?

If you're still having issues:
1. Check the server logs for detailed error messages
2. Review the error message - they now include specific guidance
3. Verify your Firebase project settings in the Firebase Console
4. Ensure your service account hasn't been deleted or revoked
5. Try Method 3 (file path) for local testing to isolate environment variable issues
