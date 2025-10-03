import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import {
  createGameSession,
  listGameSessions,
} from "@/lib/games/db";
import { GameSessionPayload } from "@/lib/games/types";

function parseGameSessionPayload(data: unknown): GameSessionPayload | null {
  if (!data || typeof data !== "object") {
    return null;
  }

  const payload = data as Partial<GameSessionPayload>;

  if (
    typeof payload.game !== "string" ||
    typeof payload.date !== "string" ||
    !Array.isArray(payload.times) ||
    payload.times.length === 0 ||
    typeof payload.maxPlayers !== "number" ||
    payload.maxPlayers < 1
  ) {
    return null;
  }

  return {
    game: payload.game,
    date: payload.date,
    times: payload.times.filter((t) => typeof t === "string"),
    description: typeof payload.description === "string" ? payload.description : "",
    maxPlayers: payload.maxPlayers,
  };
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Extract filter parameters
    const game = searchParams.get("game") || undefined;
    const date = searchParams.get("date") || undefined;
    const timesParam = searchParams.get("times");
    const times = timesParam ? timesParam.split(",") : undefined;

    const sessions = await listGameSessions({ game, date, times });
    return NextResponse.json(sessions, { status: 200 });
  } catch (error) {
    console.error("Failed to list game sessions", error);
    return NextResponse.json(
      { error: "Failed to load game sessions" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("userId")?.value;
    
    if (!userId) {
      return NextResponse.json(
        { error: "Authentication required. Please log in to post a game session." },
        { status: 401 }
      );
    }
    
    const data = await request.json();
    const payload = parseGameSessionPayload(data);

    if (!payload) {
      return NextResponse.json(
        { error: "Invalid game session data. Please ensure all required fields are filled." },
        { status: 400 }
      );
    }

    const session = await createGameSession(userId, payload);

    return NextResponse.json(session, { status: 201 });
  } catch (error) {
    console.error("Failed to create game session", error);
    return NextResponse.json(
      { error: "Failed to create game session" },
      { status: 500 }
    );
  }
}
