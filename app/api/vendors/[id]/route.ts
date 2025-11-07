import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ObjectId } from "mongodb";

import {
  deleteVendor,
  getVendorById,
  parseVendorPayload,
  updateVendor,
  updateVendorOwnership,
} from "@/lib/vendors";
import { isAdmin } from "@/lib/admin";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Vendor not found" }, { status: 404 });
    }

    const vendor = await getVendorById(id);

    if (!vendor) {
      return NextResponse.json({ error: "Vendor not found" }, { status: 404 });
    }

    const cookieStore = await cookies();
    const userId = cookieStore.get("userId")?.value;

    const userIsAdmin = userId ? await isAdmin(userId) : false;
    const isOwner = userId && vendor.ownerUserId === userId;
    if (!vendor.isApproved && !isOwner && !userIsAdmin) {
      return NextResponse.json({ error: "Vendor not found" }, { status: 404 });
    }

    return NextResponse.json({ vendor });
  } catch (error) {
    console.error("Failed to read vendor", error);
    return NextResponse.json({ error: "Unable to read vendor" }, { status: 500 });
  }
}

export async function PUT(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Vendor not found" }, { status: 404 });
    }

    const existingVendor = await getVendorById(id);
    if (!existingVendor) {
      return NextResponse.json({ error: "Vendor not found" }, { status: 404 });
    }

    const cookieStore = await cookies();
    const userId = cookieStore.get("userId")?.value;

    if (!userId) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const userIsAdmin = await isAdmin(userId);
    const isOwner = existingVendor.ownerUserId === userId;
    if (!isOwner && !userIsAdmin) {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }

    const payload = await request.json();
    const vendorData = parseVendorPayload(payload, { allowApprovalFields: userIsAdmin });

    const updatedVendor = await updateVendor(id, vendorData, { allowApprovalFields: userIsAdmin });

    if (!updatedVendor) {
      return NextResponse.json({ error: "Vendor not found" }, { status: 404 });
    }

    return NextResponse.json({ vendor: updatedVendor });
  } catch (error) {
    console.error("Failed to update vendor", error);
    const message = error instanceof Error ? error.message : "Unable to update vendor";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Vendor not found" }, { status: 404 });
    }

    const existingVendor = await getVendorById(id);
    if (!existingVendor) {
      return NextResponse.json({ error: "Vendor not found" }, { status: 404 });
    }

    const cookieStore = await cookies();
    const userId = cookieStore.get("userId")?.value;

    if (!userId) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const userIsAdmin = await isAdmin(userId);
    const isOwner = existingVendor.ownerUserId === userId;
    if (!isOwner && !userIsAdmin) {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }

    const deleted = await deleteVendor(id);

    if (!deleted) {
      return NextResponse.json({ error: "Vendor not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete vendor", error);
    return NextResponse.json({ error: "Unable to delete vendor" }, { status: 500 });
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Vendor not found" }, { status: 404 });
    }

    const existingVendor = await getVendorById(id);
    if (!existingVendor) {
      return NextResponse.json({ error: "Vendor not found" }, { status: 404 });
    }

    const cookieStore = await cookies();
    const userId = cookieStore.get("userId")?.value;

    if (!userId) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const userIsAdmin = await isAdmin(userId);
    if (!userIsAdmin) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const payload = await request.json();

    // Check if this is an ownership update
    if (Object.prototype.hasOwnProperty.call(payload, "ownerUserId")) {
      const newOwnerUserId = payload.ownerUserId || undefined;
      const updatedVendor = await updateVendorOwnership(id, newOwnerUserId);

      if (!updatedVendor) {
        return NextResponse.json({ error: "Vendor not found" }, { status: 404 });
      }

      return NextResponse.json({ vendor: updatedVendor });
    }

    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  } catch (error) {
    console.error("Failed to update vendor ownership", error);
    const message = error instanceof Error ? error.message : "Unable to update vendor";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
