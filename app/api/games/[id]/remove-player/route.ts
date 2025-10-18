import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { removePlayer, getGameSession } from "@/lib/games/db";
import { getUserBasicInfo } from "@/lib/users";
import { createMessage } from "@/lib/messages";

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
    const { playerId, reason } = body;
    
    if (!playerId) {
      return NextResponse.json(
        { error: "Player ID is required" },
        { status: 400 }
      );
    }
    
    if (!reason || typeof reason !== "string" || reason.trim().length === 0) {
      return NextResponse.json(
        { error: "Reason is required" },
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
        { error: "Only the game session creator can remove players" },
        { status: 403 }
      );
    }
    
    // Check if the player is in any list
    const isInSignedUp = existingSession.signedUpPlayers?.includes(playerId);
    const isInWaitlist = existingSession.waitlist?.includes(playerId);
    const isInPending = existingSession.pendingPlayers?.includes(playerId);
    
    if (!isInSignedUp && !isInWaitlist && !isInPending) {
      return NextResponse.json(
        { error: "Player is not in this game session" },
        { status: 400 }
      );
    }
    
    // Get host and player information for the message
    const hostInfo = await getUserBasicInfo(hostId);
    const playerInfo = await getUserBasicInfo(playerId);
    
    if (!hostInfo || !playerInfo) {
      return NextResponse.json(
        { error: "Failed to get user information" },
        { status: 500 }
      );
    }
    
    // Now remove the player
    const session = await removePlayer(id, hostId, playerId);
    
    if (!session) {
      return NextResponse.json(
        { error: "Failed to remove player" },
        { status: 500 }
      );
    }
    
    // Send a message to the player with the reason
    try {
      await createMessage({
        senderId: hostId,
        senderName: hostInfo.name,
        recipientId: playerId,
        recipientName: playerInfo.name,
        subject: `Removed from game: ${existingSession.game}`,
        content: `You have been removed from the game "${existingSession.game}" by the host.\n\nReason: ${reason.trim()}`,
      });
    } catch (error) {
      console.error("Failed to send message to player:", error);
      // Don't fail the request if message sending fails
    }
    
    return NextResponse.json(session, { status: 200 });
  } catch (error) {
    console.error("Failed to remove player", error);
    return NextResponse.json(
      { error: "Failed to remove player" },
      { status: 500 }
    );
  }
}
