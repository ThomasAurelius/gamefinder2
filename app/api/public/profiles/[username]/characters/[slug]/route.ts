import { NextRequest, NextResponse } from "next/server";

import { getPublicCharacter } from "@/lib/public-profiles";

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ username: string; slug: string }> }
) {
  const { username, slug } = await context.params;

  const result = await getPublicCharacter(username, slug);

  if (!result) {
    return new NextResponse("Character not found", { status: 404 });
  }

  return NextResponse.json(result);
}
