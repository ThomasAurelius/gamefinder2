import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ObjectId } from "mongodb";

import {
  deleteVendor,
  getVendorById,
  parseVendorPayload,
  updateVendor,
} from "@/lib/vendors";

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
    const isAdmin = cookieStore.get("isAdmin")?.value === "true";

    const isOwner = userId && vendor.ownerUserId === userId;
    if (!vendor.isApproved && !isOwner && !isAdmin) {
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
    const isAdmin = cookieStore.get("isAdmin")?.value === "true";

    if (!userId) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const isOwner = existingVendor.ownerUserId === userId;
    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }

    const payload = await request.json();
    const vendorData = parseVendorPayload(payload, { allowApprovalFields: isAdmin });

    const updatedVendor = await updateVendor(id, vendorData, { allowApprovalFields: isAdmin });

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
    const isAdmin = cookieStore.get("isAdmin")?.value === "true";

    if (!userId) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const isOwner = existingVendor.ownerUserId === userId;
    if (!isOwner && !isAdmin) {
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
