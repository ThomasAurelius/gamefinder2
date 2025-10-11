"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { formatDateInTimezone } from "@/lib/timezone";

type Player = {
	id: string;
	name: string;
	avatarUrl?: string;
};

type Session = {
	id: string;
	game: string;
	date: string;
	times: string[];
	signedUpPlayersDetails: Player[];
	waitlistDetails: Player[];
	pendingPlayersDetails: Player[];
	maxPlayers: number;
	costPerSession?: number;
};

type SessionCardProps = {
	session: Session;
	userTimezone: string;
	onRefund?: () => void;
};

export default function SessionCard({ session, userTimezone, onRefund }: SessionCardProps) {
	const [processingPlayerId, setProcessingPlayerId] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState<string | null>(null);
	const [playerSubscriptions, setPlayerSubscriptions] = useState<Record<string, boolean>>({});

	useEffect(() => {
		// Fetch subscription status for all players when the component mounts
		const fetchSubscriptionStatus = async () => {
			// Only check subscriptions if this is a paid session
			if (!session.costPerSession || session.costPerSession <= 0) {
				return;
			}

			const allPlayers = [
				...session.signedUpPlayersDetails,
				...session.waitlistDetails,
				...session.pendingPlayersDetails,
			];

			if (allPlayers.length === 0) {
				return;
			}

			try {
				const playerIds = allPlayers.map((player) => player.id);
				const response = await fetch("/api/stripe/check-players-subscriptions", {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						campaignId: session.id,
						playerIds: playerIds,
					}),
				});

				if (response.ok) {
					const subscriptionStatuses: Record<string, boolean> = await response.json();
					setPlayerSubscriptions(subscriptionStatuses);
				}
			} catch (err) {
				console.error("Failed to fetch player subscription statuses:", err);
			}
		};

		fetchSubscriptionStatus();
	}, [session.id, session.costPerSession, session.signedUpPlayersDetails, session.waitlistDetails, session.pendingPlayersDetails]);

	const handleRefund = async (playerId: string, playerName: string) => {
		if (!confirm(`Are you sure you want to issue a refund to ${playerName}? This action cannot be undone.`)) {
			return;
		}

		setProcessingPlayerId(playerId);
		setError(null);
		setSuccess(null);

		try {
			const response = await fetch("/api/stripe/refund", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					campaignId: session.id,
					playerId,
					reason: "Refund issued by host",
				}),
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.error || "Failed to process refund");
			}

			setSuccess(`Refund issued successfully to ${playerName}`);
			if (onRefund) {
				onRefund();
			}
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to process refund");
		} finally {
			setProcessingPlayerId(null);
		}
	};

	const allPlayers = [
		...session.signedUpPlayersDetails,
		...session.waitlistDetails,
		...session.pendingPlayersDetails,
	];

	return (
		<div className="rounded-lg border border-slate-800 bg-slate-950/40 p-4">
			{error && (
				<div className="mb-3 rounded-md border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400">
					{error}
				</div>
			)}

			{success && (
				<div className="mb-3 rounded-md border border-green-500/20 bg-green-500/10 p-3 text-sm text-green-400">
					{success}
				</div>
			)}

			<div className="flex items-start justify-between gap-4">
				<div className="flex-1">
					<Link
						href={`/campaigns/${session.id}`}
						className="text-lg font-medium text-slate-100 hover:text-sky-300 transition-colors"
					>
						{session.game}
					</Link>
					<div className="mt-2 space-y-1 text-sm text-slate-400">
						<p>
							<span className="text-slate-500">Date:</span>{" "}
							{formatDateInTimezone(session.date, userTimezone)}
						</p>
						<p>
							<span className="text-slate-500">Times:</span> {session.times.join(", ")}
						</p>
						<p>
							<span className="text-slate-500">Players:</span>{" "}
							{session.signedUpPlayersDetails.length} / {session.maxPlayers}
						</p>
						{session.costPerSession && session.costPerSession > 0 && (
							<p>
								<span className="text-slate-500">Cost:</span> ${session.costPerSession}/session
							</p>
						)}
					</div>
				</div>
			</div>

			{allPlayers.length > 0 && (
				<div className="mt-4 space-y-2">
					<h4 className="text-sm font-medium text-slate-300">Players</h4>
					<div className="space-y-2">
						{session.signedUpPlayersDetails.map((player) => (
							<div
								key={player.id}
								className="flex items-center justify-between rounded-md border border-slate-700 bg-slate-800/50 p-3"
							>
								<div className="flex items-center gap-3">
									{player.avatarUrl && (
										<img
											src={player.avatarUrl}
											alt={`${player.name}'s avatar`}
											className="h-8 w-8 rounded-full"
										/>
									)}
									<div>
										<Link
											href={`/user/${player.id}`}
											className="text-sm font-medium text-slate-200 hover:text-sky-300 transition-colors"
										>
											{player.name}
										</Link>
										<p className="text-xs text-green-400">Signed Up</p>
									</div>
								</div>
								{playerSubscriptions[player.id] && (
									<button
										onClick={() => handleRefund(player.id, player.name)}
										disabled={processingPlayerId === player.id}
										className="rounded-md bg-red-600 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
									>
										{processingPlayerId === player.id ? "Processing..." : "Refund"}
									</button>
								)}
							</div>
						))}

						{session.waitlistDetails.map((player) => (
							<div
								key={player.id}
								className="flex items-center justify-between rounded-md border border-slate-700 bg-slate-800/50 p-3"
							>
								<div className="flex items-center gap-3">
									{player.avatarUrl && (
										<img
											src={player.avatarUrl}
											alt={`${player.name}'s avatar`}
											className="h-8 w-8 rounded-full"
										/>
									)}
									<div>
										<Link
											href={`/user/${player.id}`}
											className="text-sm font-medium text-slate-200 hover:text-sky-300 transition-colors"
										>
											{player.name}
										</Link>
										<p className="text-xs text-yellow-400">Waitlisted</p>
									</div>
								</div>
								{playerSubscriptions[player.id] && (
									<button
										onClick={() => handleRefund(player.id, player.name)}
										disabled={processingPlayerId === player.id}
										className="rounded-md bg-red-600 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
									>
										{processingPlayerId === player.id ? "Processing..." : "Refund"}
									</button>
								)}
							</div>
						))}

						{session.pendingPlayersDetails.map((player) => (
							<div
								key={player.id}
								className="flex items-center justify-between rounded-md border border-slate-700 bg-slate-800/50 p-3"
							>
								<div className="flex items-center gap-3">
									{player.avatarUrl && (
										<img
											src={player.avatarUrl}
											alt={`${player.name}'s avatar`}
											className="h-8 w-8 rounded-full"
										/>
									)}
									<div>
										<Link
											href={`/user/${player.id}`}
											className="text-sm font-medium text-slate-200 hover:text-sky-300 transition-colors"
										>
											{player.name}
										</Link>
										<p className="text-xs text-slate-400">Pending</p>
									</div>
								</div>
								{playerSubscriptions[player.id] && (
									<button
										onClick={() => handleRefund(player.id, player.name)}
										disabled={processingPlayerId === player.id}
										className="rounded-md bg-red-600 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
									>
										{processingPlayerId === player.id ? "Processing..." : "Refund"}
									</button>
								)}
							</div>
						))}
					</div>
				</div>
			)}

			{allPlayers.length === 0 && (
				<div className="mt-4 text-sm text-slate-500">
					No players have signed up yet.
				</div>
			)}
		</div>
	);
}
