# Image Upload Feature - Environment Variables

This document describes the Firebase environment variables required for the image upload feature.

## Required Environment Variables

Add the following environment variables to your `.env.local` file:

```bash
# Firebase Configuration for Image Storage
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=your-service-account-email@your-project-id.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour-Private-Key-Here\n-----END PRIVATE KEY-----"
FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
```

## How to Get These Values

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Select your project (or create a new one)
3. Go to Project Settings (gear icon) → Service Accounts
4. Click "Generate New Private Key"
5. Download the JSON file
6. Extract the values:
   - `project_id` → `FIREBASE_PROJECT_ID`
   - `client_email` → `FIREBASE_CLIENT_EMAIL`
   - `private_key` → `FIREBASE_PRIVATE_KEY` (keep the quotes and newlines as `\n`)
7. For the storage bucket:
   - Go to Storage in the Firebase Console
   - The bucket name will be shown (usually `project-id.appspot.com`)

## Important Notes

- The `FIREBASE_PRIVATE_KEY` should include the `\n` characters as literal text (not actual newlines)
- Keep your private key secure and never commit it to version control
- The `.env.local` file is already in `.gitignore` to prevent accidental commits

## Setting Up Firebase Storage

1. In the Firebase Console, go to Storage
2. Click "Get Started"
3. Choose production mode or test mode (you can configure rules later)
4. Select a location for your storage bucket
5. Click "Done"

## Storage Rules (Optional but Recommended)

For security, you may want to configure Firebase Storage Rules. Here's a basic example:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Allow authenticated uploads
    match /avatars/{userId}/{allPaths=**} {
      allow read: if true;
      allow write: if false; // Only server can write
    }
    match /games/{userId}/{allPaths=**} {
      allow read: if true;
      allow write: if false; // Only server can write
    }
  }
}
```

This configuration:
- Allows anyone to read images (public access)
- Only allows server-side uploads (through Firebase Admin SDK)
- Prevents client-side direct uploads for security

## Features

### Profile Avatar Upload
- Upload an avatar image on the `/profile` page
- Supported formats: JPG, PNG, WebP, GIF
- Maximum size: 5MB
- Stored in Firebase Storage at `avatars/{userId}/{filename}`
- URL saved in MongoDB user profile

### Game Session Image Upload
- Upload a game image when posting a game on the `/post` page
- Supported formats: JPG, PNG, WebP, GIF
- Maximum size: 5MB
- Stored in Firebase Storage at `games/{userId}/{filename}`
- URL saved in MongoDB game session document

### Display
- Avatar displayed on profile page and as DM avatar on game detail pages
- Game images displayed as thumbnails on find page and full size on game detail pages

## Troubleshooting

### "Firebase admin initialization error"
- Check that all environment variables are set correctly
- Verify the private key format (should have `\n` characters)
- Ensure the service account has proper permissions

### "Failed to upload image"
- Check Firebase Storage is enabled in your project
- Verify storage rules allow the upload
- Check file size is under 5MB
- Ensure file type is supported

### Images not displaying
- Check the URL is properly saved in the database
- Verify the storage bucket allows public read access
- Check browser console for CORS errors
