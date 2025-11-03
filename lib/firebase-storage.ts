import { getStorage } from "firebase-admin/storage";
import { getFirebaseAdminApp } from "./firebaseAdmin";

export function getFirebaseStorage() {
  const app = getFirebaseAdminApp();
  return getStorage(app);
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
