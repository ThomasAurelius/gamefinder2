import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { joinCampaign } from "@/lib/campaigns/db";

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

    const data = await request.json();
    const { characterId, characterName } = data;

    const updatedCampaign = await joinCampaign(
      id,
      userId,
      characterId,
      characterName
    );

    if (!updatedCampaign) {
      return NextResponse.json(
        { error: "Failed to join campaign" },
        { status: 400 }
      );
    }

    return NextResponse.json(updatedCampaign);
  } catch (error) {
    console.error("Error joining campaign:", error);
    return NextResponse.json(
      { error: "Failed to join campaign" },
      { status: 500 }
    );
  }
}
