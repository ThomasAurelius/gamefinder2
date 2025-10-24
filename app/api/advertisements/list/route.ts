import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { isAdmin } from "@/lib/admin";
import { getDb } from "@/lib/mongodb";
import type { AdvertisementDocument } from "@/lib/advertisements/types";

/**
 * GET /api/advertisements/list
 * Get all advertisements (admin only)
 */
export async function GET() {
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

    const db = await getDb();
    const advertisementsCollection = db.collection<AdvertisementDocument>("advertisements");
    
    const advertisements = await advertisementsCollection
      .find({})
      .sort({ updatedAt: -1 })
      .toArray();
    
    return NextResponse.json(
      advertisements.map(ad => ({
        id: ad._id?.toString(),
        imageUrl: ad.imageUrl,
        isActive: ad.isActive,
        zipCode: ad.zipCode,
        url: ad.url,
        latitude: ad.latitude,
        longitude: ad.longitude,
        clicks: ad.clicks || 0,
        impressions: ad.impressions?.length || 0,
        createdAt: ad.createdAt,
        updatedAt: ad.updatedAt,
        createdBy: ad.createdBy,
      })),
      { status: 200 }
    );
  } catch (error) {
    console.error("Failed to fetch advertisements:", error);
    return NextResponse.json(
      { error: "Failed to retrieve advertisements" },
      { status: 500 }
    );
  }
}
