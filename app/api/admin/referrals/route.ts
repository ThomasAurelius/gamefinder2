import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getDb } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import type { UserDocument } from "@/lib/user-types";
import { isAdmin } from "@/lib/admin";

/**
 * GET /api/admin/referrals - Get list of all users with referrals (admin only)
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

		// Check if user is admin
		const userIsAdmin = await isAdmin(userId);
		if (!userIsAdmin) {
			return NextResponse.json(
				{ error: "Forbidden - Admin access required" },
				{ status: 403 }
			);
		}

		const db = await getDb();
		const usersCollection = db.collection<UserDocument>("users");

		// Find all users who have a referrer
		const referredUsers = await usersCollection
			.find(
				{
					referredBy: { $exists: true, $ne: "" },
				},
				{
					projection: {
						_id: 1,
						name: 1,
						referredBy: 1,
						createdAt: 1,
						"profile.commonName": 1,
						"profile.avatarUrl": 1,
					},
				}
			)
			.sort({ createdAt: -1 })
			.toArray();

		// Get unique referrer IDs
		const referrerIds = [
			...new Set(
				referredUsers
					.map((user) => user.referredBy)
					.filter((id): id is string => typeof id === 'string' && id !== '' && ObjectId.isValid(id))
			),
		];

		// Fetch referrer information
		const referrers = await usersCollection
			.find(
				{ _id: { $in: referrerIds.map((id) => new ObjectId(id)) } },
				{
					projection: {
						_id: 1,
						name: 1,
						"profile.commonName": 1,
					},
				}
			)
			.toArray();

		// Create a map of referrer ID to referrer info
		const referrerMap = new Map(
			referrers.map((ref) => [
				ref._id?.toString(),
				{
					id: ref._id?.toString(),
					name: ref.name,
					commonName: ref.profile?.commonName || "",
				},
			])
		);

		// Group referred users by referrer
		const referralsByReferrer: Record<
			string,
			{
				referrer: {
					id: string;
					name: string;
					commonName: string;
				};
				referrals: Array<{
					id: string;
					name: string;
					commonName: string;
					avatarUrl: string;
					joinedAt: Date;
				}>;
			}
		> = {};

		for (const user of referredUsers) {
			const referrerId = user.referredBy;
			if (!referrerId) continue;

			const referrerInfo = referrerMap.get(referrerId);
			if (!referrerInfo) {
				// Referrer not found in database, skip or use placeholder
				continue;
			}

			if (!referralsByReferrer[referrerId]) {
				referralsByReferrer[referrerId] = {
					referrer: referrerInfo,
					referrals: [],
				};
			}

			referralsByReferrer[referrerId].referrals.push({
				id: user._id?.toString() || "",
				name: user.name || "",
				commonName: user.profile?.commonName || "",
				avatarUrl: user.profile?.avatarUrl || "",
				joinedAt: user.createdAt || new Date(),
			});
		}

		// Convert to array and sort by number of referrals
		const sortedReferrals = Object.values(referralsByReferrer).sort(
			(a, b) => b.referrals.length - a.referrals.length
		);

		return NextResponse.json({
			referralsByReferrer: sortedReferrals,
			totalReferrals: referredUsers.length,
		});
	} catch (error) {
		console.error("Error fetching referrals:", error);
		return NextResponse.json(
			{ error: "Failed to fetch referrals" },
			{ status: 500 }
		);
	}
}
