import { NextResponse } from "next/server";

type NominatimAddress = {
  city?: string;
  town?: string;
  village?: string;
  municipality?: string;
  state?: string;
  region?: string;
  county?: string;
  country?: string;
};

type NominatimResult = {
  lat: string;
  lon: string;
  name: string;
  type?: string;
  class?: string;
  address?: NominatimAddress;
};

type CityOption = {
  displayName: string;
  value: string;
  lat: number;
  lon: number;
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");

    if (!query || query.trim().length < 2) {
      return NextResponse.json([]);
    }

    // Use Nominatim API to search for cities
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?` +
        `q=${encodeURIComponent(query)}&` +
        `format=json&` +
        `limit=10&` +
        `addressdetails=1&` +
        `featuretype=city`,
      {
        headers: {
          "User-Agent": "GameFinder2-App/1.0",
        },
      }
    );

    if (!response.ok) {
      console.error("City search API error:", response.statusText);
      return NextResponse.json([]);
    }

    const data = (await response.json()) as NominatimResult[];

    // Format the results to include city, state, and country
    const cities = data
      .filter((item: NominatimResult) => {
        // Filter for cities, towns, villages, and administrative areas
        const type = item.type || item.class;
        return (
          type === "city" ||
          type === "town" ||
          type === "village" ||
          type === "administrative" ||
          item.address?.city ||
          item.address?.town ||
          item.address?.village
        );
      })
      .map((item: NominatimResult) => {
        const address = item.address || {};
        const city =
          address.city ||
          address.town ||
          address.village ||
          address.municipality ||
          item.name;
        const state =
          address.state ||
          address.region ||
          address.county ||
          "";
        const country = address.country || "";

        // Build display name
        let displayName = city;
        if (state) {
          displayName += `, ${state}`;
        }
        if (country && country !== "United States") {
          displayName += `, ${country}`;
        }

        return {
          displayName,
          value: displayName,
          lat: parseFloat(item.lat),
          lon: parseFloat(item.lon),
        };
      })
      // Remove duplicates based on displayName
      .filter(
        (item: CityOption, index: number, self: CityOption[]) =>
          index === self.findIndex((t) => t.displayName === item.displayName)
      )
      .slice(0, 10);

    return NextResponse.json(cities);
  } catch (error) {
    console.error("Error searching cities:", error);
    return NextResponse.json([]);
  }
}
