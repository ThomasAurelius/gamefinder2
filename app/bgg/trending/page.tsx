"use client";

import { useEffect, useState } from "react";

type BggHotItem = {
	id: string;
	rank: string;
	name: string;
	yearPublished?: string;
	thumbnail?: string;
};

export default function BggTrendingPage() {
	const [items, setItems] = useState<BggHotItem[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const fetchHotItems = async () => {
			try {
				const response = await fetch("/api/bgg/hot");
				if (!response.ok) {
					throw new Error("Failed to fetch trending items");
				}
				const data = await response.json();
				setItems(data.items || []);
			} catch (err) {
				setError(
					err instanceof Error ? err.message : "Failed to load trending items"
				);
			} finally {
				setLoading(false);
			}
		};

		fetchHotItems();
	}, []);

	return (
		<section className="space-y-6">
			<header className="space-y-2">
				<div className="flex items-center gap-3">
					<h1 className="text-3xl font-semibold tracking-tight text-slate-100">
						Trending on BoardGameGeek
					</h1>
					<a
						href="https://boardgamegeek.com"
						target="_blank"
						rel="noopener noreferrer"
						className="text-sm text-sky-400 hover:text-sky-300"
					>
						Powered by BGG
					</a>
				</div>
				<p className="max-w-2xl text-sm text-slate-300">
					See what&apos;s hot on BoardGameGeek right now. These are the most
					popular games being discussed and played by the community.
				</p>
			</header>

			{loading && (
				<div className="rounded-lg border border-slate-800/60 bg-slate-900/40 p-8 text-center">
					<div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-slate-600 border-t-sky-500"></div>
					<p className="mt-4 text-sm text-slate-400">
						Loading trending games...
					</p>
				</div>
			)}

			{error && (
				<div className="rounded-lg border border-red-900/50 bg-red-950/20 p-6">
					<p className="text-sm text-red-300">{error}</p>
				</div>
			)}

			{!loading && !error && items.length === 0 && (
				<div className="rounded-lg border border-slate-800/60 bg-slate-900/40 p-8 text-center">
					<p className="text-sm text-slate-400">
						No trending items available at this time.
					</p>
				</div>
			)}

			{!loading && !error && items.length > 0 && (
				<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
					{items.map((item) => (
						<a
							key={item.id}
							href={`https://boardgamegeek.com/boardgame/${item.id}`}
							target="_blank"
							rel="noopener noreferrer"
							className="group rounded-lg border border-slate-800/60 bg-slate-900/40 p-4 transition hover:border-slate-700 hover:bg-slate-900/60"
						>
							<div className="flex gap-4">
								<div className="flex-shrink-0">
									{item.thumbnail ? (
										<img
											src={item.thumbnail}
											alt={item.name}
											className="h-20 w-20 rounded object-cover"
										/>
									) : (
										<div className="flex h-20 w-20 items-center justify-center rounded bg-slate-800 text-slate-500">
											<svg
												className="h-8 w-8"
												fill="none"
												stroke="currentColor"
												viewBox="0 0 24 24"
											>
												<path
													strokeLinecap="round"
													strokeLinejoin="round"
													strokeWidth={2}
													d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
												/>
											</svg>
										</div>
									)}
								</div>
								<div className="flex-1 space-y-1">
									<div className="flex items-start justify-between gap-2">
										<h3 className="font-medium text-slate-100 group-hover:text-sky-400">
											{item.name}
										</h3>
										<span className="flex-shrink-0 rounded-full bg-sky-500/20 px-2 py-0.5 text-xs font-medium text-sky-400">
											#{item.rank}
										</span>
									</div>
									{item.yearPublished && (
										<p className="text-xs text-slate-400">
											{item.yearPublished}
										</p>
									)}
								</div>
							</div>
						</a>
					))}
				</div>
			)}
		</section>
	);
}
