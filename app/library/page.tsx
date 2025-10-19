"use client";

import { useState, useEffect } from "react";
import type { BoardGame } from "@/lib/boardgames/types";
import type { UserLibrary, UserLibraryEntry } from "@/lib/boardgames/types";

export default function LibraryPage() {
	const [searchQuery, setSearchQuery] = useState("");
	const [searchResults, setSearchResults] = useState<BoardGame[]>([]);
	const [isSearching, setIsSearching] = useState(false);
	const [library, setLibrary] = useState<UserLibrary>({
		owned: [],
		wishlist: [],
	});
	const [isLoadingLibrary, setIsLoadingLibrary] = useState(true);
	const [activeTab, setActiveTab] = useState<"search" | "owned" | "wishlist">(
		"search"
	);

	useEffect(() => {
		loadLibrary();
	}, []);

	const loadLibrary = async () => {
		try {
			setIsLoadingLibrary(true);
			const response = await fetch("/api/library");
			if (response.ok) {
				const data = await response.json();
				setLibrary(data);
			}
		} catch (error) {
			console.error("Failed to load library:", error);
		} finally {
			setIsLoadingLibrary(false);
		}
	};

	const handleSearch = async () => {
		if (!searchQuery.trim()) {
			setSearchResults([]);
			return;
		}

		try {
			setIsSearching(true);
			const response = await fetch(
				`/api/boardgames?q=${encodeURIComponent(searchQuery)}&limit=50`
			);
			if (response.ok) {
				const data = await response.json();
				setSearchResults(data.games);
			}
		} catch (error) {
			console.error("Failed to search games:", error);
		} finally {
			setIsSearching(false);
		}
	};

	const handleAddToLibrary = async (
		game: BoardGame,
		type: "owned" | "wishlist"
	) => {
		try {
			const response = await fetch("/api/library", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					action: "add",
					gameId: game.id,
					gameName: game.name,
					type,
				}),
			});

			if (response.ok) {
				await loadLibrary();
			} else {
				const error = await response.json();
				alert(error.error || "Failed to add game");
			}
		} catch (error) {
			console.error("Failed to add game:", error);
			alert("Failed to add game to library");
		}
	};

	const handleRemoveFromLibrary = async (
		gameId: string,
		type: "owned" | "wishlist"
	) => {
		try {
			const response = await fetch("/api/library", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					action: "remove",
					gameId,
					gameName: "",
					type,
				}),
			});

			if (response.ok) {
				await loadLibrary();
			}
		} catch (error) {
			console.error("Failed to remove game:", error);
		}
	};

	const handleMoveGame = async (
		entry: UserLibraryEntry,
		fromType: "owned" | "wishlist",
		toType: "owned" | "wishlist"
	) => {
		try {
			const response = await fetch("/api/library", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					action: "move",
					gameId: entry.gameId,
					gameName: entry.gameName,
					fromType,
					toType,
				}),
			});

			if (response.ok) {
				await loadLibrary();
			}
		} catch (error) {
			console.error("Failed to move game:", error);
		}
	};

	const isInLibrary = (gameId: string, type: "owned" | "wishlist") => {
		return library[type].some((entry) => entry.gameId === gameId);
	};

	const handleToggleFavorite = async (
		gameId: string,
		type: "owned" | "wishlist"
	) => {
		try {
			const response = await fetch("/api/library", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					action: "toggleFavorite",
					gameId,
					gameName: "",
					type,
				}),
			});

			if (response.ok) {
				await loadLibrary();
			}
		} catch (error) {
			console.error("Failed to toggle favorite:", error);
		}
	};

	return (
		<section className="space-y-6">
			<div>
				<h1 className="text-2xl font-semibold">Board Game Library</h1>
				<p className="text-sm text-slate-300">
					Search and manage your collection of owned and wishlist games
				</p>
				<div className="mt-2 flex items-center gap-2">
					<div className="bg-white/50 p-.5 rounded-md">
						<img
							src="/powered_by_BGG_02_MED.png"
							alt="Powered by BoardGameGeek"
							className="h-[45px] w-[150px]"
							title="Powered by BoardGameGeek"
						/>
					</div>
				</div>
			</div>

			{/* Tabs */}
			<div className="flex gap-2 border-b border-slate-700">
				<button
					onClick={() => setActiveTab("search")}
					className={`px-4 py-2 font-medium transition-colors ${
						activeTab === "search"
							? "border-b-2 border-sky-500 text-sky-500"
							: "text-slate-400 hover:text-slate-200"
					}`}
				>
					Search Games
				</button>
				<button
					onClick={() => setActiveTab("owned")}
					className={`px-4 py-2 font-medium transition-colors ${
						activeTab === "owned"
							? "border-b-2 border-sky-500 text-sky-500"
							: "text-slate-400 hover:text-slate-200"
					}`}
				>
					Owned ({library.owned.length})
				</button>
				<button
					onClick={() => setActiveTab("wishlist")}
					className={`px-4 py-2 font-medium transition-colors ${
						activeTab === "wishlist"
							? "border-b-2 border-sky-500 text-sky-500"
							: "text-slate-400 hover:text-slate-200"
					}`}
				>
					Wishlist ({library.wishlist.length})
				</button>
			</div>

			{/* Search Tab */}
			{activeTab === "search" && (
				<div className="space-y-4">
					<div className="flex gap-2">
						<input
							type="text"
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							onKeyDown={(e) => e.key === "Enter" && handleSearch()}
							placeholder="Search for board games..."
							className="flex-1 rounded-lg border border-slate-700 bg-slate-900 px-4 py-2 text-slate-100 placeholder:text-slate-500 focus:border-sky-500 focus:outline-none"
						/>
						<button
							onClick={handleSearch}
							disabled={isSearching}
							className="rounded-lg bg-sky-600 px-6 py-2 font-medium text-white hover:bg-sky-700 disabled:opacity-50"
						>
							{isSearching ? "Searching..." : "Search"}
						</button>
					</div>

					{searchResults.length > 0 && (
						<div className="space-y-2">
							<h2 className="text-lg font-semibold">Search Results</h2>
							<div className="space-y-2">
								{searchResults.map((game) => (
									<div
										key={game.id}
										className="rounded-lg border border-slate-800 bg-slate-900/70 p-4"
									>
										<div className="flex items-start justify-between gap-4">
											<div className="flex-1">
												<h3 className="font-semibold text-slate-100">
													{game.name}
												</h3>
												<div className="mt-1 flex flex-wrap gap-3 text-sm text-slate-400">
													{game.yearpublished && (
														<span>
															Year: {game.yearpublished}
														</span>
													)}
													{game.rank > 0 && (
														<span>Rank: #{game.rank}</span>
													)}
													{game.average > 0 && (
														<span>
															Rating: {game.average.toFixed(2)}
														</span>
													)}
													{game.usersrated > 0 && (
														<span>
															({game.usersrated.toLocaleString()}{" "}
															ratings)
														</span>
													)}
												</div>
											</div>
											<div className="flex gap-2">
												<button
													onClick={() =>
														handleAddToLibrary(game, "owned")
													}
													disabled={isInLibrary(game.id, "owned")}
													className="rounded bg-green-600 px-3 py-1 text-sm font-medium text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
													title={
														isInLibrary(game.id, "owned")
															? "Already in owned"
															: "Add to owned"
													}
												>
													{isInLibrary(game.id, "owned")
														? "✓ Owned"
														: "+ Own"}
												</button>
												<button
													onClick={() =>
														handleAddToLibrary(game, "wishlist")
													}
													disabled={isInLibrary(
														game.id,
														"wishlist"
													)}
													className="rounded bg-yellow-600 px-3 py-1 text-sm font-medium text-white hover:bg-yellow-700 disabled:cursor-not-allowed disabled:opacity-50"
													title={
														isInLibrary(game.id, "wishlist")
															? "Already in wishlist"
															: "Add to wishlist"
													}
												>
													{isInLibrary(game.id, "wishlist")
														? "✓ Wish"
														: "+ Wish"}
												</button>
											</div>
										</div>
									</div>
								))}
							</div>
						</div>
					)}

					{searchQuery && searchResults.length === 0 && !isSearching && (
						<p className="text-center text-slate-400">No games found</p>
					)}
					<div className="mt-6 flex justify-center">
						<p className="text-center w-160 text-slate-400">
							Game Search is powered by a download of
							BoardGameGeek&apos;s games database. Future enhancements
							may include real-time search via BGG API, allowing you to
							bring in info from your BGG collection.
						</p>
					</div>
				</div>
			)}

			{/* Owned Tab */}
			{activeTab === "owned" && (
				<div className="space-y-4">
					<h2 className="text-lg font-semibold">Your Owned Games</h2>
					{isLoadingLibrary ? (
						<p className="text-slate-400">Loading...</p>
					) : library.owned.length > 0 ? (
						<div className="space-y-2">
							{[...library.owned]
								.sort((a, b) => {
									// Sort favorites first
									if (a.isFavorite && !b.isFavorite) return -1;
									if (!a.isFavorite && b.isFavorite) return 1;
									// Then by addedAt (newest first)
									return (
										new Date(b.addedAt).getTime() -
										new Date(a.addedAt).getTime()
									);
								})
								.map((entry) => (
									<div
										key={entry.gameId}
										className="rounded-lg border border-slate-800 bg-slate-900/70 p-4"
									>
										<div className="flex items-center justify-between">
											<div className="flex items-center gap-3">
												<button
													onClick={() =>
														handleToggleFavorite(
															entry.gameId,
															"owned"
														)
													}
													className="text-2xl hover:scale-110 transition-transform"
													title={
														entry.isFavorite
															? "Remove from favorites"
															: "Add to favorites"
													}
												>
													{entry.isFavorite ? "⭐" : "☆"}
												</button>
												<div>
													<h3 className="font-semibold text-slate-100">
														{entry.gameName}
													</h3>
													<p className="text-sm text-slate-400">
														Added:{" "}
														{new Date(
															entry.addedAt
														).toLocaleDateString()}
													</p>
												</div>
											</div>
											<div className="flex gap-2">
												<button
													onClick={() =>
														handleMoveGame(
															entry,
															"owned",
															"wishlist"
														)
													}
													className="rounded bg-yellow-600 px-3 py-1 text-sm font-medium text-white hover:bg-yellow-700"
													title="Move to wishlist"
												>
													→ Wish
												</button>
												<button
													onClick={() =>
														handleRemoveFromLibrary(
															entry.gameId,
															"owned"
														)
													}
													className="rounded bg-red-600 px-3 py-1 text-sm font-medium text-white hover:bg-red-700"
												>
													Remove
												</button>
											</div>
										</div>
									</div>
								))}
						</div>
					) : (
						<p className="text-center text-slate-400">
							No owned games yet. Search and add games to your
							collection!
						</p>
					)}
				</div>
			)}

			{/* Wishlist Tab */}
			{activeTab === "wishlist" && (
				<div className="space-y-4">
					<h2 className="text-lg font-semibold">Your Wishlist</h2>
					{isLoadingLibrary ? (
						<p className="text-slate-400">Loading...</p>
					) : library.wishlist.length > 0 ? (
						<div className="space-y-2">
							{[...library.wishlist]
								.sort((a, b) => {
									// Sort favorites first
									if (a.isFavorite && !b.isFavorite) return -1;
									if (!a.isFavorite && b.isFavorite) return 1;
									// Then by addedAt (newest first)
									return (
										new Date(b.addedAt).getTime() -
										new Date(a.addedAt).getTime()
									);
								})
								.map((entry) => (
									<div
										key={entry.gameId}
										className="rounded-lg border border-slate-800 bg-slate-900/70 p-4"
									>
										<div className="flex items-center justify-between">
											<div className="flex items-center gap-3">
												<button
													onClick={() =>
														handleToggleFavorite(
															entry.gameId,
															"wishlist"
														)
													}
													className="text-2xl hover:scale-110 transition-transform"
													title={
														entry.isFavorite
															? "Remove from favorites"
															: "Add to favorites"
													}
												>
													{entry.isFavorite ? "⭐" : "☆"}
												</button>
												<div>
													<h3 className="font-semibold text-slate-100">
														{entry.gameName}
													</h3>
													<p className="text-sm text-slate-400">
														Added:{" "}
														{new Date(
															entry.addedAt
														).toLocaleDateString()}
													</p>
												</div>
											</div>
											<div className="flex gap-2">
												<button
													onClick={() =>
														handleMoveGame(
															entry,
															"wishlist",
															"owned"
														)
													}
													className="rounded bg-green-600 px-3 py-1 text-sm font-medium text-white hover:bg-green-700"
													title="Move to owned"
												>
													→ Own
												</button>
												<button
													onClick={() =>
														handleRemoveFromLibrary(
															entry.gameId,
															"wishlist"
														)
													}
													className="rounded bg-red-600 px-3 py-1 text-sm font-medium text-white hover:bg-red-700"
												>
													Remove
												</button>
											</div>
										</div>
									</div>
								))}
						</div>
					) : (
						<p className="text-center text-slate-400">
							No games in your wishlist yet. Search and add games you
							want!
						</p>
					)}
				</div>
			)}
		</section>
	);
}
