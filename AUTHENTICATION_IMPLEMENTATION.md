# Cookie-Based Authentication Implementation

## Summary
Implemented cookie-based authentication to fix the issue where the Characters API was setting userId to "demo-user-1" instead of using the _id of the logged-in user.

## Changes Made

### 1. Login API Enhancement (`app/api/auth/login/route.ts`)
- When a user successfully logs in, the API now sets a secure HttpOnly cookie named `userId`
- Cookie contains the user's MongoDB `_id` (converted to string)
- Cookie configuration:
  - `httpOnly: true` - Prevents JavaScript access (XSS protection)
  - `secure: true` in production - HTTPS only
  - `sameSite: 'lax'` - CSRF protection
  - `maxAge: 7 days` - Cookie expiration

### 2. Character API Routes (`app/api/characters/route.ts` and `app/api/characters/[id]/route.ts`)
- Added `import { cookies } from "next/headers"` to read cookies
- Updated userId resolution logic:
  1. First checks for `userId` in query parameters (for backward compatibility)
  2. Then checks for `userId` in the cookie (authenticated users)
  3. Falls back to "demo-user-1" if neither exists
- Applied to all endpoints:
  - `GET /api/characters` - List characters
  - `POST /api/characters` - Create character
  - `GET /api/characters/[id]` - Get character
  - `PUT /api/characters/[id]` - Update character
  - `DELETE /api/characters/[id]` - Delete character

### 3. Profile API Routes (`app/api/profile/route.ts`)
- Applied the same cookie-based authentication for consistency
- `GET /api/profile` - Get user profile
- `POST /api/profile` - Update user profile

### 4. Logout API (`app/api/auth/logout/route.ts`) - NEW
- Created new logout endpoint
- Clears the `userId` cookie when called
- Allows users to log out and clear their session

### 5. Documentation Updates (`MONGODB_INTEGRATION.md`)
- Added Users Collection schema documentation
- Added Authentication Flow section explaining the login/logout process
- Updated API endpoint access documentation
- Marked completed enhancements in Future Enhancements section

## How It Works

### User Login Flow
1. User submits credentials to `/api/auth/login`
2. Server validates against MongoDB `users` collection
3. On success, server sets `userId` cookie with user's `_id`
4. User is now authenticated for subsequent requests

### Authenticated API Requests
1. User makes request to character or profile API
2. Server reads `userId` from cookie
3. Server fetches/updates data specific to that user
4. No need to pass userId in query parameters

### User Logout Flow
1. User calls `/api/auth/logout`
2. Server deletes the `userId` cookie
3. User is logged out

## Backward Compatibility
- Query parameter `?userId={userId}` still works for all endpoints
- Falls back to "demo-user-1" if no authentication is present
- Existing functionality remains unchanged for non-authenticated users

## Security Improvements
- HttpOnly cookies prevent XSS attacks (JavaScript cannot access the cookie)
- Secure flag ensures cookies are only sent over HTTPS in production
- SameSite attribute provides CSRF protection
- No sensitive data exposed in URLs (query parameters)

## Testing
- ✅ Build successful
- ✅ Linting passed
- ✅ Type checking passed

## Migration Impact
- No breaking changes
- Existing users will need to log in again to get the authentication cookie
- Previously hardcoded "demo-user-1" data remains accessible without authentication
