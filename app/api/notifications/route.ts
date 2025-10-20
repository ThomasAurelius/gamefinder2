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

		// Initialize response with defaults
		let hasIncompleteSettings = false;
		let unreadMessageCount = 0;
		let newPostsCount = 0;

		// Check profile completeness with error handling
		try {
			const profile = await readProfile(userId);
			hasIncompleteSettings =
				!profile.commonName ||
				!profile.location ||
				!profile.zipCode ||
				!profile.bio ||
				!profile.availability ||
				!profile.games ||
				!profile.primaryRole;
		} catch (error) {
			console.error("Error reading profile:", error);
			// Continue with default value
		}

		// Get unread message count with error handling
		try {
			unreadMessageCount = await getUnreadCount(userId);
		} catch (error) {
			console.error("Error getting unread count:", error);
			// Continue with default value
		}

		// Get new posts count since last login with error handling
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
			// Continue with default value
		}

		return NextResponse.json({
			hasIncompleteSettings,
			unreadMessageCount,
			newPostsCount,
		});
	} catch (error) {
		console.error("Error fetching notifications:", error);
		// Return 503 Service Unavailable for critical errors
		return NextResponse.json(
			{ error: "Service temporarily unavailable" },
			{ status: 503 }
		);
	}
}
