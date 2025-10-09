"use client";

export default function BggMarketplacePage() {
	return (
		<section className="space-y-6">
			<header className="space-y-2">
				<div className="flex items-center gap-3">
					<h1 className="text-3xl font-semibold tracking-tight text-slate-100">
						BGG Marketplace
					</h1>
					<a
						href="https://boardgamegeek.com/geekmarket"
						target="_blank"
						rel="noopener noreferrer"
						className="text-sm text-sky-400 hover:text-sky-300"
					>
						Powered by BGG
					</a>
				</div>
				<p className="max-w-2xl text-sm text-slate-300">
					Browse and purchase board games from the BoardGameGeek marketplace.
				</p>
			</header>

			<div className="rounded-lg border border-slate-800/60 bg-slate-900/40 p-8">
				<div className="space-y-4 text-center">
					<div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-sky-500/10">
						<svg
							className="h-8 w-8 text-sky-400"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
							/>
						</svg>
					</div>
					<div className="space-y-2">
						<h2 className="text-xl font-semibold text-slate-100">
							Visit BGG Marketplace
						</h2>
						<p className="text-sm text-slate-300">
							The BoardGameGeek marketplace is available directly on their
							website. Browse thousands of games for sale, from collectors and
							retailers around the world.
						</p>
					</div>
					<div className="flex flex-col items-center gap-3 pt-4 sm:flex-row sm:justify-center">
						<a
							href="https://boardgamegeek.com/geekmarket/browse"
							target="_blank"
							rel="noopener noreferrer"
							className="inline-flex items-center gap-2 rounded-lg bg-sky-600 px-6 py-3 text-sm font-medium text-white transition hover:bg-sky-700"
						>
							<span>Browse Marketplace</span>
							<svg
								className="h-4 w-4"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
								/>
							</svg>
						</a>
						<a
							href="https://boardgamegeek.com/geekmarket/products"
							target="_blank"
							rel="noopener noreferrer"
							className="inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-800/40 px-6 py-3 text-sm font-medium text-slate-200 transition hover:bg-slate-800/60"
						>
							<span>Search Products</span>
							<svg
								className="h-4 w-4"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
								/>
							</svg>
						</a>
					</div>
				</div>
			</div>

			<div className="rounded-lg border border-slate-800/60 bg-slate-900/40 p-6">
				<h3 className="mb-4 text-lg font-semibold text-slate-100">
					Popular Categories
				</h3>
				<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
					{[
						{
							name: "Strategy Games",
							href: "https://boardgamegeek.com/geekmarket/browse?objecttype=thing&objectid=5497",
						},
						{
							name: "Party Games",
							href: "https://boardgamegeek.com/geekmarket/browse?objecttype=thing&objectid=1030",
						},
						{
							name: "Card Games",
							href: "https://boardgamegeek.com/geekmarket/browse?objecttype=thing&objectid=1002",
						},
						{
							name: "Cooperative Games",
							href: "https://boardgamegeek.com/geekmarket/browse?objecttype=thing&objectid=2023",
						},
						{
							name: "War Games",
							href: "https://boardgamegeek.com/geekmarket/browse?objecttype=thing&objectid=4664",
						},
						{
							name: "Family Games",
							href: "https://boardgamegeek.com/geekmarket/browse?objecttype=thing&objectid=5499",
						},
					].map((category) => (
						<a
							key={category.name}
							href={category.href}
							target="_blank"
							rel="noopener noreferrer"
							className="group flex items-center justify-between rounded-lg border border-slate-800 bg-slate-900/40 px-4 py-3 transition hover:border-slate-700 hover:bg-slate-900/60"
						>
							<span className="text-sm text-slate-200 group-hover:text-sky-400">
								{category.name}
							</span>
							<svg
								className="h-4 w-4 text-slate-500 group-hover:text-sky-400"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M9 5l7 7-7 7"
								/>
							</svg>
						</a>
					))}
				</div>
			</div>
		</section>
	);
}
