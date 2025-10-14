import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { isAdmin } from "@/lib/admin";
import { getDb } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

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
    
    // Fetch user name from database
    const db = await getDb();
    const usersCollection = db.collection("users");
    const user = await usersCollection.findOne(
      { _id: new ObjectId(userId) },
      { projection: { name: 1, email: 1 } }
    );
    
    const userName = user?.name || (user?.email as string)?.split("@")[0] || "User";
    
    return NextResponse.json({ 
      authenticated: true,
      userId,
      userName,
      isAdmin: userIsAdmin 
    });
  } catch (error) {
    console.error("Error fetching user info:", error);
    return NextResponse.json({ 
      authenticated: false 
    });
  }
}
