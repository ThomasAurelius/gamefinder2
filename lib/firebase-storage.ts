import { initializeApp, getApps, cert, App } from "firebase-admin/app";
import { getStorage } from "firebase-admin/storage";

let firebaseApp: App | null = null;
let initializationError: Error | null = null;

// Lazy initialization of Firebase Admin
function ensureFirebaseInitialized(): void {
  // If initialization previously failed, throw the error instead of silently returning
  if (initializationError) {
    throw initializationError;
  }
  
  if (firebaseApp) {
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
    // Handle different private key formats
    let privateKey = process.env.FIREBASE_PRIVATE_KEY!;
    
    // Remove any quotes that might wrap the key
    privateKey = privateKey.replace(/^["']|["']$/g, '');
    
    // Normalize private key to have actual newline characters
    // This handles various formats that may occur depending on environment:
    // - Literal \n characters (common in .env files)
    // - Literal \r\n characters (Windows-style)
    // - Already normalized keys (idempotent operation)
    // Use the same robust approach as firebaseAdmin.ts
    privateKey = privateKey.replace(/\\r\\n|\\n|\\r/g, '\n');
    
    // Validate that the private key has the expected format
    if (!privateKey.includes('BEGIN PRIVATE KEY') || !privateKey.includes('END PRIVATE KEY')) {
      throw new Error('FIREBASE_PRIVATE_KEY is malformed. It should contain "BEGIN PRIVATE KEY" and "END PRIVATE KEY" markers.');
    }
    
    // Validate client email format
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL!;
    if (!clientEmail.includes('@') || !clientEmail.includes('.iam.gserviceaccount.com')) {
      throw new Error('FIREBASE_CLIENT_EMAIL is malformed. It should be in the format: your-service-account@your-project-id.iam.gserviceaccount.com');
    }
    
    firebaseApp = initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID!,
        clientEmail: clientEmail,
        privateKey: privateKey,
      }),
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET!,
    });
  } catch (error) {
    initializationError = error instanceof Error ? error : new Error("Unknown initialization error");
    console.error("Firebase admin initialization error:", initializationError);
    
    // Add more specific error messages for common issues
    if (error instanceof Error) {
      if (error.message.includes('invalid_grant') || error.message.includes('account not found')) {
        console.error("\n⚠️  Firebase Authentication Error Detected:");
        console.error("The service account credentials are invalid or the account doesn't exist.");
        console.error("\nPossible causes:");
        console.error("1. The service account was deleted from the Firebase project");
        console.error("2. The private key or client email is incorrect");
        console.error("3. The credentials are from a different Firebase project");
        console.error("4. The service account doesn't have proper permissions");
        console.error("\nTo fix this:");
        console.error("1. Go to Firebase Console → Project Settings → Service Accounts");
        console.error("2. Generate a new private key");
        console.error("3. Update your environment variables with the new credentials");
        console.error("4. Ensure FIREBASE_PROJECT_ID matches the project from the service account\n");
      }
    }
    
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
