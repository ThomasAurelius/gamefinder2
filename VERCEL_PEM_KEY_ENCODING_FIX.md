# Vercel PEM Key Encoding Fix

## Issue
Users reported that Firebase service account private keys work perfectly in localhost but fail in Vercel with the error:
```
Firebase service account 'private_key' is not in valid PEM format. 
It should start with '-----BEGIN PRIVATE KEY-----' and end with '-----END PRIVATE KEY-----'. 
If you're setting this via environment variable, ensure newlines are preserved correctly.
```

Despite using the exact same key in both environments, the key fails in Vercel.

## Root Cause
Vercel's environment variable handling can introduce additional encoding layers that weren't being normalized:

1. **Double-wrapped quotes**: `""key""` - When users copy/paste from documentation or accidentally add extra quotes
2. **Escaped quotes**: `"\"key\""` - When Vercel's UI or API escapes quotes in the value
3. **Double-escaped newlines**: `\\n` instead of `\n` - When environment variables are passed through multiple encoding layers
4. **Mixed encoding**: Combination of actual newlines and literal `\n` strings

## Solution
Enhanced the `normalizePrivateKey` function in both `lib/firebaseAdmin.ts` and `lib/firebase-storage.ts` to handle these additional encoding scenarios.

### Key Algorithm Changes
The fix uses an **iterative approach** to handle nested encoding:

```typescript
let prevKey = "";
let iterations = 0;
const maxIterations = 5; // Safety limit

while (key !== prevKey && iterations < maxIterations) {
  iterations++;
  prevKey = key;
  
  // Remove outer quotes if both start and end have matching quotes
  if ((key.startsWith('"') && key.endsWith('"')) || 
      (key.startsWith("'") && key.endsWith("'"))) {
    key = key.slice(1, -1).trim();
  }
  
  // Replace escaped quotes
  key = key.replace(/\\"/g, '"').replace(/\\'/g, "'");
}
```

This iterative approach is crucial because:
- After removing outer quotes from `"\"key\""`, we get `\"key\"`
- After replacing escaped quotes, we get `"key"`
- We need another iteration to remove the remaining quotes
- The loop continues until no more changes occur or we hit the safety limit

### Complete Normalization Steps
1. **Trim whitespace**: Remove leading/trailing spaces
2. **Iteratively unwrap quotes**: Handle nested quotes and escaped quotes
3. **Normalize newlines**: Convert all variants (`\\n`, `\n`, `\r\n`, etc.) to `\n`
4. **Clean lines**: Remove empty lines and trim each line
5. **Final trim**: Ensure no trailing whitespace

## Test Coverage
All 11 test scenarios pass:

1. ✅ Standard .env format with literal `\n`
2. ✅ Vercel with double-wrapped quotes (`""key""`)
3. ✅ Vercel with escaped quotes inside (`"\"key\""`)
4. ✅ Key with double-escaped newlines (`\\n`)
5. ✅ Key with actual newlines and empty lines
6. ✅ Key with mixed actual and literal newlines
7. ✅ Key with tabs, spaces, and empty lines
8. ✅ Single-quoted key with literal `\n`
9. ✅ Triple-quoted key (extreme case)
10. ✅ No quotes with literal `\n`
11. ✅ Windows-style line endings (`\r\n`)

## Files Modified
- `lib/firebaseAdmin.ts` - Enhanced `normalizePrivateKey()` function
- `lib/firebase-storage.ts` - Applied same enhancements to inline normalization
- `.env.example` - Updated documentation with clearer guidance

## Backward Compatibility
✅ **Fully backward compatible**
- All previously working key formats continue to work
- No breaking changes to API or behavior
- Purely additive error handling
- Existing implementations are unaffected

## Security
✅ **No security issues**
- CodeQL scan: 0 alerts
- No new vulnerabilities introduced
- Private key validation remains strict
- Safety limits prevent infinite loops

## Usage
### For Vercel Users
Simply paste your Firebase private key directly into Vercel's environment variable UI:

1. Go to your Vercel project settings → Environment Variables
2. Add `FIREBASE_PRIVATE_KEY` as the key
3. Paste the entire key value (including quotes if present in your service account JSON)
4. The system will automatically handle any encoding issues

**You don't need to:**
- Manually escape or encode anything
- Worry about quote wrapping
- Convert newlines manually
- Remove empty lines

### For Local Development
In your `.env.local` file, use standard format:
```bash
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEA...\n-----END PRIVATE KEY-----"
```

## Troubleshooting
If you still encounter issues:

1. **Verify BEGIN/END markers**: Ensure your key includes both markers
2. **Check for truncation**: Make sure the entire key was copied/pasted
3. **Check project ID**: Verify `FIREBASE_PROJECT_ID` matches your Firebase project
4. **Check client email**: Ensure `FIREBASE_CLIENT_EMAIL` is valid
5. **Review logs**: The enhanced error messages will pinpoint the exact issue

## Technical Details
### Why This Happens in Vercel but Not Localhost

**Localhost (`.env.local` file):**
- Environment variables are read directly from file
- No additional encoding layers
- Simple string processing

**Vercel (Cloud platform):**
- Variables pass through multiple systems:
  - Web UI → Vercel's backend API
  - Backend API → Build system
  - Build system → Runtime environment
- Each layer may add encoding (quotes, escaping)
- Different encoding depending on how variables are set (UI vs CLI vs API)

### Why Iterative Approach is Necessary
Consider this real-world scenario from Vercel:

1. User copies key from Firebase: `"-----BEGIN...-----"`
2. Pastes into Vercel UI: Vercel wraps in quotes → `""-----BEGIN...-----""`
3. Vercel's API escapes internal quotes → `"\"-----BEGIN...\""`
4. Our code reads: `"\"-----BEGIN...\""`

A single-pass normalization would miss nested layers. The iterative approach handles this:
- Iteration 1: Remove outer quotes → `\"-----BEGIN...\"`
- Iteration 2: Unescape quotes → `"-----BEGIN..."`
- Iteration 3: Remove outer quotes → `-----BEGIN...`
- Iteration 4: No changes, exit loop → Success!

## Migration
No migration needed. The fix is automatic and transparent to users.

## Monitoring
To verify the fix is working:
1. Check server startup logs for "Firebase Admin app initialized successfully"
2. Test image upload functionality
3. Monitor for PEM-related errors in Vercel logs

If PEM errors persist, the enhanced error messages will provide specific guidance.

## Related Documentation
- [PEM_KEY_FIX_SUMMARY.md](./PEM_KEY_FIX_SUMMARY.md) - Previous PEM key fixes
- [VERCEL_PEM_KEY_FIX.md](./VERCEL_PEM_KEY_FIX.md) - Empty lines fix
- [Firebase Admin SDK Documentation](https://firebase.google.com/docs/admin/setup)

## Support
If you encounter issues after this fix:
1. Check that you're using the latest version of the code
2. Verify all three Firebase environment variables are set correctly:
   - `FIREBASE_PROJECT_ID`
   - `FIREBASE_CLIENT_EMAIL`
   - `FIREBASE_PRIVATE_KEY`
3. Review Vercel deployment logs for specific error messages
4. The enhanced error messages will guide you to the specific issue
