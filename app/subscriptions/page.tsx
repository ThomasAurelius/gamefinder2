"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

type Subscription = {
	id: string;
	status: string;
	campaignId: string | null;
	campaignName: string;
	amount: number;
	currency: string;
	interval: string;
	currentPeriodStart: number | undefined;
	currentPeriodEnd: number | undefined;
	cancelAtPeriodEnd: boolean;
	canceledAt: number | null;
	created: number | undefined;
};

export default function SubscriptionsPage() {
	const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [isRedirecting, setIsRedirecting] = useState(false);
	const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());

	useEffect(() => {
		const fetchSubscriptions = async () => {
			try {
				setIsLoading(true);
				const response = await fetch("/api/stripe/list-subscriptions");
				
				if (!response.ok) {
					throw new Error("Failed to fetch subscriptions");
				}

				const data = await response.json();
				setSubscriptions(data.subscriptions || []);
			} catch (err) {
				setError(err instanceof Error ? err.message : "Failed to load subscriptions");
			} finally {
				setIsLoading(false);
			}
		};

		fetchSubscriptions();
	}, []);

	const handleManageSubscription = async () => {
		try {
			setIsRedirecting(true);
			setError(null);

			const response = await fetch("/api/stripe/create-portal-session", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					returnUrl: `${window.location.origin}/subscriptions`,
				}),
			});

			if (!response.ok) {
				throw new Error("Failed to create portal session");
			}

			const data = await response.json();
			
			// Redirect to Stripe Customer Portal
			window.location.href = data.url;
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to open billing portal");
			setIsRedirecting(false);
		}
	};

	const handleDeleteSubscription = async (subscriptionId: string) => {
		if (!confirm("Are you sure you want to delete this incomplete subscription?")) {
			return;
		}

		try {
			setDeletingIds(prev => new Set(prev).add(subscriptionId));
			setError(null);

			const response = await fetch("/api/stripe/delete-incomplete-subscription", {
				method: "DELETE",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ subscriptionId }),
			});

			if (!response.ok) {
				const data = await response.json();
				throw new Error(data.error || "Failed to delete subscription");
			}

			// Remove the subscription from the list
			setSubscriptions(prev => prev.filter(sub => sub.id !== subscriptionId));
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to delete subscription");
		} finally {
			setDeletingIds(prev => {
				const next = new Set(prev);
				next.delete(subscriptionId);
				return next;
			});
		}
	};

	const isIncomplete = (status: string) => {
		return status === "incomplete" || status === "incomplete_expired";
	};

	const formatDate = (timestamp: number | null | undefined) => {
		if (timestamp === null || timestamp === undefined || timestamp === 0) {
			return "N/A";
		}
		const date = new Date(timestamp * 1000);
		if (isNaN(date.getTime())) {
			return "Invalid Date";
		}
		return date.toLocaleDateString("en-US", {
			year: "numeric",
			month: "long",
			day: "numeric",
		});
	};

	const getStatusColor = (status: string) => {
		switch (status) {
			case "active":
				return "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
			case "canceled":
				return "text-slate-400 bg-slate-500/10 border-slate-500/20";
			case "incomplete_expired":
				return "text-red-400 bg-red-500/10 border-red-500/20";
			case "incomplete":
				return "text-orange-400 bg-orange-500/10 border-orange-500/20";
			case "past_due":
				return "text-amber-400 bg-amber-500/10 border-amber-500/20";
			case "trialing":
				return "text-sky-400 bg-sky-500/10 border-sky-500/20";
			default:
				return "text-slate-400 bg-slate-500/10 border-slate-500/20";
		}
	};

	const getStatusLabel = (status: string) => {
		return status.charAt(0).toUpperCase() + status.slice(1).replace(/_/g, " ");
	};

	if (isLoading) {
		return (
			<section className="space-y-4">
				<h1 className="text-2xl font-semibold">My Subscriptions</h1>
				<div className="rounded-xl border border-slate-800 bg-slate-950/40 p-8 text-slate-300">
					Loading your subscriptions...
				</div>
			</section>
		);
	}

	return (
		<section className="space-y-4">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-semibold">My Subscriptions</h1>
					<p className="mt-1 text-sm text-slate-400">
						Manage your active campaign subscriptions
					</p>
				</div>
				{subscriptions.length > 0 && (
					<button
						onClick={handleManageSubscription}
						disabled={isRedirecting}
						className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-50"
					>
						{isRedirecting ? "Opening Portal..." : "Manage All Subscriptions"}
					</button>
				)}
			</div>

			{error && (
				<div className="rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-200">
					{error}
				</div>
			)}

			<div className="space-y-4 rounded-2xl border border-slate-800/60 bg-slate-900/40 p-6 shadow-lg shadow-slate-900/30">
				{subscriptions.length === 0 ? (
					<div className="space-y-4 py-8 text-center">
						<div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-slate-700 bg-slate-800/50">
							<svg
								className="h-8 w-8 text-slate-500"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
								/>
							</svg>
						</div>
						<div>
							<p className="text-lg font-medium text-slate-200">
								No Active Subscriptions
							</p>
							<p className="mt-2 text-sm text-slate-400">
								You don&apos;t have any active campaign subscriptions yet.
							</p>
						</div>
						<Link
							href="/find-campaigns"
							className="inline-block rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-sky-700"
						>
							Browse Campaigns
						</Link>
					</div>
				) : (
					<div className="space-y-4">
						{subscriptions.map((subscription) => (
							<div
								key={subscription.id}
								className="rounded-lg border border-slate-700/50 bg-slate-800/30 p-4"
							>
								<div className="flex items-start justify-between">
									<div className="flex-1">
										<div className="flex items-center gap-3">
											<h3 className="text-lg font-medium text-slate-100">
												{subscription.campaignName}
											</h3>
											<span
												className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${getStatusColor(subscription.status)}`}
											>
												{getStatusLabel(subscription.status)}
											</span>
										</div>
										
										<div className="mt-3 grid gap-2 text-sm text-slate-400 sm:grid-cols-2">
											<div>
												<span className="text-slate-500">Amount:</span>{" "}
												<span className="font-medium text-slate-300">
													${subscription.amount.toFixed(2)}/{subscription.interval}
												</span>
											</div>
											<div>
												<span className="text-slate-500">Next billing:</span>{" "}
												<span className="font-medium text-slate-300">
													{subscription.cancelAtPeriodEnd
														? "Canceling"
														: formatDate(subscription.currentPeriodEnd)}
												</span>
											</div>
											<div>
												<span className="text-slate-500">Started:</span>{" "}
												<span className="text-slate-300">
													{formatDate(subscription.created)}
												</span>
											</div>
											{subscription.canceledAt && (
												<div>
													<span className="text-slate-500">Canceled:</span>{" "}
													<span className="text-slate-300">
														{formatDate(subscription.canceledAt)}
													</span>
												</div>
											)}
										</div>

										{subscription.cancelAtPeriodEnd && (
											<div className="mt-3 rounded-md border border-amber-500/20 bg-amber-500/10 px-3 py-2 text-xs text-amber-400">
												This subscription will end on{" "}
												{formatDate(subscription.currentPeriodEnd)}
											</div>
										)}

										{isIncomplete(subscription.status) && (
											<div className="mt-3 rounded-md border border-orange-500/20 bg-orange-500/10 px-3 py-2 text-xs text-orange-400">
												This subscription was not completed. You can safely delete it.
											</div>
										)}
									</div>
								</div>

								<div className="mt-4 flex gap-2">
									{subscription.campaignId && (
										<Link
											href={`/campaigns/${subscription.campaignId}`}
											className="rounded-lg border border-slate-700 bg-slate-800/50 px-3 py-1.5 text-xs font-medium text-slate-300 transition hover:border-sky-500 hover:text-sky-400"
										>
											View Campaign
										</Link>
									)}
									{isIncomplete(subscription.status) ? (
										<button
											onClick={() => handleDeleteSubscription(subscription.id)}
											disabled={deletingIds.has(subscription.id)}
											className="rounded-lg border border-red-700 bg-red-800/50 px-3 py-1.5 text-xs font-medium text-red-300 transition hover:border-red-500 hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-50"
										>
											{deletingIds.has(subscription.id) ? "Deleting..." : "Delete"}
										</button>
									) : (
										<button
											onClick={handleManageSubscription}
											disabled={isRedirecting}
											className="rounded-lg border border-slate-700 bg-slate-800/50 px-3 py-1.5 text-xs font-medium text-slate-300 transition hover:border-sky-500 hover:text-sky-400 disabled:cursor-not-allowed disabled:opacity-50"
										>
											Manage
										</button>
									)}
								</div>
							</div>
						))}
					</div>
				)}
			</div>
		</section>
	);
}
