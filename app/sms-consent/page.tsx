import Link from "next/link";

function MessageIcon({ className }: { className?: string }) {
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
                        <path d="M21 11.5a8.38 8.38 0 0 1-1 3.9 8.5 8.5 0 0 1-7.5 4.6 8.38 8.38 0 0 1-3.9-1l-4.6 1 1-4.6a8.38 8.38 0 0 1-1-3.9 8.5 8.5 0 0 1 4.6-7.5 8.38 8.38 0 0 1 3.9-1h.5a8.48 8.48 0 0 1 8 8Z" />
                        <path d="M8 12h.01" />
                        <path d="M12 12h.01" />
                        <path d="M16 12h.01" />
                </svg>
        );
}

function PhoneIcon({ className }: { className?: string }) {
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
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.05 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92Z" />
                </svg>
        );
}

function ShieldCheckIcon({ className }: { className?: string }) {
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
                        <path d="M12 2 4 5v6c0 5.25 3.43 10.39 8 12 4.57-1.61 8-6.75 8-12V5z" />
                        <path d="m9 12 2 2 4-4" />
                </svg>
        );
}

const sections = [
        {
                title: "1. Overview",
                content: (
                        <>
                                <p>
                                        The Gathering Call offers optional SMS messaging to keep you informed about your tabletop gaming campaigns. By providing your phone number in your profile, you consent to receive SMS notifications from campaign hosts using our platform.
                                </p>
                                <p>
                                        <strong>SMS messaging is completely optional.</strong> You can use all features of The Gathering Call without providing a phone number.
                                </p>
                        </>
                ),
        },
        {
                title: "2. How to Opt In",
                content: (
                        <>
                                <p>To receive SMS notifications:</p>
                                <ol className="list-decimal list-inside space-y-2 text-slate-200/80">
                                        <li>Log in to your account on The Gathering Call</li>
                                        <li>Navigate to your Profile page</li>
                                        <li>Locate the &quot;Phone Number&quot; field</li>
                                        <li>Enter your mobile phone number</li>
                                        <li>Save your profile</li>
                                </ol>
                                <p className="mt-3">
                                        By entering and saving your phone number, you consent to receive SMS messages related to campaigns you have joined.
                                </p>
                        </>
                ),
        },
        {
                title: "3. Types of Messages You May Receive",
                content: (
                        <>
                                <p>When you opt in to SMS notifications, you may receive:</p>
                                <ul className="list-disc list-inside space-y-2 text-slate-200/80">
                                        <li>Campaign updates and announcements from hosts</li>
                                        <li>Schedule changes or cancellations</li>
                                        <li>Session reminders</li>
                                        <li>Important campaign-related information</li>
                                </ul>
                                <p className="mt-3">
                                        <strong>Message Frequency:</strong> The number of messages you receive depends on the campaigns you join and how often hosts send updates. Typically, you may receive 1-5 messages per month per campaign.
                                </p>
                        </>
                ),
        },
        {
                title: "4. SMS Service Provider",
                content: (
                        <>
                                <p>
                                        SMS messages are delivered through Twilio, a third-party messaging service provider. By opting in to SMS notifications:
                                </p>
                                <ul className="list-disc list-inside space-y-2 text-slate-200/80">
                                        <li>Your phone number will be shared with Twilio for the purpose of message delivery</li>
                                        <li>Twilio&apos;s privacy practices are governed by their own privacy policy</li>
                                        <li>Messages are sent from a Twilio phone number on behalf of The Gathering Call</li>
                                </ul>
                        </>
                ),
        },
        {
                title: "5. Data Collection and Use",
                content: (
                        <>
                                <p>When you provide your phone number:</p>
                                <ul className="list-disc list-inside space-y-2 text-slate-200/80">
                                        <li>
                                                <strong>What we collect:</strong> Your mobile phone number
                                        </li>
                                        <li>
                                                <strong>How we use it:</strong> Only to send campaign-related SMS notifications
                                        </li>
                                        <li>
                                                <strong>Who can see it:</strong> Your phone number is never visible to anyone, including campaign hosts. It is stored securely and used only for SMS delivery.
                                        </li>
                                        <li>
                                                <strong>How we protect it:</strong> Your phone number is stored securely in our database and never shared publicly or displayed in the application
                                        </li>
                                        <li>
                                                <strong>Retention:</strong> We keep your phone number until you remove it from your profile or delete your account
                                        </li>
                                </ul>
                        </>
                ),
        },
        {
                title: "6. Message and Data Rates",
                content: (
                        <>
                                <p>
                                        <strong>Standard message and data rates may apply</strong> when you receive SMS notifications. Check with your mobile carrier for details about your messaging plan.
                                </p>
                                <p>
                                        The Gathering Call does not charge any fees for SMS notifications, but your carrier may charge you for text messages received depending on your plan.
                                </p>
                        </>
                ),
        },
        {
                title: "7. How to Opt Out",
                content: (
                        <>
                                <p>You can stop receiving SMS notifications at any time through any of these methods:</p>
                                <div className="space-y-4">
                                        <div>
                                                <h3 className="text-sm font-semibold text-slate-100">Method 1: Remove Phone Number from Profile</h3>
                                                <ol className="list-decimal list-inside space-y-2 text-slate-200/80">
                                                        <li>Log in to your account</li>
                                                        <li>Go to your Profile page</li>
                                                        <li>Clear the phone number field</li>
                                                        <li>Save your profile</li>
                                                </ol>
                                        </div>
                                        <div>
                                                <h3 className="text-sm font-semibold text-slate-100">Method 2: Reply STOP</h3>
                                                <p>
                                                        Reply <strong>STOP</strong> to any SMS message you receive from The Gathering Call. This will immediately opt you out of future SMS notifications.
                                                </p>
                                        </div>
                                        <div>
                                                <h3 className="text-sm font-semibold text-slate-100">Method 3: Contact Support</h3>
                                                <p>
                                                        Contact us through the platform&apos;s support channels and request to be removed from SMS notifications.
                                                </p>
                                        </div>
                                </div>
                                <p className="mt-3">
                                        <strong>Note:</strong> After opting out, you will no longer receive SMS notifications, but you will still receive in-app messages through the internal messaging system.
                                </p>
                        </>
                ),
        },
        {
                title: "8. Help and Support",
                content: (
                        <>
                                <p>If you have questions about SMS notifications, you can:</p>
                                <ul className="list-disc list-inside space-y-2 text-slate-200/80">
                                        <li>
                                                Reply <strong>HELP</strong> to any SMS message for assistance
                                        </li>
                                        <li>Contact us through the platform&apos;s support channels</li>
                                        <li>
                                                Review our <Link href="/privacy" className="text-indigo-200 underline decoration-indigo-400/60 underline-offset-4 transition hover:text-indigo-100">Privacy Policy</Link> for more information about data handling
                                        </li>
                                </ul>
                        </>
                ),
        },
        {
                title: "9. Your Rights",
                content: (
                        <>
                                <p>You have the right to:</p>
                                <ul className="list-disc list-inside space-y-2 text-slate-200/80">
                                        <li>Opt in or opt out of SMS notifications at any time</li>
                                        <li>Request information about what phone number we have on file</li>
                                        <li>Request deletion of your phone number from our records</li>
                                        <li>Change your phone number at any time</li>
                                        <li>Access all platform features without providing a phone number</li>
                                </ul>
                        </>
                ),
        },
        {
                title: "10. Changes to This Policy",
                content: (
                        <>
                                <p>
                                        We may update this SMS Consent policy from time to time. When we make changes, we will update the &quot;Last updated&quot; date at the top of this page. Continued use of SMS notifications after changes indicates your acceptance of the updated terms.
                                </p>
                                <p>
                                        If we make material changes to how we handle SMS notifications, we will notify you through the platform or via SMS before the changes take effect.
                                </p>
                        </>
                ),
        },
        {
                title: "11. Compliance",
                content: (
                        <>
                                <p>Our SMS messaging program complies with:</p>
                                <ul className="list-disc list-inside space-y-2 text-slate-200/80">
                                        <li>Telephone Consumer Protection Act (TCPA)</li>
                                        <li>CAN-SPAM Act</li>
                                        <li>Cellular Telecommunications Industry Association (CTIA) guidelines</li>
                                        <li>Mobile Marketing Association (MMA) Consumer Best Practices</li>
                                </ul>
                        </>
                ),
        },
        {
                title: "12. Contact Us",
                content: (
                        <p>
                                If you have questions about SMS notifications or this consent policy, please contact us through the platform&apos;s support channels.
                        </p>
                ),
        },
];

export default function SmsConsentPage() {
        return (
                <div className="mx-auto max-w-5xl space-y-8 py-8">
                        <div className="rounded-3xl border-2 border-amber-500/50 bg-gradient-to-br from-amber-600/20 via-purple-600/20 to-indigo-600/20 p-8 shadow-2xl">
                                <div className="text-center space-y-4">
                                        <div className="flex justify-center gap-4">
                                                <MessageIcon className="h-8 w-8 text-amber-300" />
                                                <PhoneIcon className="h-8 w-8 text-purple-200" />
                                                <ShieldCheckIcon className="h-8 w-8 text-indigo-300" />
                                        </div>
                                        <h1 className="text-4xl font-bold bg-gradient-to-r from-amber-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
                                                SMS Messaging Consent
                                        </h1>
                                        <p className="text-slate-200 max-w-2xl mx-auto">
                                                Stay up to date with timely campaign alerts while maintaining full control over your phone number and privacy.
                                        </p>
                                        <div className="inline-flex rounded-full border border-amber-500/50 bg-amber-500/20 px-5 py-2 text-sm font-semibold text-amber-200">
                                                Last updated: January 10, 2025
                                        </div>
                                </div>
                        </div>

                        <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-8 shadow-xl">
                                <div className="space-y-8 text-sm leading-relaxed text-slate-300">
                                        {sections.map((section) => (
                                                <div key={section.title} className="space-y-3">
                                                        <h2 className="text-xl font-semibold text-slate-100">{section.title}</h2>
                                                        <div className="space-y-3">{section.content}</div>
                                                </div>
                                        ))}
                                </div>
                        </div>

                        <div className="rounded-2xl border border-indigo-500/40 bg-slate-900/70 p-8 shadow-xl">
                                <h2 className="text-2xl font-semibold text-indigo-200">Control Your Experience</h2>
                                <p className="mt-3 text-sm text-slate-300">
                                        Use SMS for critical reminders, opt out whenever you like, and rely on in-app messaging for everything else. Your preferences always come first.
                                </p>
                                <div className="mt-6 flex flex-wrap items-center gap-4">
                                        <Link
                                                href="/profile"
                                                className="rounded-lg bg-gradient-to-r from-amber-500 via-purple-500 to-indigo-500 px-5 py-2 text-sm font-semibold text-white transition hover:from-amber-400 hover:via-purple-400 hover:to-indigo-400"
                                        >
                                                Update Phone Number
                                        </Link>
                                        <Link
                                                href="/support"
                                                className="rounded-lg border border-white/10 px-5 py-2 text-sm font-medium text-slate-200 transition hover:border-white/30"
                                        >
                                                Contact Support
                                        </Link>
                                </div>
                        </div>
                </div>
        );
}
