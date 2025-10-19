import Link from "next/link";

function ScaleIcon({ className }: { className?: string }) {
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
                        <path d="M7 21h10" />
                        <path d="M12 3v18" />
                        <path d="m3 6 3 6 3-6" />
                        <path d="m15 6 3 6 3-6" />
                </svg>
        );
}

function BookIcon({ className }: { className?: string }) {
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
                        <path d="M3 4h6a3 3 0 0 1 3 3v13a2 2 0 0 0-2-2H3z" />
                        <path d="M21 4h-6a3 3 0 0 0-3 3v13a2 2 0 0 1 2-2h7z" />
                </svg>
        );
}

function ShieldIcon({ className }: { className?: string }) {
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
                        <path d="M9 12h6" />
                        <path d="M12 9v6" />
                </svg>
        );
}

const sections = [
        {
                title: "1. Acceptance of Terms",
                content: (
                        <p>
                                By accessing and using The Gathering Call platform, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
                        </p>
                ),
        },
        {
                title: "2. Use License",
                content: (
                        <>
                                <p>
                                        Permission is granted to temporarily use The Gathering Call for personal, non-commercial use only. This is the grant of a license, not a transfer of title, and under this license you may not:
                                </p>
                                <ul className="list-disc list-inside space-y-2 text-slate-200/80">
                                        <li>Modify or copy the materials</li>
                                        <li>Use the materials for any commercial purpose or for any public display</li>
                                        <li>Attempt to reverse engineer any software contained on the platform</li>
                                        <li>Remove any copyright or other proprietary notations from the materials</li>
                                        <li>Transfer the materials to another person or &quot;mirror&quot; the materials on any other server</li>
                                </ul>
                        </>
                ),
        },
        {
                title: "3. User Accounts",
                content: (
                        <>
                                <p>
                                        When you create an account with us, you must provide information that is accurate, complete, and current at all times. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account on our Service.
                                </p>
                                <p>
                                        You are responsible for safeguarding the password that you use to access the Service and for any activities or actions under your password.
                                </p>
                        </>
                ),
        },
        {
                title: "4. User Content",
                content: (
                        <>
                                <p>
                                        Our Service allows you to post, link, store, share and otherwise make available certain information, text, graphics, or other material. You are responsible for the content that you post on or through the Service, including its legality, reliability, and appropriateness.
                                </p>
                                <p>
                                        By posting content on or through the Service, you grant us the right and license to use, modify, publicly perform, publicly display, reproduce, and distribute such content on and through the Service.
                                </p>
                        </>
                ),
        },
        {
                title: "5. Third-Party Services and BoardGameGeek Integration",
                content: (
                        <>
                                <p>
                                        The Gathering Call uses BoardGameGeek&apos;s XML API2 (BGG API2) to provide enhanced features and functionality. By using our Service, you acknowledge and agree to the following:
                                </p>
                                <ul className="list-disc list-inside space-y-2 text-slate-200/80">
                                        <li>
                                                <strong className="text-slate-100">User Profile Integration:</strong> We use BGG API2 to allow you to link your BoardGameGeek username and profile to your account on The Gathering Call
                                        </li>
                                        <li>
                                                <strong className="text-slate-100">Collection Integration:</strong> When you provide your BGG username, we access your BoardGameGeek collection data through their API to display your game library and preferences
                                        </li>
                                        <li>
                                                <strong className="text-slate-100">Marketplace:</strong> Our marketplace feature is powered by BoardGameGeek&apos;s game database and marketplace listings accessed through BGG API2
                                        </li>
                                        <li>
                                                <strong className="text-slate-100">Game Library:</strong> Game search and library features use BoardGameGeek&apos;s comprehensive game database accessed through their API
                                        </li>
                                </ul>
                                <p>
                                        When you link your BoardGameGeek username or access features powered by BGG API2, you are also subject to BoardGameGeek&apos;s own terms of service and privacy policy. We are not responsible for BoardGameGeek&apos;s services, data accuracy, or availability. BoardGameGeek is a third-party service independent of The Gathering Call.
                                </p>
                                <p>
                                        BoardGameGeek, its trademarks, service marks, and logos are the property of BoardGameGeek, LLC. All rights reserved.
                                </p>
                        </>
                ),
        },
        {
                title: "6. Prohibited Uses",
                content: (
                        <>
                                <p>
                                        You may use the Service only for lawful purposes and in accordance with these Terms. You agree not to use the Service:
                                </p>
                                <ul className="list-disc list-inside space-y-2 text-slate-200/80">
                                        <li>In any way that violates any applicable national or international law or regulation</li>
                                        <li>To transmit, or procure the sending of, any advertising or promotional material, including any &quot;junk mail&quot;, &quot;chain letter,&quot; &quot;spam,&quot; or any other similar solicitation</li>
                                        <li>To impersonate or attempt to impersonate the Company, a Company employee, another user, or any other person or entity</li>
                                        <li>In any way that infringes upon the rights of others, or in any way is illegal, threatening, fraudulent, or harmful</li>
                                        <li>To engage in any other conduct that restricts or inhibits anyone&apos;s use or enjoyment of the Service</li>
                                </ul>
                        </>
                ),
        },
        {
                title: "7. Non-Discrimination and Community Standards",
                content: (
                        <>
                                <p>
                                        The Gathering Call is committed to maintaining an inclusive and welcoming community for all users. We have zero tolerance for discrimination or harassment of any kind.
                                </p>
                                <p>
                                        Discrimination, harassment, or abusive behavior directed at any user based on the following characteristics is strictly prohibited:
                                </p>
                                <ul className="list-disc list-inside space-y-2 text-slate-200/80">
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
                        </>
                ),
        },
        {
                title: "8. Termination",
                content: (
                        <>
                                <p>
                                        We may terminate or suspend your account and bar access to the Service immediately, without prior notice or liability, under our sole discretion, for any reason whatsoever and without limitation, including but not limited to a breach of the Terms.
                                </p>
                                <p>
                                        If you wish to terminate your account, you may simply discontinue using the Service or contact us to request account deletion.
                                </p>
                        </>
                ),
        },
        {
                title: "9. Limitation of Liability",
                content: (
                        <p>
                                In no event shall The Gathering Call, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the Service.
                        </p>
                ),
        },
        {
                title: "10. Disclaimer",
                content: (
                        <p>
                                Your use of the Service is at your sole risk. The Service is provided on an &quot;AS IS&quot; and &quot;AS AVAILABLE&quot; basis. The Service is provided without warranties of any kind, whether express or implied, including, but not limited to, implied warranties of merchantability, fitness for a particular purpose, non-infringement or course of performance.
                        </p>
                ),
        },
        {
                title: "11. Governing Law",
                content: (
                        <p>
                                These Terms shall be governed and construed in accordance with the laws of the jurisdiction in which The Gathering Call operates, without regard to its conflict of law provisions.
                        </p>
                ),
        },
        {
                title: "12. Changes to Terms",
                content: (
                        <>
                                <p>
                                        We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material, we will provide at least 30 days notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion.
                                </p>
                                <p>
                                        By continuing to access or use our Service after any revisions become effective, you agree to be bound by the revised terms. If you do not agree to the new terms, you are no longer authorized to use the Service.
                                </p>
                        </>
                ),
        },
        {
                title: "13. Contact Us",
                content: (
                        <p>
                                If you have any questions about these Terms, please contact us through the platform&apos;s support channels.
                        </p>
                ),
        },
];

export default function TermsPage() {
        const lastUpdated = new Date().toLocaleDateString();

        return (
                <div className="mx-auto max-w-5xl space-y-8 py-8">
                        <div className="rounded-3xl border-2 border-amber-500/50 bg-gradient-to-br from-amber-600/20 via-purple-600/20 to-indigo-600/20 p-8 shadow-2xl">
                                <div className="text-center space-y-4">
                                        <div className="flex justify-center gap-4">
                                                <ScaleIcon className="h-8 w-8 text-amber-400" />
                                                <BookIcon className="h-8 w-8 text-purple-300" />
                                                <ShieldIcon className="h-8 w-8 text-indigo-300" />
                                        </div>
                                        <h1 className="text-4xl font-bold bg-gradient-to-r from-amber-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
                                                Terms of Service
                                        </h1>
                                        <p className="text-slate-200">
                                                Clear guidelines that keep The Gathering Call safe, fair, and community driven.
                                        </p>
                                        <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/50 bg-amber-500/20 px-5 py-2 text-sm font-semibold text-amber-200">
                                                Last updated: {lastUpdated}
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

                        <div className="rounded-2xl border border-indigo-500/40 bg-slate-900/60 p-8 shadow-xl">
                                <div className="grid gap-6 md:grid-cols-2">
                                        <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-6">
                                                <h3 className="text-lg font-semibold text-amber-200">Hosting with Confidence</h3>
                                                <p className="mt-2 text-sm text-amber-100/80">
                                                        Game Masters benefit from transparent policies that outline expectations, protect your communities, and highlight the value you bring to every session.
                                                </p>
                                        </div>
                                        <div className="rounded-xl border border-purple-500/40 bg-purple-500/10 p-6">
                                                <h3 className="text-lg font-semibold text-purple-200">Players Come First</h3>
                                                <p className="mt-2 text-sm text-purple-100/80">
                                                        Players enjoy safe, inclusive spaces with clear standards for conduct, communication, and dispute resolution across the platform.
                                                </p>
                                        </div>
                                </div>
                        </div>

                        <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-8 shadow-xl text-center">
                                <h2 className="text-2xl font-semibold text-slate-100">Need a hand?</h2>
                                <p className="mt-3 text-sm text-slate-300">
                                        Our support team is here to help with policy questions, account concerns, or anything else you need to keep your adventures running smoothly.
                                </p>
                                <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
                                        <Link
                                                href="/support"
                                                className="rounded-lg border border-amber-500/50 bg-amber-500/20 px-5 py-2 text-sm font-medium text-amber-200 transition hover:bg-amber-500/30"
                                        >
                                                Visit Support Center
                                        </Link>
                                        <Link
                                                href="https://discord.gg/Nx9jPfn6Sb"
                                                className="rounded-lg border border-indigo-500/50 bg-indigo-500/20 px-5 py-2 text-sm font-medium text-indigo-200 transition hover:bg-indigo-500/30"
                                        >
                                                Join Our Discord
                                        </Link>
                                </div>
                        </div>
                </div>
        );
}
