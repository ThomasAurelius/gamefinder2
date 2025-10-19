import Link from "next/link";

function LifebuoyIcon({ className }: { className?: string }) {
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
                        <circle cx="12" cy="12" r="10" />
                        <circle cx="12" cy="12" r="4" />
                        <path d="m4.93 4.93 3.54 3.54" />
                        <path d="m15.53 15.53 3.54 3.54" />
                        <path d="m4.93 19.07 3.54-3.54" />
                        <path d="m15.53 8.47 3.54-3.54" />
                </svg>
        );
}

function SparkIcon({ className }: { className?: string }) {
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
                        <path d="M12 3v4" />
                        <path d="M12 17v4" />
                        <path d="M3 12h4" />
                        <path d="M17 12h4" />
                        <path d="m5.6 5.6 2.8 2.8" />
                        <path d="m15.6 15.6 2.8 2.8" />
                        <path d="m18.4 5.6-2.8 2.8" />
                        <path d="m8.4 15.6-2.8 2.8" />
                </svg>
        );
}

function EnvelopeIcon({ className }: { className?: string }) {
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
                        <path d="M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" />
                        <path d="m22 6-10 7L2 6" />
                </svg>
        );
}

const resourceLinks = [
        { href: "/mission", label: "Our Mission" },
        { href: "/terms", label: "Terms of Service" },
        { href: "/privacy", label: "Privacy Policy" },
        { href: "/technical-reference", label: "Technical Reference" },
        { href: "/about-hosting-paid-games", label: "Paid Hosting Guide" },
        { href: "/terms-paid-games", label: "Paid Games Terms" },
        { href: "/sms-consent", label: "SMS Consent" },
];

export default function SupportPage() {
        return (
                <div className="mx-auto max-w-5xl space-y-8 py-8">
                        <div className="rounded-3xl border-2 border-amber-500/50 bg-gradient-to-br from-amber-600/20 via-purple-600/20 to-indigo-600/20 p-8 shadow-2xl">
                                <div className="text-center space-y-4">
                                        <div className="flex justify-center gap-4">
                                                <LifebuoyIcon className="h-8 w-8 text-amber-400" />
                                                <SparkIcon className="h-8 w-8 text-purple-300" />
                                                <EnvelopeIcon className="h-8 w-8 text-indigo-300" />
                                        </div>
                                        <h1 className="text-4xl font-bold bg-gradient-to-r from-amber-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
                                                Support Center
                                        </h1>
                                        <p className="text-slate-200 max-w-2xl mx-auto">
                                                Find answers quickly, explore platform resources, and connect with our team whenever you need help.
                                        </p>
                                </div>
                        </div>

                        <section className="rounded-2xl border border-white/10 bg-slate-900/60 p-8 shadow-xl">
                                <h2 className="text-2xl font-semibold text-amber-300">Self-Service Resources</h2>
                                <p className="mt-3 text-sm text-slate-300">
                                        Browse our guides and policy pages to learn how The Gathering Call supports Game Masters and players alike.
                                </p>
                                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                                        {resourceLinks.map((link) => (
                                                <Link
                                                        key={link.href}
                                                        href={link.href}
                                                        className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm font-medium text-amber-100 transition hover:bg-amber-500/20"
                                                >
                                                        {link.label}
                                                </Link>
                                        ))}
                                </div>
                        </section>

                        <section className="rounded-2xl border border-white/10 bg-slate-900/60 p-8 shadow-xl">
                                <h2 className="text-2xl font-semibold text-purple-300">Community Support</h2>
                                <p className="mt-3 text-sm text-slate-300">
                                        Join our community server to get live help from The Gathering Call team and fellow GMs.
                                </p>
                                <div className="mt-6 flex flex-wrap gap-4">
                                        <Link
                                                href="https://discord.gg/Nx9jPfn6Sb"
                                                className="rounded-lg border border-purple-500/40 bg-purple-500/10 px-5 py-2 text-sm font-semibold text-purple-100 transition hover:bg-purple-500/20"
                                        >
                                                Join the Discord Support Server
                                        </Link>
                                        <Link
                                                href="https://discord.gg/Nx9jPfn6Sb"
                                                className="rounded-lg border border-white/10 px-5 py-2 text-sm font-medium text-slate-200 transition hover:border-white/30"
                                        >
                                                Review Community Guidelines
                                        </Link>
                                </div>
                        </section>

                        <section className="rounded-2xl border border-white/10 bg-slate-900/60 p-8 shadow-xl">
                                <h2 className="text-2xl font-semibold text-indigo-300">Need Direct Assistance?</h2>
                                <div className="mt-6 grid gap-6 md:grid-cols-2">
                                        <div className="rounded-xl border border-indigo-500/30 bg-indigo-500/10 p-5">
                                                <h3 className="text-lg font-semibold text-indigo-100">Send Us a Message</h3>
                                                <p className="mt-2 text-sm text-slate-100/80">
                                                        Reach out from your in-app Messages by starting a conversation with our support team. We typically respond within one business day.
                                                </p>
                                                <Link
                                                        href="/messages"
                                                        className="mt-4 inline-flex items-center justify-center rounded-lg border border-indigo-500/40 bg-indigo-500/20 px-4 py-2 text-sm font-medium text-indigo-100 transition hover:bg-indigo-500/30"
                                                >
                                                        Open Messages
                                                </Link>
                                        </div>
                                        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-5">
                                                <h3 className="text-lg font-semibold text-emerald-100">Email Our Team</h3>
                                                <p className="mt-2 text-sm text-slate-100/80">
                                                        Prefer email? Contact us at <a className="text-emerald-100 underline decoration-emerald-300/60 underline-offset-4 transition hover:text-emerald-50" href="mailto:support@thegatheringcall.com">support@thegatheringcall.com</a> for billing, account, or policy questions.
                                                </p>
                                        </div>
                                </div>
                        </section>

                        <section className="rounded-2xl border-2 border-amber-500/50 bg-gradient-to-br from-amber-600/20 via-purple-600/20 to-indigo-600/20 p-8 text-center shadow-2xl">
                                <h2 className="text-2xl font-semibold text-slate-100">We&apos;re Here to Help</h2>
                                <p className="mt-3 text-sm text-slate-200 max-w-2xl mx-auto">
                                        Whether you&apos;re launching a new campaign, exploring paid games, or joining your first session, our team is ready to support your journey on The Gathering Call.
                                </p>
                        </section>
                </div>
        );
}
