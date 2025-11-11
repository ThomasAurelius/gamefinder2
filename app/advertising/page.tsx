import Link from "next/link";

function MegaphoneIcon({ className }: { className?: string }) {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="1.5"
			strokeLinecap="round"
			strokeLinejoin="round"
			className={className}
			aria-hidden="true"
		>
			<path d="m3 11 18-5v12L3 13v8H1V5h2z" />
			<path d="M11 12v9" />
		</svg>
	);
}

function TargetIcon({ className }: { className?: string }) {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="1.5"
			strokeLinecap="round"
			strokeLinejoin="round"
			className={className}
			aria-hidden="true"
		>
			<circle cx="12" cy="12" r="9" />
			<circle cx="12" cy="12" r="5" />
			<circle cx="12" cy="12" r="1" />
		</svg>
	);
}

function ChartIcon({ className }: { className?: string }) {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="1.5"
			strokeLinecap="round"
			strokeLinejoin="round"
			className={className}
			aria-hidden="true"
		>
			<path d="M3 3v18h18" />
			<rect x="7" y="12" width="3" height="6" rx="0.5" />
			<rect x="12" y="9" width="3" height="9" rx="0.5" />
			<rect x="17" y="6" width="3" height="12" rx="0.5" />
		</svg>
	);
}

const keyFeatures = [
	"4:1 Aspect Ratio Images (800x200px recommended) that auto-scale for mobile",
	"Location-Based Targeting that reaches users within 50 miles of your chosen zip code",
	"Smart competition handling so the closest ad is shown when multiple target the same area",
	"Clickable ads with a URL that opens in a new window",
	"Performance tracking for unique impressions (per user per hour) and total clicks",
];

const howItWorks = [
	{
		title: "Geographic Targeting",
		description:
			"Specify a zip code for your advertisement and it will display to players within a 50-mile radius—ideal for stores, events, and regional offerings.",
	},
	{
		title: "Automatic Optimization",
		description:
			"When campaigns overlap, The Gathering Call automatically prioritizes the ad closest to each player, ensuring the most relevant content appears first.",
	},
	{
		title: "Responsive Design",
		description:
			"Your 4:1 artwork scales seamlessly from desktop monitors to phones. On smaller screens, ads resize to 90% width for clear, legible messaging.",
	},
	{
		title: "Click-Through Actions",
		description:
			"Attach a URL to send players directly to your store, registration form, or landing page whenever they tap your banner.",
	},
	{
		title: "Performance Analytics",
		description:
			"Monitor impressions and clicks directly in the platform so you can fine-tune creatives, offers, and timing with confidence.",
	},
];

const placements = [
	{
		title: "Find Games",
		description:
			"Showcase one-shots to active players searching for a new table right now.",
	},
	{
		title: "Find Campaigns",
		description:
			"Reach long-form adventurers browsing for their next ongoing story.",
	},
	{
		title: "My Campaigns",
		description:
			"Stay in front of engaged players managing their schedules and groups.",
	},
];

const idealFor = [
	{
		title: "Local Game Stores",
		description:
			"Promote in-store events, product releases, or weekly play nights to nearby players.",
	},
	{
		title: "Gaming Conventions",
		description:
			"Drive ticket sales and highlight panels, guests, or tournaments before badges sell out.",
	},
	{
		title: "Publishers & Creators",
		description:
			"Launch new games, supplements, or crowdfunding campaigns to an audience ready to support you.",
	},
	{
		title: "Gaming Services",
		description:
			"Advertise VTT tools, streaming services, character creators, or other tabletop solutions.",
	},
];

export default function AdvertisingPage() {
	return (
		<div className="mx-auto max-w-5xl space-y-8 py-8">
			<div className="rounded-3xl border-2 border-amber-500/50 bg-gradient-to-br from-amber-600/20 via-purple-600/20 to-indigo-600/20 p-8 shadow-2xl">
				<div className="text-center space-y-4">
					<div className="flex justify-center gap-4">
						<MegaphoneIcon className="h-8 w-8 text-amber-400" />
						<TargetIcon className="h-8 w-8 text-purple-300" />
						<ChartIcon className="h-8 w-8 text-indigo-300" />
					</div>
					<h1 className="text-4xl font-bold bg-gradient-to-r from-amber-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
						Advertising on The Gathering Call
					</h1>
					<p className="text-slate-200 max-w-2xl mx-auto">
						Reach tabletop fans with location-based promotions crafted
						specifically for the adventures they love.
					</p>
				</div>
			</div>

			<section className="rounded-2xl border border-white/10 bg-slate-900/60 p-8 shadow-xl">
				<h2 className="text-2xl font-semibold text-amber-300">
					Platform Highlights
				</h2>
				<p className="mt-3 text-sm text-slate-300">
					The Gathering Call provides a dedicated advertising network
					tailored to the tabletop community. Every placement is curated to
					put your promotion in front of players and Game Masters who are
					ready to discover new experiences.
				</p>
				<ul className="mt-6 space-y-3 text-sm text-slate-200/90">
					{keyFeatures.map((feature) => (
						<li key={feature} className="flex items-start gap-3">
							<span className="mt-1 text-amber-300">•</span>
							<span>{feature}</span>
						</li>
					))}
				</ul>
			</section>

			<section className="rounded-2xl border border-white/10 bg-slate-900/60 p-8 shadow-xl">
				<h2 className="text-2xl font-semibold text-purple-300">
					How It Works
				</h2>
				<div className="mt-6 grid gap-6 md:grid-cols-2">
					{howItWorks.map((step) => (
						<div
							key={step.title}
							className="rounded-xl border border-purple-500/30 bg-purple-500/10 p-5"
						>
							<h3 className="text-lg font-semibold text-purple-100">
								{step.title}
							</h3>
							<p className="mt-2 text-sm text-slate-100/80">
								{step.description}
							</p>
						</div>
					))}
				</div>
			</section>

			<section className="rounded-2xl border border-white/10 bg-slate-900/60 p-8 shadow-xl">
				<h2 className="text-2xl font-semibold text-indigo-300">
					Where Your Ads Appear
				</h2>
				<p className="mt-3 text-sm text-slate-300">
					Ads are woven into the experience on the highest-traffic surfaces
					across The Gathering Call platform:
				</p>
				<div className="mt-6 grid gap-4 md:grid-cols-3">
					{placements.map((placement) => (
						<div
							key={placement.title}
							className="rounded-xl border border-indigo-500/30 bg-indigo-500/10 p-4"
						>
							<h3 className="text-base font-semibold text-indigo-100">
								{placement.title}
							</h3>
							<p className="mt-2 text-xs text-slate-100/80">
								{placement.description}
							</p>
						</div>
					))}
				</div>
				<p className="mt-6 text-xs text-slate-400 italic">
					Placements sit after the main header and before search tools,
					maximizing visibility without disrupting discovery.
				</p>
			</section>

			<section className="rounded-2xl border border-white/10 bg-slate-900/60 p-8 shadow-xl">
				<h2 className="text-2xl font-semibold text-amber-300">Ideal For</h2>
				<div className="mt-6 grid gap-5 md:grid-cols-2">
					{idealFor.map((item) => (
						<div
							key={item.title}
							className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-5"
						>
							<h3 className="text-base font-semibold text-amber-100">
								{item.title}
							</h3>
							<p className="mt-2 text-sm text-amber-50/80">
								{item.description}
							</p>
						</div>
					))}
				</div>
			</section>

			<section className="rounded-2xl border border-white/10 bg-slate-900/60 p-8 shadow-xl">
				<h2 className="text-2xl font-semibold text-slate-100">
					Technical Specs
				</h2>
				<div className="mt-6 grid gap-4 md:grid-cols-2">
					<div className="rounded-xl border border-white/10 bg-slate-950/60 p-5">
						<dl className="space-y-3 text-sm text-slate-200">
							<div className="flex justify-between">
								<dt className="text-slate-400">Image Dimensions</dt>
								<dd className="font-medium text-slate-100">
									800×200 (4:1)
								</dd>
							</div>
							<div className="flex justify-between">
								<dt className="text-slate-400">File Size</dt>
								<dd className="font-medium text-slate-100">
									Up to 5 MB
								</dd>
							</div>
							<div className="flex justify-between">
								<dt className="text-slate-400">Formats</dt>
								<dd className="font-medium text-slate-100">
									PNG or JPG
								</dd>
							</div>
							<div className="flex justify-between">
								<dt className="text-slate-400">Destination Links</dt>
								<dd className="font-medium text-slate-100">
									Open in a new tab
								</dd>
							</div>
						</dl>
					</div>
					<div className="rounded-xl border border-indigo-500/30 bg-indigo-500/10 p-5">
						<h3 className="text-lg font-semibold text-indigo-100">
							Pricing
						</h3>
						<p className="mt-2 text-sm text-slate-100/80">
							<strong className="text-indigo-50">
								Contact support for current pricing.
							</strong>
							. Purchase multiple locations to cover additional
							territories.
						</p>
						<ul className="mt-4 space-y-2 text-xs text-slate-100/80">
							<li>• Locations are defined by zip code</li>
							<li>• Each location covers a 50-mile radius</li>
							<li>
								• When multiple advertisers target the same area, ads
								rotate based on user proximity
							</li>
						</ul>
						<p className="mt-4 text-xs text-slate-400 italic">
							Pricing is subject to change with advance notice to current
							advertisers.
						</p>
					</div>
				</div>
			</section>

			<section className="rounded-2xl border-2 border-amber-500/50 bg-gradient-to-br from-amber-600/20 via-purple-600/20 to-indigo-600/20 p-8 text-center shadow-2xl">
				<h2 className="text-2xl font-semibold text-slate-100">
					Ready to Advertise?
				</h2>
				<p className="mt-3 text-sm text-slate-200 max-w-2xl mx-auto">
					Partner with our team to choose locations, design standout
					creatives, and launch campaigns that resonate with players.
				</p>
				<div className="mt-6 flex flex-wrap justify-center gap-4">
					<Link
						href="/support"
						className="rounded-lg border border-amber-500/50 bg-amber-500/20 px-5 py-2 text-sm font-medium text-amber-200 transition hover:bg-amber-500/30"
					>
						Contact Support
					</Link>
					<Link
						href="https://discord.gg/Nx9jPfn6Sb"
						className="rounded-lg border border-indigo-500/50 bg-indigo-500/20 px-5 py-2 text-sm font-medium text-indigo-200 transition hover:bg-indigo-500/30"
					>
						Chat on Discord
					</Link>
				</div>
			</section>
		</div>
	);
}
