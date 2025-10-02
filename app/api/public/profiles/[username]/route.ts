import { NextRequest, NextResponse } from "next/server";

import { getPublicProfile } from "@/lib/public-profiles";

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ username: string }> }
) {
  const { username } = await context.params;

  const profile = await getPublicProfile(username);

  if (!profile) {
    return new NextResponse("Profile not found", { status: 404 });
  }

  return NextResponse.json(profile);
}
