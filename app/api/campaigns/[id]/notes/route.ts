import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  createCampaignNote,
  getCampaignNotes,
  CampaignNotePayload,
} from "@/lib/campaigns/notes";
import { getCampaign } from "@/lib/campaigns/db";

export async function GET(
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

    // Verify that the campaign exists
    const campaign = await getCampaign(id);
    if (!campaign) {
      return NextResponse.json(
        { error: "Campaign not found" },
        { status: 404 }
      );
    }

    // Only the campaign creator can view notes
    // Return empty array for non-creators instead of 403 error
    if (campaign.userId !== userId) {
      return NextResponse.json([]);
    }

    const notes = await getCampaignNotes(id);
    return NextResponse.json(notes);
  } catch (error) {
    console.error("Error fetching campaign notes:", error);
    return NextResponse.json(
      { error: "Failed to fetch notes" },
      { status: 500 }
    );
  }
}

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

    // Verify that the user is the campaign creator
    const campaign = await getCampaign(id);
    if (!campaign) {
      return NextResponse.json(
        { error: "Campaign not found" },
        { status: 404 }
      );
    }

    if (campaign.userId !== userId) {
      return NextResponse.json(
        { error: "Only the campaign creator can add notes" },
        { status: 403 }
      );
    }

    const data = await request.json();
    const { content } = data;

    if (!content || typeof content !== "string" || content.trim().length === 0) {
      return NextResponse.json(
        { error: "Note content is required" },
        { status: 400 }
      );
    }

    const payload: CampaignNotePayload = {
      campaignId: id,
      userId,
      content: content.trim(),
    };

    await createCampaignNote(payload);
    
    // Return all notes after creating a new one
    const notes = await getCampaignNotes(id);
    return NextResponse.json(notes, { status: 201 });
  } catch (error) {
    console.error("Error creating campaign note:", error);
    return NextResponse.json(
      { error: "Failed to create note" },
      { status: 500 }
    );
  }
}
