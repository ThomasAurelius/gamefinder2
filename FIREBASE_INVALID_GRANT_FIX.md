# Firebase Invalid Grant Error Fix

## Issue
Users were experiencing "invalid_grant: Invalid grant: account not found" error when uploading images to Firebase Storage. This error occurs when the Firebase Admin SDK cannot authenticate with the provided service account credentials.

## Root Cause
The error can be caused by several issues:
1. **Private key format issues**: The environment variable handling only expected one format (`\\n` escaped newlines), but different deployment platforms (Vercel, Railway, etc.) may set environment variables differently
2. **Incorrect credentials**: Service account may have been deleted or credentials are from a different project
3. **Malformed credentials**: Private key or client email may have extra quotes, whitespace, or incorrect format
4. **Lack of validation**: No upfront validation of credential format before attempting to initialize Firebase

## Solution

### 1. Robust Private Key Handling
Improved the private key processing in `lib/firebase-storage.ts` to handle multiple formats:
- Keys wrapped in quotes (single or double) - automatically removed
- Keys with escaped newlines (`\\n`) - converted to actual newlines
- Keys with actual newlines already in place - left as-is
- Validates that the key contains required BEGIN/END markers

### 2. Client Email Validation
Added validation to ensure the client email follows the expected service account format:
- Must contain `@` symbol
- Must contain `.iam.gserviceaccount.com` domain

### 3. Enhanced Error Messages
Added specific error detection and detailed troubleshooting information:
- Detects "invalid_grant" and "account not found" errors
- Provides clear explanation of possible causes
- Shows step-by-step resolution instructions in console
- Helps users understand they need to regenerate credentials

### 4. Documentation Updates
Updated three documentation files with comprehensive troubleshooting:
- `IMAGE_UPLOAD_SETUP.md`: Added detailed section on invalid_grant error
- `AVATAR_UPLOAD_FIX.md`: Added new error messages users might see
- `QUICKSTART.md`: Added troubleshooting for invalid_grant error

## Technical Changes

### Modified Files
1. **lib/firebase-storage.ts**
   - Enhanced private key processing (handles multiple formats)
   - Added private key validation (checks for BEGIN/END markers)
   - Added client email validation (checks for service account format)
   - Added detailed error messages for invalid_grant errors
   - Better error propagation with helpful context

2. **IMAGE_UPLOAD_SETUP.md**
   - Added comprehensive troubleshooting section for invalid_grant error
   - Included step-by-step fix instructions
   - Added private key format examples

3. **AVATAR_UPLOAD_FIX.md**
   - Added new error message examples
   - Included validation error messages

4. **QUICKSTART.md**
   - Added invalid_grant troubleshooting steps
   - Referenced detailed documentation

## Error Messages

### Before
```
Firebase upload failed: invalid_grant: Invalid grant: account not found
```

### After
```
Firebase upload failed: invalid_grant: Invalid grant: account not found

⚠️  Firebase Authentication Error Detected:
The service account credentials are invalid or the account doesn't exist.

Possible causes:
1. The service account was deleted from the Firebase project
2. The private key or client email is incorrect
3. The credentials are from a different Firebase project
4. The service account doesn't have proper permissions

To fix this:
1. Go to Firebase Console → Project Settings → Service Accounts
2. Generate a new private key
3. Update your environment variables with the new credentials
4. Ensure FIREBASE_PROJECT_ID matches the project from the service account
```

## Testing
Manually tested the private key handling logic with various formats:
- ✓ Keys with escaped newlines and quotes
- ✓ Keys with escaped newlines, no quotes
- ✓ Keys with actual newlines
- ✓ Invalid key format (correctly rejected)
- ✓ Valid client email format
- ✓ Invalid client email format (correctly rejected)

## Build Verification
- ✓ TypeScript compilation successful
- ✓ Next.js build completed without errors
- ✓ ESLint passed (no new warnings)

## User Impact
Users experiencing the invalid_grant error will now:
1. See detailed error messages explaining the issue
2. Get step-by-step instructions to fix the problem
3. Have environment variables automatically validated
4. Know exactly which credentials are malformed

This significantly improves the developer experience and reduces the time to diagnose and fix Firebase authentication issues.
