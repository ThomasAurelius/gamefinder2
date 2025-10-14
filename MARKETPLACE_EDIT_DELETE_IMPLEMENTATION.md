# Marketplace Edit and Delete Implementation Summary

## Overview
Implemented edit and delete functionality for marketplace listings, allowing both admins and listing owners to manage their content.

## Changes Made

### 1. Database Layer (`lib/marketplace/db.ts`)
Added two new admin functions following the pattern from tall-tales:

- **`updateMarketplaceListingByAdmin(id, updates)`**: Allows admins to update any listing without ownership check
- **`deleteMarketplaceListingByAdmin(id)`**: Allows admins to delete any listing without ownership check

These complement the existing functions:
- `updateMarketplaceListing(id, userId, updates)`: For regular users to update their own listings
- `deleteMarketplaceListing(id, userId)`: For regular users to delete their own listings

### 2. API Routes (`app/api/marketplace/[id]/route.ts`)
Added two new endpoint handlers:

#### PUT Endpoint
- Requires authentication
- Checks if user is admin using `isAdmin(userId)`
- Admins can update any listing
- Regular users can only update their own listings
- Returns 404 if listing not found or user lacks permission

#### DELETE Endpoint
- Requires authentication
- Checks if user is admin using `isAdmin(userId)`
- Admins can delete any listing
- Regular users can only delete their own listings
- Returns 404 if listing not found or user lacks permission
- Returns success response on successful deletion

### 3. Marketplace Detail Page (`app/marketplace/[id]/page.tsx`)
Enhanced the listing detail page with:

- Added `isAdmin` state to track admin status
- Added `isDeleting` state for delete operation feedback
- Fetches user's admin status from `/api/auth/user` endpoint
- Calculates `canEdit` permission: `currentUserId && (currentUserId === listing.userId || isAdmin)`
- Added Edit and Delete buttons that only show when user can edit
- Edit button navigates to `/marketplace/${id}/edit`
- Delete button shows confirmation dialog and redirects to marketplace page on success

### 4. Edit Page (`app/marketplace/[id]/edit/page.tsx`)
Created a comprehensive edit page featuring:

- Full form pre-populated with existing listing data
- All fields from the original post form:
  - Listing type (sell/want)
  - **Status field (active/sold/closed)** - NEW for edit page
  - Title, description
  - Game system (with custom option)
  - Tags (common tags + custom tags)
  - Price and condition (for sell listings)
  - Location and zip code
  - Image URLs
  - Contact information
- Fetches listing data on page load
- Handles custom game systems by checking if they're in GAME_OPTIONS
- Submits updates via PUT request to `/api/marketplace/${id}`
- Redirects to listing detail page on success
- Shows loading state while fetching listing data
- Cancel button to navigate back

## Permission Model

### Admin Users
- Can edit any marketplace listing
- Can delete any marketplace listing
- Can change listing status

### Regular Users
- Can only edit their own listings
- Can only delete their own listings
- Can change their listing status

### Unauthenticated Users
- Cannot edit or delete any listings
- Edit and delete buttons don't appear

## Implementation Pattern
This implementation follows the same pattern as the tall-tales feature:
1. Separate admin functions in the database layer
2. Admin check in API routes
3. Conditional rendering in UI based on ownership/admin status
4. Consistent error messages and status codes

## Testing Recommendations
1. Test as regular user:
   - Create a listing
   - Edit your own listing
   - Delete your own listing
   - Try to edit/delete another user's listing (should fail)

2. Test as admin:
   - Edit any user's listing
   - Delete any user's listing
   - Change listing status

3. Test edge cases:
   - Unauthenticated user (should not see buttons)
   - Invalid listing ID
   - Network errors during update/delete
