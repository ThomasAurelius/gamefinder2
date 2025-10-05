import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  getUserLibrary,
  addToLibrary,
  removeFromLibrary,
  moveToLibrary,
  toggleFavorite,
} from "@/lib/boardgames/library";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("userId")?.value;

    if (!userId) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    const library = await getUserLibrary(userId);

    return NextResponse.json(library);
  } catch (error) {
    console.error("Error fetching library:", error);
    return NextResponse.json(
      { error: "Failed to fetch library" },
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
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { action, gameId, gameName, type, fromType, toType } = body;

    if (!action || !gameId || !gameName) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    let success = false;

    switch (action) {
      case "add":
        if (!type || (type !== "owned" && type !== "wishlist")) {
          return NextResponse.json(
            { error: "Invalid type" },
            { status: 400 }
          );
        }
        success = await addToLibrary(userId, gameId, gameName, type);
        break;

      case "remove":
        if (!type || (type !== "owned" && type !== "wishlist")) {
          return NextResponse.json(
            { error: "Invalid type" },
            { status: 400 }
          );
        }
        success = await removeFromLibrary(userId, gameId, type);
        break;

      case "move":
        if (
          !fromType ||
          !toType ||
          (fromType !== "owned" && fromType !== "wishlist") ||
          (toType !== "owned" && toType !== "wishlist")
        ) {
          return NextResponse.json(
            { error: "Invalid fromType or toType" },
            { status: 400 }
          );
        }
        success = await moveToLibrary(userId, gameId, gameName, fromType, toType);
        break;

      case "toggleFavorite":
        if (!type || (type !== "owned" && type !== "wishlist")) {
          return NextResponse.json(
            { error: "Invalid type" },
            { status: 400 }
          );
        }
        success = await toggleFavorite(userId, gameId, type);
        break;

      default:
        return NextResponse.json(
          { error: "Invalid action" },
          { status: 400 }
        );
    }

    if (!success) {
      return NextResponse.json(
        { error: "Operation failed" },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error managing library:", error);
    return NextResponse.json(
      { error: "Failed to manage library" },
      { status: 500 }
    );
  }
}
