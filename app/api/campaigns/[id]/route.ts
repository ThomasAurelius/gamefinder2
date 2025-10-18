import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getCampaign, updateCampaign, deleteCampaign } from "@/lib/campaigns/db";
import { CampaignPayload } from "@/lib/campaigns/types";

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    
    const campaign = await getCampaign(id);
    
    if (!campaign) {
      return NextResponse.json(
        { error: "Campaign not found" },
        { status: 404 }
      );
    }
    
    return NextResponse.json(campaign, { status: 200 });
  } catch (error) {
    console.error("Failed to fetch campaign", error);
    return NextResponse.json(
      { error: "Failed to fetch campaign" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const cookieStore = await cookies();
    const userId = cookieStore.get("userId")?.value;

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    
    // Validate required fields
    if (!body.game || !body.date || !Array.isArray(body.times) || body.times.length === 0) {
      return NextResponse.json(
        { error: "Missing required fields: game, date, and times are required" },
        { status: 400 }
      );
    }

    // Build the update payload
    const payload: Partial<CampaignPayload> = {
      game: body.game,
      date: body.date,
      times: body.times,
      description: body.description || "",
      maxPlayers: typeof body.maxPlayers === 'number' ? body.maxPlayers : parseInt(String(body.maxPlayers)) || 4,
      imageUrl: body.imageUrl,
      location: body.location,
      zipCode: body.zipCode,
      latitude: body.latitude,
      longitude: body.longitude,
      sessionsLeft: body.sessionsLeft,
      classesNeeded: body.classesNeeded,
      costPerSession: body.costPerSession,
      requiresPayment: body.requiresPayment,
      stripePaymentIntentId: body.stripePaymentIntentId,
      stripeClientSecret: body.stripeClientSecret,
      meetingFrequency: body.meetingFrequency,
      daysOfWeek: body.daysOfWeek,
    };

    const updatedCampaign = await updateCampaign(userId, id, payload);

    if (!updatedCampaign) {
      return NextResponse.json(
        { error: "Campaign not found or you do not have permission to edit it" },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedCampaign, { status: 200 });
  } catch (error) {
    console.error("Failed to update campaign", error);
    return NextResponse.json(
      { error: "Failed to update campaign" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const cookieStore = await cookies();
    const userId = cookieStore.get("userId")?.value;

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const success = await deleteCampaign(userId, id);

    if (!success) {
      return NextResponse.json(
        { error: "Campaign not found or you do not have permission to delete it" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Failed to delete campaign", error);
    return NextResponse.json(
      { error: "Failed to delete campaign" },
      { status: 500 }
    );
  }
}
