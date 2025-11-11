# Badge System Migration Notes

## Overview
This migration converts badges from image-based icons to text-based tags (like the GM indicator).

## Database Schema Changes

### BadgeDocument Changes
- **Added Required Fields:**
  - `text: string` - The text displayed on the badge tag (e.g., "VIP", "PRO", "GM")
  - `color: string` (now required) - Hex color code for badge styling
  
- **Changed Fields:**
  - `imageUrl: string` → `imageUrl?: string` (now optional, for backward compatibility)

### Migration Steps for Existing Badges

If you have existing badges in your database, you'll need to migrate them:

1. **For each existing badge:**
   - Add a `text` field with an appropriate short string (2-4 characters recommended)
   - Ensure `color` field is populated with a valid hex color (e.g., `#94a3b8`)
   - The `imageUrl` can remain but will no longer be used in display

2. **Example MongoDB migration script:**
```javascript
db.badges.updateMany(
  { text: { $exists: false } },
  {
    $set: {
      text: "BADGE", // Replace with appropriate text
      color: "#94a3b8" // Replace with appropriate color
    }
  }
)
```

## UI Changes

### Admin Interface (Settings Page)
- **Removed:** Image upload functionality for badges
- **Added:** 
  - Text field for badge text (short string)
  - Color picker/input for hex color code
  - Live preview of badge appearance
  
### Badge Display
Badges now appear as rounded pill-shaped tags with:
- Text content from the `text` field
- Background color at 20% opacity of the specified color
- Border color at 30% opacity of the specified color
- Automatic text color calculation based on background luminance

## API Changes

### POST /api/badges
**Request Body Changes:**
- Removed: `imageUrl` (required)
- Added: `text` (required) - Badge text to display
- Changed: `color` (now required) - Hex color code

### PUT /api/badges
**Request Body Changes:**
- Same as POST changes above

### GET /api/badges
**Response Changes:**
- Added: `text` field in badge objects
- Kept: `imageUrl` field for backward compatibility (but will be undefined for new badges)

## Migration Checklist

- [ ] Review existing badges in database
- [ ] Decide on text labels for existing badges
- [ ] Choose appropriate colors for existing badges
- [ ] Run database migration to add `text` and `color` fields
- [ ] Test badge display on user profiles
- [ ] Test badge display in player search
- [ ] Test badge management in admin interface
- [ ] Verify badge awarding still works correctly

## Styling Details

The new badge styling matches the GM indicator:
```tsx
className="inline-block rounded-full border px-2 py-1 text-sm font-medium"
style={{
  backgroundColor: `${color}33`, // 20% opacity
  color: getTextColorFromHex(color), // Auto-calculated
  borderColor: `${color}4D` // 30% opacity
}}
```

## Recommended Badge Text Examples

- **VIP** - For VIP members
- **PRO** - For professional/paid members
- **MOD** - For moderators
- **GM** - For game masters
- **NEW** - For new users
- **🔥** - For featured/hot content (emojis work!)
- **⭐** - For special recognition

## Questions?

If you encounter any issues during migration, please check:
1. All existing badges have `text` and `color` fields
2. Color values are valid hex codes (e.g., `#94a3b8`)
3. Text values are short (2-4 characters recommended for best appearance)
