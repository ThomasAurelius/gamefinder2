import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { readProfile, writeProfile } from "@/lib/profile-db";
import { isValidTimezone } from "@/lib/timezone";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const cookieStore = await cookies();
    const userId = searchParams.get("userId") || cookieStore.get("userId")?.value;
    
    if (!userId) {
      return NextResponse.json(
        { error: "Authentication required. Please log in." },
        { status: 401 }
      );
    }
    
    const profile = await readProfile(userId);
    
    return NextResponse.json({
      timezone: profile.timezone || "America/Chicago",
    });
  } catch (error) {
    console.error("Error fetching settings:", error);
    return new NextResponse("Unable to read settings", { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const cookieStore = await cookies();
    const userId = searchParams.get("userId") || cookieStore.get("userId")?.value;
    
    if (!userId) {
      return NextResponse.json(
        { error: "Authentication required. Please log in." },
        { status: 401 }
      );
    }
    
    const payload = await request.json();
    const { timezone } = payload;
    
    if (!timezone || typeof timezone !== "string") {
      return NextResponse.json(
        { error: "Timezone is required" },
        { status: 400 }
      );
    }
    
    if (!isValidTimezone(timezone)) {
      return NextResponse.json(
        { error: "Invalid timezone" },
        { status: 400 }
      );
    }
    
    // Read current profile and update timezone
    const profile = await readProfile(userId);
    profile.timezone = timezone;
    await writeProfile(userId, profile);
    
    return NextResponse.json({ timezone }, { status: 200 });
  } catch (error) {
    console.error("Error updating settings:", error);
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }
    return new NextResponse("Unable to save settings", { status: 500 });
  }
}
