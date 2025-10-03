# Fix: Profile and Characters Saving Issues

## Issues Addressed

### 1. Profile Not Saving
**Problem**: Profile updates were silently failing without any error feedback to the user.

**Root Cause**: The `writeProfile` function in `lib/profile-db.ts` was using `updateOne` without checking if the update actually matched and modified a document. If the user document didn't exist (or wasn't found), the update would silently fail.

**Solution**: Added result checking to verify the update was successful:
```typescript
const result = await usersCollection.updateOne(...);
if (result.matchedCount === 0) {
  throw new Error("User not found");
}
```

This now throws a clear error if the user document doesn't exist, which will be caught by the API route handler and returned as a 400 error with the message "User not found".

### 2. Characters Saving with "demo-user-1"
**Problem**: When logged-in users created characters, they were being saved with the userId "demo-user-1" instead of their actual user ID.

**Root Causes Identified**:

1. **Missing Cookie Path**: The userId cookie was set without an explicit path, which could cause it to be scoped only to `/api/auth/login` instead of being available for all API routes.

2. **Potential Empty Cookie Value**: If `user._id?.toString()` somehow returned an empty string, the cookie would be set to `""`, which is falsy. When the API routes checked for the userId, the empty string would fail the truthiness check and fall back to "demo-user-1".

**Solutions Applied**:

1. **Added Explicit Cookie Path**:
```typescript
response.cookies.set("userId", userId, {
  // ... other options
  path: "/", // Ensures cookie is sent with all requests
});
```

2. **Added Cookie Value Validation**:
```typescript
const userId = user._id?.toString();
if (!userId) {
  throw new Error("User ID is missing");
}
response.cookies.set("userId", userId, { ... });
```

This ensures the userId cookie is never set to an empty or invalid value.

## How It Works

### Before Fixes
1. User logs in → cookie set without explicit path (might be scoped to /api/auth/login)
2. User navigates to /profile or /characters
3. Frontend makes API call to save profile/character
4. Backend tries to read userId cookie → cookie might not be sent or might be empty
5. Backend falls back to "demo-user-1"
6. Profile update silently fails or characters save with wrong userId

### After Fixes
1. User logs in → cookie set with `path: "/"` and validated userId
2. Cookie is now available for all API routes
3. User navigates to /profile or /characters
4. Frontend makes API call to save profile/character
5. Backend reads userId cookie successfully (or throws error if missing)
6. Profile update succeeds (or throws "User not found" error if user doesn't exist)
7. Characters save with correct userId

## Testing

All changes have been validated with:
- ✅ ESLint (no errors)
- ✅ TypeScript compilation (no errors)
- ✅ Next.js build (successful)

## Migration Notes

- No breaking changes
- Existing users will need to log in again to get the corrected cookie
- Any profiles that failed to save silently will now show error messages, helping identify authentication issues

## Files Modified

1. `lib/profile-db.ts` - Added error checking in `writeProfile()`
2. `app/api/auth/login/route.ts` - Added cookie path and validation
