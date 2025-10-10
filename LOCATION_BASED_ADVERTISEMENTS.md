# Location-Based Advertisement Feature Update

## Overview
Updated the advertisement feature to support location-based filtering, allowing advertisements to be shown only within 100 miles of a specified zip code. Multiple active advertisements can coexist, with the closest one being shown to users within range.

## Changes Made

### 1. Database Schema Updates
**File: `lib/advertisements/types.ts`**
- Added optional `zipCode` field (string) to store the advertisement's target location
- Added optional `latitude` and `longitude` fields (numbers) to store geocoded coordinates

### 2. Database Functions
**File: `lib/advertisements/db.ts`**

#### New Functions:
- `getActiveAdvertisements()`: Returns all active advertisements (replaces single ad retrieval)
- `getActiveAdvertisementForUser(userLatitude?, userLongitude?)`: Core filtering logic that:
  - Returns the closest advertisement within 100 miles if user has location
  - Returns first active ad if user has no location (backward compatibility)
  - Falls back to ads without location (global ads) if no ads within range

#### Updated Functions:
- `setAdvertisement()`: Now accepts optional `zipCode` parameter
  - Geocodes the zip code to latitude/longitude using existing `geocodeLocation()` utility
  - Stores coordinates in the advertisement document
  - No longer deactivates existing advertisements (allows multiple active ads)
  - If geocoding fails, advertisement is created without location (shows to everyone)

### 3. API Endpoints
**File: `app/api/advertisements/route.ts`**

#### GET `/api/advertisements`:
- Now fetches user's profile to get their location (latitude/longitude)
- Passes user location to `getActiveAdvertisementForUser()` for filtering
- Gracefully handles cases where user is not logged in or has no location

#### POST `/api/advertisements`:
- Now accepts optional `zipCode` field in request body
- Validates zipCode is a string if provided
- Passes zipCode to `setAdvertisement()` for geocoding and storage

### 4. Admin UI
**File: `app/settings/page.tsx`**
- Added `adZipCode` state variable
- Added zip code input field in the Advertisement admin section
- Updated UI text to explain the 100-mile radius behavior
- Zip code field includes helpful placeholder and description
- Sends zipCode to API when saving advertisement

## How It Works

### Advertisement Selection Logic:
1. System retrieves all active advertisements from database
2. If user is logged in and has location in profile:
   - Calculate distance from user to each advertisement with coordinates
   - Filter to only ads within 100 miles
   - Sort by distance (closest first)
   - Return closest advertisement
3. If no ads within 100 miles OR user has no location:
   - Return first advertisement without location (global ad)
4. If no advertisements found:
   - Return null (no ad shown)

### Multiple Advertisements Support:
- Admins can create multiple active advertisements
- Each can have its own zip code or no zip code (global)
- Closer advertisement is automatically prioritized for users
- Advertisements without zip codes act as fallbacks and show to everyone

### Backward Compatibility:
- Users without location still see advertisements (first active ad)
- Advertisements without zip codes are shown to all users
- Existing functionality is preserved

## Testing

Verified the distance calculation and filtering logic with 5 test cases:
1. ✓ User near advertisement (within 100 miles) - correct ad selected
2. ✓ User near different advertisement - correct regional ad selected  
3. ✓ User far from all located ads - fallback to global ad
4. ✓ User without location - first active ad shown
5. ✓ Multiple ads within range - closest ad selected

All tests passed successfully.

## Usage

### For Admins:
1. Go to Settings page
2. Scroll to "Admin: Advertisement" section
3. Upload image (800x800 recommended)
4. **NEW**: Enter zip code (optional) - e.g., "78729"
   - Leave blank to show to all users
   - Enter zip code to limit to 100-mile radius
5. Check "Display advertisement" to activate
6. Click "Save Advertisement"

### For Users:
- Advertisements automatically filtered based on profile location
- Users must have location or zip code in their profile for location filtering
- No visible changes - system works behind the scenes

## Files Modified:
- `lib/advertisements/types.ts` - Added zipCode and coordinates fields
- `lib/advertisements/db.ts` - Added filtering logic and updated functions
- `app/api/advertisements/route.ts` - Updated endpoints for location handling
- `app/settings/page.tsx` - Added zip code input field

## Technical Details

### Dependencies:
- Uses existing `geocodeLocation()` from `lib/geolocation.ts` (OpenStreetMap Nominatim API)
- Uses existing `calculateDistance()` (Haversine formula) for distance calculations
- User location comes from profile (already geocoded when profile is saved)

### Distance Calculation:
- Maximum distance: 100 miles (hardcoded in `getActiveAdvertisementForUser`)
- Distance calculated using Haversine formula (great-circle distance)
- Earth radius: 3959 miles

### Performance Considerations:
- Advertisement filtering happens at query time (not cached)
- Geocoding happens only when saving advertisement (not on every view)
- Falls back gracefully if geocoding fails
- Minimal database queries (all active ads fetched once per request)
