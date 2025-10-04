# Avatar Upload 500 Error Fix

## Problem
Users were experiencing a 500 error when trying to upload avatars. The error provided no details about what went wrong, making it difficult to diagnose.

## Root Cause
The Firebase Admin SDK initialization was happening at module load time and silently failing when environment variables were not properly configured. When users attempted to upload images, the application would fail with a generic 500 error because Firebase was not properly initialized.

## Solution
Implemented the following improvements:

### 1. Lazy Initialization
Changed Firebase Admin SDK from eager (module load time) to lazy (on-demand) initialization. This prevents build failures and only initializes Firebase when actually needed.

### 2. Environment Variable Validation
Added validation to check for required Firebase environment variables:
- `FIREBASE_PROJECT_ID`
- `FIREBASE_CLIENT_EMAIL`
- `FIREBASE_PRIVATE_KEY`
- `FIREBASE_STORAGE_BUCKET`

If any are missing, a clear error message is thrown indicating exactly which variables are missing.

### 3. Improved Error Messages
- The upload API endpoint now returns the actual error message instead of a generic "Failed to upload image"
- Firebase storage operations include detailed error information
- Errors are properly logged to the console for debugging

### 4. Better Error Propagation
Errors now properly propagate through the entire upload chain:
1. Firebase initialization errors → thrown with details
2. Storage upload errors → caught and re-thrown with context
3. API endpoint errors → returned to client with actual message

## Error Messages Users Might See

### Missing Environment Variables
```
Missing Firebase environment variables: FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY, FIREBASE_STORAGE_BUCKET
```

### Firebase Upload Failures
```
Firebase upload failed: [specific error message]
```

### Invalid Grant / Account Not Found
```
Firebase upload failed: invalid_grant: Invalid grant: account not found
```
This means the service account credentials are invalid. See `IMAGE_UPLOAD_SETUP.md` for troubleshooting steps.

### Configuration Issues
```
Firebase Storage bucket is not configured
```

```
FIREBASE_PRIVATE_KEY is malformed. It should contain "BEGIN PRIVATE KEY" and "END PRIVATE KEY" markers.
```

```
FIREBASE_CLIENT_EMAIL is malformed. It should be in the format: your-service-account@your-project-id.iam.gserviceaccount.com
```

## Setup Requirements
To use the image upload feature, you must:

1. Create a Firebase project
2. Enable Firebase Storage
3. Generate a service account key
4. Configure the environment variables in `.env.local`

See `IMAGE_UPLOAD_SETUP.md` and `QUICKSTART.md` for detailed setup instructions.

## Testing the Fix
1. Without environment variables configured:
   - Attempt to upload an avatar
   - You should see a clear error message indicating which variables are missing

2. With environment variables configured:
   - Upload should work normally
   - Any Firebase-specific errors will include detailed information

## Technical Changes

### Modified Files
- `lib/firebase-storage.ts` - Lazy initialization, validation, and error handling
- `app/api/upload/route.ts` - Improved error message propagation

### Code Changes Summary
- Added lazy initialization pattern for Firebase Admin SDK
- Added environment variable validation before initialization
- Wrapped upload function in try-catch for better error handling
- Return specific error messages to clients
- Proper TypeScript non-null assertions after validation
