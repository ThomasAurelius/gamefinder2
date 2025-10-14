export default function SmsConsentPage() {
	return (
		<section className="space-y-6">
			<div>
				<h1 className="text-2xl font-semibold text-slate-100">
					SMS Messaging Consent
				</h1>
				<p className="mt-2 text-sm text-slate-400">
					Last updated: January 10, 2025
				</p>
			</div>

			<div className="space-y-4 rounded-2xl border border-slate-800/60 bg-slate-900/40 p-6 shadow-lg shadow-slate-900/30">
				<div className="space-y-4 text-sm text-slate-300 leading-relaxed">
					<div className="space-y-3">
						<h2 className="text-lg font-semibold text-slate-100">
							1. Overview
						</h2>
						<p>
							The Gathering Call offers optional SMS messaging to keep you informed about your tabletop gaming campaigns. By providing your phone number in your profile, you consent to receive SMS notifications from campaign hosts using our platform.
						</p>
						<p>
							<strong>SMS messaging is completely optional.</strong> You can use all features of The Gathering Call without providing a phone number.
						</p>
					</div>

					<div className="space-y-3">
						<h2 className="text-lg font-semibold text-slate-100">
							2. How to Opt In
						</h2>
						<p>
							To receive SMS notifications:
						</p>
						<ol className="list-decimal list-inside space-y-2 ml-2">
							<li>Log in to your account on The Gathering Call</li>
							<li>Navigate to your Profile page</li>
							<li>Locate the &quot;Phone Number&quot; field</li>
							<li>Enter your mobile phone number</li>
							<li>Save your profile</li>
						</ol>
						<p className="mt-3">
							By entering and saving your phone number, you consent to receive SMS messages related to campaigns you have joined.
						</p>
					</div>

					<div className="space-y-3">
						<h2 className="text-lg font-semibold text-slate-100">
							3. Types of Messages You May Receive
						</h2>
						<p>
							When you opt in to SMS notifications, you may receive:
						</p>
						<ul className="list-disc list-inside space-y-2 ml-2">
							<li>Campaign updates and announcements from hosts</li>
							<li>Schedule changes or cancellations</li>
							<li>Session reminders</li>
							<li>Important campaign-related information</li>
						</ul>
						<p className="mt-3">
							<strong>Message Frequency:</strong> The number of messages you receive depends on the campaigns you join and how often hosts send updates. Typically, you may receive 1-5 messages per month per campaign.
						</p>
					</div>

					<div className="space-y-3">
						<h2 className="text-lg font-semibold text-slate-100">
							4. SMS Service Provider
						</h2>
						<p>
							SMS messages are delivered through Twilio, a third-party messaging service provider. By opting in to SMS notifications:
						</p>
						<ul className="list-disc list-inside space-y-2 ml-2">
							<li>Your phone number will be shared with Twilio for the purpose of message delivery</li>
							<li>Twilio&apos;s privacy practices are governed by their own privacy policy</li>
							<li>Messages are sent from a Twilio phone number on behalf of The Gathering Call</li>
						</ul>
					</div>

					<div className="space-y-3">
						<h2 className="text-lg font-semibold text-slate-100">
							5. Data Collection and Use
						</h2>
						<p>
							When you provide your phone number:
						</p>
						<ul className="list-disc list-inside space-y-2 ml-2">
							<li><strong>What we collect:</strong> Your mobile phone number</li>
							<li><strong>How we use it:</strong> Only to send campaign-related SMS notifications</li>
							<li><strong>Who can see it:</strong> Your phone number is never visible to anyone, including campaign hosts. It is stored securely and used only for SMS delivery.</li>
							<li><strong>How we protect it:</strong> Your phone number is stored securely in our database and never shared publicly or displayed in the application</li>
							<li><strong>Retention:</strong> We keep your phone number until you remove it from your profile or delete your account</li>
						</ul>
					</div>

					<div className="space-y-3">
						<h2 className="text-lg font-semibold text-slate-100">
							6. Message and Data Rates
						</h2>
						<p>
							<strong>Standard message and data rates may apply</strong> when you receive SMS notifications. Check with your mobile carrier for details about your messaging plan.
						</p>
						<p>
							The Gathering Call does not charge any fees for SMS notifications, but your carrier may charge you for text messages received depending on your plan.
						</p>
					</div>

					<div className="space-y-3">
						<h2 className="text-lg font-semibold text-slate-100">
							7. How to Opt Out
						</h2>
						<p>
							You can stop receiving SMS notifications at any time through any of these methods:
						</p>
						
						<h3 className="text-base font-medium text-slate-200">
							Method 1: Remove Phone Number from Profile
						</h3>
						<ol className="list-decimal list-inside space-y-2 ml-2">
							<li>Log in to your account</li>
							<li>Go to your Profile page</li>
							<li>Clear the phone number field</li>
							<li>Save your profile</li>
						</ol>

						<h3 className="text-base font-medium text-slate-200 mt-3">
							Method 2: Reply STOP
						</h3>
						<p>
							Reply <strong>STOP</strong> to any SMS message you receive from The Gathering Call. This will immediately opt you out of future SMS notifications.
						</p>

						<h3 className="text-base font-medium text-slate-200 mt-3">
							Method 3: Contact Support
						</h3>
						<p>
							Contact us through the platform&apos;s support channels and request to be removed from SMS notifications.
						</p>

						<p className="mt-3">
							<strong>Note:</strong> After opting out, you will no longer receive SMS notifications, but you will still receive in-app messages through the internal messaging system.
						</p>
					</div>

					<div className="space-y-3">
						<h2 className="text-lg font-semibold text-slate-100">
							8. Help and Support
						</h2>
						<p>
							If you have questions about SMS notifications, you can:
						</p>
						<ul className="list-disc list-inside space-y-2 ml-2">
							<li>Reply <strong>HELP</strong> to any SMS message for assistance</li>
							<li>Contact us through the platform&apos;s support channels</li>
							<li>Review our <a href="/privacy" className="text-sky-400 hover:text-sky-300 underline">Privacy Policy</a> for more information about data handling</li>
						</ul>
					</div>

					<div className="space-y-3">
						<h2 className="text-lg font-semibold text-slate-100">
							9. Your Rights
						</h2>
						<p>
							You have the right to:
						</p>
						<ul className="list-disc list-inside space-y-2 ml-2">
							<li>Opt in or opt out of SMS notifications at any time</li>
							<li>Request information about what phone number we have on file</li>
							<li>Request deletion of your phone number from our records</li>
							<li>Change your phone number at any time</li>
							<li>Access all platform features without providing a phone number</li>
						</ul>
					</div>

					<div className="space-y-3">
						<h2 className="text-lg font-semibold text-slate-100">
							10. Changes to This Policy
						</h2>
						<p>
							We may update this SMS Consent policy from time to time. When we make changes, we will update the &quot;Last updated&quot; date at the top of this page. Continued use of SMS notifications after changes indicates your acceptance of the updated terms.
						</p>
						<p>
							If we make material changes to how we handle SMS notifications, we will notify you through the platform or via SMS before the changes take effect.
						</p>
					</div>

					<div className="space-y-3">
						<h2 className="text-lg font-semibold text-slate-100">
							11. Compliance
						</h2>
						<p>
							Our SMS messaging program complies with:
						</p>
						<ul className="list-disc list-inside space-y-2 ml-2">
							<li>Telephone Consumer Protection Act (TCPA)</li>
							<li>CAN-SPAM Act</li>
							<li>Cellular Telecommunications Industry Association (CTIA) guidelines</li>
							<li>Mobile Marketing Association (MMA) Consumer Best Practices</li>
						</ul>
					</div>

					<div className="space-y-3">
						<h2 className="text-lg font-semibold text-slate-100">
							12. Contact Us
						</h2>
						<p>
							If you have questions about SMS notifications or this consent policy, please contact us through the platform&apos;s support channels.
						</p>
					</div>
				</div>
			</div>
		</section>
	);
}
