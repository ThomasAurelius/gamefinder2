import { NextResponse } from "next/server";
import { getCampaign } from "@/lib/campaigns/db";
import { getUserBasicInfo } from "@/lib/users";
import { generateCampaignICal } from "@/lib/calendar-export";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const campaign = await getCampaign(id);

    if (!campaign) {
      return new NextResponse("Campaign not found", { status: 404 });
    }

    // Get host information
    const host = await getUserBasicInfo(campaign.userId);
    const hostName = host?.name;

    // Generate iCal content
    const icalContent = generateCampaignICal(
      {
        id: campaign.id,
        game: campaign.game,
        date: campaign.date,
        times: campaign.times,
        description: campaign.description,
        location: campaign.location,
        meetingFrequency: campaign.meetingFrequency,
        daysOfWeek: campaign.daysOfWeek,
      },
      hostName
    );

    // Return iCal file with appropriate headers
    return new NextResponse(icalContent, {
      status: 200,
      headers: {
        "Content-Type": "text/calendar; charset=utf-8",
        "Content-Disposition": `attachment; filename="campaign-${campaign.game.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.ics"`,
      },
    });
  } catch (error) {
    console.error("Error generating iCal file:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
