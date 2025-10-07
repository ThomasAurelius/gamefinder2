import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { leaveCampaign } from "@/lib/campaigns/db";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("userId")?.value;

    if (!userId) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const { id } = await params;

    const updatedCampaign = await leaveCampaign(id, userId);

    if (!updatedCampaign) {
      return NextResponse.json(
        { error: "Failed to leave campaign. The campaign may not exist or you may not be a member." },
        { status: 400 }
      );
    }

    return NextResponse.json(updatedCampaign);
  } catch (error) {
    console.error("Error leaving campaign:", error);
    return NextResponse.json(
      { error: "Failed to leave campaign" },
      { status: 500 }
    );
  }
}
