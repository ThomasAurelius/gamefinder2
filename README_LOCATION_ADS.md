# Location-Based Advertisements - Quick Start Guide

## What Was Added

This feature allows advertisements to be targeted to users within a 100-mile radius of a specified zip code.

## For Administrators

### Creating a Location-Based Advertisement

1. Go to **Settings** page
2. Scroll to **"Admin: Advertisement"** section
3. Fill in the fields:
   - ✅ Check **"Display advertisement"**
   - 📍 Enter **Zip Code** (e.g., "78729") - OPTIONAL
   - 🖼️ Click **"Upload Image (800x800)"** to select your image
4. Click **"Save Advertisement"**

### Zip Code Behavior

- **With Zip Code**: Ad shows only to users within 100 miles
- **Without Zip Code**: Ad shows to all users (global)

### Multiple Advertisements

You can have multiple active advertisements:
- Each can have its own zip code
- Users see the **closest** ad to them
- If user is out of range of all ads, they see global ads

## For Developers

### Key Files

```
lib/advertisements/
├── types.ts              # Schema with zipCode, lat, lon fields
└── db.ts                 # Filtering logic (getActiveAdvertisementForUser)

app/api/advertisements/
└── route.ts              # API endpoints (GET/POST)

app/settings/
└── page.tsx              # Admin UI with zip code input
```

### API Usage

**GET /api/advertisements**
- Automatically fetches user's location from profile
- Returns closest ad within 100 miles
- Falls back to global ads if out of range

**POST /api/advertisements** (Admin only)
```json
{
  "imageUrl": "https://...",
  "isActive": true,
  "zipCode": "78729"  // optional
}
```

### Database Schema

```typescript
{
  imageUrl: string;
  isActive: boolean;
  zipCode?: string;      // NEW
  latitude?: number;     // NEW - geocoded from zipCode
  longitude?: number;    // NEW - geocoded from zipCode
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}
```

## How It Works

1. Admin saves ad with zip code
2. System geocodes zip code → lat/lon
3. User requests advertisement
4. System calculates distance from user to each ad
5. Returns closest ad within 100 miles
6. Falls back to global ads if needed

## Examples

### Example 1: Single Location Ad
```
Ad: Austin, TX (78729)
User in Austin: ✅ Sees ad (11 miles)
User in NYC: ❌ No ad (1,504 miles)
```

### Example 2: Multiple Location Ads
```
Ad A: Austin, TX
Ad B: Los Angeles, CA

User in Austin: ✅ Sees Ad A (closest)
User in LA: ✅ Sees Ad B (closest)
User in NYC: ❌ No ads
```

### Example 3: With Global Fallback
```
Ad A: Austin, TX (has zipCode)
Ad B: (no zipCode - global)

User in Austin: ✅ Sees Ad A
User in NYC: ✅ Sees Ad B (fallback)
```

## Testing

Run the test script to verify logic:
```bash
node /tmp/test_advertisement_logic.js
```

Expected output: All 5 tests pass ✓

## Documentation

- 📖 `LOCATION_BASED_ADVERTISEMENTS.md` - Technical details
- 📋 `IMPLEMENTATION_SUMMARY_LOCATION_ADS.md` - Implementation overview
- 🎨 `VISUAL_SUMMARY_LOCATION_ADS.md` - Visual diagrams

## Troubleshooting

**Ad not showing?**
- Check if user has location in profile
- Verify ad is active (checkbox checked)
- Confirm zip code is valid and geocoded

**Wrong ad showing?**
- Multiple ads may exist - closest is shown
- Check ad zip codes in database
- Verify user's profile location

**Geocoding failed?**
- Ad will be treated as global (shows to everyone)
- Check console logs for geocoding errors
- Verify zip code format (e.g., "12345")

## Support

For questions or issues, see the detailed documentation files listed above.
