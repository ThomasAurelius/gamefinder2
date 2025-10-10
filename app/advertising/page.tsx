import Link from "next/link";

export default function AdvertisingPage() {
	return (
		<div className="mx-auto max-w-4xl px-4 py-12">
			<div className="space-y-8">
				<div>
					<h1 className="text-3xl font-bold text-slate-100">
						Advertising on The Gathering Call
					</h1>
					<p className="mt-2 text-slate-400">
						Reach your target audience of tabletop gaming enthusiasts with our location-based advertising platform.
					</p>
				</div>

				{/* Overview Section */}
				<section className="rounded-xl border border-slate-800/60 bg-slate-900/40 p-6">
					<h2 className="text-2xl font-semibold text-slate-100 mb-4">
						Advertising Capabilities
					</h2>
					<p className="text-slate-300 mb-4">
						The Gathering Call offers a powerful advertising platform designed specifically for reaching 
						tabletop gaming communities. Our location-based advertising ensures your message reaches the 
						right audience at the right place.
					</p>
					<div className="rounded-lg border border-sky-700/50 bg-sky-900/20 p-4">
						<h3 className="text-sm font-medium text-sky-200 mb-2">
							Key Features
						</h3>
						<ul className="space-y-2 text-sm text-slate-300">
							<li className="flex items-start gap-2">
								<span className="text-sky-400 mt-1">•</span>
								<span><strong>2:1 Aspect Ratio Images:</strong> Professional banner format (800x400px recommended) that auto-scales for mobile devices</span>
							</li>
							<li className="flex items-start gap-2">
								<span className="text-sky-400 mt-1">•</span>
								<span><strong>Location-Based Targeting:</strong> Ads are shown to users within 50 miles of your specified zip code</span>
							</li>
							<li className="flex items-start gap-2">
								<span className="text-sky-400 mt-1">•</span>
								<span><strong>Smart Competition Handling:</strong> If multiple ads target the same area, the geographically closest ad is shown to each user</span>
							</li>
							<li className="flex items-start gap-2">
								<span className="text-sky-400 mt-1">•</span>
								<span><strong>Clickable Ads:</strong> Include a URL that opens in a new window when users click your advertisement</span>
							</li>
							<li className="flex items-start gap-2">
								<span className="text-sky-400 mt-1">•</span>
								<span><strong>Performance Tracking:</strong> Track unique impressions (per user per hour) and total clicks on your advertisement</span>
							</li>
						</ul>
					</div>
				</section>

				{/* How It Works */}
				<section className="rounded-xl border border-slate-800/60 bg-slate-900/40 p-6">
					<h2 className="text-2xl font-semibold text-slate-100 mb-4">
						How It Works
					</h2>
					<div className="space-y-4 text-slate-300">
						<div>
							<h3 className="text-lg font-medium text-slate-200 mb-2">
								1. Geographic Targeting
							</h3>
							<p className="text-sm">
								Specify a zip code for your advertisement, and it will be shown to all users within 
								a 50-mile radius of that location. This ensures your ad reaches local gamers who are 
								most likely to engage with your business or event.
							</p>
						</div>
						
						<div>
							<h3 className="text-lg font-medium text-slate-200 mb-2">
								2. Automatic Optimization
							</h3>
							<p className="text-sm">
								When multiple advertisements compete for the same audience, our system automatically 
								prioritizes showing the closest advertisement to each user. This ensures the most 
								relevant local content is displayed.
							</p>
						</div>
						
						<div>
							<h3 className="text-lg font-medium text-slate-200 mb-2">
								3. Responsive Design
							</h3>
							<p className="text-sm">
								Your 2:1 aspect ratio image automatically scales to fit any device, from mobile phones 
								to desktop computers. On mobile devices (under 900px width), ads scale to 90% of screen 
								width for optimal viewing.
							</p>
						</div>

						<div>
							<h3 className="text-lg font-medium text-slate-200 mb-2">
								4. Click-Through Actions
							</h3>
							<p className="text-sm">
								Add a URL to your advertisement to drive traffic to your website, event page, or online store. 
								When users click your ad, they&apos;re taken to your specified URL in a new browser window.
							</p>
						</div>

						<div>
							<h3 className="text-lg font-medium text-slate-200 mb-2">
								5. Performance Analytics
							</h3>
							<p className="text-sm">
								Track the effectiveness of your advertisement with built-in analytics. Monitor unique 
								impressions (counted once per user per hour) and total clicks to measure engagement 
								and adjust your strategy.
							</p>
						</div>
					</div>
				</section>

				{/* Placement & Visibility */}
				<section className="rounded-xl border border-slate-800/60 bg-slate-900/40 p-6">
					<h2 className="text-2xl font-semibold text-slate-100 mb-4">
						Ad Placement & Visibility
					</h2>
					<p className="text-slate-300 mb-3">
						Your advertisements are prominently displayed on the most visited pages of our platform:
					</p>
					<ul className="space-y-2 text-sm text-slate-300 mb-4">
						<li className="flex items-start gap-2">
							<span className="text-sky-400">✓</span>
							<span><strong>Find Games:</strong> Where users search for one-shot gaming sessions</span>
						</li>
						<li className="flex items-start gap-2">
							<span className="text-sky-400">✓</span>
							<span><strong>Find Campaigns:</strong> Where users browse ongoing campaign opportunities</span>
						</li>
						<li className="flex items-start gap-2">
							<span className="text-sky-400">✓</span>
							<span><strong>My Campaigns:</strong> User dashboard for managing their gaming activities</span>
						</li>
					</ul>
					<p className="text-sm text-slate-400 italic">
						Advertisements appear after the page header and before search sections, ensuring maximum visibility 
						without being intrusive to the user experience.
					</p>
				</section>

				{/* Ideal For */}
				<section className="rounded-xl border border-slate-800/60 bg-slate-900/40 p-6">
					<h2 className="text-2xl font-semibold text-slate-100 mb-4">
						Ideal For
					</h2>
					<div className="grid gap-4 md:grid-cols-2">
						<div className="rounded-lg border border-slate-700/50 bg-slate-950/40 p-4">
							<h3 className="text-base font-medium text-slate-200 mb-2">
								Local Game Stores
							</h3>
							<p className="text-sm text-slate-400">
								Promote in-store events, new product releases, or gaming nights to players in your area.
							</p>
						</div>
						
						<div className="rounded-lg border border-slate-700/50 bg-slate-950/40 p-4">
							<h3 className="text-base font-medium text-slate-200 mb-2">
								Gaming Conventions
							</h3>
							<p className="text-sm text-slate-400">
								Reach attendees in your convention&apos;s geographic area to boost ticket sales and awareness.
							</p>
						</div>
						
						<div className="rounded-lg border border-slate-700/50 bg-slate-950/40 p-4">
							<h3 className="text-base font-medium text-slate-200 mb-2">
								Publishers & Creators
							</h3>
							<p className="text-sm text-slate-400">
								Launch new games, supplements, or crowdfunding campaigns to an engaged tabletop audience.
							</p>
						</div>
						
						<div className="rounded-lg border border-slate-700/50 bg-slate-950/40 p-4">
							<h3 className="text-base font-medium text-slate-200 mb-2">
								Gaming Services
							</h3>
							<p className="text-sm text-slate-400">
								Advertise virtual tabletops, character tools, streaming services, or other gaming products.
							</p>
						</div>
					</div>
				</section>

				{/* Technical Specifications */}
				<section className="rounded-xl border border-slate-800/60 bg-slate-900/40 p-6">
					<h2 className="text-2xl font-semibold text-slate-100 mb-4">
						Technical Specifications
					</h2>
					<div className="space-y-3 text-sm text-slate-300">
						<div className="rounded-lg bg-slate-950/40 p-4 border border-slate-800">
							<div className="grid gap-3">
								<div className="flex justify-between">
									<span className="text-slate-400">Image Dimensions:</span>
									<span className="font-medium text-slate-200">800x400 pixels (2:1 ratio)</span>
								</div>
								<div className="flex justify-between">
									<span className="text-slate-400">File Formats:</span>
									<span className="font-medium text-slate-200">JPG, PNG, WebP, GIF</span>
								</div>
								<div className="flex justify-between">
									<span className="text-slate-400">Maximum File Size:</span>
									<span className="font-medium text-slate-200">5MB</span>
								</div>
								<div className="flex justify-between">
									<span className="text-slate-400">Geographic Range:</span>
									<span className="font-medium text-slate-200">50-mile radius from zip code</span>
								</div>
								<div className="flex justify-between">
									<span className="text-slate-400">Mobile Scaling:</span>
									<span className="font-medium text-slate-200">Auto-adjusts to 90% width on &lt;900px</span>
								</div>
								<div className="flex justify-between">
									<span className="text-slate-400">Link Behavior:</span>
									<span className="font-medium text-slate-200">Opens in new window</span>
								</div>
							</div>
						</div>
					</div>
				</section>

				{/* Get Started */}
				<section className="rounded-xl border border-sky-600/40 bg-sky-900/20 p-6 text-center">
					<h2 className="text-2xl font-semibold text-slate-100 mb-3">
						Interested in Advertising?
					</h2>
					<p className="text-slate-300 mb-6 max-w-2xl mx-auto">
						Contact us to learn more about advertising opportunities on The Gathering Call and 
						how we can help you reach the tabletop gaming community.
					</p>
					<p className="text-sm text-slate-400">
						For advertising inquiries, please reach out through our support channels.
					</p>
				</section>

				{/* Back to Home */}
				<div className="text-center">
					<Link
						href="/"
						className="inline-block text-sm text-slate-400 hover:text-slate-300 hover:underline"
					>
						← Back to Home
					</Link>
				</div>
			</div>
		</div>
	);
}
