import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { isAdmin } from "@/lib/admin";
import { listUnresolvedFlags, resolveFlag, softDeleteTallTale } from "@/lib/tall-tales/db";
import { getUsersBasicInfo } from "@/lib/users";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("userId")?.value;

    if (!userId) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const userIsAdmin = await isAdmin(userId);
    if (!userIsAdmin) {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    const flags = await listUnresolvedFlags();

    // Fetch user information for flaggers
    const userIds = [...new Set(flags.map(f => f.flaggedBy))];
    const usersMap = await getUsersBasicInfo(userIds);

    // Add flagger names
    const flagsWithUsers = flags.map(flag => ({
      ...flag,
      flaggerName: usersMap.get(flag.flaggedBy)?.name || "Unknown User",
    }));

    return NextResponse.json(flagsWithUsers, { status: 200 });
  } catch (error) {
    console.error("Failed to list flags:", error);
    return NextResponse.json(
      { error: "Failed to retrieve flags" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("userId")?.value;

    if (!userId) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const userIsAdmin = await isAdmin(userId);
    if (!userIsAdmin) {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { flagId, taleId, action } = body;

    if (!flagId || !taleId || !action) {
      return NextResponse.json(
        { error: "flagId, taleId, and action are required" },
        { status: 400 }
      );
    }

    if (action !== "allow" && action !== "delete") {
      return NextResponse.json(
        { error: "action must be either 'allow' or 'delete'" },
        { status: 400 }
      );
    }

    // If deleting, soft delete the tale
    if (action === "delete") {
      await softDeleteTallTale(taleId, userId);
    }

    // Resolve the flag
    const resolution = action === "delete" ? "deleted" : "allowed";
    await resolveFlag(flagId, userId, resolution);

    return NextResponse.json({
      message: `Flag ${action === "delete" ? "resolved and content deleted" : "resolved and content allowed"}`,
    }, { status: 200 });
  } catch (error) {
    console.error("Failed to resolve flag:", error);
    return NextResponse.json(
      { error: "Failed to resolve flag" },
      { status: 500 }
    );
  }
}
