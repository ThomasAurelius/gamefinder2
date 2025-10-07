import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { approvePlayer, getGameSession } from "@/lib/games/db";

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
    
    // Get the game session first to provide specific error messages
    const existingSession = await getGameSession(id);
    
    if (!existingSession) {
      return NextResponse.json(
        { error: "Game session not found" },
        { status: 404 }
      );
    }
    
    // Check if the user is the game session host
    if (existingSession.userId !== hostId) {
      return NextResponse.json(
        { error: "Only the game session creator can approve players" },
        { status: 403 }
      );
    }
    
    // Check if the player is in the pending list
    if (!existingSession.pendingPlayers?.includes(playerId)) {
      return NextResponse.json(
        { error: "Player is not in the pending approval list" },
        { status: 400 }
      );
    }
    
    // Now approve the player
    const session = await approvePlayer(id, hostId, playerId);
    
    if (!session) {
      return NextResponse.json(
        { error: "Failed to approve player" },
        { status: 500 }
      );
    }
    
    return NextResponse.json(session, { status: 200 });
  } catch (error) {
    console.error("Failed to approve player", error);
    return NextResponse.json(
      { error: "Failed to approve player" },
      { status: 500 }
    );
  }
}
