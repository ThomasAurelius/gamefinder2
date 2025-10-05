import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { joinGameSession } from "@/lib/games/db";
import { getUserBasicInfo } from "@/lib/users";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("userId")?.value;
    
    if (!userId) {
      return NextResponse.json(
        { error: "Authentication required. Please log in to join a game session." },
        { status: 401 }
      );
    }
    
    const { id } = await params;
    
    const session = await joinGameSession(id, userId);
    
    if (!session) {
      return NextResponse.json(
        { error: "Failed to join game session. You may already be signed up or the session does not exist." },
        { status: 400 }
      );
    }
    
    // Fetch host information
    const host = await getUserBasicInfo(session.userId);
    const sessionWithHost = {
      ...session,
      hostName: host?.name || "Unknown Host",
      hostAvatarUrl: host?.avatarUrl,
    };
    
    return NextResponse.json(sessionWithHost, { status: 200 });
  } catch (error) {
    console.error("Failed to join game session", error);
    return NextResponse.json(
      { error: "Failed to join game session" },
      { status: 500 }
    );
  }
}
