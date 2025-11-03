# Vercel PEM Key Empty Lines Fix

## Issue
Users were unable to login with Firebase authentication when private keys were pasted into Vercel's environment variable UI with actual newlines. The error was "Invalid PEM formatted message."

## Root Cause
When Firebase private keys are copied and pasted into Vercel's environment variable UI, users typically paste the key with actual newline characters (not literal `\n` strings). This can introduce:

1. **Empty lines** between the BEGIN marker and key content
2. **Empty lines** between key content lines
3. **Empty lines** before the END marker
4. **Trailing whitespace** on individual lines

These empty lines and whitespace are not valid in PEM format and cause Firebase Admin SDK to reject the key with "Invalid PEM formatted message" error.

## User Experience in Vercel
When a user pastes their Firebase private key into Vercel:
- The key appears with actual line breaks (not `\n`)
- When they press arrow-right at the end of a line, the cursor moves to the next line
- This indicates the key has actual newline characters, not literal `\n` strings
- Any blank lines in the pasted content are preserved as empty lines in the environment variable

## Solution
Updated the `normalizePrivateKey()` function in both:
- `lib/firebaseAdmin.ts`
- `lib/firebase-storage.ts`

### Changes Made
Added a new normalization step that:
1. Splits the key by newlines
2. Trims each individual line (removes leading/trailing whitespace)
3. **Filters out empty lines** (the key fix)
4. Rejoins the lines with newlines

```typescript
// Step 4: Trim each individual line and remove empty lines
// This handles cases where PEM keys are pasted into Vercel with actual newlines,
// which may include blank lines that invalidate the PEM format
key = key.split("\n")
         .map(line => line.trim())
         .filter(line => line.length > 0)
         .join("\n");
```

## How It Works

### Before the Fix
```
"-----BEGIN PRIVATE KEY-----
                              <- Empty line
MIIEvQIBADANBgkqhkiG...
                              <- Empty line
-----END PRIVATE KEY-----"
```
Result: ❌ Invalid PEM format (5 lines including 2 empty)

### After the Fix
```
"-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG...
-----END PRIVATE KEY-----"
```
Result: ✅ Valid PEM format (3 lines, empty lines removed)

## Testing

### Test Cases Verified
1. ✅ Keys with literal `\n` (from .env files)
2. ✅ Keys with actual newlines and quotes (Vercel style)
3. ✅ Keys with empty lines (common copy-paste issue)
4. ✅ Keys with trailing spaces on individual lines
5. ✅ Keys with mixed newline formats

### Manual Verification
Run the verification script:
```bash
node /tmp/verify_fix.js
```

All test cases pass successfully.

## For Users

### How to Set Your Firebase Key in Vercel

1. Go to your Firebase Console → Project Settings → Service Accounts
2. Click "Generate new private key" and download the JSON file
3. Open the JSON file and copy the entire `private_key` value (including the quotes and all newlines)
4. In Vercel, go to your project settings → Environment Variables
5. **Simply paste the entire key** with all its newlines directly into the value field
6. The system will automatically:
   - Remove any empty lines
   - Trim whitespace from each line
   - Normalize the format for Firebase Admin SDK

### No Special Formatting Needed
You don't need to:
- Convert newlines to `\n`
- Remove empty lines manually
- Worry about trailing spaces
- Add or remove quotes

Just paste the key exactly as it appears in your Firebase service account JSON!

## Files Changed
- `lib/firebaseAdmin.ts` - Updated `normalizePrivateKey()` function
- `lib/firebase-storage.ts` - Updated private key normalization in `ensureFirebaseInitialized()`
- `.env.example` - Updated documentation with Vercel-specific guidance

## Backward Compatibility
This fix is fully backward compatible:
- ✅ Existing keys with literal `\n` still work
- ✅ Keys without empty lines still work
- ✅ Keys from .env files still work
- ✅ Keys from JSON files still work

The new filter only removes truly empty lines (after trimming), so valid key content is never removed.

## Security
- ✅ CodeQL security check passed with 0 alerts
- ✅ No new vulnerabilities introduced
- ✅ Private keys remain properly validated
- ✅ All validation checks still in place

## Troubleshooting

If you still have issues after this fix:

1. **Verify the key format**: Make sure your key includes both `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----` markers
2. **Check for truncation**: Ensure the entire key was pasted (not cut off in the middle)
3. **Verify project ID**: Make sure `FIREBASE_PROJECT_ID` matches your Firebase project
4. **Check client email**: Ensure `FIREBASE_CLIENT_EMAIL` ends with `.iam.gserviceaccount.com`
5. **Restart server**: After changing environment variables in Vercel, redeploy your application

The error messages will guide you to the specific issue if validation still fails.
