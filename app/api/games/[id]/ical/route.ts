import { NextResponse } from "next/server";
import { getGameSession } from "@/lib/games/db";
import { getUserBasicInfo } from "@/lib/users";
import { generateGameSessionICal } from "@/lib/calendar-export";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getGameSession(id);

    if (!session) {
      return new NextResponse("Game session not found", { status: 404 });
    }

    // Get host information
    const host = await getUserBasicInfo(session.userId);
    const hostName = host?.name;

    // Generate iCal content
    const icalContent = generateGameSessionICal(
      {
        id: session.id,
        game: session.game,
        date: session.date,
        times: session.times,
        description: session.description,
        location: session.location,
      },
      hostName
    );

    // Return iCal file with appropriate headers
    return new NextResponse(icalContent, {
      status: 200,
      headers: {
        "Content-Type": "text/calendar; charset=utf-8",
        "Content-Disposition": `attachment; filename="game-${session.game.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.ics"`,
      },
    });
  } catch (error) {
    console.error("Error generating iCal file:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
