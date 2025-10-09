import { NextResponse } from "next/server";
import { fetchBggMarketplace } from "@/lib/bgg-api";

export async function GET() {
  try {
    const data = await fetchBggMarketplace();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching BGG marketplace:", error);
    return NextResponse.json(
      { error: "Failed to fetch marketplace data from BoardGameGeek" },
      { status: 500 }
    );
  }
}
