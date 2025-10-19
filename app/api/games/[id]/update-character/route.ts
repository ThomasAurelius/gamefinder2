import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { updatePlayerCharacter } from "@/lib/games/db";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const cookieStore = await cookies();
    const userId = cookieStore.get("userId")?.value;

    if (!userId) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const data = await request.json();
    const { characterId, characterName } = data;

    const updatedGame = await updatePlayerCharacter(
      id,
      userId,
      characterId,
      characterName
    );

    if (!updatedGame) {
      return NextResponse.json(
        { error: "Failed to update character. You must be a player in this game." },
        { status: 400 }
      );
    }

    return NextResponse.json(updatedGame);
  } catch (error) {
    console.error("Error updating player character:", error);
    return NextResponse.json(
      { error: "Failed to update character" },
      { status: 500 }
    );
  }
}
