import { NextResponse } from "next/server";
import { getMarketplaceListing } from "@/lib/marketplace/db";
import { getUsersBasicInfo } from "@/lib/users";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const listing = await getMarketplaceListing(id);

    if (!listing) {
      return NextResponse.json(
        { error: "Listing not found" },
        { status: 404 }
      );
    }

    // Add host information
    const hostsMap = await getUsersBasicInfo([listing.userId]);
    const hostInfo = hostsMap.get(listing.userId);

    return NextResponse.json({
      ...listing,
      hostName: hostInfo?.name || "Unknown User",
      hostAvatarUrl: hostInfo?.avatarUrl,
    });
  } catch (error) {
    console.error("Error fetching marketplace listing:", error);
    return NextResponse.json(
      { error: "Failed to fetch listing" },
      { status: 500 }
    );
  }
}
