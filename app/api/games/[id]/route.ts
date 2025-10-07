import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getGameSession, updateGameSession, deleteGameSession } from "@/lib/games/db";
import { GameSessionPayload } from "@/lib/games/types";
import { isAdmin } from "@/lib/admin";
import { geocodeLocation } from "@/lib/geolocation";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const session = await getGameSession(id);
    
    if (!session) {
      return NextResponse.json(
        { error: "Game session not found" },
        { status: 404 }
      );
    }
    
    return NextResponse.json(session, { status: 200 });
  } catch (error) {
    console.error("Failed to fetch game session", error);
    return NextResponse.json(
      { error: "Failed to fetch game session" },
      { status: 500 }
    );
  }
}

export async function PUT(
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
    const data = await request.json() as Partial<GameSessionPayload>;
    
    // Validate that the user owns this session
    const existingSession = await getGameSession(id);
    if (!existingSession) {
      return NextResponse.json(
        { error: "Game session not found" },
        { status: 404 }
      );
    }
    
    // Check if user is admin or owns the session
    const userIsAdmin = await isAdmin(userId);
    if (existingSession.userId !== userId && !userIsAdmin) {
      return NextResponse.json(
        { error: "You can only edit your own game sessions" },
        { status: 403 }
      );
    }
    
    // Geocode the location if it's being updated
    // Try zipCode first, then fall back to location
    const locationToGeocode = data.zipCode || data.location;
    if (locationToGeocode) {
      try {
        const coords = await geocodeLocation(locationToGeocode);
        if (coords) {
          data.latitude = coords.latitude;
          data.longitude = coords.longitude;
        }
      } catch (error) {
        // Log the error but don't fail the game session update
        console.error("Failed to geocode location:", error);
      }
    }
    
    // If admin is editing someone else's game, use the original owner's userId
    const ownerUserId = userIsAdmin && existingSession.userId !== userId 
      ? existingSession.userId 
      : userId;
    
    const updatedSession = await updateGameSession(ownerUserId, id, data);
    
    if (!updatedSession) {
      return NextResponse.json(
        { error: "Failed to update game session" },
        { status: 500 }
      );
    }
    
    return NextResponse.json(updatedSession, { status: 200 });
  } catch (error) {
    console.error("Failed to update game session", error);
    return NextResponse.json(
      { error: "Failed to update game session" },
      { status: 500 }
    );
  }
}

export async function DELETE(
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
    
    // Validate that the user owns this session
    const existingSession = await getGameSession(id);
    if (!existingSession) {
      return NextResponse.json(
        { error: "Game session not found" },
        { status: 404 }
      );
    }
    
    // Check if user is admin or owns the session
    const userIsAdmin = await isAdmin(userId);
    if (existingSession.userId !== userId && !userIsAdmin) {
      return NextResponse.json(
        { error: "You can only delete your own game sessions" },
        { status: 403 }
      );
    }
    
    // If admin is deleting someone else's game, use the original owner's userId
    const ownerUserId = userIsAdmin && existingSession.userId !== userId 
      ? existingSession.userId 
      : userId;
    
    const deleted = await deleteGameSession(ownerUserId, id);
    
    if (!deleted) {
      return NextResponse.json(
        { error: "Failed to delete game session" },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Failed to delete game session", error);
    return NextResponse.json(
      { error: "Failed to delete game session" },
      { status: 500 }
    );
  }
}
