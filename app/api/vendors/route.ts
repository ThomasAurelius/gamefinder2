import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import { createVendor, listVendors, listVendorsByLocation, parseVendorPayload } from "@/lib/vendors";
import { isAdmin } from "@/lib/admin";
import { readProfile } from "@/lib/profile-db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const ownerParam = searchParams.get("owner");
    const includeUnapproved = searchParams.get("includeUnapproved") === "true";
    const nearMe = searchParams.get("nearMe") === "true";

    const cookieStore = await cookies();
    const userId = cookieStore.get("userId")?.value;

    if (ownerParam === "me") {
      if (!userId) {
        return NextResponse.json({ error: "Authentication required" }, { status: 401 });
      }

      const vendors = await listVendors({ ownerUserId: userId, includeUnapproved: true });
      return NextResponse.json({ vendors });
    }

    if (nearMe) {
      if (!userId) {
        // Return empty array if not authenticated
        return NextResponse.json({ vendors: [] });
      }

      const profile = await readProfile(userId);
      if (!profile.latitude || !profile.longitude) {
        // Return empty array if user has no location
        return NextResponse.json({ vendors: [] });
      }

      const vendors = await listVendorsByLocation(profile.latitude, profile.longitude, 50);
      return NextResponse.json({ vendors });
    }

    if (includeUnapproved) {
      if (!userId) {
        return NextResponse.json({ error: "Authentication required" }, { status: 401 });
      }

      const userIsAdmin = await isAdmin(userId);
      if (!userIsAdmin) {
        return NextResponse.json({ error: "Admin access required" }, { status: 403 });
      }

      const vendors = await listVendors({ includeUnapproved: true });
      return NextResponse.json({ vendors });
    }

    const vendors = await listVendors();
    return NextResponse.json({ vendors });
  } catch (error) {
    console.error("Failed to list vendors", error);
    return NextResponse.json({ error: "Unable to fetch vendors" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("userId")?.value;

    if (!userId) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const payload = await request.json();
    const vendorData = parseVendorPayload(payload);
    
    // Check if user is admin
    const userIsAdmin = await isAdmin(userId);
    
    // If admin and ownerUserId is provided in payload, use it; otherwise use current user
    let ownerUserId: string | undefined = userId;
    if (userIsAdmin && payload.ownerUserId !== undefined) {
      ownerUserId = payload.ownerUserId || undefined; // Allow empty string to mean no owner
    }
    
    const vendor = await createVendor(ownerUserId, vendorData);

    return NextResponse.json({ vendor }, { status: 201 });
  } catch (error) {
    console.error("Failed to create vendor", error);
    const message = error instanceof Error ? error.message : "Unable to create vendor";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
