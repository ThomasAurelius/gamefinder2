# Vendor Geocoding Migration

## Overview
This document explains the vendor geocoding migration that was implemented to fix the issue where `FeaturedVendorsFeed` was not calculating distance and `isNearbyVendors` was always false.

## Problem
Vendors in the database had zip codes but no latitude/longitude coordinates. The `listVendorsByLocation` function requires vendors to have coordinates to calculate distances, which meant nearby vendors could never be found.

## Solution
The following changes were made:

### 1. Added Geocoding to Vendor Operations
- Modified `lib/vendors.ts` to import the `geocodeLocation` function from `lib/geolocation.ts`
- Updated `createVendor` function to geocode zip codes when vendors are created
- Updated `updateVendor` function to geocode zip codes when vendors are updated

### 2. Created Migration Script
A TypeScript migration script (`scripts/geocode-vendors.ts`) was created to geocode existing vendors that don't have coordinates.

## Running the Migration

### Prerequisites
- Ensure you have access to the MongoDB database
- Ensure your `.env.local` file has the correct `MONGODB_URI` set

### Steps
1. Run the migration script:
   ```bash
   npm run migrate:geocode-vendors
   ```

2. The script will:
   - Find all vendors with zip codes but no coordinates
   - Geocode each vendor's zip code using OpenStreetMap's Nominatim API
   - Update the vendor documents with latitude/longitude coordinates
   - Respect the API rate limit (1 request per second)
   - Display progress and a summary when complete

### Expected Output
```
🌍 Vendor Geocoding Migration Script

==================================================

📊 Found X vendors to geocode

[1/X] Processing: Vendor Name
   Zip: 78729
   ✅ Geocoded: 30.456789, -97.123456

...

==================================================

📊 Summary:
   Total: X
   ✅ Success: Y
   ❌ Failed: Z

✨ Migration complete!
```

## How It Works Going Forward

### New Vendors
When a new vendor is created through the API:
1. The zip code is submitted as part of the vendor data
2. The `createVendor` function automatically geocodes the zip code
3. The vendor is stored with latitude/longitude coordinates
4. The vendor will appear in "nearby vendors" searches

### Updated Vendors
When a vendor is updated:
1. If the zip code is changed, it will be geocoded again
2. The vendor's coordinates are updated
3. The vendor will appear in the correct location for "nearby vendors" searches

### FeaturedVendorsFeed Behavior
- The component tries to fetch nearby vendors first using `?nearMe=true`
- If the user has a location set and there are vendors within 50 miles with coordinates, they are shown as "Nearby Venues"
- If no nearby vendors are found, it falls back to showing all approved vendors as "All Venues"
- Vendors are sorted by distance when coordinates are available

## Technical Details

### Geocoding Service
- Uses OpenStreetMap's Nominatim API (free, no API key required)
- Respects the 1 request per second rate limit
- Handles US zip codes by adding "USA" context
- Has built-in retry logic (2 retries with 1 second delays)
- Includes timeout protection (5 seconds per request)

### Error Handling
- If geocoding fails for a vendor, it continues without coordinates
- Vendors without coordinates won't appear in "nearby vendors" but will still appear in "all vendors"
- Errors are logged to the console for debugging

## Testing
After running the migration:
1. Check that vendors have `latitude` and `longitude` fields populated
2. Test the FeaturedVendorsFeed component to verify "Nearby Venues" appears for logged-in users
3. Verify that distance is displayed for nearby vendors
4. Confirm that vendors are sorted by distance

## Rollback
If you need to rollback the migration:
```javascript
// Remove coordinates from all vendors
db.vendors.updateMany(
  {},
  { $unset: { latitude: "", longitude: "" } }
)
```

Note: This will cause `isNearbyVendors` to return to always being false.
