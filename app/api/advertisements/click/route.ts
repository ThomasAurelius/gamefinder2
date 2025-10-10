import { NextResponse } from "next/server";
import { trackClick } from "@/lib/advertisements/db";

/**
 * POST /api/advertisements/click
 * Track a click on an advertisement
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { advertisementId } = body;

    if (!advertisementId || typeof advertisementId !== "string") {
      return NextResponse.json(
        { error: "advertisementId is required" },
        { status: 400 }
      );
    }

    const success = await trackClick(advertisementId);

    if (success) {
      return NextResponse.json(
        { message: "Click tracked successfully" },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        { error: "Failed to track click" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Failed to track click:", error);
    return NextResponse.json(
      { error: "Failed to track click" },
      { status: 500 }
    );
  }
}
