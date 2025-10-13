import { NextResponse } from "next/server";
import { searchUsersByName } from "@/lib/users";

/**
 * GET /api/users/search
 * Search for users by name (for filtering games/campaigns by host)
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const searchTerm = searchParams.get("name");

    if (!searchTerm || searchTerm.trim().length === 0) {
      return NextResponse.json([], { status: 200 });
    }

    const users = await searchUsersByName(searchTerm);

    // Return users with only necessary information
    const results = users.map(user => ({
      id: user.id,
      name: user.name,
      avatarUrl: user.avatarUrl,
    }));

    return NextResponse.json(results, { status: 200 });
  } catch (error) {
    console.error("Failed to search users:", error);
    return NextResponse.json(
      { error: "Failed to search users" },
      { status: 500 }
    );
  }
}
