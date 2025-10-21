export default function PrivacyPage() {
	return (
		<section className="space-y-6">
			<div>
				<h1 className="text-2xl font-semibold text-slate-100">
					Privacy Policy
				</h1>
				<p className="mt-2 text-sm text-slate-400">
					Last updated: {new Date().toLocaleDateString()}
				</p>
			</div>

			<div className="space-y-4 rounded-2xl border border-slate-800/60 bg-slate-900/40 p-6 shadow-lg shadow-slate-900/30">
				<div className="space-y-4 text-sm text-slate-300 leading-relaxed">
					<div className="space-y-3">
						<h2 className="text-lg font-semibold text-slate-100">
							1. Introduction
						</h2>
						<p>
							The Gathering Call (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform.
						</p>
						<p>
							Please read this privacy policy carefully. If you do not agree with the terms of this privacy policy, please do not access the platform.
						</p>
					</div>

					<div className="space-y-3">
						<h2 className="text-lg font-semibold text-slate-100">
							2. Information We Collect
						</h2>
						<p>
							We may collect information about you in a variety of ways. The information we may collect on the platform includes:
						</p>
						
						<h3 className="text-base font-medium text-slate-200">
							Personal Data
						</h3>
						<p>
							Personally identifiable information, such as your name, email address, and demographic information, that you voluntarily give to us when you register with the platform or when you choose to participate in various activities related to the platform.
						</p>

						<h3 className="text-base font-medium text-slate-200">
							Mobile Phone Numbers
						</h3>
						<p>
							If you choose to provide your mobile phone number for optional SMS notifications, we collect and store this information. Your mobile phone number will only be shared with our SMS service provider (Twilio) for the sole purpose of delivering campaign-related notifications. We will never share your mobile phone number with third parties or affiliates for marketing or promotional activities.
						</p>

						<h3 className="text-base font-medium text-slate-200">
							Derivative Data
						</h3>
						<p>
							Information our servers automatically collect when you access the platform, such as your IP address, your browser type, your operating system, your access times, and the pages you have viewed directly before and after accessing the platform.
						</p>

						<h3 className="text-base font-medium text-slate-200">
							Financial Data
						</h3>
						<p>
							Financial information, such as data related to your payment method (e.g., valid credit card number, card brand, expiration date) that we may collect when you purchase, order, return, exchange, or request information about our services from the platform. We store only very limited, if any, financial information that we collect. Otherwise, all financial information is stored by our payment processor, Stripe, and you are encouraged to review their privacy policy and contact them directly for responses to your questions.
						</p>
					</div>

					<div className="space-y-3">
						<h2 className="text-lg font-semibold text-slate-100">
							3. Use of Your Information
						</h2>
						<p>
							Having accurate information about you permits us to provide you with a smooth, efficient, and customized experience. Specifically, we may use information collected about you via the platform to:
						</p>
						<ul className="list-disc list-inside space-y-2 ml-2">
							<li>Create and manage your account</li>
							<li>Process your transactions and send you related information</li>
							<li>Email you regarding your account or orders</li>
							<li>Enable user-to-user communications</li>
							<li>Fulfill and manage game sessions, campaigns, and orders</li>
							<li>Generate a personal profile about you to make future visits to the platform more personalized</li>
							<li>Increase the efficiency and operation of the platform</li>
							<li>Monitor and analyze usage and trends to improve your experience with the platform</li>
							<li>Notify you of updates to the platform</li>
							<li>Offer new products, services, and/or recommendations to you</li>
							<li>Perform other business activities as needed</li>
							<li>Prevent fraudulent transactions, monitor against theft, and protect against criminal activity</li>
							<li>Process payments and refunds</li>
							<li>Request feedback and contact you about your use of the platform</li>
							<li>Resolve disputes and troubleshoot problems</li>
							<li>Respond to product and customer service requests</li>
							<li>Send you a newsletter</li>
						</ul>
					</div>

					<div className="space-y-3">
						<h2 className="text-lg font-semibold text-slate-100">
							4. Disclosure of Your Information
						</h2>
						<p>
							We may share information we have collected about you in certain situations. Your information may be disclosed as follows:
						</p>
						
						<h3 className="text-base font-medium text-slate-200">
							By Law or to Protect Rights
						</h3>
						<p>
							If we believe the release of information about you is necessary to respond to legal process, to investigate or remedy potential violations of our policies, or to protect the rights, property, and safety of others, we may share your information as permitted or required by any applicable law, rule, or regulation.
						</p>

						<h3 className="text-base font-medium text-slate-200">
							Third-Party Service Providers
						</h3>
						<p>
							We may share your information with third parties that perform services for us or on our behalf, including payment processing, data analysis, email delivery, hosting services, customer service, and marketing assistance.
						</p>

						<h3 className="text-base font-medium text-slate-200">
							Other Users
						</h3>
						<p>
							When you share personal information or otherwise interact with public areas of the platform, such personal information may be viewed by all users and may be publicly distributed outside the platform in perpetuity.
						</p>
					</div>

					<div className="space-y-3">
						<h2 className="text-lg font-semibold text-slate-100">
							5. Security of Your Information
						</h2>
						<p>
							We use administrative, technical, and physical security measures to help protect your personal information. While we have taken reasonable steps to secure the personal information you provide to us, please be aware that despite our efforts, no security measures are perfect or impenetrable, and no method of data transmission can be guaranteed against any interception or other type of misuse.
						</p>
					</div>

					<div className="space-y-3">
						<h2 className="text-lg font-semibold text-slate-100">
							6. Policy for Children
						</h2>
						<p>
							We do not knowingly solicit information from or market to children under the age of 13. If you become aware of any data we have collected from children under age 13, please contact us using the contact information provided below.
						</p>
					</div>

					<div className="space-y-3">
						<h2 className="text-lg font-semibold text-slate-100">
							7. Controls for Do-Not-Track Features
						</h2>
						<p>
							Most web browsers and some mobile operating systems include a Do-Not-Track (&quot;DNT&quot;) feature or setting you can activate to signal your privacy preference not to have data about your online browsing activities monitored and collected. No uniform technology standard for recognizing and implementing DNT signals has been finalized. As such, we do not currently respond to DNT browser signals or any other mechanism that automatically communicates your choice not to be tracked online.
						</p>
					</div>

					<div className="space-y-3">
						<h2 className="text-lg font-semibold text-slate-100">
							8. Your Privacy Rights
						</h2>
						<p>
							Depending on your location, you may have certain rights regarding your personal information, including:
						</p>
						<ul className="list-disc list-inside space-y-2 ml-2">
							<li>The right to access – You have the right to request copies of your personal data</li>
							<li>The right to rectification – You have the right to request that we correct any information you believe is inaccurate or complete information you believe is incomplete</li>
							<li>The right to erasure – You have the right to request that we erase your personal data, under certain conditions</li>
							<li>The right to restrict processing – You have the right to request that we restrict the processing of your personal data, under certain conditions</li>
							<li>The right to object to processing – You have the right to object to our processing of your personal data, under certain conditions</li>
							<li>The right to data portability – You have the right to request that we transfer the data that we have collected to another organization, or directly to you, under certain conditions</li>
						</ul>
					</div>

					<div className="space-y-3">
						<h2 className="text-lg font-semibold text-slate-100">
							9. Data Retention
						</h2>
						<p>
							We will retain your personal information only for as long as is necessary for the purposes set out in this Privacy Policy. We will retain and use your information to the extent necessary to comply with our legal obligations, resolve disputes, and enforce our policies.
						</p>
					</div>

					<div className="space-y-3">
						<h2 className="text-lg font-semibold text-slate-100">
							10. Changes to This Privacy Policy
						</h2>
						<p>
							We may update this Privacy Policy from time to time in order to reflect, for example, changes to our practices or for other operational, legal, or regulatory reasons. We will notify you of any changes by posting the new Privacy Policy on this page and updating the &quot;Last updated&quot; date.
						</p>
						<p>
							You are advised to review this Privacy Policy periodically for any changes. Changes to this Privacy Policy are effective when they are posted on this page.
						</p>
					</div>

					<div className="space-y-3">
						<h2 className="text-lg font-semibold text-slate-100">
							11. Contact Us
						</h2>
						<p>
							If you have questions or comments about this Privacy Policy, please contact us through the platform&apos;s support channels.
						</p>
					</div>
				</div>
			</div>
		</section>
	);
}
