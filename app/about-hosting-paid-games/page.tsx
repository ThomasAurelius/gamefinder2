import Link from "next/link";

export default function AboutHostingPaidGamesPage() {
	return (
		<div className="mx-auto max-w-4xl px-4 py-12">
			<div className="space-y-8">
				<div>
					<h1 className="text-3xl font-bold text-slate-100">
						About Hosting Paid Games
					</h1>
					<p className="mt-2 text-slate-400">
						A comprehensive guide to hosting paid campaigns and setting up payments through Stripe.
					</p>
				</div>

				{/* Overview Section */}
				<section className="rounded-xl border border-slate-800/60 bg-slate-900/40 p-6">
					<h2 className="text-2xl font-semibold text-slate-100 mb-4">
						Overview
					</h2>
					<p className="text-slate-300 mb-4">
						As a Game Master on The Gathering Call, you have the option to host paid campaigns. 
						This allows you to monetize your time and expertise while providing high-quality gaming 
						experiences to your players. Our platform uses Stripe to handle all payment processing 
						securely and professionally.
					</p>
					<div className="rounded-lg border border-amber-700/50 bg-amber-900/20 p-4">
						<h3 className="text-sm font-medium text-amber-200 mb-2">
							Why Host Paid Games?
						</h3>
						<ul className="space-y-2 text-sm text-slate-300">
							<li className="flex items-start gap-2">
								<span className="text-amber-400 mt-1">•</span>
								<span>Earn income from your Game Master skills and preparation time</span>
							</li>
							<li className="flex items-start gap-2">
								<span className="text-amber-400 mt-1">•</span>
								<span>Players with financial commitment tend to be more engaged and reliable</span>
							</li>
							<li className="flex items-start gap-2">
								<span className="text-amber-400 mt-1">•</span>
								<span>Professional payment processing with automatic payouts</span>
							</li>
							<li className="flex items-start gap-2">
								<span className="text-amber-400 mt-1">•</span>
								<span>You maintain control over your pricing</span>
							</li>
						</ul>
					</div>
				</section>

				{/* Payment Terms */}
				<section className="rounded-xl border border-slate-800/60 bg-slate-900/40 p-6">
					<h2 className="text-2xl font-semibold text-slate-100 mb-4">
						Payment Terms
					</h2>
					<div className="space-y-4 text-slate-300">
						<div>
							<h3 className="text-lg font-medium text-slate-200 mb-2">
								Platform Fee: 20%
							</h3>
							<p className="text-sm">
								The platform retains 20% of each paid session fee. You receive 80% of the payment, 
								minus payment processing fees.
							</p>
						</div>
						<div className="rounded-lg bg-slate-950/40 p-4 border border-slate-800">
							<h4 className="text-sm font-medium text-slate-200 mb-2">Example Calculation:</h4>
							<div className="space-y-1 text-sm text-slate-400">
								<p>If you charge <strong className="text-slate-300">$10.00</strong> per session:</p>
								<ul className="ml-4 space-y-1">
									<li>• Platform fee (20%): <strong className="text-slate-300">$2.00</strong></li>
									<li>• Stripe processing fee: <strong className="text-slate-300">$0.59</strong> ($0.30 + 2.9%)</li>
									<li>• Your payout: <strong className="text-emerald-400">~$7.41</strong></li>
								</ul>
							</div>
						</div>
						<div>
							<h3 className="text-lg font-medium text-slate-200 mb-2">
								Payment Processing
							</h3>
							<p className="text-sm">
								All payments are processed through Stripe, a secure and trusted payment platform. 
								Payouts are automatically transferred to your bank account according to Stripe&apos;s 
								payout schedule.
							</p>
						</div>
					</div>
				</section>

				{/* Getting Started Steps */}
				<section className="rounded-xl border border-slate-800/60 bg-slate-900/40 p-6">
					<h2 className="text-2xl font-semibold text-slate-100 mb-4">
						Getting Started: Step-by-Step Guide
					</h2>
					
					<div className="space-y-6">
						{/* Step 1 */}
						<div className="flex gap-4">
							<div className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-full bg-sky-600 text-white font-bold">
								1
							</div>
							<div className="flex-1">
								<h3 className="text-lg font-medium text-slate-100 mb-2">
									Accept the Terms and Conditions
								</h3>
								<p className="text-sm text-slate-300 mb-3">
									Before you can host paid campaigns, you need to review and accept our 
									Paid Games Terms and Conditions. This covers your responsibilities as a host, 
									the platform fee structure, and refund policies.
								</p>
								<Link
									href="/terms-paid-games"
									className="inline-block text-sm text-sky-400 hover:text-sky-300 hover:underline"
								>
									Review Terms and Conditions →
								</Link>
							</div>
						</div>

						{/* Step 2 */}
						<div className="flex gap-4">
							<div className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-full bg-sky-600 text-white font-bold">
								2
							</div>
							<div className="flex-1">
								<h3 className="text-lg font-medium text-slate-100 mb-2">
									Complete Stripe Onboarding
								</h3>
								<p className="text-sm text-slate-300 mb-3">
									Set up your payout account with Stripe to receive payments. The onboarding 
									process is secure and straightforward. You&apos;ll need:
								</p>
								<ul className="space-y-2 text-sm text-slate-400 mb-3 ml-4">
									<li>• Business or personal information</li>
									<li>• Bank account details for receiving payouts</li>
									<li>• Tax identification information (SSN or EIN)</li>
								</ul>
								<Link
									href="/host/onboarding"
									className="inline-block rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-sky-700"
								>
									Start Stripe Onboarding
								</Link>
							</div>
						</div>

						{/* Step 3 */}
						<div className="flex gap-4">
							<div className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-full bg-sky-600 text-white font-bold">
								3
							</div>
							<div className="flex-1">
								<h3 className="text-lg font-medium text-slate-100 mb-2">
									Create Your Paid Campaign
								</h3>
								<p className="text-sm text-slate-300 mb-3">
									Once your Stripe account is set up, you can create campaigns with paid sessions:
								</p>
								<ul className="space-y-2 text-sm text-slate-400 mb-3 ml-4">
									<li>• Go to your dashboard and click &quot;Create New Campaign&quot;</li>
									<li>• Fill in your campaign details (name, game system, description, etc.)</li>
									<li>• Set the cost per session (e.g., $5.00, $10.00, etc.)</li>
									<li>• Enter a value greater than $0 to enable paid sessions</li>
									<li>• Complete the campaign setup and publish</li>
								</ul>
								<p className="text-xs text-slate-500 italic">
									Note: You can always create free campaigns by setting the cost per session to $0.
								</p>
							</div>
						</div>

						{/* Step 4 */}
						<div className="flex gap-4">
							<div className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-full bg-sky-600 text-white font-bold">
								4
							</div>
							<div className="flex-1">
								<h3 className="text-lg font-medium text-slate-100 mb-2">
									Manage Your Campaigns
								</h3>
								<p className="text-sm text-slate-300 mb-3">
									After your campaign is live:
								</p>
								<ul className="space-y-2 text-sm text-slate-400 mb-3 ml-4">
									<li>• Players will be charged when they join your campaign</li>
									<li>• You can view payment status in your campaign dashboard</li>
									<li>• Payouts are processed automatically by Stripe</li>
									<li>• You can manage refunds through the platform if needed</li>
								</ul>
								<Link
									href="/host/dashboard"
									className="inline-block text-sm text-sky-400 hover:text-sky-300 hover:underline"
								>
									Go to Host Dashboard →
								</Link>
							</div>
						</div>
					</div>
				</section>

				{/* Stripe Onboarding Details */}
				<section className="rounded-xl border border-slate-800/60 bg-slate-900/40 p-6">
					<h2 className="text-2xl font-semibold text-slate-100 mb-4">
						About Stripe Onboarding
					</h2>
					<div className="space-y-4 text-slate-300">
						<p className="text-sm">
							Stripe is a leading payment processing platform trusted by millions of businesses 
							worldwide. The onboarding process ensures compliance with financial regulations and 
							helps prevent fraud.
						</p>
						
						<div>
							<h3 className="text-lg font-medium text-slate-200 mb-2">
								What to Expect During Onboarding
							</h3>
							<ul className="space-y-2 text-sm text-slate-400">
								<li className="flex items-start gap-2">
									<span className="text-sky-400 mt-1">1.</span>
									<span>You&apos;ll be redirected to Stripe&apos;s secure onboarding page</span>
								</li>
								<li className="flex items-start gap-2">
									<span className="text-sky-400 mt-1">2.</span>
									<span>Provide your business or personal information</span>
								</li>
								<li className="flex items-start gap-2">
									<span className="text-sky-400 mt-1">3.</span>
									<span>Add your bank account details for payouts</span>
								</li>
								<li className="flex items-start gap-2">
									<span className="text-sky-400 mt-1">4.</span>
									<span>Verify your identity with tax information</span>
								</li>
								<li className="flex items-start gap-2">
									<span className="text-sky-400 mt-1">5.</span>
									<span>Review and accept Stripe&apos;s Connected Account Agreement</span>
								</li>
								<li className="flex items-start gap-2">
									<span className="text-sky-400 mt-1">6.</span>
									<span>Complete the process and return to The Gathering Call</span>
								</li>
							</ul>
						</div>

						<div className="rounded-lg bg-slate-950/40 p-4 border border-slate-800">
							<h4 className="text-sm font-medium text-slate-200 mb-2">Important Notes:</h4>
							<ul className="space-y-2 text-xs text-slate-400">
								<li>• The entire process typically takes 5-10 minutes</li>
								<li>• You can save your progress and return later if needed</li>
								<li>• All information is securely stored by Stripe, not by The Gathering Call</li>
								<li>• You must complete onboarding before creating paid campaigns</li>
								<li>• Stripe may require additional verification in some cases</li>
							</ul>
						</div>
					</div>
				</section>

				{/* Host Responsibilities */}
				<section className="rounded-xl border border-slate-800/60 bg-slate-900/40 p-6">
					<h2 className="text-2xl font-semibold text-slate-100 mb-4">
						Your Responsibilities as a Paid Host
					</h2>
					<div className="space-y-3 text-sm text-slate-300">
						<ul className="space-y-3">
							<li className="flex items-start gap-3">
								<span className="text-sky-400 mt-1">✓</span>
								<span>
									<strong className="text-slate-200">Deliver Quality Sessions:</strong> Provide 
									the game sessions as advertised with appropriate preparation and engagement.
								</span>
							</li>
							<li className="flex items-start gap-3">
								<span className="text-sky-400 mt-1">✓</span>
								<span>
									<strong className="text-slate-200">Maintain Professionalism:</strong> Conduct 
									yourself professionally and create a welcoming environment for all players.
								</span>
							</li>
							<li className="flex items-start gap-3">
								<span className="text-sky-400 mt-1">✓</span>
								<span>
									<strong className="text-slate-200">Honor Commitments:</strong> Show up for 
									scheduled sessions or provide appropriate refunds if you need to cancel.
								</span>
							</li>
							<li className="flex items-start gap-3">
								<span className="text-sky-400 mt-1">✓</span>
								<span>
									<strong className="text-slate-200">Communicate Clearly:</strong> Keep players 
									informed about session details, requirements, and any changes.
								</span>
							</li>
							<li className="flex items-start gap-3">
								<span className="text-sky-400 mt-1">✓</span>
								<span>
									<strong className="text-slate-200">Handle Tax Obligations:</strong> You are 
									responsible for reporting income and paying applicable taxes.
								</span>
							</li>
						</ul>
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
								Can I host both free and paid campaigns?
							</h3>
							<p className="text-sm text-slate-400">
								Yes! Once you&apos;re set up for paid campaigns, you can create both free and paid campaigns. 
								Simply set the cost per session to $0 for free campaigns.
							</p>
						</div>

						<div>
							<h3 className="text-base font-medium text-slate-200 mb-2">
								How long does it take to receive payouts?
							</h3>
							<p className="text-sm text-slate-400">
								Payouts are processed automatically by Stripe according to their standard payout schedule, 
								typically 2-7 business days after a payment is made. You can view your payout schedule in 
								your Stripe dashboard.
							</p>
						</div>

						<div>
							<h3 className="text-base font-medium text-slate-200 mb-2">
								What if I need to issue a refund?
							</h3>
							<p className="text-sm text-slate-400">
								You can process refunds through the platform for canceled or undelivered sessions. 
								Refunds are expected for situations where you cannot fulfill your commitment to players.
							</p>
						</div>

						<div>
							<h3 className="text-base font-medium text-slate-200 mb-2">
								Do I need a business account to accept payments?
							</h3>
							<p className="text-sm text-slate-400">
								No, you can use either a personal or business account with Stripe. Many Game Masters 
								start with a personal account and can upgrade to a business account later if needed.
							</p>
						</div>

						<div>
							<h3 className="text-base font-medium text-slate-200 mb-2">
								What happens if a player disputes a payment?
							</h3>
							<p className="text-sm text-slate-400">
								Stripe handles payment disputes according to their policies. You&apos;ll be notified of any 
								disputes and have the opportunity to respond. Maintaining good communication with players 
								and honoring your commitments helps prevent disputes.
							</p>
						</div>
					</div>
				</section>

				{/* Call to Action */}
				<section className="rounded-xl border border-sky-600/40 bg-sky-900/20 p-6 text-center">
					<h2 className="text-2xl font-semibold text-slate-100 mb-3">
						Ready to Start Hosting Paid Campaigns?
					</h2>
					<p className="text-slate-300 mb-6 max-w-2xl mx-auto">
						Begin by accepting our terms and completing your Stripe onboarding. 
						You&apos;ll be hosting paid sessions in no time!
					</p>
					<div className="flex gap-4 justify-center flex-wrap">
						<Link
							href="/terms-paid-games"
							className="rounded-lg bg-sky-600 px-6 py-3 text-sm font-medium text-white transition hover:bg-sky-700"
						>
							Review Terms &amp; Get Started
						</Link>
						<Link
							href="/host/onboarding"
							className="rounded-lg border border-slate-700 px-6 py-3 text-sm font-medium text-slate-200 transition hover:bg-slate-800"
						>
							Go to Stripe Onboarding
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
