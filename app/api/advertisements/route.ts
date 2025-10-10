import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { isAdmin } from "@/lib/admin";
import { getActiveAdvertisement, setAdvertisement } from "@/lib/advertisements/db";

/**
 * GET /api/advertisements
 * Get the active advertisement
 */
export async function GET() {
  try {
    const advertisement = await getActiveAdvertisement();
    
    if (!advertisement || !advertisement.isActive) {
      return NextResponse.json(
        { imageUrl: "", isActive: false },
        { status: 200 }
      );
    }
    
    return NextResponse.json(
      { imageUrl: advertisement.imageUrl, isActive: advertisement.isActive },
      { status: 200 }
    );
  } catch (error) {
    console.error("Failed to fetch advertisement:", error);
    return NextResponse.json(
      { error: "Failed to retrieve advertisement" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/advertisements
 * Create or update advertisement (admin only)
 */
export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("userId")?.value;

    if (!userId) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const userIsAdmin = await isAdmin(userId);
    if (!userIsAdmin) {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { imageUrl, isActive } = body;

    if (typeof isActive !== "boolean") {
      return NextResponse.json(
        { error: "isActive must be a boolean" },
        { status: 400 }
      );
    }

    if (isActive && (!imageUrl || typeof imageUrl !== "string")) {
      return NextResponse.json(
        { error: "imageUrl is required when advertisement is active" },
        { status: 400 }
      );
    }

    const advertisement = await setAdvertisement(
      userId,
      imageUrl || "",
      isActive
    );

    return NextResponse.json(
      {
        imageUrl: advertisement.imageUrl,
        isActive: advertisement.isActive,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Failed to update advertisement:", error);
    return NextResponse.json(
      { error: "Failed to update advertisement" },
      { status: 500 }
    );
  }
}
