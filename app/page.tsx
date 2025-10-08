import Image from "next/image";
import Link from "next/link";
import AnnouncementPopup from "@/components/AnnouncementPopup";

export default function HomePage() {
	return (
		<>
			<AnnouncementPopup />
			<div className="space-y-10 flex flex-col items-center py-16 text-center">
				<h1 className="text-3xl font-bold sm:text-4xl">Welcome!</h1>
				<Image
					src="/logo.png"
					alt="The Gathering Call Logo"
					width={240}
					height={240}
					className="h-60 w-auto"
				/>
				<section className="rounded-2xl border border-sky-500/20 bg-gradient-to-br from-sky-900/30 to-slate-900/50 p-8 shadow-xl max-w-2xl">
					<h2 className="text-2xl font-bold text-sky-400 mb-4">Why Choose Paid Campaigns?</h2>
					<ul className="space-y-3 text-left">
						<li className="flex items-start gap-3">
							<span className="text-sky-400 mt-1">✓</span>
							<p className="text-slate-300">
								<strong className="text-slate-100">Professional DM Experience:</strong> A dedicated Game Master brings polish and expertise that elevates your game beyond casual sessions with friends.
							</p>
						</li>
						<li className="flex items-start gap-3">
							<span className="text-sky-400 mt-1">✓</span>
							<p className="text-slate-300">
								<strong className="text-slate-100">High-Quality Sessions:</strong> Professional preparation, engaging storytelling, and consistent quality ensure memorable adventures every time.
							</p>
						</li>
						<li className="flex items-start gap-3">
							<span className="text-sky-400 mt-1">✓</span>
							<p className="text-slate-300">
								<strong className="text-slate-100">Player Accountability:</strong> Financial commitment encourages better attendance and more engaged participants, creating a reliable gaming schedule.
							</p>
						</li>
					</ul>
				</section>
				<section className="rounded-2xl border border-white/10 bg-slate-900/50 p-8 shadow-xl">
					<p className="mt-4 max-w-2xl text-base text-slate-300">
						Build your tabletop adventures, manage characters, and discover
						new games with ease. Use the navigation above to explore the
						dashboard, curate your library, or find the perfect game night.
					</p>
					<div className="mt-6 flex gap-4 justify-center">
						<Link
							href="/auth/register"
							className="rounded-md bg-indigo-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-indigo-400"
						>
							Create an Account
						</Link>
						<Link
							href="/auth/login"
							className="rounded-md border border-white/10 px-6 py-3 text-sm font-semibold text-slate-200 transition hover:bg-white/10"
						>
							Log In
						</Link>
					</div>
				</section>
				<section className="grid gap-6 sm:grid-cols-2">
					<article className="rounded-xl border border-white/5 bg-slate-900/60 p-6">
						<h2 className="text-xl font-semibold">Stay Organized</h2>
						<p className="mt-2 text-sm text-slate-300">
							Track campaigns, monitor upcoming sessions, and keep your
							group on the same page from one convenient hub.
						</p>
					</article>
					<article className="rounded-xl border border-white/5 bg-slate-900/60 p-6">
						<h2 className="text-xl font-semibold">Discover &amp; Share</h2>
						<p className="mt-2 text-sm text-slate-300">
							Browse curated game recommendations and share your favorites
							with friends in just a few clicks.
						</p>
					</article>
				</section>
			</div>
		</>
	);
}
