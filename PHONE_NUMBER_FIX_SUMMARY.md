# Phone Number Fix Summary

## Issue
When users entered their phone number on the `/profile` page and saved, the phone number would not persist or be displayed after refreshing the page.

## Root Cause
The `sanitizeProfile()` function was being called in the GET and POST endpoints of `/api/profile/route.ts`, which removed the `phoneNumber` field before returning the profile data to the frontend. This meant:
1. When saving, the phone number was stored in the database but not returned in the response
2. When loading the profile, the phone number was retrieved from the database but removed before being sent to the frontend

## Solution
Removed the `sanitizeProfile()` calls from `/api/profile/route.ts` (lines 164 and 206) so that:
- Authenticated users can see their own phone number when viewing their profile
- Phone numbers are saved and retrieved correctly

## Security Considerations
Phone numbers remain protected in public-facing contexts:
- Public user endpoints (`/api/public/users/[userId]`, `/api/public/users/search`) use MongoDB projections to only return specific fields (name, commonName, avatarUrl)
- Player search endpoint (`/api/players`) uses projections to exclude phone numbers
- The `sanitizeProfile()` function remains available in `lib/profile-db.ts` for future use if needed
- Phone numbers are only accessible to:
  - The authenticated user viewing their own profile
  - Campaign hosts sending SMS notifications to their campaign players (internal use)

## Changed Files
- `app/api/profile/route.ts`: Removed `sanitizeProfile()` calls from GET and POST endpoints

## Testing Recommendations
To verify the fix works:
1. Log in to the application
2. Navigate to `/profile`
3. Enter a phone number in the "Phone Number" field
4. Click "Save Profile"
5. Refresh the page
6. Verify the phone number is still displayed in the field

To verify security:
1. View another user's profile through the player search or public profile endpoints
2. Verify that phone numbers are NOT exposed in the API response

## CodeQL Security Scan
✅ No security vulnerabilities found in the changes
