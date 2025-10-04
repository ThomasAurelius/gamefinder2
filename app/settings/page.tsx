"use client";

import Link from "next/link";

export default function SettingsPage() {
  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-semibold">Settings</h1>
      <p className="text-sm text-slate-300">
        Configure account security, notification preferences, and connected
        services from this settings hub.
      </p>

      <div className="space-y-6 rounded-2xl border border-slate-800/60 bg-slate-900/40 p-6 shadow-lg shadow-slate-900/30">
        <div className="space-y-4">
          <div className="rounded-lg border border-slate-700/50 bg-slate-800/30 p-4">
            <h2 className="text-sm font-medium text-slate-200">Profile Settings</h2>
            <p className="mt-2 text-xs text-slate-400">
              Timezone and other profile settings are now managed in your Profile page.
            </p>
            <Link
              href="/profile"
              className="mt-3 inline-block rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-sky-700"
            >
              Go to Profile
            </Link>
          </div>
          
          <div className="rounded-lg border border-slate-700/50 bg-slate-800/30 p-4">
            <p className="text-sm text-slate-400">
              Additional settings will be available here in the future.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
