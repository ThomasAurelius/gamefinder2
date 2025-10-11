"use client";

import { useState, useEffect } from "react";

type PaymentInfo = {
	playerId: string;
	type: "subscription" | "one_time";
	subscriptionId?: string;
	paymentIntentId?: string;
	status: string;
	amount: number;
	currency: string;
	created: number;
	cancelAtPeriodEnd?: boolean;
};

type PlayerWithPayment = {
	playerId: string;
	playerName: string;
	avatarUrl?: string;
	payments: PaymentInfo[];
};

type CampaignRefundManagerProps = {
	campaignId: string;
	playerIds: string[];
	onRefundIssued?: () => void;
};

export default function CampaignRefundManager({
	campaignId,
	playerIds,
	onRefundIssued,
}: CampaignRefundManagerProps) {
	const [playersWithPayments, setPlayersWithPayments] = useState<PlayerWithPayment[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [processingPlayerId, setProcessingPlayerId] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState<string | null>(null);

	useEffect(() => {
		fetchPayments();
	}, [campaignId, playerIds]);

	const fetchPayments = async () => {
		setIsLoading(true);
		setError(null);

		try {
			const response = await fetch(
				`/api/stripe/campaign-payments?campaignId=${campaignId}`
			);

			if (!response.ok) {
				throw new Error("Failed to fetch payment information");
			}

			const data = await response.json();

			// Group payments by player
			const playerMap = new Map<string, PlayerWithPayment>();

			for (const payment of data.payments || []) {
				if (!playerMap.has(payment.playerId)) {
					playerMap.set(payment.playerId, {
						playerId: payment.playerId,
						playerName: "Loading...",
						payments: [],
					});
				}

				playerMap.get(payment.playerId)!.payments.push(payment);
			}

			// Fetch all player info in a single batch request
			const playerIdsToFetch = Array.from(playerMap.keys());
			if (playerIdsToFetch.length > 0) {
				const usersResponse = await fetch("/api/users/batch", {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({ userIds: playerIdsToFetch }),
				});

				if (usersResponse.ok) {
					const usersData = await usersResponse.json();
					
					// Update player names and avatars
					for (const [playerId, playerInfo] of playerMap.entries()) {
						const userData = usersData[playerId];
						if (userData) {
							playerInfo.playerName = userData.name || "Unknown Player";
							playerInfo.avatarUrl = userData.avatarUrl;
						} else {
							playerInfo.playerName = "Unknown Player";
						}
					}
				}
			}

			setPlayersWithPayments(Array.from(playerMap.values()));
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to load payments");
		} finally {
			setIsLoading(false);
		}
	};

	const handleRefund = async (
		playerId: string,
		subscriptionId?: string,
		paymentType?: string
	) => {
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
					campaignId,
					playerId,
					subscriptionId,
					reason: "Campaign canceled by host",
				}),
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.error || "Failed to process refund");
			}

			setSuccess(
				data.message ||
					(paymentType === "subscription"
						? "Subscription canceled and refund issued successfully"
						: "Refund issued successfully")
			);

			// Refresh payment data
			await fetchPayments();

			if (onRefundIssued) {
				onRefundIssued();
			}
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to process refund");
		} finally {
			setProcessingPlayerId(null);
		}
	};

	if (isLoading) {
		return (
			<div className="bg-slate-800 rounded-lg p-6">
				<h3 className="text-lg font-medium text-slate-200 mb-4">
					Player Payments
				</h3>
				<p className="text-slate-400">Loading payment information...</p>
			</div>
		);
	}

	if (playersWithPayments.length === 0) {
		return (
			<div className="bg-slate-800 rounded-lg p-6">
				<h3 className="text-lg font-medium text-slate-200 mb-4">
					Player Payments
				</h3>
				<p className="text-slate-400">
					No payments found for this campaign.
				</p>
			</div>
		);
	}

	return (
		<div className="bg-slate-800 rounded-lg p-6">
			<h3 className="text-lg font-medium text-slate-200 mb-4">
				Player Payments & Refunds
			</h3>

			{error && (
				<div className="mb-4 p-4 bg-red-900/20 border border-red-800 rounded-md">
					<p className="text-red-300 text-sm">{error}</p>
				</div>
			)}

			{success && (
				<div className="mb-4 p-4 bg-green-900/20 border border-green-800 rounded-md">
					<p className="text-green-300 text-sm">{success}</p>
				</div>
			)}

			<div className="space-y-4">
				{playersWithPayments.map((player) => (
					<div
						key={player.playerId}
						className="bg-slate-700 rounded-lg p-4 space-y-3"
					>
						<div className="flex items-center gap-3">
							{player.avatarUrl && (
								<img
									src={player.avatarUrl}
									alt={player.playerName}
									className="w-10 h-10 rounded-full"
								/>
							)}
							<h4 className="text-slate-200 font-medium">
								{player.playerName}
							</h4>
						</div>

						<div className="space-y-2">
							{player.payments.map((payment, idx) => (
								<div
									key={idx}
									className="flex items-center justify-between bg-slate-600 rounded-md p-3"
								>
									<div className="flex-1">
										<div className="text-slate-200 font-medium">
											{payment.type === "subscription"
												? "Subscription"
												: "One-Time Payment"}
										</div>
										<div className="text-slate-400 text-sm">
											{/* Amount is already converted from cents to dollars by the API */}
											${payment.amount.toFixed(2)}{" "}
											{payment.currency.toUpperCase()} -{" "}
											{payment.status}
										</div>
										{payment.type === "subscription" &&
											payment.cancelAtPeriodEnd && (
												<div className="text-amber-400 text-sm">
													Canceling at period end
												</div>
											)}
									</div>

									<button
										onClick={() =>
											handleRefund(
												player.playerId,
												payment.subscriptionId,
												payment.type
											)
										}
										disabled={
											processingPlayerId === player.playerId ||
											payment.status === "canceled" ||
											payment.status === "incomplete" ||
											(payment.type === "subscription" && payment.status !== "active")
										}
										className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
									>
										{processingPlayerId === player.playerId
											? "Processing..."
											: payment.status === "canceled"
												? "Already Canceled"
												: "Issue Refund"}
									</button>
								</div>
							))}
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
