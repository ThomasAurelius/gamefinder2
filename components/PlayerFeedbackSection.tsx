"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type StoredPlayerFeedback = {
	id: string;
	hostId: string;
	playerId: string;
	sessionId: string;
	sessionType: "game" | "campaign";
	rating: 1 | 2 | 3 | 4 | 5;
	comment?: string;
	createdAt: string;
	isFlagged?: boolean;
};

type PlayerFeedbackStats = {
	playerId: string;
	totalRatings: number;
	averageRating: number;
	ratings: {
		1: number;
		2: number;
		3: number;
		4: number;
		5: number;
	};
	feedback?: StoredPlayerFeedback[];
};

type PlayerFeedbackSectionProps = {
	playerId: string;
};

export default function PlayerFeedbackSection({
	playerId,
}: PlayerFeedbackSectionProps) {
	const [stats, setStats] = useState<PlayerFeedbackStats | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [showComments, setShowComments] = useState(false);

	useEffect(() => {
		async function fetchStats() {
			try {
				const response = await fetch(
					`/api/player-feedback/stats/${playerId}`
				);
				if (response.ok) {
					const data = await response.json();
					setStats(data);
				}
			} catch (error) {
				console.error("Failed to fetch player feedback stats", error);
			} finally {
				setIsLoading(false);
			}
		}

		fetchStats();
	}, [playerId]);

	if (isLoading) {
		return (
			<div className="rounded-xl border border-amber-500/50 bg-gradient-to-br from-amber-600/20 via-purple-600/20 to-indigo-600/20 p-6">
				<h2 className="text-xl font-semibold text-slate-100">
					Player Rating
				</h2>
				<p className="mt-2 text-sm text-slate-400">Loading...</p>
			</div>
		);
	}

	if (!stats) {
		return null;
	}

	const feedbackWithComments = stats.feedback?.filter((f) => f.comment) || [];

	const displayStars = (rating: number) => {
		const fullStars = Math.floor(rating);
		const hasHalfStar = rating % 1 >= 0.5;
		const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
		
		return (
			<>
				{"⭐".repeat(fullStars)}
				{hasHalfStar && "½"}
				{"☆".repeat(emptyStars)}
			</>
		);
	};

	return (
		<div className="rounded-xl border border-amber-500/50 bg-gradient-to-br from-amber-600/20 via-purple-600/20 to-indigo-600/20 p-6">
			<div className="flex items-center justify-between mb-4">
				<h2 className="text-xl font-semibold text-slate-100">Player Rating</h2>
				{feedbackWithComments.length > 0 && (
					<Link
						href={`/feedback/${playerId}`}
						className="text-sm text-sky-400 hover:text-sky-300 transition-colors"
					>
						View All Feedback →
					</Link>
				)}
			</div>

			{stats.totalRatings > 0 && stats.averageRating != null ? (
				<div className="mt-4 flex items-center gap-4">
					<div className="flex items-center gap-2">
						<span className="text-3xl">🎮</span>
						<span className="text-3xl font-bold text-amber-400">
							{stats.averageRating.toFixed(1)}
						</span>
					</div>
					<div className="text-sm text-slate-400">
						<div className="text-lg text-amber-400/80">
							{displayStars(stats.averageRating)}
						</div>
						<div>{stats.totalRatings} total rating{stats.totalRatings !== 1 ? "s" : ""}</div>
						<div className="flex gap-3 mt-1">
							<span>5⭐: {stats.ratings[5]}</span>
							<span>4⭐: {stats.ratings[4]}</span>
							<span>3⭐: {stats.ratings[3]}</span>
							<span>2⭐: {stats.ratings[2]}</span>
							<span>1⭐: {stats.ratings[1]}</span>
						</div>
					</div>
				</div>
			) : (
				<div className="mt-4 text-sm text-slate-400">
					No ratings yet. Play some games to receive feedback!
				</div>
			)}

			{feedbackWithComments.length > 0 && (
				<div className="mt-4">
					<button
						onClick={() => setShowComments(!showComments)}
						className="text-sm text-sky-400 hover:text-sky-300 transition-colors"
					>
						{showComments ? "Hide" : "Show preview of"} feedback comments (
						{feedbackWithComments.length})
					</button>

					{showComments && (
						<div className="mt-4 space-y-3">
							{feedbackWithComments.slice(0, 3).map((feedback) => (
								<div
									key={feedback.id}
									className={`rounded-lg border p-4 ${
										feedback.isFlagged
											? "border-orange-500/30 bg-orange-500/10"
											: "border-slate-700 bg-slate-800/50"
									}`}
								>
									<div className="flex items-center justify-between mb-2">
										<div className="flex items-center gap-2">
											<span className="text-lg text-amber-400">
												{"⭐".repeat(feedback.rating)}
											</span>
											<span className="text-xs text-slate-500">
												{new Date(
													feedback.createdAt
												).toLocaleDateString()}
											</span>
										</div>
										{feedback.isFlagged && (
											<span className="text-xs text-orange-400">
												⏳ Under Review
											</span>
										)}
									</div>
									<p className="text-sm text-slate-300">
										{feedback.comment}
									</p>
								</div>
							))}
							{feedbackWithComments.length > 3 && (
								<Link
									href={`/feedback/${playerId}`}
									className="block text-center text-sm text-sky-400 hover:text-sky-300 transition-colors mt-2"
								>
									View all {feedbackWithComments.length} comments →
								</Link>
							)}
						</div>
					)}
				</div>
			)}

			<div className="mt-4 text-xs text-slate-500">
				Feedback comments are visible to everyone unless flagged
			</div>
		</div>
	);
}
