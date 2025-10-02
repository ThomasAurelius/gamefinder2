import { NextResponse } from "next/server";

import { getPublicProfile } from "@/lib/public-profiles";

export async function GET(
  _: Request,
  context: { params: { username: string } }
) {
  const { username } = context.params;

  const profile = await getPublicProfile(username);

  if (!profile) {
    return new NextResponse("Profile not found", { status: 404 });
  }

  return NextResponse.json(profile);
}
