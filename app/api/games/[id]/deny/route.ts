import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { denyPlayer } from "@/lib/games/db";

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
    
    const session = await denyPlayer(id, hostId, playerId);
    
    if (!session) {
      return NextResponse.json(
        { error: "Failed to deny player. You may not be the host or the player is not in pending list." },
        { status: 400 }
      );
    }
    
    return NextResponse.json(session, { status: 200 });
  } catch (error) {
    console.error("Failed to deny player", error);
    return NextResponse.json(
      { error: "Failed to deny player" },
      { status: 500 }
    );
  }
}
