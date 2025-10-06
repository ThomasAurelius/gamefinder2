import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { isAdmin } from "@/lib/admin";

/**
 * GET /api/admin/status - Check if the current user is an admin
 */
export async function GET() {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("userId")?.value;
    
    if (!userId) {
      return NextResponse.json({ isAdmin: false });
    }
    
    const userIsAdmin = await isAdmin(userId);
    
    return NextResponse.json({ isAdmin: userIsAdmin });
  } catch (error) {
    console.error("Error checking admin status:", error);
    return NextResponse.json({ isAdmin: false });
  }
}
