# Ambassador Program Implementation

This document describes the implementation of the ambassador program feature for GameFinder2.

## Overview

The ambassador program allows designated DMs (Dungeon Masters) to host paid games on the platform without paying the standard 15% platform fee. Ambassadors only pay Stripe's transaction fees (approximately 2.9% + $0.30 per transaction).

## Database Changes

### User Document (`UserDocument` type in `lib/user-types.ts`)

Added two new optional fields:
- `isAmbassador?: boolean` - Flag indicating if the user is an ambassador
- `ambassadorUntil?: Date` - Optional expiration date for ambassador status

If `ambassadorUntil` is not set, the ambassador status is permanent.

## Backend Implementation

### User Helper Functions (`lib/users.ts`)

Four new functions were added to manage ambassador status:

1. **`isActiveAmbassador(userId: string): Promise<boolean>`**
   - Checks if a user is currently an active ambassador
   - Returns `false` if the ambassador status has expired
   - Returns `true` if the user is an ambassador with no expiration or a future expiration date

2. **`getAmbassadorStatus(userId: string): Promise<{isAmbassador: boolean, ambassadorUntil?: Date} | null>`**
   - Returns the full ambassador status for a user
   - Used by the admin API to display current status

3. **`setAmbassadorStatus(userId: string, isAmbassador: boolean, ambassadorUntil?: Date): Promise<boolean>`**
   - Sets or removes ambassador status for a user
   - Can set an optional expiration date
   - Returns `true` if the update was successful

### Payment Processing (`app/api/stripe/create-payment-intent/route.ts`)

Modified the subscription creation logic to:

1. Check if the campaign host is an active ambassador using `isActiveAmbassador()`
2. Set the `applicationFeePercent` to:
   - `0%` for ambassadors (no platform fee)
   - `15%` for regular DMs (standard platform fee)
3. Store the ambassador status in the subscription metadata for tracking

Key code changes:
```typescript
// Check if host is an active ambassador
hostIsAmbassador = await isActiveAmbassador(campaign.userId);

// Calculate application fee based on ambassador status
const applicationFeePercent = hostIsAmbassador ? 0 : 15;

// Only apply fee if greater than 0
if (applicationFeePercent > 0) {
  subscriptionOptions.application_fee_percent = applicationFeePercent;
}
```

### Admin API (`app/api/admin/ambassador/route.ts`)

Created a new admin-only API endpoint with two methods:

1. **GET `/api/admin/ambassador?userId={userId}`**
   - Retrieves ambassador status for a specific user
   - Requires admin authentication
   - Returns user info and ambassador status

2. **POST `/api/admin/ambassador`**
   - Sets or removes ambassador status for a user
   - Requires admin authentication
   - Accepts: `userId`, `isAmbassador`, and optional `ambassadorUntil` date
   - Returns success status and updated values

## Frontend Implementation

### Admin UI (`app/settings/page.tsx`)

Added a new "Ambassador Management" section in the admin settings panel that includes:

1. **User Search**
   - Text input to search for users by username
   - Reuses the existing `/api/public/users/search` endpoint

2. **Status Display**
   - Shows current ambassador status
   - Displays expiration date if set
   - Shows "permanent" if no expiration date

3. **Ambassador Controls**
   - Date picker for setting expiration date (optional)
   - "Grant Ambassador Status" button for non-ambassadors
   - "Revoke Ambassador Status" button for current ambassadors
   - Real-time feedback on success/failure

4. **Fee Structure Information**
   - Clear explanation of the fee structure
   - Ambassadors: 0% platform fee + Stripe fees
   - Regular DMs: 15% platform fee + Stripe fees

### UI Flow

1. Admin searches for a user by username
2. System displays user's current ambassador status
3. Admin can optionally set an expiration date
4. Admin clicks to grant or revoke ambassador status
5. System updates the database and provides feedback
6. Updated status is immediately visible in the UI

## Fee Structure Summary

| User Type | Platform Fee | Stripe Fees | Total Cost |
|-----------|--------------|-------------|------------|
| Ambassador | 0% | ~2.9% + $0.30 | ~2.9% + $0.30 |
| Regular DM | 15% | ~2.9% + $0.30 | ~17.9% + $0.30 |

## Security Considerations

1. **Admin-Only Access**: All ambassador management functions require admin authentication
2. **Validation**: User IDs are validated before database operations
3. **Error Handling**: Comprehensive error handling with appropriate HTTP status codes
4. **Logging**: Ambassador status changes are logged for audit purposes

## Testing Recommendations

To test the ambassador program:

1. **As Admin**:
   - Log in as an admin user
   - Navigate to Settings
   - Use the Ambassador Management section to grant ambassador status to a test user
   - Set an expiration date and verify it's stored correctly

2. **As Ambassador DM**:
   - Create a paid campaign as an ambassador user
   - Have a player subscribe to the campaign
   - Verify in Stripe dashboard that no platform fee is charged (only transaction fees)

3. **As Regular DM**:
   - Create a paid campaign as a non-ambassador user
   - Have a player subscribe to the campaign
   - Verify in Stripe dashboard that the 15% platform fee is charged

4. **Expiration Testing**:
   - Set a past expiration date for an ambassador
   - Verify they are treated as regular DMs (15% fee)
   - Set a future expiration date
   - Verify they maintain ambassador status (0% fee)

## Future Enhancements

Potential improvements for the ambassador program:

1. **Bulk Management**: Ability to manage multiple ambassadors at once
2. **Ambassador List**: View all current ambassadors and their expiration dates
3. **Notifications**: Email notifications when ambassador status is granted/revoked or about to expire
4. **Analytics**: Track ambassador performance and revenue impact
5. **Automatic Expiration**: Automated job to expire ambassadors and notify them
6. **Ambassador Badge**: Visual badge on ambassador profiles
