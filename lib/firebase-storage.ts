import { initializeApp, getApps, cert, App } from "firebase-admin/app";
import { getStorage } from "firebase-admin/storage";

let firebaseApp: App | null = null;
let initializationError: Error | null = null;

// Lazy initialization of Firebase Admin
function ensureFirebaseInitialized(): void {
  if (firebaseApp || initializationError) {
    return;
  }

  if (getApps().length > 0) {
    firebaseApp = getApps()[0];
    return;
  }

  // Validate required environment variables
  const requiredVars = {
    FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID,
    FIREBASE_CLIENT_EMAIL: process.env.FIREBASE_CLIENT_EMAIL,
    FIREBASE_PRIVATE_KEY: process.env.FIREBASE_PRIVATE_KEY,
    FIREBASE_STORAGE_BUCKET: process.env.FIREBASE_STORAGE_BUCKET,
  };

  const missingVars = Object.entries(requiredVars)
    .filter(([, value]) => !value)
    .map(([key]) => key);

  if (missingVars.length > 0) {
    const error = new Error(`Missing Firebase environment variables: ${missingVars.join(", ")}`);
    initializationError = error;
    console.error("Firebase admin initialization error:", error.message);
    throw error;
  }

  try {
    const privateKey = process.env.FIREBASE_PRIVATE_KEY!.replace(/\\n/g, "\n");
    
    firebaseApp = initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID!,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL!,
        privateKey: privateKey,
      }),
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET!,
    });
  } catch (error) {
    initializationError = error instanceof Error ? error : new Error("Unknown initialization error");
    console.error("Firebase admin initialization error:", initializationError);
    throw initializationError;
  }
}

export function getFirebaseStorage() {
  ensureFirebaseInitialized();
  return getStorage();
}

export async function uploadImageToFirebase(
  file: Buffer,
  path: string,
  contentType: string
): Promise<string> {
  try {
    const bucket = getFirebaseStorage().bucket();
    
    if (!bucket.name) {
      throw new Error("Firebase Storage bucket is not configured");
    }
    
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
  } catch (error) {
    console.error("Error uploading to Firebase Storage:", error);
    throw new Error(
      error instanceof Error 
        ? `Firebase upload failed: ${error.message}`
        : "Firebase upload failed: Unknown error"
    );
  }
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
