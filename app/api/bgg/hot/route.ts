import { NextResponse } from "next/server";
import { fetchBggHotItems } from "@/lib/bgg-api";

export async function GET() {
  try {
    const items = await fetchBggHotItems();
    return NextResponse.json({ items });
  } catch (error) {
    console.error("Error fetching BGG hot items:", error);
    return NextResponse.json(
      { error: "Failed to fetch trending items from BoardGameGeek" },
      { status: 500 }
    );
  }
}
