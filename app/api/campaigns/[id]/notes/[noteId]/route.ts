import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  updateCampaignNote,
  deleteCampaignNote,
} from "@/lib/campaigns/notes";
import { getCampaign } from "@/lib/campaigns/db";

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string; noteId: string }> }
) {
  try {
    const { id, noteId } = await context.params;
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
        { error: "Only the campaign creator can update notes" },
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

    const updatedNote = await updateCampaignNote(noteId, userId, content.trim());
    
    if (!updatedNote) {
      return NextResponse.json(
        { error: "Note not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedNote);
  } catch (error) {
    console.error("Error updating campaign note:", error);
    return NextResponse.json(
      { error: "Failed to update note" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string; noteId: string }> }
) {
  try {
    const { id, noteId } = await context.params;
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
        { error: "Only the campaign creator can delete notes" },
        { status: 403 }
      );
    }

    const deleted = await deleteCampaignNote(noteId, userId);
    
    if (!deleted) {
      return NextResponse.json(
        { error: "Note not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting campaign note:", error);
    return NextResponse.json(
      { error: "Failed to delete note" },
      { status: 500 }
    );
  }
}
