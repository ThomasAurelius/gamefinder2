import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { readProfile } from "@/lib/profile-db";
import { getUnreadCount } from "@/lib/messages";
import { countNewGamesSinceDate } from "@/lib/games/db";
import { getDb } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

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

		// Check profile completeness
		const profile = await readProfile(userId);
		const hasIncompleteSettings =
			!profile.commonName ||
			!profile.location ||
			!profile.zipCode ||
			!profile.bio ||
			!profile.availability ||
			!profile.games ||
			!profile.primaryRole;

		// Get unread message count
		const unreadMessageCount = await getUnreadCount(userId);

		// Get new posts count since last login
		let newPostsCount = 0;
		try {
			const db = await getDb();
			const usersCollection = db.collection("users");
			const user = await usersCollection.findOne(
				{ _id: new ObjectId(userId) },
				{ projection: { lastLoginAt: 1 } }
			);

			if (user?.lastLoginAt) {
				// Count posts created after the user's last login
				// Subtract 1 second to avoid counting the current login
				const lastLoginDate = new Date(user.lastLoginAt);
				lastLoginDate.setSeconds(lastLoginDate.getSeconds() - 1);
				newPostsCount = await countNewGamesSinceDate(lastLoginDate);
			}
		} catch (error) {
			console.error("Error counting new posts:", error);
			// Continue with newPostsCount = 0
		}

		return NextResponse.json({
			hasIncompleteSettings,
			unreadMessageCount,
			newPostsCount,
		});
	} catch (error) {
		console.error("Error fetching notifications:", error);
		return NextResponse.json(
			{ error: "Failed to fetch notifications" },
			{ status: 500 }
		);
	}
}
