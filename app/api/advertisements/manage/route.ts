import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { isAdmin } from "@/lib/admin";
import { getDb } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import type { AdvertisementDocument } from "@/lib/advertisements/types";
import { geocodeLocation } from "@/lib/geolocation";

/**
 * PUT /api/advertisements/manage
 * Update an advertisement (admin only)
 */
export async function PUT(request: Request) {
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
    const { id, imageUrl, isActive, zipCode, url } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Advertisement ID is required" },
        { status: 400 }
      );
    }

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

    const db = await getDb();
    const advertisementsCollection = db.collection<AdvertisementDocument>("advertisements");
    
    const updateData: Partial<AdvertisementDocument> = {
      imageUrl: imageUrl || "",
      isActive,
      zipCode: zipCode?.trim() || undefined,
      url: url?.trim() || undefined,
      updatedAt: new Date(),
    };

    // Geocode the zip code if provided
    if (zipCode && zipCode.trim()) {
      try {
        const coords = await geocodeLocation(zipCode.trim());
        if (coords) {
          updateData.latitude = coords.latitude;
          updateData.longitude = coords.longitude;
        } else {
          // Clear coordinates if geocoding failed
          updateData.latitude = undefined;
          updateData.longitude = undefined;
        }
      } catch (error) {
        console.error("Failed to geocode advertisement zip code:", error);
        // Clear coordinates if geocoding failed
        updateData.latitude = undefined;
        updateData.longitude = undefined;
      }
    } else {
      // Clear coordinates if no zip code provided
      updateData.latitude = undefined;
      updateData.longitude = undefined;
    }

    const result = await advertisementsCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: "Advertisement not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, message: "Advertisement updated successfully" },
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

/**
 * DELETE /api/advertisements/manage
 * Delete an advertisement (admin only)
 */
export async function DELETE(request: Request) {
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

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Advertisement ID is required" },
        { status: 400 }
      );
    }

    const db = await getDb();
    const advertisementsCollection = db.collection<AdvertisementDocument>("advertisements");
    
    const result = await advertisementsCollection.deleteOne({
      _id: new ObjectId(id)
    });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: "Advertisement not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, message: "Advertisement deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Failed to delete advertisement:", error);
    return NextResponse.json(
      { error: "Failed to delete advertisement" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/advertisements/manage
 * Toggle advertisement active status (admin only)
 */
export async function PATCH(request: Request) {
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
    const { id, isActive } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Advertisement ID is required" },
        { status: 400 }
      );
    }

    if (typeof isActive !== "boolean") {
      return NextResponse.json(
        { error: "isActive must be a boolean" },
        { status: 400 }
      );
    }

    const db = await getDb();
    const advertisementsCollection = db.collection<AdvertisementDocument>("advertisements");
    
    const result = await advertisementsCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: { isActive, updatedAt: new Date() } }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: "Advertisement not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, message: "Advertisement status updated successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Failed to toggle advertisement:", error);
    return NextResponse.json(
      { error: "Failed to toggle advertisement" },
      { status: 500 }
    );
  }
}
