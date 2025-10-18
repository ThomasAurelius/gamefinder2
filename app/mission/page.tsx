import Link from "next/link";

function HeartIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
    </svg>
  );
}

function UsersIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
    </svg>
  );
}

function ShieldIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z" />
    </svg>
  );
}

export default function MissionPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-8 py-8">
      {/* Hero Section */}
      <div className="rounded-3xl border-2 border-amber-500/50 bg-gradient-to-br from-amber-600/20 via-purple-600/20 to-indigo-600/20 p-8 shadow-2xl">
        <div className="text-center space-y-4">
          <div className="flex justify-center gap-2">
            <HeartIcon className="h-8 w-8 text-amber-400" />
            <UsersIcon className="h-8 w-8 text-purple-400" />
            <ShieldIcon className="h-8 w-8 text-indigo-400" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-amber-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
            Our Mission
          </h1>
          <p className="text-xl text-slate-200 max-w-2xl mx-auto">
            Connecting gamers for epic adventures, one session at a time
          </p>
          <div className="inline-block rounded-full bg-amber-500/20 border border-amber-500/50 px-6 py-2">
            <p className="text-amber-300 font-semibold">
              A Midnight Oil Software LLC Product
            </p>
          </div>
        </div>
      </div>

      {/* Core Mission Statement */}
      <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-8 shadow-xl">
        <h2 className="text-2xl font-bold text-amber-400 mb-6 flex items-center gap-2">
          <HeartIcon className="h-6 w-6" />
          Community First, Always
        </h2>
        <div className="space-y-4 text-slate-200">
          <p className="text-lg">
            The Gathering Call was created with a simple but powerful vision: to help gamers 
            find each other for epic tabletop adventures. We believe that everyone should have 
            access to amazing gaming experiences, regardless of their budget.
          </p>
          <p className="text-lg">
            This isn&apos;t a money grab. This is about building a thriving community where 
            Game Masters and players can connect, create memorable stories, and share their 
            passion for tabletop gaming.
          </p>
        </div>
      </div>

      {/* Our Commitments */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-8 shadow-xl">
          <h2 className="text-2xl font-bold text-purple-400 mb-6 flex items-center gap-2">
            <ShieldIcon className="h-6 w-6" />
            Our Commitments to You
          </h2>
          <ul className="space-y-4">
            <li className="flex items-start gap-3">
              <span className="text-purple-400 mt-1 text-xl">✓</span>
              <div>
                <p className="text-slate-100 font-semibold">Free Games, Forever</p>
                <p className="text-sm text-slate-300">
                  Free games will always be an option on The Gathering Call. If we can&apos;t 
                  operate while offering free games, we will shut down rather than force 
                  everyone to pay.
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-purple-400 mt-1 text-xl">✓</span>
              <div>
                <p className="text-slate-100 font-semibold">Lower Fees Than Competitors</p>
                <p className="text-sm text-slate-300">
                  Our 15% platform fee is significantly lower than other platforms. We keep 
                  fees minimal because this is about supporting the community, not maximizing 
                  profits.
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-purple-400 mt-1 text-xl">✓</span>
              <div>
                <p className="text-slate-100 font-semibold">Transparent Operations</p>
                <p className="text-sm text-slate-300">
                  We&apos;re honest about our fees and where they go: supporting infrastructure, 
                  development, and scaling to serve more gamers.
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-purple-400 mt-1 text-xl">✓</span>
              <div>
                <p className="text-slate-100 font-semibold">Community-Driven Development</p>
                <p className="text-sm text-slate-300">
                  Your feedback shapes our platform. We listen to Game Masters and players 
                  to build the features you actually need.
                </p>
              </div>
            </li>
          </ul>
        </div>

        <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-8 shadow-xl">
          <h2 className="text-2xl font-bold text-indigo-400 mb-6 flex items-center gap-2">
            <UsersIcon className="h-6 w-6" />
            What We Believe
          </h2>
          <ul className="space-y-4">
            <li className="flex items-start gap-3">
              <span className="text-indigo-400 mt-1 text-xl">•</span>
              <div>
                <p className="text-slate-100 font-semibold">Gaming Brings People Together</p>
                <p className="text-sm text-slate-300">
                  Tabletop games create bonds, tell stories, and build communities. We&apos;re 
                  here to facilitate those connections.
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-indigo-400 mt-1 text-xl">•</span>
              <div>
                <p className="text-slate-100 font-semibold">Game Masters Deserve Support</p>
                <p className="text-sm text-slate-300">
                  Running games takes time, creativity, and effort. GMs should have the option 
                  to be compensated fairly for their work while keeping fees reasonable.
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-indigo-400 mt-1 text-xl">•</span>
              <div>
                <p className="text-slate-100 font-semibold">Accessibility Matters</p>
                <p className="text-sm text-slate-300">
                  Whether you&apos;re looking for free games or willing to pay for premium 
                  experiences, there&apos;s a place for you here.
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-indigo-400 mt-1 text-xl">•</span>
              <div>
                <p className="text-slate-100 font-semibold">Quality Over Quantity</p>
                <p className="text-sm text-slate-300">
                  We focus on building tools that truly help gamers connect and organize 
                  sessions, not on flashy features that don&apos;t add value.
                </p>
              </div>
            </li>
          </ul>
        </div>
      </div>

      {/* Fee Structure - Transparent */}
      <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-8 shadow-xl">
        <h2 className="text-2xl font-bold text-amber-400 mb-6 text-center">
          Why Our Fees Matter
        </h2>
        <div className="space-y-4 text-slate-300">
          <p>
            We believe in transparency. Here&apos;s the truth about platform fees:
          </p>
          <div className="grid gap-6 md:grid-cols-2 max-w-4xl mx-auto">
            <div className="rounded-xl bg-amber-500/10 border-2 border-amber-500/50 p-6">
              <h3 className="text-xl font-bold text-amber-400 mb-3 text-center">
                The Gathering Call
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-300">Platform Fee:</span>
                  <span className="text-amber-400 font-semibold">15%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300">Ambassador Fee:</span>
                  <span className="text-emerald-400 font-semibold">0%</span>
                </div>
                <p className="text-xs text-slate-400 mt-3 italic">
                  Plus standard Stripe processing fees (2.9% + $0.30)
                </p>
              </div>
            </div>
            <div className="rounded-xl bg-slate-700/30 border border-slate-600 p-6">
              <h3 className="text-xl font-bold text-slate-300 mb-3 text-center">
                Typical Competitors
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-300">Platform Fee:</span>
                  <span className="text-rose-400 font-semibold">20-30%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300">Additional Fees:</span>
                  <span className="text-rose-400 font-semibold">Varies</span>
                </div>
                <p className="text-xs text-slate-400 mt-3 italic">
                  Plus payment processing fees
                </p>
              </div>
            </div>
          </div>
          <p className="text-center text-amber-300 font-semibold mt-6">
            💰 Our lower fees mean more money for Game Masters and better value for players!
          </p>
        </div>
      </div>

      {/* About Midnight Oil Software */}
      <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-8 shadow-xl">
        <h2 className="text-2xl font-bold text-purple-400 mb-4 text-center">
          About Midnight Oil Software LLC
        </h2>
        <p className="text-slate-300 text-center max-w-3xl mx-auto">
          The Gathering Call is proudly developed and maintained by Midnight Oil Software LLC, 
          a company dedicated to building tools that serve gaming communities. We&apos;re gamers 
          ourselves, and we&apos;re committed to creating platforms that reflect our values: 
          community, accessibility, and fair treatment for everyone.
        </p>
      </div>

      {/* Sustainable Growth */}
      <div className="rounded-2xl border border-indigo-500/50 bg-slate-900/60 p-8 shadow-xl">
        <h2 className="text-2xl font-bold text-indigo-400 mb-4">
          Sustainable Growth
        </h2>
        <div className="space-y-4 text-slate-300">
          <p>
            Our fees exist to support the platform&apos;s future growth. As more gamers join 
            The Gathering Call, we need to:
          </p>
          <ul className="space-y-3 ml-6">
            <li className="flex items-start gap-3">
              <span className="text-indigo-400 mt-1">•</span>
              <span>Scale our infrastructure to handle more users and sessions</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-indigo-400 mt-1">•</span>
              <span>Continue developing new features requested by the community</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-indigo-400 mt-1">•</span>
              <span>Provide reliable support for Game Masters and players</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-indigo-400 mt-1">•</span>
              <span>Maintain secure payment processing and data protection</span>
            </li>
          </ul>
          <p className="text-sm text-slate-400 italic mt-4">
            Every dollar we collect goes right back into making The Gathering Call better 
            for the entire community.
          </p>
        </div>
      </div>

      {/* Call to Action */}
      <div className="rounded-2xl border-2 border-amber-500/50 bg-gradient-to-br from-amber-600/20 via-purple-600/20 to-indigo-600/20 p-8 shadow-xl text-center">
        <h2 className="text-2xl font-bold text-slate-100 mb-4">
          Join Our Community
        </h2>
        <p className="text-slate-200 mb-6 max-w-2xl mx-auto">
          Whether you&apos;re a Game Master looking to host sessions or a player seeking 
          your next adventure, The Gathering Call is here for you.
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <Link
            href="/find-campaigns"
            className="rounded-lg bg-gradient-to-r from-amber-500 via-purple-500 to-indigo-500 px-6 py-3 text-sm font-medium text-white transition hover:from-amber-400 hover:via-purple-400 hover:to-indigo-400"
          >
            Find a Campaign
          </Link>
          <Link
            href="/dashboard"
            className="rounded-lg border border-slate-700 px-6 py-3 text-sm font-medium text-slate-200 transition hover:bg-slate-800"
          >
            Start Hosting
          </Link>
          <Link
            href="/ambassador"
            className="rounded-lg border border-amber-500/50 bg-amber-500/20 px-6 py-3 text-sm font-medium text-amber-300 transition hover:bg-amber-500/30"
          >
            Become an Ambassador
          </Link>
        </div>
      </div>

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
  );
}
