import Link from "next/link";
import { notFound } from "next/navigation";
import { getGameSession } from "@/lib/games/db";
import { getUsersBasicInfo } from "@/lib/users";
import { formatDateInTimezone, DEFAULT_TIMEZONE } from "@/lib/timezone";

export default async function GameDetailPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const { id } = await params;
	const session = await getGameSession(id);

	if (!session) {
		notFound();
	}

	// Fetch user information for all players and waitlist
	const allUserIds = [
		session.userId,
		...session.signedUpPlayers,
		...session.waitlist,
	];
	const usersMap = await getUsersBasicInfo(allUserIds);

	const host = usersMap.get(session.userId);
	const signedUpPlayersList = session.signedUpPlayers
		.map((playerId) => usersMap.get(playerId))
		.filter((user) => user !== undefined);
	const waitlistPlayersList = session.waitlist
		.map((playerId) => usersMap.get(playerId))
		.filter((user) => user !== undefined);

	const isFull = session.signedUpPlayers.length >= session.maxPlayers;
	const availableSlots = session.maxPlayers - session.signedUpPlayers.length;

	return (
		<div className="mx-auto flex w-full max-w-4xl flex-col gap-8 px-4 py-8 text-slate-100">
			{/* Back link */}
			<Link
				href="/find"
				className="text-sm font-medium text-sky-300 hover:text-sky-200"
			>
				← Back to Find Games
			</Link>

			{/* Image placeholder - hidden if no image */}
			{/* TODO: Add image support in future */}
			{false && (
				<div className="aspect-video w-full overflow-hidden rounded-lg border border-slate-800 bg-slate-900/50">
					{/* Image placeholder */}
				</div>
			)}

			{/* Game title and basic info */}
			<header className="space-y-4">
				<div>
					<h1 className="text-3xl font-bold text-slate-100">
						{session.game}
					</h1>
					<p className="mt-2 text-sm uppercase tracking-wide text-slate-400">
						Game Session
					</p>
				</div>

				<div className="flex flex-wrap items-center gap-4 text-sm">
					<div className="rounded-lg border border-slate-800 bg-slate-900/70 px-4 py-2">
						<span className="block text-xs uppercase tracking-wide text-slate-400">
							Date
						</span>
						<span className="text-base font-medium text-slate-100">
							{formatDateInTimezone(session.date, DEFAULT_TIMEZONE)}
						</span>
					</div>

					<div className="rounded-lg border border-slate-800 bg-slate-900/70 px-4 py-2">
						<span className="block text-xs uppercase tracking-wide text-slate-400">
							Time Slots
						</span>
						<span className="text-base font-medium text-slate-100">
							{session.times.join(", ")}
						</span>
					</div>

					<div className="rounded-lg border border-slate-800 bg-slate-900/70 px-4 py-2">
						<span className="block text-xs uppercase tracking-wide text-slate-400">
							Players
						</span>
						<span
							className={`text-base font-medium ${isFull ? "text-orange-400" : "text-green-400"}`}
						>
							{session.signedUpPlayers.length}/{session.maxPlayers}
						</span>
					</div>
				</div>
			</header>

			{/* Description */}
			{session.description && (
				<section className="space-y-2">
					<h2 className="text-lg font-semibold text-slate-100">
						Description
					</h2>
					<p className="whitespace-pre-line text-base text-slate-200">
						{session.description}
					</p>
				</section>
			)}

			{/* Host Information */}
			<section className="space-y-3">
				<h2 className="text-lg font-semibold text-slate-100">
					Game Master
				</h2>
				<div className="rounded-lg border border-slate-800 bg-slate-900/70 p-4">
					<p className="text-base text-slate-100">
						{host ? host.name : "Unknown Host"}
					</p>
				</div>
			</section>

			{/* Signed Up Players */}
			<section className="space-y-3">
				<div className="flex items-center justify-between">
					<h2 className="text-lg font-semibold text-slate-100">
						Signed Up Players
					</h2>
					<span className="text-sm text-slate-400">
						{session.signedUpPlayers.length} / {session.maxPlayers}
					</span>
				</div>

				{signedUpPlayersList.length > 0 ? (
					<div className="space-y-2">
						{signedUpPlayersList.map((player, index) => (
							<div
								key={player.id}
								className="rounded-lg border border-slate-800 bg-slate-900/70 px-4 py-3 text-base text-slate-100"
							>
								<div className="flex items-center gap-3">
									<span className="flex h-8 w-8 items-center justify-center rounded-full bg-sky-600 text-sm font-medium">
										{index + 1}
									</span>
									<span>{player.name}</span>
								</div>
							</div>
						))}
					</div>
				) : (
					<p className="rounded-lg border border-slate-800 bg-slate-900/70 px-4 py-3 text-sm text-slate-400">
						No players signed up yet.
					</p>
				)}

				{availableSlots > 0 && (
					<p className="text-sm text-green-400">
						{availableSlots} {availableSlots === 1 ? "spot" : "spots"}{" "}
						available
					</p>
				)}
			</section>

			{/* Waitlist */}
			{(waitlistPlayersList.length > 0 || isFull) && (
				<section className="space-y-3">
					<div className="flex items-center justify-between">
						<h2 className="text-lg font-semibold text-slate-100">
							Waitlist
						</h2>
						<span className="text-sm text-slate-400">
							{waitlistPlayersList.length}{" "}
							{waitlistPlayersList.length === 1 ? "player" : "players"}
						</span>
					</div>

					{waitlistPlayersList.length > 0 ? (
						<div className="space-y-2">
							{waitlistPlayersList.map((player, index) => (
								<div
									key={player.id}
									className="rounded-lg border border-slate-800 bg-slate-900/70 px-4 py-3 text-base text-slate-100"
								>
									<div className="flex items-center gap-3">
										<span className="flex h-8 w-8 items-center justify-center rounded-full bg-yellow-600 text-sm font-medium">
											{index + 1}
										</span>
										<span>{player.name}</span>
									</div>
								</div>
							))}
						</div>
					) : (
						<p className="rounded-lg border border-slate-800 bg-slate-900/70 px-4 py-3 text-sm text-slate-400">
							No players on waitlist.
						</p>
					)}
				</section>
			)}

			{/* Game metadata */}
			<section className="rounded-lg border border-slate-800 bg-slate-900/40 p-4">
				<div className="space-y-2 text-xs text-slate-400">
					<p>
						<span className="font-medium">Created:</span>{" "}
						{new Date(session.createdAt).toLocaleString()}
					</p>
					<p>
						<span className="font-medium">Last Updated:</span>{" "}
						{new Date(session.updatedAt).toLocaleString()}
					</p>
				</div>
			</section>
		</div>
	);
}
