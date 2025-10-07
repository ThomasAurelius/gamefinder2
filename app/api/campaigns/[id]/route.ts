import { NextResponse } from "next/server";
import { getCampaign } from "@/lib/campaigns/db";

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
