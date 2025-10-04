# Location-Based Player Search Feature

## Overview

Users can now search for players within a specified radius of a location or zip code. Results are automatically sorted by distance, showing the closest players first.

## Features

### For Users Setting Up Their Profile

1. **Automatic Geocoding**: When you save your profile with a location or zip code, the system automatically determines your coordinates
2. **Privacy**: Only the city/state or zip code you provide is visible to other users
3. **Accuracy**: Zip codes provide more accurate location data than city names

### For Users Searching for Players

1. **Location Search**: Enter a zip code or city name in the "Location or Zip Code" field
2. **Radius Selection**: Choose how far to search (10, 25, 50, 100, or 250 miles)
3. **Distance Display**: See exactly how far away each player is
4. **Sorted Results**: Players are automatically sorted from closest to furthest

## How to Use

### Setting Your Location

1. Go to your Profile page
2. Fill in either:
   - **Zip Code** field (recommended for accuracy)
   - **Location** field (City, State format)
3. Click "Save Profile"
4. Your coordinates are automatically calculated and stored

### Searching for Players by Location

1. Go to the Players page
2. Enter a location or zip code in the "Location or Zip Code" field
3. (Optional) Select a search radius from the dropdown that appears
4. (Optional) Add additional filters (role, game, etc.)
5. Click "Search Players"
6. View results sorted by distance, with distance shown next to each player

## Technical Details

### Geocoding Service

- Uses OpenStreetMap Nominatim API (free, no API key required)
- Respects rate limits and service guidelines
- Falls back gracefully if geocoding fails

### Distance Calculation

- Uses the Haversine formula for accurate great-circle distances
- Calculates distances in miles
- Accounts for Earth's curvature

### Data Storage

- Latitude and longitude are stored in user profiles
- Coordinates are optional (profiles work without them)
- Only shown to users as distance in search results

### Privacy Considerations

- Exact coordinates are not displayed to users
- Only the distance between players is shown
- Users control what location information they share

## Examples

### Example 1: Finding D&D Players Near You

1. Enter your zip code: `90210`
2. Select radius: `50 miles`
3. Select game: `Dungeons & Dragons`
4. Click "Search Players"
5. See all D&D players within 50 miles, sorted by distance

### Example 2: Finding Any Players in a City

1. Enter city: `Seattle, WA`
2. Select radius: `25 miles`
3. Leave other filters blank
4. Click "Search Players"
5. See all players within 25 miles of Seattle

## Troubleshooting

### "No players found" when searching by location

- **Issue**: The location might not be recognized
- **Solution**: Try a zip code instead, or a more specific location (e.g., "Portland, OR" instead of just "Portland")

### Distance seems inaccurate

- **Issue**: Geocoding might have found the wrong location
- **Solution**: Use a zip code for more accurate results

### My profile doesn't show in location searches

- **Issue**: Your profile might not have coordinates yet
- **Solution**: Edit and re-save your profile with a location or zip code filled in

## API Endpoints

### Search Players by Location

```
GET /api/players?location={location}&radius={miles}
```

**Parameters:**
- `location` (string): Zip code or city name
- `radius` (number): Search radius in miles (default: 50)

**Response:**
```json
[
  {
    "id": "user123",
    "name": "John Doe",
    "location": "Los Angeles, CA",
    "distance": 12.3,
    ...
  }
]
```

## Future Enhancements

Potential improvements:
- Map view of nearby players
- Distance units preference (miles/kilometers)
- "Players near me" shortcut using browser geolocation
- Notification when new players join your area
- Geofenced game session creation
