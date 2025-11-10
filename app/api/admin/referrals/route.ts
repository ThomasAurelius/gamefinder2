import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getDb } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import type { UserDocument } from "@/lib/user-types";

/**
 * GET /api/admin/referrals - Get list of users referred by the current user
 */
export async function GET() {
	try {
		const cookieStore = await cookies();
		const userId = cookieStore.get("userId")?.value;

		if (!userId || !ObjectId.isValid(userId)) {
			return NextResponse.json(
				{ error: "Unauthorized" },
				{ status: 401 }
			);
		}

		const db = await getDb();
		const usersCollection = db.collection<UserDocument>("users");

		// Find all users who have this user as their referrer
		const referredUsers = await usersCollection
			.find(
				{ referredBy: userId },
				{
					projection: {
						_id: 1,
						name: 1,
						email: 1,
						createdAt: 1,
						"profile.commonName": 1,
						"profile.avatarUrl": 1,
					},
				}
			)
			.sort({ createdAt: -1 })
			.toArray();

		// Format the response
		const formattedReferrals = referredUsers.map((user) => ({
			id: user._id?.toString(),
			name: user.name,
			commonName: user.profile?.commonName || "",
			avatarUrl: user.profile?.avatarUrl || "",
			joinedAt: user.createdAt,
		}));

		return NextResponse.json({
			referrals: formattedReferrals,
			count: formattedReferrals.length,
		});
	} catch (error) {
		console.error("Error fetching referrals:", error);
		return NextResponse.json(
			{ error: "Failed to fetch referrals" },
			{ status: 500 }
		);
	}
}
