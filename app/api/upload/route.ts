import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { uploadImageToFirebase } from "@/lib/firebase-storage";
import { randomUUID } from "crypto";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("userId")?.value;

    if (!userId) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const type = formData.get("type") as string; // "avatar", "game", "character", "tale", "campaign", "advertisement", or "marketplace"

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed." },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 5MB." },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // Generate unique filename
    const ext = file.name.split(".").pop();
    const filename = `${randomUUID()}.${ext}`;
    
    // Determine storage path based on type
    let path: string;
    if (type === "avatar") {
      path = `avatars/${userId}/${filename}`;
    } else if (type === "character") {
      path = `characters/${userId}/${filename}`;
    } else if (type === "tale") {
      path = `tall-tales/${userId}/${filename}`;
    } else if (type === "advertisement") {
      path = `advertisements/${filename}`;
    } else if (type === "marketplace") {
      path = `marketplace/${userId}/${filename}`;
    } else {
      path = `games/${userId}/${filename}`;
    }

    // Upload to Firebase
    const url = await uploadImageToFirebase(buffer, path, file.type);

    return NextResponse.json({ url }, { status: 200 });
  } catch (error) {
    console.error("Failed to upload image:", error);
    
    // Provide more detailed error message
    const errorMessage = error instanceof Error ? error.message : "Failed to upload image";
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
