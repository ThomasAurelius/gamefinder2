"use client";

import { useEffect, useState } from "react";

type StoredHostFeedback = {
	id: string;
	playerId: string;
	hostId: string;
	sessionId: string;
	sessionType: "game" | "campaign";
	recommend: "yes" | "no" | "skip";
	comment?: string;
	createdAt: string;
};

type HostFeedbackStats = {
	hostId: string;
	totalRatings: number;
	yesCount: number;
	noCount: number;
	skipCount: number;
	score: number;
	feedback?: StoredHostFeedback[];
};

type HostFeedbackSectionProps = {
	hostId: string;
};

export default function HostFeedbackSection({
	hostId,
}: HostFeedbackSectionProps) {
	const [stats, setStats] = useState<HostFeedbackStats | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [showComments, setShowComments] = useState(false);

	useEffect(() => {
		async function fetchStats() {
			try {
				const response = await fetch(`/api/host-feedback/stats/${hostId}`);
				if (response.ok) {
					const data = await response.json();
					setStats(data);
				}
			} catch (error) {
				console.error("Failed to fetch host feedback stats", error);
			} finally {
				setIsLoading(false);
			}
		}

		fetchStats();
	}, [hostId]);

	if (isLoading) {
		return (
			<div className="rounded-xl border border-amber-500/50 bg-gradient-to-br from-amber-600/20 via-purple-600/20 to-indigo-600/20 p-6">
				<h2 className="text-xl font-semibold text-slate-100">
					Host Rating
				</h2>
				<p className="mt-2 text-sm text-slate-400">Loading...</p>
			</div>
		);
	}

	if (!stats) {
		return null;
	}

	const feedbackWithComments = stats.feedback?.filter((f) => f.comment) || [];

	return (
		<div className="rounded-xl border border-amber-500/50 bg-gradient-to-br from-amber-600/20 via-purple-600/20 to-indigo-600/20 p-6">
			<h2 className="text-xl font-semibold text-slate-100">Host Rating</h2>

			<div className="mt-4 flex items-center gap-4">
				<div className="flex items-center gap-2">
					<span className="text-3xl">⭐</span>
					<span
						className={`text-3xl font-bold ${
							stats.score > 0
								? "text-green-400"
								: stats.score < 0
									? "text-red-400"
									: "text-slate-300"
						}`}
					>
						{stats.score > 0 ? "+" : ""}
						{stats.score}
					</span>
				</div>
				<div className="text-sm text-slate-400">
					<div>{stats.totalRatings} total ratings</div>
					<div className="flex gap-3">
						<span>{stats.yesCount} 👍</span>
						<span>{stats.noCount} 👎</span>
						<span>{stats.skipCount} ⏭️</span>
					</div>
				</div>
			</div>

			{feedbackWithComments.length > 0 && (
				<div className="mt-4">
					<button
						onClick={() => setShowComments(!showComments)}
						className="text-sm text-sky-400 hover:text-sky-300 transition-colors"
					>
						{showComments ? "Hide" : "View"} feedback comments (
						{feedbackWithComments.length})
					</button>

					{showComments && (
						<div className="mt-4 space-y-3">
							{feedbackWithComments.map((feedback) => (
								<div
									key={feedback.id}
									className="rounded-lg border border-slate-700 bg-slate-800/50 p-4"
								>
									<div className="flex items-center justify-between mb-2">
										<div className="flex items-center gap-2">
											{feedback.recommend === "yes" && (
												<span className="text-lg">👍</span>
											)}
											{feedback.recommend === "no" && (
												<span className="text-lg">👎</span>
											)}
											{feedback.recommend === "skip" && (
												<span className="text-lg">⏭️</span>
											)}
											<span className="text-xs text-slate-500">
												{new Date(
													feedback.createdAt
												).toLocaleDateString()}
											</span>
										</div>
									</div>
									<p className="text-sm text-slate-300">
										{feedback.comment}
									</p>
								</div>
							))}
						</div>
					)}
				</div>
			)}

			<div className="mt-4 text-xs text-slate-500">
				Only you and admins can see feedback comments
			</div>
		</div>
	);
}
