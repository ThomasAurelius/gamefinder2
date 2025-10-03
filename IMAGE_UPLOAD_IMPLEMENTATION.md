# Image Upload Feature Implementation

## Overview

This document summarizes the implementation of image upload functionality for user avatars and game session images. The feature uses Firebase Storage to store images and MongoDB to store the image URLs.

## Features Implemented

### 1. Profile Avatar Upload
- Users can upload an avatar image from their profile page (`/profile`)
- Avatar is displayed on:
  - Profile page (with fallback to initial letter)
  - Game detail pages (as the DM's avatar)
  - Public profile pages (future)
- Supported formats: JPG, PNG, WebP, GIF
- Maximum file size: 5MB
- Storage location: `avatars/{userId}/{filename}` in Firebase Storage

### 2. Game Session Image Upload
- Users can upload an image when posting a game session (`/post`)
- Image is displayed as:
  - Thumbnail (96x96px) on the find games page (`/find`)
  - Full-size image on the game detail page (`/games/[id]`)
- Supported formats: JPG, PNG, WebP, GIF
- Maximum file size: 5MB
- Storage location: `games/{userId}/{filename}` in Firebase Storage

## Technical Changes

### Database Schema Changes

#### Profile Record
Added `avatarUrl` field to store the avatar image URL:
```typescript
export type ProfileRecord = {
  // ... existing fields
  avatarUrl?: string;
}
```

#### Game Session Record
Added `imageUrl` field to store the game session image URL:
```typescript
export type GameSessionPayload = {
  // ... existing fields
  imageUrl?: string;
}
```

### New Files

#### `/lib/firebase-storage.ts`
- Firebase Admin SDK initialization
- `uploadImageToFirebase()` - Upload image buffer to Firebase Storage
- `deleteImageFromFirebase()` - Delete image from Firebase Storage (future use)
- Handles making images publicly accessible

#### `/app/api/upload/route.ts`
- POST endpoint for uploading images
- Validates file type and size
- Handles both avatar and game image uploads
- Returns the public URL of the uploaded image
- Requires authentication

### Modified Files

#### `/lib/profile-db.ts`
- Added `avatarUrl` field to `ProfileRecord` type
- Updated default profile to include empty `avatarUrl`
- Updated `readProfile()` to return `avatarUrl`

#### `/lib/games/types.ts`
- Added `imageUrl` field to `GameSessionPayload` type

#### `/lib/games/db.ts`
- Updated all functions to handle `imageUrl` field
- `listGameSessions()`, `getGameSession()`, `createGameSession()`, `joinGameSession()`, `listUserGameSessions()`

#### `/lib/users.ts`
- Added `avatarUrl` to `UserBasicInfo` type
- Updated `getUserBasicInfo()` and `getUsersBasicInfo()` to fetch avatar URL from user profile

#### `/app/api/profile/route.ts`
- Updated validation to accept `avatarUrl` field
- Returns `avatarUrl` in profile response

#### `/app/api/games/route.ts`
- Updated `parseGameSessionPayload()` to handle `imageUrl`

#### `/app/api/auth/register/route.ts`
- Initialize `avatarUrl` as empty string for new users

#### `/app/profile/page.tsx`
- Added avatar upload UI with preview
- Shows current avatar or initial letter fallback
- Added `handleAvatarUpload()` function
- Includes upload progress indicator

#### `/app/post/page.tsx`
- Added game image upload UI with preview
- Shows uploaded image with remove button
- Added `handleImageUpload()` function
- Includes upload progress indicator

#### `/app/find/page.tsx`
- Added `imageUrl` to `GameSession` type
- Updated `GameSessionCard` to display thumbnail image
- Thumbnail displays on the left side of the card (96x96px)

#### `/app/games/[id]/page.tsx`
- Updated to display full game session image
- Added DM avatar display with fallback
- Shows avatar next to DM name in "Game Master" section

### Package Updates

#### `package.json`
- Added `firebase-admin` dependency (v13+)

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Firebase
1. Create a Firebase project at https://console.firebase.google.com/
2. Enable Firebase Storage in your project
3. Generate a service account key:
   - Go to Project Settings → Service Accounts
   - Click "Generate New Private Key"
   - Download the JSON file

### 3. Set Environment Variables
Create a `.env.local` file with the following variables:

```bash
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=your-service-account-email@your-project-id.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour-Private-Key-Here\n-----END PRIVATE KEY-----"
FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
```

See `.env.example` and `IMAGE_UPLOAD_SETUP.md` for detailed instructions.

### 4. Configure Firebase Storage Rules (Optional)
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /avatars/{userId}/{allPaths=**} {
      allow read: if true;
      allow write: if false;
    }
    match /games/{userId}/{allPaths=**} {
      allow read: if true;
      allow write: if false;
    }
  }
}
```

## API Endpoints

### POST `/api/upload`
Upload an image file (avatar or game image).

**Request:**
- Method: POST
- Content-Type: multipart/form-data
- Body:
  - `file`: Image file (required)
  - `type`: "avatar" or "game" (required)

**Response:**
```json
{
  "url": "https://storage.googleapis.com/bucket-name/path/to/image.jpg"
}
```

**Errors:**
- 401: Not authenticated
- 400: Invalid file type or size
- 500: Upload failed

## User Flow

### Avatar Upload Flow
1. User navigates to `/profile`
2. Clicks "Upload Avatar" button
3. Selects image file from device
4. Image is uploaded to Firebase Storage
5. URL is saved to user's profile in MongoDB
6. Avatar is displayed immediately in the UI

### Game Image Upload Flow
1. User navigates to `/post` to create a game session
2. Clicks "Upload Image" button (optional)
3. Selects image file from device
4. Image is uploaded to Firebase Storage
5. Preview is shown with option to remove
6. When form is submitted, image URL is saved with the game session

## Display Behavior

### Avatar Display
- **Profile Page**: Shows avatar in circular frame, or first letter of name as fallback
- **Game Detail Page**: Shows DM's avatar next to their name in "Game Master" section
- Fallback: Displays first letter of display name in a colored circle

### Game Image Display
- **Find Games Page**: Shows 96x96px thumbnail on the left side of each game card (if image exists)
- **Game Detail Page**: Shows full-width aspect-video image at the top (if image exists)
- If no image: Nothing is displayed (seamless omission)

## Security Considerations

1. **Authentication Required**: Only authenticated users can upload images
2. **File Size Limit**: 5MB maximum to prevent abuse
3. **File Type Validation**: Only image types (JPEG, PNG, WebP, GIF) allowed
4. **Server-Side Upload**: All uploads go through backend API (not direct to Firebase)
5. **Public Read Access**: Images are publicly readable (intended for display)
6. **User-Scoped Storage**: Images are stored under user's ID folder

## Testing

To test the implementation:

1. **Setup**: Ensure Firebase credentials are configured
2. **Profile Avatar**:
   - Log in to the application
   - Navigate to `/profile`
   - Upload an avatar image
   - Verify it displays on profile page
   - Navigate to a game session you created
   - Verify avatar shows next to your name as DM
3. **Game Image**:
   - Navigate to `/post`
   - Fill out game session form
   - Upload a game image
   - Submit the form
   - Navigate to `/find`
   - Verify thumbnail appears in your game card
   - Click on the game to view details
   - Verify full image displays at top of page

## Future Enhancements

Potential improvements to consider:

1. **Image Optimization**: Compress images and generate thumbnails server-side
2. **Image Editing**: Allow users to crop/rotate images before upload
3. **Multiple Images**: Support multiple images per game session
4. **Image Gallery**: Show all images in a gallery view
5. **Delete Old Images**: Automatically delete replaced images from storage
6. **Progress Indicator**: Show upload progress percentage
7. **Drag and Drop**: Support drag-and-drop file upload
8. **Image Validation**: Check image dimensions and quality

## Troubleshooting

### Common Issues

**Firebase initialization error**
- Verify all environment variables are set correctly
- Check that private key has proper format with `\n` characters
- Ensure service account has Storage Admin permissions

**Upload fails with 401**
- User is not authenticated
- Check that userId cookie is set properly

**Image not displaying**
- Verify URL is saved correctly in database
- Check browser console for CORS errors
- Ensure Firebase Storage rules allow public read

**File too large error**
- Image exceeds 5MB limit
- Ask user to resize image or compress it

## Documentation Files

- `IMAGE_UPLOAD_SETUP.md` - Detailed setup instructions
- `.env.example` - Example environment variables
- This file - Complete implementation summary
