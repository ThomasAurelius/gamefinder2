export default function HomePage() {
  return (
    <div className="space-y-10">
      <section className="rounded-2xl border border-white/10 bg-slate-900/50 p-8 shadow-xl">
        <h1 className="text-3xl font-bold sm:text-4xl">Welcome to GameFinder</h1>
        <p className="mt-4 max-w-2xl text-base text-slate-300">
          Build your tabletop adventures, manage characters, and discover new
          games with ease. Use the navigation above to explore the dashboard,
          curate your library, or find the perfect game night.
        </p>
      </section>
      <section className="grid gap-6 sm:grid-cols-2">
        <article className="rounded-xl border border-white/5 bg-slate-900/60 p-6">
          <h2 className="text-xl font-semibold">Stay Organized</h2>
          <p className="mt-2 text-sm text-slate-300">
            Track campaigns, monitor upcoming sessions, and keep your group on
            the same page from one convenient hub.
          </p>
        </article>
        <article className="rounded-xl border border-white/5 bg-slate-900/60 p-6">
          <h2 className="text-xl font-semibold">Discover &amp; Share</h2>
          <p className="mt-2 text-sm text-slate-300">
            Browse curated game recommendations and share your favorites with
            friends in just a few clicks.
          </p>
        </article>
      </section>
    </div>
  );
}
