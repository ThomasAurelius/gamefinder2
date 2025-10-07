import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { denyPlayer, getCampaign } from "@/lib/campaigns/db";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cookieStore = await cookies();
    const hostId = cookieStore.get("userId")?.value;
    
    if (!hostId) {
      return NextResponse.json(
        { error: "Authentication required. Please log in." },
        { status: 401 }
      );
    }
    
    const { id } = await params;
    const body = await request.json();
    const { playerId } = body;
    
    if (!playerId) {
      return NextResponse.json(
        { error: "Player ID is required" },
        { status: 400 }
      );
    }
    
    // Get the campaign first to provide specific error messages
    const existingCampaign = await getCampaign(id);
    
    if (!existingCampaign) {
      return NextResponse.json(
        { error: "Campaign not found" },
        { status: 404 }
      );
    }
    
    // Check if the user is the campaign host
    if (existingCampaign.userId !== hostId) {
      return NextResponse.json(
        { error: "Only the campaign creator can deny players" },
        { status: 403 }
      );
    }
    
    // Check if the player is in the pending list
    if (!existingCampaign.pendingPlayers?.includes(playerId)) {
      return NextResponse.json(
        { error: "Player is not in the pending approval list" },
        { status: 400 }
      );
    }
    
    // Now deny the player
    const campaign = await denyPlayer(id, hostId, playerId);
    
    if (!campaign) {
      return NextResponse.json(
        { error: "Failed to deny player" },
        { status: 500 }
      );
    }
    
    return NextResponse.json(campaign, { status: 200 });
  } catch (error) {
    console.error("Failed to deny player", error);
    return NextResponse.json(
      { error: "Failed to deny player" },
      { status: 500 }
    );
  }
}
