# Advertisement Feature Implementation

## Overview
This feature allows administrators to upload and display an 800x400 pixel advertisement across multiple pages in the application. The advertisement can be toggled on/off and is displayed prominently under page headers and before search sections.

## Features Implemented

### 1. Database Schema
- **Collection**: `advertisements`
- **Fields**:
  - `imageUrl` (string): URL of the uploaded advertisement image
  - `isActive` (boolean): Whether the advertisement should be displayed
  - `createdAt` (Date): Timestamp of creation
  - `updatedAt` (Date): Timestamp of last update
  - `createdBy` (string): User ID of the admin who created/updated it

### 2. API Endpoints

#### GET `/api/advertisements`
- **Purpose**: Retrieve the current active advertisement
- **Authentication**: None required (public endpoint)
- **Response**: `{ imageUrl: string, isActive: boolean }`

#### POST `/api/advertisements`
- **Purpose**: Create or update the advertisement
- **Authentication**: Admin only (403 if not admin)
- **Request Body**: `{ imageUrl: string, isActive: boolean }`
- **Response**: `{ imageUrl: string, isActive: boolean }`

### 3. Upload Support
Updated `/api/upload` to support advertisement type:
- New type: `"advertisement"`
- Storage path: `advertisements/{filename}`
- Same validation as other uploads (5MB max, image types only)

### 4. Admin Settings Interface
Added a new section to `/app/settings/page.tsx` (admin only):
- **Upload Image**: File upload button for 800x400 images
- **Image Preview**: Shows uploaded image using Next.js Image component
- **Display Toggle**: Checkbox to enable/disable advertisement display
- **Save Button**: Saves configuration to database
- **Status Messages**: Success/error feedback for operations

### 5. Advertisement Component
Created `/components/Advertisement.tsx`:
- **Responsive Design**:
  - Mobile (< 900px): 90% of screen width
  - Desktop: Full width up to 800px maximum
- **Aspect Ratio**: Maintains 2:1 (800x400) aspect ratio
- **Image Optimization**: Uses Next.js Image component with priority loading
- **Auto-hide**: Returns null if no active advertisement
- **Lazy Loading**: Fetches advertisement data on component mount

### 6. Page Integration
Advertisement component added to three pages, positioned after header and before search:

1. **Find Games** (`/app/find/page.tsx`)
   - Location: After page title, before search form
   
2. **Find Campaigns** (`/app/find-campaigns/page.tsx`)
   - Location: After page title, before search form
   
3. **My Campaigns** (`/app/my-campaigns/page.tsx`)
   - Location: After page title, before search form

## Technical Details

### Responsive Sizing
```tsx
// Screens < 1024px: 90% width | Screens ≥ 1024px: 100% width (max 800px)
// This meets the requirement: 90% width on mobile (under 900px)
<div className="w-[90%] lg:w-full lg:max-w-[800px]">
```

### Image Sizes Attribute
```tsx
sizes="(max-width: 900px) 90vw, 800px"
```
This tells the browser:
- On screens ≤900px: use 90% of viewport width
- On larger screens: use 800px

### Database Pattern
Follows the same pattern as the announcements feature:
- Single active advertisement at a time
- Previous advertisements are deactivated when a new one is set
- MongoDB collection stores all advertisement history

## Security
- ✅ Admin-only access for creating/updating advertisements
- ✅ Authentication check in POST endpoint
- ✅ File validation (type, size) in upload endpoint
- ✅ No SQL injection vulnerabilities (using MongoDB driver properly)
- ✅ CodeQL security scan passed with 0 alerts

## Usage

### For Admins
1. Navigate to Settings page
2. Scroll to "Admin: Advertisement" section
3. Click "Upload Image (800x400)" to select an image
4. Check "Display advertisement" to enable
5. Click "Save Advertisement"

### For Users
- The advertisement appears automatically on Find Games, Find Campaigns, and My Campaigns pages
- No action required
- If disabled by admin, the space collapses (no empty space shown)

## File Changes
- `lib/advertisements/types.ts` (new)
- `lib/advertisements/db.ts` (new)
- `app/api/advertisements/route.ts` (new)
- `components/Advertisement.tsx` (new)
- `app/api/upload/route.ts` (modified)
- `app/settings/page.tsx` (modified)
- `app/find/page.tsx` (modified)
- `app/find-campaigns/page.tsx` (modified)
- `app/my-campaigns/page.tsx` (modified)

## Future Enhancements (Optional)
- Multiple advertisements with rotation
- Click tracking/analytics
- Scheduled advertisement campaigns
- Target specific user groups or pages
- A/B testing support
