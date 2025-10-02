import { NextResponse } from "next/server";

import { getPublicCharacter } from "@/lib/public-profiles";

export async function GET(
  _: Request,
  context: { params: { username: string; slug: string } }
) {
  const { username, slug } = context.params;

  const result = await getPublicCharacter(username, slug);

  if (!result) {
    return new NextResponse("Character not found", { status: 404 });
  }

  return NextResponse.json(result);
}
