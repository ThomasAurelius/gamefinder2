# Fix: Zipcode Search Not Working

## Issue
Players with zipcode 78729 in their profile were not appearing when searching within 50 miles of 78729.

## Root Cause
The Nominatim geocoding API (OpenStreetMap) does not reliably geocode bare US zip codes without country context. When searching for just "78729", the API may:
- Return no results
- Return inconsistent results between profile save and search
- Return results from other countries with similar postal codes

This caused a mismatch between the coordinates stored in the profile and the coordinates used during search, making distance calculations incorrect.

## Solution
Modified the `geocodeLocation()` function in `lib/geolocation.ts` to:
1. Detect US zip codes (5-digit or 5+4 format like "78729" or "78729-1234")
2. Automatically append ", USA" to US zip codes before geocoding
3. Ensures consistent geocoding between profile saves and searches

### Changes Made
- Added `isUSZipCode()` helper function to detect US zip codes using regex: `/^\d{5}(-\d{4})?$/`
- Modified `geocodeLocation()` to use "78729, USA" instead of just "78729" for US zip codes
- This fix automatically applies to:
  - Profile location geocoding (when users save their zipcode)
  - Player search by location
  - Game session search by location

## Testing
The zipcode detection logic was tested with various inputs:
- ✅ "78729" → Detected as US zip code
- ✅ "78729-1234" → Detected as US zip code (5+4 format)
- ✅ " 78729 " → Detected as US zip code (handles whitespace)
- ✅ "Austin, TX" → Not detected (city/state format passes through unchanged)
- ✅ Edge cases (too short, too long, non-numeric) correctly rejected

## Impact
- Users with US zip codes in their profiles will now appear correctly in location-based searches
- Both profile saving and searching use the same geocoding format
- Distance calculations will now be accurate for US zip code searches
- No breaking changes - existing profiles will work correctly when re-saved or when users update their profiles

## Files Modified
- `lib/geolocation.ts` - Added US zip code detection and context appending

## Notes
- The fix specifically targets US zip codes. International postal codes pass through unchanged.
- If users enter full addresses like "Austin, TX" or "Seattle, WA", they are not modified and geocode normally.
- The Nominatim API handles "78729, USA" much more reliably than just "78729".
