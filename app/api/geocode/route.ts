import { NextResponse } from "next/server";
import { geocodeLocation } from "@/lib/geolocation";

export async function GET(request: Request) {
	try {
		const { searchParams } = new URL(request.url);
		const location = searchParams.get("location");

		if (!location) {
			return NextResponse.json(
				{ error: "Location parameter is required" },
				{ status: 400 }
			);
		}

		const coordinates = await geocodeLocation(location);

		if (!coordinates) {
			return NextResponse.json(
				{ error: "Unable to geocode location" },
				{ status: 404 }
			);
		}

		return NextResponse.json(coordinates);
	} catch (error) {
		console.error("Geocode API error:", error);
		return NextResponse.json(
			{ error: "Failed to geocode location" },
			{ status: 500 }
		);
	}
}
