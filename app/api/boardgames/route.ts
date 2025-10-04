import { NextResponse } from "next/server";
import { searchBoardGames } from "@/lib/boardgames/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q") || "";
    const limit = parseInt(searchParams.get("limit") || "20");

    const games = await searchBoardGames(query, limit);

    return NextResponse.json({ games });
  } catch (error) {
    console.error("Error searching board games:", error);
    return NextResponse.json(
      { error: "Failed to search board games" },
      { status: 500 }
    );
  }
}
