import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { isAdmin } from "@/lib/admin";

/**
 * GET /api/user/me - Get current user's basic info
 */
export async function GET() {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("userId")?.value;
    
    if (!userId) {
      return NextResponse.json({ 
        authenticated: false 
      });
    }
    
    const userIsAdmin = await isAdmin(userId);
    
    return NextResponse.json({ 
      authenticated: true,
      userId,
      isAdmin: userIsAdmin 
    });
  } catch (error) {
    console.error("Error fetching user info:", error);
    return NextResponse.json({ 
      authenticated: false 
    });
  }
}
