export default function TermsPage() {
	return (
		<section className="space-y-6">
			<div>
				<h1 className="text-2xl font-semibold text-slate-100">
					Terms of Service
				</h1>
				<p className="mt-2 text-sm text-slate-400">
					Last updated: {new Date().toLocaleDateString()}
				</p>
			</div>

			<div className="space-y-4 rounded-2xl border border-slate-800/60 bg-slate-900/40 p-6 shadow-lg shadow-slate-900/30">
				<div className="space-y-4 text-sm text-slate-300 leading-relaxed">
					<div className="space-y-3">
						<h2 className="text-lg font-semibold text-slate-100">
							1. Acceptance of Terms
						</h2>
						<p>
							By accessing and using The Gathering Call platform, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
						</p>
					</div>

					<div className="space-y-3">
						<h2 className="text-lg font-semibold text-slate-100">
							2. Use License
						</h2>
						<p>
							Permission is granted to temporarily use The Gathering Call for personal, non-commercial use only. This is the grant of a license, not a transfer of title, and under this license you may not:
						</p>
						<ul className="list-disc list-inside space-y-2 ml-2">
							<li>Modify or copy the materials</li>
							<li>Use the materials for any commercial purpose or for any public display</li>
							<li>Attempt to reverse engineer any software contained on the platform</li>
							<li>Remove any copyright or other proprietary notations from the materials</li>
							<li>Transfer the materials to another person or &quot;mirror&quot; the materials on any other server</li>
						</ul>
					</div>

					<div className="space-y-3">
						<h2 className="text-lg font-semibold text-slate-100">
							3. User Accounts
						</h2>
						<p>
							When you create an account with us, you must provide information that is accurate, complete, and current at all times. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account on our Service.
						</p>
						<p>
							You are responsible for safeguarding the password that you use to access the Service and for any activities or actions under your password.
						</p>
					</div>

					<div className="space-y-3">
						<h2 className="text-lg font-semibold text-slate-100">
							4. User Content
						</h2>
						<p>
							Our Service allows you to post, link, store, share and otherwise make available certain information, text, graphics, or other material. You are responsible for the content that you post on or through the Service, including its legality, reliability, and appropriateness.
						</p>
						<p>
							By posting content on or through the Service, you grant us the right and license to use, modify, publicly perform, publicly display, reproduce, and distribute such content on and through the Service.
						</p>
					</div>

					<div className="space-y-3">
						<h2 className="text-lg font-semibold text-slate-100">
							5. Third-Party Services and BoardGameGeek Integration
						</h2>
						<p>
							The Gathering Call uses BoardGameGeek&apos;s XML API2 (BGG API2) to provide enhanced features and functionality. By using our Service, you acknowledge and agree to the following:
						</p>
						<ul className="list-disc list-inside space-y-2 ml-2">
							<li>
								<strong>User Profile Integration:</strong> We use BGG API2 to allow you to link your BoardGameGeek username and profile to your account on The Gathering Call
							</li>
							<li>
								<strong>Collection Integration:</strong> When you provide your BGG username, we access your BoardGameGeek collection data through their API to display your game library and preferences
							</li>
							<li>
								<strong>Marketplace:</strong> Our marketplace feature is powered by BoardGameGeek&apos;s game database and marketplace listings accessed through BGG API2
							</li>
							<li>
								<strong>Game Library:</strong> Game search and library features use BoardGameGeek&apos;s comprehensive game database accessed through their API
							</li>
						</ul>
						<p>
							When you link your BoardGameGeek username or access features powered by BGG API2, you are also subject to BoardGameGeek&apos;s own terms of service and privacy policy. We are not responsible for BoardGameGeek&apos;s services, data accuracy, or availability. BoardGameGeek is a third-party service independent of The Gathering Call.
						</p>
						<p>
							BoardGameGeek, its trademarks, service marks, and logos are the property of BoardGameGeek, LLC. All rights reserved.
						</p>
					</div>

					<div className="space-y-3">
						<h2 className="text-lg font-semibold text-slate-100">
							6. Prohibited Uses
						</h2>
						<p>
							You may use the Service only for lawful purposes and in accordance with these Terms. You agree not to use the Service:
						</p>
						<ul className="list-disc list-inside space-y-2 ml-2">
							<li>In any way that violates any applicable national or international law or regulation</li>
							<li>To transmit, or procure the sending of, any advertising or promotional material, including any &quot;junk mail&quot;, &quot;chain letter,&quot; &quot;spam,&quot; or any other similar solicitation</li>
							<li>To impersonate or attempt to impersonate the Company, a Company employee, another user, or any other person or entity</li>
							<li>In any way that infringes upon the rights of others, or in any way is illegal, threatening, fraudulent, or harmful</li>
							<li>To engage in any other conduct that restricts or inhibits anyone&apos;s use or enjoyment of the Service</li>
						</ul>
					</div>

					<div className="space-y-3">
						<h2 className="text-lg font-semibold text-slate-100">
							7. Non-Discrimination and Community Standards
						</h2>
						<p>
							The Gathering Call is committed to maintaining an inclusive and welcoming community for all users. We have zero tolerance for discrimination or harassment of any kind.
						</p>
						<p>
							Discrimination, harassment, or abusive behavior directed at any user based on the following characteristics is strictly prohibited:
						</p>
						<ul className="list-disc list-inside space-y-2 ml-2">
							<li>Race, ethnicity, or national origin</li>
							<li>Religion or religious beliefs</li>
							<li>Sex, gender, or gender identity</li>
							<li>Sexual orientation</li>
							<li>Physical appearance or body size</li>
							<li>Disability or medical condition</li>
							<li>Age</li>
							<li>Veteran status</li>
							<li>Any other protected characteristic under applicable law</li>
						</ul>
						<p>
							Violations of this policy will result in immediate termination of your account and permanent ban from the Service. We reserve the right to take additional legal action as appropriate.
						</p>
					</div>

					<div className="space-y-3">
						<h2 className="text-lg font-semibold text-slate-100">
							8. Termination
						</h2>
						<p>
							We may terminate or suspend your account and bar access to the Service immediately, without prior notice or liability, under our sole discretion, for any reason whatsoever and without limitation, including but not limited to a breach of the Terms.
						</p>
						<p>
							If you wish to terminate your account, you may simply discontinue using the Service or contact us to request account deletion.
						</p>
					</div>

					<div className="space-y-3">
						<h2 className="text-lg font-semibold text-slate-100">
							9. Limitation of Liability
						</h2>
						<p>
							In no event shall The Gathering Call, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the Service.
						</p>
					</div>

					<div className="space-y-3">
						<h2 className="text-lg font-semibold text-slate-100">
							10. Disclaimer
						</h2>
						<p>
							Your use of the Service is at your sole risk. The Service is provided on an &quot;AS IS&quot; and &quot;AS AVAILABLE&quot; basis. The Service is provided without warranties of any kind, whether express or implied, including, but not limited to, implied warranties of merchantability, fitness for a particular purpose, non-infringement or course of performance.
						</p>
					</div>

					<div className="space-y-3">
						<h2 className="text-lg font-semibold text-slate-100">
							11. Governing Law
						</h2>
						<p>
							These Terms shall be governed and construed in accordance with the laws of the jurisdiction in which The Gathering Call operates, without regard to its conflict of law provisions.
						</p>
					</div>

					<div className="space-y-3">
						<h2 className="text-lg font-semibold text-slate-100">
							12. Changes to Terms
						</h2>
						<p>
							We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material, we will provide at least 30 days notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion.
						</p>
						<p>
							By continuing to access or use our Service after any revisions become effective, you agree to be bound by the revised terms. If you do not agree to the new terms, you are no longer authorized to use the Service.
						</p>
					</div>

					<div className="space-y-3">
						<h2 className="text-lg font-semibold text-slate-100">
							13. Contact Us
						</h2>
						<p>
							If you have any questions about these Terms, please contact us through the platform&apos;s support channels.
						</p>
					</div>
				</div>
			</div>
		</section>
	);
}
