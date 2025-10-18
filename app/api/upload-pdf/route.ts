import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { uploadImageToFirebase } from "@/lib/firebase-storage";
import { randomUUID } from "crypto";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB for PDFs
const ALLOWED_TYPES = ["application/pdf"];

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
    const files = formData.getAll("files") as File[];

    if (files.length === 0) {
      return NextResponse.json(
        { error: "No files provided" },
        { status: 400 }
      );
    }

    if (files.length > 3) {
      return NextResponse.json(
        { error: "Maximum 3 files allowed" },
        { status: 400 }
      );
    }

    const uploadedUrls: string[] = [];

    for (const file of files) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        return NextResponse.json(
          { error: "Invalid file type. Only PDF files are allowed." },
          { status: 400 }
        );
      }

      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { error: "File too large. Maximum size is 10MB per file." },
          { status: 400 }
        );
      }

      // Convert file to buffer
      const buffer = Buffer.from(await file.arrayBuffer());

      // Generate unique filename
      const ext = file.name.split(".").pop();
      const filename = `${randomUUID()}.${ext}`;
      
      // Store in character-sheets folder
      const path = `character-sheets/${userId}/${filename}`;

      // Upload to Firebase
      const url = await uploadImageToFirebase(buffer, path, file.type);
      uploadedUrls.push(url);
    }

    return NextResponse.json({ urls: uploadedUrls }, { status: 200 });
  } catch (error) {
    console.error("Failed to upload PDFs:", error);
    
    // Provide more detailed error message
    const errorMessage = error instanceof Error ? error.message : "Failed to upload PDFs";
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
