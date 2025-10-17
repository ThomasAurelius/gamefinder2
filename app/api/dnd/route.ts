import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
	const searchParams = request.nextUrl.searchParams;
	const endpoint = searchParams.get("endpoint");

	if (!endpoint) {
		return NextResponse.json(
			{ error: "Missing endpoint parameter" },
			{ status: 400 }
		);
	}

	try {
		const response = await fetch(
			`https://www.dnd5eapi.co/api/${endpoint}`
		);

		if (!response.ok) {
			return NextResponse.json(
				{ error: "Failed to fetch from D&D API" },
				{ status: response.status }
			);
		}

		const data = await response.json();
		return NextResponse.json(data);
	} catch (error) {
		console.error("D&D API error:", error);
		return NextResponse.json(
			{ error: "Failed to fetch from D&D API" },
			{ status: 500 }
		);
	}
}
