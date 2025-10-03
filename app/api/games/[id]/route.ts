import { NextResponse } from "next/server";
import { getGameSession } from "@/lib/games/db";

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
