import Link from "next/link";

export default function SubscriptionPage() {
	return (
		<div className="mx-auto max-w-4xl px-4 py-12">
			<div className="space-y-8">
				<div>
					<h1 className="text-3xl font-bold text-slate-100">
						About Paid Game Subscriptions
					</h1>
					<p className="mt-2 text-slate-400">
						Learn about the benefits of subscribing to paid campaigns and how pricing works.
					</p>
				</div>

				{/* Benefits Section */}
				<section className="rounded-xl border border-slate-800/60 bg-slate-900/40 p-6">
					<h2 className="text-2xl font-semibold text-slate-100 mb-4">
						Why Subscribe to Paid Campaigns?
					</h2>
					<p className="text-slate-300 mb-4">
						Paid campaigns offer a premium gaming experience with dedicated Game Masters who 
						are committed to providing high-quality, professionally-run sessions.
					</p>
					<div className="space-y-4">
						<div className="rounded-lg border border-emerald-700/50 bg-emerald-900/20 p-4">
							<h3 className="text-sm font-medium text-emerald-200 mb-3">
								Key Benefits:
							</h3>
							<ul className="space-y-3 text-sm text-slate-300">
								<li className="flex items-start gap-3">
									<span className="text-emerald-400 mt-1">✓</span>
									<div>
										<strong className="text-slate-200">Professional Game Masters:</strong> Your GM 
										is compensated for their time and expertise, ensuring well-prepared, engaging sessions.
									</div>
								</li>
								<li className="flex items-start gap-3">
									<span className="text-emerald-400 mt-1">✓</span>
									<div>
										<strong className="text-slate-200">Reliable Sessions:</strong> Financial commitment 
										encourages consistent attendance and dedication from all participants.
									</div>
								</li>
								<li className="flex items-start gap-3">
									<span className="text-emerald-400 mt-1">✓</span>
									<div>
										<strong className="text-slate-200">Quality Content:</strong> GMs often invest in 
										maps, props, digital tools, and extensive preparation for paid sessions.
									</div>
								</li>
								<li className="flex items-start gap-3">
									<span className="text-emerald-400 mt-1">✓</span>
									<div>
										<strong className="text-slate-200">Committed Players:</strong> Playing alongside 
										others who are invested creates a more engaging and immersive experience.
									</div>
								</li>
								<li className="flex items-start gap-3">
									<span className="text-emerald-400 mt-1">✓</span>
									<div>
										<strong className="text-slate-200">Flexible Scheduling:</strong> Many professional 
										GMs offer multiple time slots and campaign options to fit your schedule.
									</div>
								</li>
							</ul>
						</div>
					</div>
				</section>

				{/* How Pricing Works */}
				<section className="rounded-xl border border-slate-800/60 bg-slate-900/40 p-6">
					<h2 className="text-2xl font-semibold text-slate-100 mb-4">
						How Pricing Works
					</h2>
					<div className="space-y-4 text-slate-300">
						<p className="text-sm">
							When you join a paid campaign, you pay per session. The host sets their own pricing 
							based on session length, complexity, and the value they provide.
						</p>

						<div>
							<h3 className="text-lg font-medium text-slate-200 mb-2">
								Price Breakdown
							</h3>
							<p className="text-sm mb-3">
								Your payment is split between the Game Master and the platform to cover hosting 
								costs and payment processing:
							</p>
							<div className="rounded-lg bg-slate-950/40 p-4 border border-slate-800">
								<div className="space-y-3 text-sm">
									<div className="flex items-start justify-between">
										<span className="text-slate-400">Game Master receives:</span>
										<span className="font-medium text-emerald-400">85%</span>
									</div>
									<div className="flex items-start justify-between">
										<span className="text-slate-400">Platform fee:</span>
										<span className="font-medium text-slate-300">15%</span>
									</div>
									<div className="flex items-start justify-between">
										<span className="text-slate-400">Payment processing fees:</span>
										<span className="font-medium text-slate-300">~2.9% + $0.30</span>
									</div>
								</div>
								<div className="mt-4 pt-4 border-t border-slate-800">
									<h4 className="text-xs font-medium text-slate-300 mb-2">Example for a $20 session:</h4>
									<div className="space-y-1 text-xs text-slate-400">
										<p>• You pay: <strong className="text-slate-300">$20.00</strong></p>
										<p>• Platform fee (15%): <strong className="text-slate-300">$3.00</strong></p>
										<p>• Payment processing: <strong className="text-slate-300">~$0.88</strong></p>
										<p>• Your GM receives: <strong className="text-emerald-400">~$16.12</strong></p>
									</div>
								</div>
							</div>
						</div>

						<div>
							<h3 className="text-lg font-medium text-slate-200 mb-2">
								What the Platform Fee Covers
							</h3>
							<ul className="space-y-2 text-sm text-slate-400 ml-4">
								<li>• Secure payment processing through Stripe</li>
								<li>• Campaign scheduling and player management tools</li>
								<li>• Character sheets and campaign notes features</li>
								<li>• Messaging system between players and hosts</li>
								<li>• Platform maintenance and ongoing development</li>
								<li>• Customer support for both players and hosts</li>
							</ul>
						</div>
					</div>
				</section>

				{/* How Subscriptions Work */}
				<section className="rounded-xl border border-slate-800/60 bg-slate-900/40 p-6">
					<h2 className="text-2xl font-semibold text-slate-100 mb-4">
						How Campaign Subscriptions Work
					</h2>
					<div className="space-y-4">
						<div className="flex gap-4">
							<div className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-full bg-purple-600 text-white font-bold">
								1
							</div>
							<div className="flex-1">
								<h3 className="text-lg font-medium text-slate-100 mb-2">
									Find a Campaign
								</h3>
								<p className="text-sm text-slate-300">
									Browse available paid campaigns and find one that matches your interests, 
									schedule, and budget.
								</p>
							</div>
						</div>

						<div className="flex gap-4">
							<div className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-full bg-purple-600 text-white font-bold">
								2
							</div>
							<div className="flex-1">
								<h3 className="text-lg font-medium text-slate-100 mb-2">
									Request to Join
								</h3>
								<p className="text-sm text-slate-300">
									Submit a request to join the campaign. The host will review your profile and 
									approve your request if you&apos;re a good fit for their table.
								</p>
							</div>
						</div>

						<div className="flex gap-4">
							<div className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-full bg-purple-600 text-white font-bold">
								3
							</div>
							<div className="flex-1">
								<h3 className="text-lg font-medium text-slate-100 mb-2">
									Complete Payment
								</h3>
								<p className="text-sm text-slate-300">
									Once approved, you&apos;ll complete your payment for the session. Your payment 
									information is securely handled by Stripe.
								</p>
							</div>
						</div>

						<div className="flex gap-4">
							<div className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-full bg-purple-600 text-white font-bold">
								4
							</div>
							<div className="flex-1">
								<h3 className="text-lg font-medium text-slate-100 mb-2">
									Enjoy Your Session
								</h3>
								<p className="text-sm text-slate-300">
									Attend your scheduled session and enjoy a premium gaming experience with your 
									professional Game Master!
								</p>
							</div>
						</div>
					</div>
				</section>

				{/* Managing Subscriptions */}
				<section className="rounded-xl border border-slate-800/60 bg-slate-900/40 p-6">
					<h2 className="text-2xl font-semibold text-slate-100 mb-4">
						Managing Your Subscriptions
					</h2>
					<div className="space-y-4 text-slate-300">
						<p className="text-sm">
							You can view and manage all your active campaign subscriptions from your 
							subscriptions dashboard. This includes:
						</p>
						<ul className="space-y-2 text-sm text-slate-400 ml-4">
							<li>• Viewing all active and past subscriptions</li>
							<li>• Checking payment status and next billing dates</li>
							<li>• Managing payment methods through Stripe</li>
							<li>• Canceling subscriptions if needed</li>
							<li>• Accessing links to your campaign pages</li>
						</ul>
						<div className="pt-4">
							<Link
								href="/subscriptions"
								className="inline-block rounded-lg bg-sky-600 px-6 py-3 text-sm font-medium text-white transition hover:bg-sky-700"
							>
								Manage My Subscriptions
							</Link>
						</div>
					</div>
				</section>

				{/* FAQ Section */}
				<section className="rounded-xl border border-slate-800/60 bg-slate-900/40 p-6">
					<h2 className="text-2xl font-semibold text-slate-100 mb-4">
						Frequently Asked Questions
					</h2>
					<div className="space-y-4">
						<div>
							<h3 className="text-base font-medium text-slate-200 mb-2">
								Can I cancel my subscription at any time?
							</h3>
							<p className="text-sm text-slate-400">
								Yes, you can cancel your campaign subscription at any time through the Stripe customer 
								portal. You&apos;ll retain access through the end of your current billing period.
							</p>
						</div>

						<div>
							<h3 className="text-base font-medium text-slate-200 mb-2">
								What if I miss a session?
							</h3>
							<p className="text-sm text-slate-400">
								Policies vary by Game Master. Most GMs don&apos;t offer refunds for missed sessions, 
								but some may allow you to make up the content. Check with your GM about their 
								specific policies before subscribing.
							</p>
						</div>

						<div>
							<h3 className="text-base font-medium text-slate-200 mb-2">
								Are refunds available?
							</h3>
							<p className="text-sm text-slate-400">
								Refunds are typically available if the Game Master cancels a session or can&apos;t 
								deliver the agreed-upon content. For other situations, contact your GM directly 
								or reach out to our support team.
							</p>
						</div>

						<div>
							<h3 className="text-base font-medium text-slate-200 mb-2">
								Is my payment information secure?
							</h3>
							<p className="text-sm text-slate-400">
								Yes! All payments are processed through Stripe, one of the world&apos;s most trusted 
								payment platforms. The Gathering Call never stores your credit card information.
							</p>
						</div>

						<div>
							<h3 className="text-base font-medium text-slate-200 mb-2">
								Can I join multiple paid campaigns?
							</h3>
							<p className="text-sm text-slate-400">
								Absolutely! You can join as many paid campaigns as your schedule and budget allow. 
								Each campaign will be billed separately based on its schedule and pricing.
							</p>
						</div>

						<div>
							<h3 className="text-base font-medium text-slate-200 mb-2">
								What payment methods are accepted?
							</h3>
							<p className="text-sm text-slate-400">
								We accept all major credit cards, debit cards, and other payment methods supported 
								by Stripe in your region.
							</p>
						</div>
					</div>
				</section>

				{/* Call to Action */}
				<section className="rounded-xl border border-purple-600/40 bg-purple-900/20 p-6 text-center">
					<h2 className="text-2xl font-semibold text-slate-100 mb-3">
						Ready to Find Your Next Campaign?
					</h2>
					<p className="text-slate-300 mb-6 max-w-2xl mx-auto">
						Browse our collection of paid and free campaigns to find the perfect table for you!
					</p>
					<div className="flex gap-4 justify-center flex-wrap">
						<Link
							href="/find-campaigns"
							className="rounded-lg bg-purple-600 px-6 py-3 text-sm font-medium text-white transition hover:bg-purple-700"
						>
							Browse Campaigns
						</Link>
						<Link
							href="/subscriptions"
							className="rounded-lg border border-slate-700 px-6 py-3 text-sm font-medium text-slate-200 transition hover:bg-slate-800"
						>
							View My Subscriptions
						</Link>
					</div>
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
