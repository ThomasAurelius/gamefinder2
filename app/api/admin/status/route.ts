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
    
    console.log("[Admin Status] Checking admin status for userId:", userId ? `${userId.substring(0, 8)}...` : "none");
    
    if (!userId) {
      console.log("[Admin Status] No userId cookie found");
      return NextResponse.json({ isAdmin: false }, {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, private',
        },
      });
    }
    
    const userIsAdmin = await isAdmin(userId);
    
    console.log("[Admin Status] User isAdmin:", userIsAdmin);
    
    return NextResponse.json({ isAdmin: userIsAdmin }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, private',
      },
    });
  } catch (error) {
    console.error("[Admin Status] Error checking admin status:", error);
    return NextResponse.json({ isAdmin: false }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, private',
      },
    });
  }
}
