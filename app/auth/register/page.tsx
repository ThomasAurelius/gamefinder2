export default function RegisterPage() {
  return (
    <div className="mx-auto max-w-md space-y-6 rounded-2xl border border-white/10 bg-slate-900/60 p-8">
      <div>
        <h1 className="text-2xl font-semibold">Create an account</h1>
        <p className="mt-2 text-sm text-slate-300">
          Join GameFinder to track campaigns and share adventures with friends.
        </p>
      </div>
      <form className="space-y-4">
        <label className="block text-sm">
          <span className="text-slate-200">Display name</span>
          <input
            type="text"
            name="name"
            className="mt-1 w-full rounded-md border border-white/10 bg-slate-950 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            placeholder="Alex the Adventurer"
          />
        </label>
        <label className="block text-sm">
          <span className="text-slate-200">Email</span>
          <input
            type="email"
            name="email"
            className="mt-1 w-full rounded-md border border-white/10 bg-slate-950 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            placeholder="you@example.com"
          />
        </label>
        <label className="block text-sm">
          <span className="text-slate-200">Password</span>
          <input
            type="password"
            name="password"
            className="mt-1 w-full rounded-md border border-white/10 bg-slate-950 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            placeholder="••••••••"
          />
        </label>
        <button
          type="submit"
          className="w-full rounded-md bg-indigo-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-400"
        >
          Register
        </button>
      </form>
      <p className="text-sm text-slate-300">
        Already have an account?{" "}
        <a className="text-indigo-300 hover:text-indigo-200" href="/auth/login">
          Log in
        </a>
      </p>
    </div>
  );
}
