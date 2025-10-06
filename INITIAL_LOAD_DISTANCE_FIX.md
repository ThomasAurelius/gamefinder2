# Fix: Calculate Distance on Initial Load in /find

## Issue
When users visit the `/find` page, the "All Upcoming Events" section showed all games without distance calculations, even though the user's zip code was auto-populated in the location search field. Distance was only calculated after manually clicking the "Search" button.

## Solution
Modified the initial page load logic in `/app/find/page.tsx` to:
1. Fetch the user's profile first to get their zip code
2. If the user has a zip code, include it in the initial API request for events
3. Use the default radius of 25 miles for the initial load
4. The API automatically calculates distances and filters games within the radius

## Changes Made
### `/app/find/page.tsx`
- Combined `fetchUserProfile()` and `fetchAllEvents()` into a single `fetchUserProfileAndEvents()` function
- Sequentially fetches profile first, then uses the zip code to fetch events
- Adds `location` and `radius` parameters to the initial `/api/games` request when user has a zip code
- Maintains backward compatibility: if user has no zip code, all games are fetched (original behavior)

## Implementation Details
```typescript
const fetchUserProfileAndEvents = async () => {
  // First, fetch user profile to get their zipcode
  let userZipCode = "";
  try {
    const response = await fetch("/api/profile");
    if (response.ok) {
      const profile = await response.json();
      if (profile.zipCode) {
        userZipCode = profile.zipCode;
        setLocationSearch(profile.zipCode);
      }
      if (profile.userId) {
        setCurrentUserId(profile.userId);
      }
    }
  } catch (error) {
    console.error("Failed to fetch user profile:", error);
  }

  // Then fetch all events with location filtering if zipcode is available
  setIsLoadingEvents(true);
  try {
    const params = new URLSearchParams();
    if (userZipCode) {
      params.append("location", userZipCode);
      params.append("radius", "25"); // Use default radius of 25 miles
    }
    
    const response = await fetch(`/api/games?${params.toString()}`);
    if (response.ok) {
      const events = await response.json();
      setAllEvents(events);
    }
  } catch (error) {
    console.error("Failed to fetch events:", error);
  } finally {
    setIsLoadingEvents(false);
  }
};
```

## Benefits
- **Better User Experience**: Users immediately see games near them sorted by distance on initial page load
- **Consistent Behavior**: The "All Upcoming Events" section now shows distance-filtered results just like the search results
- **No Breaking Changes**: Users without zip codes still see all games (original behavior)
- **Leverages Existing Infrastructure**: Uses the same geocoding and distance calculation logic already in place

## Testing
- ✅ Build succeeds with no new errors or warnings
- ✅ Linting passes with no new issues
- ✅ Logic verified: sequential fetch ensures zip code is available before events API call
- ✅ Backward compatible: works when user has no zip code in profile

## Impact
- Users with zip codes in their profile will see games near them on initial load
- Distance information (in miles) is displayed for each game
- Games are automatically filtered to within 25 miles of the user's location
- Games are sorted by distance (closest first)
