import { NextRequest, NextResponse } from "next/server";

// Whitelist of allowed D&D 5e API endpoints
const ALLOWED_ENDPOINTS = [
	"races",
	"classes",
	"equipment",
	"spells",
	"monsters",
	"magic-items",
	"conditions",
	"backgrounds",
	"alignments",
	"equipment-categories",
];

export async function GET(request: NextRequest) {
	const searchParams = request.nextUrl.searchParams;
	const endpoint = searchParams.get("endpoint");
	const id = searchParams.get("id");

	if (!endpoint) {
		return NextResponse.json(
			{ error: "Missing endpoint parameter" },
			{ status: 400 }
		);
	}

	// Validate endpoint against whitelist
	if (!ALLOWED_ENDPOINTS.includes(endpoint)) {
		return NextResponse.json(
			{ error: "Invalid endpoint" },
			{ status: 400 }
		);
	}

	try {
		// Build the URL - if id is provided, fetch specific item
		const url = id 
			? `https://www.dnd5eapi.co/api/${endpoint}/${id}`
			: `https://www.dnd5eapi.co/api/${endpoint}`;

		const response = await fetch(url, {
			next: { revalidate: 3600 }, // Cache for 1 hour
		});

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
