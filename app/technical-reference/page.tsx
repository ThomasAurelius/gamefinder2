import Link from "next/link";

export const metadata = {
	title: "Technical Reference | The Gathering Call",
	description:
		"High-level technical overview of The Gathering Call platform, including stack summary, integrations, and key routing metrics.",
};

const setupHighlights = [
	{
		title: "Next.js Platform",
		description:
			"App Router project running Next.js 15 with React 19, TypeScript, and Tailwind CSS for server and client rendering.",
	},
	{
		title: "MongoDB Data Layer",
		description:
			"Primary persistence for campaigns, sessions, messaging, marketplace listings, and platform metadata.",
	},
	{
		title: "Firebase Image Hosting",
		description:
			"Firebase Storage hosts images, while Firebase Auth manages identity, session tokens, and secure user onboarding for both players and hosts.",
	},
];

const apiIntegrations = [
	{
		name: "Stripe",
		details:
			"Handles payments, subscriptions, refunds, and Stripe Connect onboarding for paid campaigns and hosts.",
	},
	{
		name: "BoardGameGeek",
		details:
			"Backs the board game search endpoint (`GET /api/boardgames`) used when curating libraries, marketplace entries, links to BGG profiles and collections.",
	},
];

const pageGroups = [
	{
		title: "Public Pages",
		count: 8,
		summary:
			"Landing and discovery surfaces available without authentication.",
		routes: [
			{ label: "Home", path: "/" },
			{ label: "Find Games", path: "/find" },
			{ label: "Find Campaigns", path: "/find-campaigns" },
			{ label: "Player Search", path: "/players" },
			{ label: "Tall Tales", path: "/tall-tales" },
			{ label: "Mission", path: "/mission" },
			{ label: "Advertising", path: "/advertising" },
			{ label: "Ambassador Program", path: "/ambassador" },
		],
	},
	{
		title: "User Pages",
		count: 9,
		summary:
			"Authenticated user dashboards, profile management, and collaboration tools.",
		routes: [
			{ label: "Dashboard", path: "/dashboard" },
			{ label: "Profile", path: "/profile" },
			{ label: "Public Profile", path: "/public/profiles/[username]" },
			{ label: "Settings", path: "/settings" },
			{ label: "My Campaigns", path: "/my-campaigns" },
			{ label: "Messages", path: "/messages" },
			{ label: "Library", path: "/library" },
			{ label: "Characters", path: "/characters" },
			{ label: "Subscriptions", path: "/subscriptions" },
		],
	},
	{
		title: "Game Management",
		count: 8,
		summary: "Campaign and one-shot configuration, editing, and payments.",
		routes: [
			{ label: "Post Game", path: "/post" },
			{ label: "Post Campaign", path: "/post-campaign" },
			{ label: "Game Details", path: "/games/[id]" },
			{ label: "Campaign Details", path: "/campaigns/[id]" },
			{ label: "Edit Game", path: "/games/[id]/edit" },
			{ label: "Edit Campaign", path: "/campaigns/[id]/edit" },
			{ label: "Game Payment", path: "/games/[id]/payment" },
			{ label: "Campaign Payment", path: "/campaigns/[id]/payment" },
		],
	},
	{
		title: "Host Features",
		count: 2,
		summary:
			"Stripe Connect onboarding and earnings visibility for professional hosts.",
		routes: [
			{ label: "Host Dashboard", path: "/host/dashboard" },
			{ label: "Host Onboarding", path: "/host/onboarding" },
		],
	},
	{
		title: "Other Features",
		count: 4,
		summary: "Ancillary growth and engagement surfaces for the community.",
		routes: [
			{ label: "Marketplace", path: "/marketplace" },
			{ label: "D&D Character Builder", path: "/dnd-character-builder" },
			{ label: "Ambassador Program", path: "/ambassador" },
			{ label: "Advertising", path: "/advertising" },
		],
	},
	{
		title: "Authentication",
		count: 3,
		summary: "Entry points into the Firebase-backed authentication flow.",
		routes: [
			{ label: "Login", path: "/auth/login" },
			{ label: "Register", path: "/auth/register" },
			{ label: "Reset Password", path: "/auth/reset-password" },
		],
	},
	{
		title: "Legal",
		count: 4,
		summary: "Policy disclosures supporting compliance and transparency.",
		routes: [
			{ label: "Privacy Policy", path: "/privacy" },
			{ label: "Terms of Service", path: "/terms" },
			{ label: "Paid Games Terms", path: "/terms-paid-games" },
			{ label: "SMS Consent", path: "/sms-consent" },
		],
	},
];

export default function TechnicalReferencePage() {
	return (
		<div className="mx-auto max-w-5xl space-y-10 py-12">
			<header className="rounded-3xl border border-white/10 bg-slate-900/60 p-8 shadow-xl">
				<p className="text-sm uppercase tracking-wide text-amber-300">
					Platform Technical Reference
				</p>
				<h1 className="mt-3 text-4xl font-bold text-slate-50">
					The Gathering Call Architecture at a Glance
				</h1>
				<p className="mt-4 text-base text-slate-300">
					A README-inspired snapshot of the stack, integrations, and
					routing surface area that powers the tabletop community
					experience.
				</p>
			</header>

			<section className="grid gap-6 md:grid-cols-3">
				{setupHighlights.map((item) => (
					<article
						key={item.title}
						className="rounded-2xl border border-amber-500/20 bg-gradient-to-br from-amber-500/10 via-purple-500/10 to-indigo-500/10 p-6"
					>
						<h2 className="text-lg font-semibold text-amber-200">
							{item.title}
						</h2>
						<p className="mt-2 text-sm text-slate-200/80">
							{item.description}
						</p>
					</article>
				))}
			</section>

			<section className="rounded-2xl border border-white/10 bg-slate-900/60 p-8 shadow-xl">
				<h2 className="text-2xl font-semibold text-slate-50">
					External APIs
				</h2>
				<p className="mt-3 text-sm text-slate-300">
					The platform integrates with specialized services for payments
					and board game data enrichment.
				</p>
				<div className="mt-6 grid gap-4 md:grid-cols-2">
					{apiIntegrations.map((api) => (
						<article
							key={api.name}
							className="rounded-xl border border-white/10 bg-slate-950/60 p-5"
						>
							<h3 className="text-lg font-semibold text-amber-200">
								{api.name}
							</h3>
							<p className="mt-2 text-sm text-slate-200/80">
								{api.details}
							</p>
						</article>
					))}
				</div>
			</section>

			<section className="rounded-2xl border border-white/10 bg-slate-900/60 p-8 shadow-xl">
				<div className="flex flex-col gap-4 md:flex-row md:items-baseline md:justify-between">
					<div>
						<h2 className="text-2xl font-semibold text-slate-50">
							Routing Surface Summary
						</h2>
						<p className="mt-2 text-sm text-slate-300">
							Derived from the primary README inventory, grouped by the
							experience type to mirror navigation expectations.
						</p>
					</div>
					<div className="rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-right">
						<p className="text-xs uppercase tracking-wide text-amber-200">
							Total Documented Routes
						</p>
						<p className="text-2xl font-semibold text-amber-100">36</p>
					</div>
				</div>

				<div className="mt-6 grid gap-5">
					{pageGroups.map((group) => (
						<article
							key={group.title}
							className="rounded-2xl border border-white/10 bg-slate-950/60 p-6"
						>
							<div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
								<div>
									<h3 className="text-xl font-semibold text-slate-100">
										{group.title}
									</h3>
									<p className="text-sm text-slate-300">
										{group.summary}
									</p>
								</div>
								<div className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-1 text-sm font-medium text-amber-100">
									{group.count} Pages
								</div>
							</div>
							<ul className="mt-4 grid gap-2 sm:grid-cols-2">
								{group.routes.map((route) => (
									<li
										key={route.path}
										className="text-sm text-slate-300"
									>
										<a href={route.path}>
											<span className="font-medium text-slate-100">
												{route.label}
											</span>
											<span className="text-slate-500">
												{" "}
												— {route.path}
											</span>
										</a>
									</li>
								))}
							</ul>
						</article>
					))}
				</div>
			</section>

			<section className="rounded-2xl border border-white/10 bg-slate-900/60 p-8 shadow-xl">
				<div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
					<div>
						<h2 className="text-2xl font-semibold text-slate-50">
							API Surface Area
						</h2>
						<p className="mt-2 text-sm text-slate-300">
							Includes authenticated, public, admin, and utility
							endpoints exposed under{" "}
							<code className="rounded bg-slate-800 px-1.5 py-0.5 text-xs">
								/api
							</code>
							.
						</p>
					</div>
					<div className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-right">
						<p className="text-xs uppercase tracking-wide text-emerald-200">
							Documented Endpoints
						</p>
						<p className="text-2xl font-semibold text-emerald-100">119</p>
					</div>
				</div>
				<p className="mt-6 text-sm text-slate-300">
					Authentication, campaign management, messaging, feedback,
					marketplace, advertisements, and auxiliary utilities are all
					surfaced through modular route handlers within the{" "}
					<code className="rounded bg-slate-800 px-1.5 py-0.5 text-xs">
						app/api
					</code>{" "}
					tree.
				</p>
			</section>

			<footer className="pt-4 text-center">
				<Link
					href="/"
					className="inline-flex items-center gap-2 rounded-full border border-amber-500/40 bg-amber-500/10 px-5 py-2 text-sm font-semibold text-amber-100 transition hover:border-amber-400 hover:bg-amber-400/20"
				>
					Return to Home
				</Link>
			</footer>
		</div>
	);
}
