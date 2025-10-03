# Image Upload Feature - Quick Start Guide

## What Was Implemented

This PR adds image upload functionality to the GameFinder2 application:

1. **Profile Avatars** - Upload a profile picture on `/profile`
2. **Game Session Images** - Upload game images when posting on `/post`
3. **Display** - Images show on find page (thumbnails) and game detail pages (full size)

## Setup Instructions

### Step 1: Firebase Project Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select existing one
3. Enable **Storage** from the left menu
4. Click "Get Started" and choose your security rules

### Step 2: Generate Service Account Key

1. In Firebase Console, go to **Project Settings** (gear icon)
2. Click **Service Accounts** tab
3. Click **Generate New Private Key**
4. Download the JSON file

### Step 3: Configure Environment Variables

Create a file named `.env.local` in the project root with:

```bash
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=your-service-account-email@your-project-id.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour-Private-Key-Here\n-----END PRIVATE KEY-----"
FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
```

**Important Notes:**
- Copy values from your downloaded JSON file
- Keep the `\n` in the private key as literal text (not actual newlines)
- The private key should be wrapped in double quotes

### Step 4: Run the Application

```bash
npm install
npm run dev
```

### Step 5: Test the Features

1. **Avatar Upload**:
   - Navigate to `/profile`
   - Click "Upload Avatar"
   - Select an image (JPG, PNG, WebP, or GIF)
   - Avatar appears immediately

2. **Game Image Upload**:
   - Navigate to `/post`
   - Fill in game details
   - Click "Upload Image" (optional)
   - Select an image
   - Submit the form
   - View your game on `/find` to see the thumbnail
   - Click the game to see full image

## What Changed

### New Files
- `/lib/firebase-storage.ts` - Firebase integration
- `/app/api/upload/route.ts` - Upload API endpoint
- `.env.example` - Example environment variables
- Documentation files

### Modified Files
- Profile page - Added avatar upload UI
- Post game page - Added image upload UI
- Find games page - Shows image thumbnails
- Game detail page - Shows full images and DM avatars
- Database types - Added `avatarUrl` and `imageUrl` fields

## Features

✅ Secure server-side uploads (requires authentication)  
✅ File validation (type and size)  
✅ 5MB maximum file size  
✅ Supports JPG, PNG, WebP, GIF  
✅ Image preview before upload  
✅ Fallback display when no image  
✅ Public image URLs stored in MongoDB  

## Support

For detailed information, see:
- `IMAGE_UPLOAD_SETUP.md` - Complete setup guide
- `IMAGE_UPLOAD_IMPLEMENTATION.md` - Technical details

## Troubleshooting

**"Firebase admin initialization error"**
- Check that all environment variables are set
- Verify the private key format includes `\n` characters
- Make sure you're using the correct project ID

**"Failed to upload image"**
- Ensure you're logged in
- Check file is under 5MB
- Verify file type is supported

**Images don't display**
- Check browser console for errors
- Verify Firebase Storage allows public read access
- Confirm URLs are saved correctly in database

## Next Steps

Once Firebase is configured, all image upload features will work automatically. Users can start uploading avatars and game images immediately.
