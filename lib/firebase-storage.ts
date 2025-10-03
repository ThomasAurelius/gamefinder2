import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getStorage } from "firebase-admin/storage";

// Initialize Firebase Admin if not already initialized
if (!getApps().length) {
  try {
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");
    
    initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: privateKey,
      }),
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    });
  } catch (error) {
    console.error("Firebase admin initialization error:", error);
  }
}

export function getFirebaseStorage() {
  return getStorage();
}

export async function uploadImageToFirebase(
  file: Buffer,
  path: string,
  contentType: string
): Promise<string> {
  const bucket = getFirebaseStorage().bucket();
  const fileRef = bucket.file(path);

  await fileRef.save(file, {
    metadata: {
      contentType,
    },
    public: true,
  });

  // Make file publicly accessible
  await fileRef.makePublic();

  // Return the public URL
  return `https://storage.googleapis.com/${bucket.name}/${path}`;
}

export async function deleteImageFromFirebase(url: string): Promise<void> {
  try {
    const bucket = getFirebaseStorage().bucket();
    // Extract the file path from the URL
    const urlParts = url.split(`${bucket.name}/`);
    if (urlParts.length > 1) {
      const filePath = decodeURIComponent(urlParts[1]);
      const fileRef = bucket.file(filePath);
      await fileRef.delete();
    }
  } catch (error) {
    console.error("Error deleting image from Firebase:", error);
    // Don't throw - deletion failure shouldn't block the operation
  }
}
