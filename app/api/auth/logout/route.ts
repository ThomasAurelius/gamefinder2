import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({
    message: "Logged out successfully",
  });

  // Clear userId cookie
  response.cookies.delete("userId");

  return response;
}
