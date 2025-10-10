import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { isAdmin } from "@/lib/admin";
import { getActiveAdvertisementForUser, setAdvertisement, trackImpression } from "@/lib/advertisements/db";
import { readProfile } from "@/lib/profile-db";

/**
 * GET /api/advertisements
 * Get the active advertisement for the current user (based on their location)
 */
export async function GET() {
  try {
    // Try to get user's location from their profile
    let userLatitude: number | undefined;
    let userLongitude: number | undefined;
    let userId: string | undefined;
    
    try {
      const cookieStore = await cookies();
      userId = cookieStore.get("userId")?.value;
      
      if (userId) {
        const profile = await readProfile(userId);
        userLatitude = profile.latitude;
        userLongitude = profile.longitude;
      }
    } catch (error) {
      // If we can't get user profile, continue without location filtering
      console.log("Could not fetch user profile for advertisement filtering:", error);
    }
    
    const advertisement = await getActiveAdvertisementForUser(userLatitude, userLongitude);
    
    if (!advertisement || !advertisement.isActive) {
      return NextResponse.json(
        { imageUrl: "", isActive: false },
        { status: 200 }
      );
    }
    
    // Track impression if we have a userId
    if (userId && advertisement._id) {
      await trackImpression(advertisement._id.toString(), userId);
    }
    
    return NextResponse.json(
      { 
        id: advertisement._id?.toString(),
        imageUrl: advertisement.imageUrl, 
        isActive: advertisement.isActive,
        url: advertisement.url
      },
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
    const { imageUrl, isActive, zipCode, url } = body;

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

    if (zipCode !== undefined && typeof zipCode !== "string") {
      return NextResponse.json(
        { error: "zipCode must be a string" },
        { status: 400 }
      );
    }

    if (url !== undefined && typeof url !== "string") {
      return NextResponse.json(
        { error: "url must be a string" },
        { status: 400 }
      );
    }

    const advertisement = await setAdvertisement(
      userId,
      imageUrl || "",
      isActive,
      zipCode,
      url
    );

    return NextResponse.json(
      {
        imageUrl: advertisement.imageUrl,
        isActive: advertisement.isActive,
        url: advertisement.url,
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
