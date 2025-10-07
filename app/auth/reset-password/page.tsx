interface ResetPasswordPageProps {
  searchParams: Promise<{ token?: string }>;
}

export default async function ResetPasswordPage({ searchParams }: ResetPasswordPageProps) {
  const params = await searchParams;
  const hasToken = Boolean(params?.token);

  return (
    <div className="mx-auto max-w-md space-y-6 rounded-2xl border border-white/10 bg-slate-900/60 p-8">
      <div>
        <h1 className="text-2xl font-semibold">
          {hasToken ? "Choose a new password" : "Reset your password"}
        </h1>
        <p className="mt-2 text-sm text-slate-300">
          {hasToken
            ? "Enter a new password to finish resetting access to your account."
            : "Enter your email address and we will send you a reset link."}
        </p>
      </div>
      <form className="space-y-4">
        {hasToken ? (
          <>
            <input type="hidden" name="token" value={params?.token} />
            <label className="block text-sm">
              <span className="text-slate-200">New password</span>
              <input
                type="password"
                name="password"
                className="mt-1 w-full rounded-md border border-white/10 bg-slate-950 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                placeholder="••••••••"
              />
            </label>
            <label className="block text-sm">
              <span className="text-slate-200">Confirm password</span>
              <input
                type="password"
                name="confirmPassword"
                className="mt-1 w-full rounded-md border border-white/10 bg-slate-950 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                placeholder="••••••••"
              />
            </label>
          </>
        ) : (
          <label className="block text-sm">
            <span className="text-slate-200">Email</span>
            <input
              type="email"
              name="email"
              className="mt-1 w-full rounded-md border border-white/10 bg-slate-950 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              placeholder="you@example.com"
            />
          </label>
        )}
        <button
          type="submit"
          className="w-full rounded-md bg-indigo-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-400"
        >
          {hasToken ? "Update password" : "Send reset link"}
        </button>
      </form>
    </div>
  );
}
