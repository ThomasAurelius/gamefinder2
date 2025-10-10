# Visual Summary: Location-Based Advertisement Feature

## Before (Original Behavior)
```
┌─────────────────────────────────────────────────────┐
│  Admin Sets Advertisement                           │
│  ├─ Upload Image                                    │
│  └─ Toggle Active/Inactive                          │
└─────────────────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────┐
│  Database                                           │
│  └─ One Active Advertisement (globally)             │
└─────────────────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────┐
│  All Users See Same Advertisement                   │
│  (Regardless of Location)                           │
└─────────────────────────────────────────────────────┘
```

## After (New Behavior)
```
┌─────────────────────────────────────────────────────┐
│  Admin Sets Advertisement                           │
│  ├─ Upload Image                                    │
│  ├─ Toggle Active/Inactive                          │
│  └─ [NEW] Enter Zip Code (optional)                 │
│      Example: "78729" for Austin, TX                │
└─────────────────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────┐
│  System Geocodes Zip Code                           │
│  └─ Converts to Latitude/Longitude                  │
│     (Uses OpenStreetMap Nominatim API)              │
└─────────────────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────┐
│  Database                                           │
│  └─ Multiple Active Advertisements Allowed          │
│      ├─ Ad #1: Austin, TX (30.44°N, 97.75°W)       │
│      ├─ Ad #2: Los Angeles, CA (34.09°N, 118.41°W) │
│      └─ Ad #3: No location (global fallback)       │
└─────────────────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────┐
│  User Requests Advertisement                        │
│  └─ System checks user's profile location          │
└─────────────────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────┐
│  Distance Calculation (Haversine Formula)           │
│  ├─ Calculate distance from user to each ad        │
│  ├─ Filter ads within 100 miles                    │
│  └─ Sort by distance (closest first)               │
└─────────────────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────┐
│  Result: User Sees Most Relevant Ad                 │
│                                                      │
│  User in Austin → Sees Ad #1 (11 miles away)        │
│  User in LA → Sees Ad #2 (9 miles away)            │
│  User in NYC → Sees Ad #3 (global fallback)        │
│  User no location → Sees first active ad           │
└─────────────────────────────────────────────────────┘
```

## Admin UI Changes

### Before
```
┌───────────────────────────────────────┐
│ Admin: Advertisement                  │
│                                       │
│ ☑ Display advertisement               │
│                                       │
│ [Preview Image Here]                  │
│                                       │
│ [Upload Image (800x800)] button      │
│                                       │
│ [Save Advertisement] button           │
└───────────────────────────────────────┘
```

### After
```
┌───────────────────────────────────────┐
│ Admin: Advertisement                  │
│ Upload and manage the site            │
│ advertisement (800x800 image).        │
│ Add a zip code to show the ad only    │
│ within 100 miles of that location.    │ ← New description
│                                       │
│ ☑ Display advertisement               │
│                                       │
│ Zip Code (optional)                   │ ← NEW FIELD
│ [12345                ]               │
│ Leave blank to show to all users.     │
│ If provided, ad will only show        │
│ within 100 miles.                     │
│                                       │
│ [Preview Image Here]                  │
│                                       │
│ [Upload Image (800x800)] button      │
│                                       │
│ [Save Advertisement] button           │
└───────────────────────────────────────┘
```

## Technical Flow Diagram

```
User Views Page
      │
      ▼
Advertisement Component
      │
      ▼
GET /api/advertisements
      │
      ├─ Fetch user's profile ─────────┐
      │                                 │
      │                                 ▼
      │                    Read user's lat/lon from profile
      │                                 │
      │                                 ▼
      └─ Call getActiveAdvertisementForUser(lat, lon)
                      │
                      ▼
      ┌───────────────────────────────────────┐
      │ 1. Get all active advertisements      │
      │ 2. Filter by distance (≤100 miles)    │
      │ 3. Sort by distance (closest first)   │
      │ 4. Return closest ad OR global ad     │
      └───────────────────────────────────────┘
                      │
                      ▼
      Return advertisement to component
                      │
                      ▼
      Render image on page
```

## Example Scenarios

### Scenario 1: Single Location-Based Ad
```
Database:
  - Ad A: Austin, TX (78729)

User in Austin (30.27°N, 97.74°W):
  Distance to Ad A: 11.8 miles ✓
  Result: Show Ad A

User in New York (40.71°N, 74.01°W):
  Distance to Ad A: 1504.7 miles ✗
  Result: No ad shown
```

### Scenario 2: Multiple Location-Based Ads
```
Database:
  - Ad A: Austin, TX (78729)
  - Ad B: Los Angeles, CA (90210)

User in Austin (30.27°N, 97.74°W):
  Distance to Ad A: 11.8 miles ✓
  Distance to Ad B: 1370.5 miles ✗
  Result: Show Ad A (closest within 100 miles)

User in LA (34.05°N, 118.24°W):
  Distance to Ad A: 1370.5 miles ✗
  Distance to Ad B: 9.7 miles ✓
  Result: Show Ad B (closest within 100 miles)
```

### Scenario 3: Mix of Location-Based and Global Ads
```
Database:
  - Ad A: Austin, TX (78729)
  - Ad B: No location (global)

User in Austin (30.27°N, 97.74°W):
  Distance to Ad A: 11.8 miles ✓
  Result: Show Ad A (location-based takes priority)

User in New York (40.71°N, 74.01°W):
  Distance to Ad A: 1504.7 miles ✗
  Result: Show Ad B (global fallback)

User without location:
  Result: Show Ad A (first active ad)
```

## Code Changes Summary

### 1. Database Schema (lib/advertisements/types.ts)
```typescript
// Added fields:
zipCode?: string;      // e.g., "78729"
latitude?: number;     // e.g., 30.4383
longitude?: number;    // e.g., -97.7515
```

### 2. Core Logic (lib/advertisements/db.ts)
```typescript
// New functions:
+ getActiveAdvertisements()           // Get all active ads
+ getActiveAdvertisementForUser()     // Filter by location

// Modified functions:
~ setAdvertisement()                  // Now accepts zipCode
```

### 3. API (app/api/advertisements/route.ts)
```typescript
// GET endpoint changes:
+ Fetch user's profile location
+ Pass location to filtering function

// POST endpoint changes:
+ Accept zipCode parameter
+ Validate zipCode type
```

### 4. UI (app/settings/page.tsx)
```typescript
// State changes:
+ const [adZipCode, setAdZipCode] = useState("");

// UI changes:
+ Zip code input field
+ Helper text explaining 100-mile radius
```

## Performance Characteristics

- **Geocoding**: Only on advertisement save (not on every view)
- **Distance Calculation**: On every advertisement fetch for logged-in users
- **Database Queries**: One query to get all active ads per request
- **Caching**: None currently (could be added if needed)
- **API Calls**: One external call to Nominatim per advertisement save

## Error Handling

1. **Geocoding Fails**: Ad becomes global (shown to everyone)
2. **User Has No Location**: First active ad shown
3. **No Ads Within Range**: Global ads shown as fallback
4. **Database Error**: Returns null (no ad shown, graceful degradation)
