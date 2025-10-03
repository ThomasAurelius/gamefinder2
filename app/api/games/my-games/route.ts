import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { listUserGameSessions } from "@/lib/games/db";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("userId")?.value;
    
    if (!userId) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }
    
    const sessions = await listUserGameSessions(userId);
    return NextResponse.json(sessions, { status: 200 });
  } catch (error) {
    console.error("Failed to list user game sessions", error);
    return NextResponse.json(
      { error: "Failed to load game sessions" },
      { status: 500 }
    );
  }
}
