import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { leaveCampaign } from "@/lib/campaigns/db";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const cookieStore = await cookies();
    const userId = cookieStore.get("userId")?.value;

    if (!userId) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const updatedCampaign = await leaveCampaign(id, userId);

    if (!updatedCampaign) {
      return NextResponse.json(
        { error: "Failed to leave campaign" },
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
