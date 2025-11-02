# Firebase PEM Private Key Fix Summary

## Issue Description

Users were experiencing the following error when uploading images via the `/api/upload` endpoint:

```
/api/upload:1  Failed to load resource: the server responded with a status of 500 ()
Firebase upload failed: Failed to parse private key: Error: Invalid PEM formatted message.
```

This error occurred when Firebase Admin SDK attempted to use the private key from environment variables for authentication to Firebase Storage.

## Root Cause Analysis

The "Invalid PEM formatted message" error occurs when the private key does not have proper PEM format structure. Specifically, the Firebase Admin SDK requires:

1. **Proper line structure**: The `-----BEGIN PRIVATE KEY-----` marker must be on its own line
2. **Proper line ending**: The `-----END PRIVATE KEY-----` marker must be on its own line
3. **Key content separation**: The actual key data must be on separate lines between the markers

### Why This Was Happening

When private keys are stored in environment variables, newline characters can be encoded in various ways:

1. **Literal `\n`** (two characters: backslash + n): Common in `.env` files
2. **Actual newlines**: May occur when copying from files
3. **Windows-style `\r\n`**: Line endings on Windows systems
4. **Mixed formats**: Combinations of the above
5. **Wrapped in quotes**: Single or double quotes around the key
6. **Extra whitespace**: Leading or trailing spaces

The previous implementation had several issues:

```typescript
// Old problematic code
privateKey = privateKey.replace(/^["']|["']$/g, '');
privateKey = privateKey.replace(/\\r\\n|\\n|\\r/g, '\n');
```

**Problems:**
- Used a single regex that could miss certain quote patterns with spaces
- Did not handle all newline encoding variations
- Did not validate the resulting PEM structure
- Provided minimal error messages for debugging

## Solution Implemented

### 1. Improved Private Key Normalization

Both `lib/firebase-storage.ts` and `lib/firebaseAdmin.ts` now use a robust multi-step normalization process:

```typescript
// Step 1: Trim leading/trailing whitespace
privateKey = privateKey.trim();

// Step 2: Remove wrapping quotes (single or double) - must be both at start and end
if ((privateKey.startsWith('"') && privateKey.endsWith('"')) || 
    (privateKey.startsWith("'") && privateKey.endsWith("'"))) {
  privateKey = privateKey.slice(1, -1);
}

// Step 3: Normalize all newline variants
privateKey = privateKey.replace(/\\r\\n/g, '\n')
                       .replace(/\\n/g, '\n')
                       .replace(/\\r/g, '\n')
                       .replace(/\r\n/g, '\n')
                       .replace(/\r/g, '\n');

// Step 4: Final trim after normalization
privateKey = privateKey.trim();
```

This handles all common environment variable formats:
- ✅ `"-----BEGIN PRIVATE KEY-----\nMIIE...\n-----END PRIVATE KEY-----"`
- ✅ `'-----BEGIN PRIVATE KEY-----\nMIIE...\n-----END PRIVATE KEY-----'`
- ✅ `-----BEGIN PRIVATE KEY-----\nMIIE...\n-----END PRIVATE KEY-----` (no quotes)
- ✅ With leading/trailing spaces: `  "-----BEGIN..."  `
- ✅ Windows newlines: `"-----BEGIN PRIVATE KEY-----\r\nMIIE..."`
- ✅ Mixed newline formats

### 2. Comprehensive PEM Structure Validation

Added validation to catch issues before Firebase SDK attempts to parse the key:

```typescript
// Validate basic structure
if (!privateKey.includes('BEGIN PRIVATE KEY') || !privateKey.includes('END PRIVATE KEY')) {
  throw new Error('FIREBASE_PRIVATE_KEY is malformed. It should contain "BEGIN PRIVATE KEY" and "END PRIVATE KEY" markers.');
}

// Validate proper line structure
const lines = privateKey.split('\n');
if (lines.length < 3) {
  throw new Error(
    'FIREBASE_PRIVATE_KEY is malformed. The private key must have at least 3 lines: ' +
    'BEGIN marker, key content, and END marker. ' +
    'Ensure newlines are properly encoded in your environment variable.'
  );
}

// Validate BEGIN marker on its own line
if (!lines[0].trim().startsWith('-----BEGIN PRIVATE KEY-----')) {
  throw new Error(
    'FIREBASE_PRIVATE_KEY is malformed. The BEGIN PRIVATE KEY marker must be on its own line. ' +
    'Current first line: ' + lines[0].substring(0, 50) + '...'
  );
}

// Validate END marker on its own line
if (!lines[lines.length - 1].trim().startsWith('-----END PRIVATE KEY-----')) {
  throw new Error(
    'FIREBASE_PRIVATE_KEY is malformed. The END PRIVATE KEY marker must be on its own line. ' +
    'Current last line: ' + lines[lines.length - 1].substring(0, 50) + '...'
  );
}
```

### 3. Enhanced Error Messages

The error messages now:
- Clearly explain what's wrong with the private key format
- Show the actual problematic content (first 50 characters)
- Provide guidance on how to fix the issue
- Help distinguish between different types of formatting problems

### 4. Updated Documentation

Updated `.env.example` with clearer instructions:

```bash
# IMPORTANT: The private key MUST have the BEGIN and END markers on separate lines.
# Example of correct format with literal \n:
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour-Private-Key-Here\n-----END PRIVATE KEY-----"
```

## Files Changed

1. **`lib/firebase-storage.ts`** - Improved private key normalization and added comprehensive validation
2. **`lib/firebaseAdmin.ts`** - Updated `normalizePrivateKey()` function with robust handling and enhanced validation
3. **`.env.example`** - Added clearer documentation and examples

## Testing & Verification

### Automated Testing

Created test scripts that validate the normalization handles:
- ✅ Quoted keys with literal `\n`
- ✅ Unquoted keys with literal `\n`
- ✅ Keys with actual newlines
- ✅ Keys with leading/trailing spaces and quotes
- ✅ Single-quoted keys
- ✅ Windows-style `\r\n` line endings
- ✅ Mixed newline formats

All tests passed successfully.

### Manual Testing

To verify the fix works:

1. **Check your private key format in `.env.local`**:
   ```bash
   # Correct format - note the \n between sections
   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBAD...\n-----END PRIVATE KEY-----"
   ```

2. **Restart your development server**:
   ```bash
   npm run dev
   ```

3. **Test image upload**: Try uploading an image through any of the upload interfaces (avatar, game image, character image, etc.)

4. **Check for clear error messages**: If there's still an issue, you should now see a detailed error message explaining exactly what's wrong with the key format

## For Users: How to Set Up Your Private Key

### Option 1: Using Individual Environment Variables (Recommended for Development)

1. Go to your Firebase Console → Project Settings → Service Accounts
2. Generate a new private key (downloads a JSON file)
3. Open the JSON file and extract these values:
   ```json
   {
     "project_id": "your-project-id",
     "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIB...\n-----END PRIVATE KEY-----",
     "client_email": "firebase-adminsdk-xxxxx@your-project-id.iam.gserviceaccount.com"
   }
   ```

4. Add to your `.env.local` file (note: keep the `\n` as literal backslash-n):
   ```bash
   FIREBASE_PROJECT_ID=your-project-id
   FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project-id.iam.gserviceaccount.com
   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIB...\n-----END PRIVATE KEY-----"
   FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
   ```

### Option 2: Using Service Account JSON (Alternative)

You can also use one of these alternative methods:

```bash
# Option A: Inline JSON
FIREBASE_SERVICE_ACCOUNT_JSON='{"type":"service_account", "project_id": "...", ...}'

# Option B: Base64 encoded JSON
FIREBASE_SERVICE_ACCOUNT_BASE64=<base64-encoded-service-account-json>

# Option C: File path
FIREBASE_SERVICE_ACCOUNT_PATH=./firebase-service-account.json
```

## Troubleshooting

### Still Getting PEM Errors?

1. **Check newline format**: Make sure you're using `\n` (backslash-n), not actual newlines in your `.env.local` file
2. **Check quotes**: The entire key should be wrapped in double quotes
3. **Check markers**: Verify the key includes `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----`
4. **Check for extra characters**: No extra spaces or characters within the key content
5. **Check error message**: The new error messages will tell you exactly what's wrong

### Example of Correct Format

```bash
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCaR8ql9Y...(full key here)...YourKeyContent\n-----END PRIVATE KEY-----"
```

### Common Mistakes to Avoid

❌ **Missing quotes**:
```bash
FIREBASE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\nMIIE...
```

❌ **Actual newlines instead of `\n`**:
```bash
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEA
-----END PRIVATE KEY-----"
```

❌ **All on one line without `\n`**:
```bash
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----MIIEvQI...-----END PRIVATE KEY-----"
```

✅ **Correct format**:
```bash
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...\n-----END PRIVATE KEY-----"
```

## Technical Details

### Why PEM Format Matters

PEM (Privacy Enhanced Mail) is a standard format for storing cryptographic keys. The format requires:

1. A header line: `-----BEGIN PRIVATE KEY-----`
2. Base64-encoded key data (typically split across multiple lines)
3. A footer line: `-----END PRIVATE KEY-----`

The Firebase Admin SDK uses the `crypto` module from Node.js, which strictly enforces this format. If the markers are not on their own lines, the SDK cannot parse the key and throws "Invalid PEM formatted message."

### How Environment Variables Work

Environment variables are stored as simple strings. When you write:

```bash
KEY="line1\nline2"
```

The `\n` is stored as two characters (backslash and 'n'), not as a newline character. Our normalization code converts these literal `\n` sequences into actual newline characters that the crypto library expects.

## Additional Notes

- This fix is backward compatible - existing properly formatted keys will continue to work
- No database migrations or data changes are required
- The fix applies to both the `/api/upload` endpoint and any other Firebase Admin SDK operations
- Server restart is required after changing environment variables

## Verification Checklist

After deploying this fix:

- [ ] Update `.env.local` with properly formatted `FIREBASE_PRIVATE_KEY`
- [ ] Restart development server
- [ ] Test image upload via profile avatar
- [ ] Test image upload via game creation
- [ ] Test image upload via character creation
- [ ] Check server logs for any new error messages
- [ ] Verify no console errors in browser

## Support

If you continue to experience issues after implementing this fix:

1. Check the server logs for detailed error messages
2. Verify your service account has proper permissions in Firebase Console
3. Ensure your Firebase project has Storage enabled
4. Verify the storage bucket name is correct in `FIREBASE_STORAGE_BUCKET`

The enhanced error messages will guide you to the specific issue with your configuration.
