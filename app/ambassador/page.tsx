"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import { useRouter } from "next/navigation";

type FormData = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
};

function EyeIcon({ className }: { className?: string }) {
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
      aria-hidden
    >
      <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon({ className }: { className?: string }) {
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
      aria-hidden
    >
      <path d="M17.94 17.94A10.94 10.94 0 0 1 12 19C5 19 1 12 1 12a18.53 18.53 0 0 1 5.11-5.64" />
      <path d="M22.54 12.46a18.5 18.5 0 0 0-5.05-5.27" />
      <path d="M14.12 14.12a3 3 0 0 1-4.24-4.24" />
      <path d="m1 1 22 22" />
    </svg>
  );
}

function StarIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden
    >
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  );
}

export default function AmbassadorSignupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (field: keyof FormData) =>
    (event: ChangeEvent<HTMLInputElement>) => {
      setFormData((prev) => ({ ...prev, [field]: event.target.value }));
    };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    const trimmedName = formData.name.trim();
    const trimmedEmail = formData.email.trim();
    const trimmedPassword = formData.password.trim();
    const trimmedConfirmPassword = formData.confirmPassword.trim();

    if (!trimmedEmail) {
      setError("Email is required.");
      return;
    }

    if (!trimmedPassword) {
      setError("Password is required.");
      return;
    }

    if (trimmedPassword !== trimmedConfirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);

    (async () => {
      try {
        const response = await fetch("/api/auth/register", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: trimmedName,
            email: trimmedEmail,
            password: trimmedPassword,
            isAmbassador: true,
          }),
        });

        const body = await response.json();

        if (!response.ok) {
          const message = typeof body?.error === "string" ? body.error : "Unable to create account.";
          setError(message);
          return;
        }

        setSuccess("Ambassador account created! Redirecting to login...");
        setFormData({ name: "", email: "", password: "", confirmPassword: "" });

        window.setTimeout(() => {
          router.push("/auth/login");
        }, 1200);
      } catch (submitError) {
        console.error("Failed to submit registration", submitError);
        setError("Something went wrong. Please try again.");
      } finally {
        setIsSubmitting(false);
      }
    })();
  };

  return (
    <div className="mx-auto max-w-5xl space-y-8 py-8">
      {/* Hero Section */}
      <div className="rounded-3xl border-2 border-amber-500/50 bg-gradient-to-br from-amber-600/20 via-purple-600/20 to-indigo-600/20 p-8 shadow-2xl">
        <div className="text-center space-y-4">
          <div className="flex justify-center gap-2">
            <StarIcon className="h-8 w-8 text-amber-400" />
            <StarIcon className="h-8 w-8 text-amber-400" />
            <StarIcon className="h-8 w-8 text-amber-400" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-amber-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
            Become a Gathering Call Ambassador
          </h1>
          <p className="text-xl text-slate-200 max-w-2xl mx-auto">
            Join our exclusive program and help grow The Gathering Call community while earning incredible benefits!
          </p>
          <div className="inline-block rounded-full bg-amber-500/20 border border-amber-500/50 px-6 py-2">
            <p className="text-amber-300 font-semibold">
              🎉 Program Active Until June 30th, 2026
            </p>
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-8 shadow-xl">
          <h2 className="text-2xl font-bold text-amber-400 mb-6 flex items-center gap-2">
            <StarIcon className="h-6 w-6" />
            Ambassador Benefits
          </h2>
          <ul className="space-y-4">
            <li className="flex items-start gap-3">
              <span className="text-amber-400 mt-1 text-xl">✓</span>
              <div>
                <p className="text-slate-100 font-semibold">Zero Platform Fees</p>
                <p className="text-sm text-slate-300">
                  Keep more of your earnings! Only pay Stripe&apos;s 2.9% + $0.30 transaction fee. 
                  Regular DMs pay an additional 15% platform fee.
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-amber-400 mt-1 text-xl">✓</span>
              <div>
                <p className="text-slate-100 font-semibold">Exclusive Ambassador Badge</p>
                <p className="text-sm text-slate-300">
                  Stand out with a special badge on your profile showing you&apos;re a valued community leader.
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-amber-400 mt-1 text-xl">✓</span>
              <div>
                <p className="text-slate-100 font-semibold">Priority Support</p>
                <p className="text-sm text-slate-300">
                  Get faster responses and dedicated assistance when you need help.
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-amber-400 mt-1 text-xl">✓</span>
              <div>
                <p className="text-slate-100 font-semibold">Early Access</p>
                <p className="text-sm text-slate-300">
                  Be the first to try new features and provide feedback that shapes the platform.
                </p>
              </div>
            </li>
          </ul>
        </div>

        <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-8 shadow-xl">
          <h2 className="text-2xl font-bold text-purple-400 mb-6">
            How It Works
          </h2>
          <ul className="space-y-4">
            <li className="flex items-start gap-3">
              <span className="rounded-full bg-purple-500/20 text-purple-400 font-bold px-3 py-1">1</span>
              <div className="flex-1">
                <p className="text-slate-100 font-semibold">Sign Up as an Ambassador</p>
                <p className="text-sm text-slate-300">
                  Create your account using the form below to instantly activate your ambassador benefits.
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="rounded-full bg-purple-500/20 text-purple-400 font-bold px-3 py-1">2</span>
              <div className="flex-1">
                <p className="text-slate-100 font-semibold">Help Grow Our Community</p>
                <p className="text-sm text-slate-300">
                  Share The Gathering Call with your players, fellow DMs, and gaming communities.
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="rounded-full bg-purple-500/20 text-purple-400 font-bold px-3 py-1">3</span>
              <div className="flex-1">
                <p className="text-slate-100 font-semibold">Enjoy Your Benefits</p>
                <p className="text-sm text-slate-300">
                  Host paid campaigns with zero platform fees and maximize your earnings until June 30th, 2026.
                </p>
              </div>
            </li>
          </ul>
        </div>
      </div>

      {/* Fee Comparison */}
      <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-8 shadow-xl">
        <h2 className="text-2xl font-bold text-indigo-400 mb-6 text-center">
          See the Difference
        </h2>
        <div className="grid gap-6 md:grid-cols-2 max-w-3xl mx-auto">
          <div className="rounded-xl bg-amber-500/10 border-2 border-amber-500/50 p-6">
            <div className="text-center mb-4">
              <StarIcon className="h-8 w-8 text-amber-400 mx-auto mb-2" />
              <h3 className="text-xl font-bold text-amber-400">Ambassador DM</h3>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-300">Campaign Fee:</span>
                <span className="text-white font-semibold">$100.00</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-300">Platform Fee (0%):</span>
                <span className="text-amber-400 font-semibold">$0.00</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-300">Stripe Fee (2.9% + $0.30):</span>
                <span className="text-white">$3.20</span>
              </div>
              <div className="border-t border-amber-500/30 pt-2 mt-2 flex justify-between">
                <span className="text-amber-300 font-bold">You Keep:</span>
                <span className="text-amber-300 font-bold text-lg">$96.80</span>
              </div>
            </div>
          </div>
          <div className="rounded-xl bg-slate-700/30 border border-slate-600 p-6">
            <div className="text-center mb-4">
              <h3 className="text-xl font-bold text-slate-300">Regular DM</h3>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-300">Campaign Fee:</span>
                <span className="text-white font-semibold">$100.00</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-300">Platform Fee (15%):</span>
                <span className="text-rose-400">-$15.00</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-300">Stripe Fee (2.9% + $0.30):</span>
                <span className="text-white">-$3.20</span>
              </div>
              <div className="border-t border-slate-600 pt-2 mt-2 flex justify-between">
                <span className="text-slate-300 font-bold">You Keep:</span>
                <span className="text-slate-300 font-bold text-lg">$81.80</span>
              </div>
            </div>
          </div>
        </div>
        <p className="text-center text-amber-300 font-semibold mt-6 text-lg">
          💰 Save $15 per $100 earned as an Ambassador!
        </p>
      </div>

      {/* Signup Form */}
      <div className="mx-auto max-w-md">
        <div className="rounded-2xl border-2 border-indigo-500/50 bg-slate-900/80 p-8 shadow-xl">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-indigo-300">Join Now</h2>
            <p className="mt-2 text-sm text-slate-300">
              Create your ambassador account and start enjoying the benefits today!
            </p>
          </div>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <label className="block text-sm">
              <span className="text-slate-200">Display name</span>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange("name")}
                className="mt-1 w-full rounded-md border border-white/10 bg-slate-950 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                placeholder="Your name"
                autoComplete="nickname"
              />
            </label>
            <label className="block text-sm">
              <span className="text-slate-200">Email</span>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange("email")}
                className="mt-1 w-full rounded-md border border-white/10 bg-slate-950 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                placeholder="you@example.com"
                autoComplete="email"
                required
              />
            </label>
            <label className="block text-sm">
              <span className="text-slate-200">Password</span>
              <div className="relative mt-1">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange("password")}
                  className="w-full rounded-md border border-white/10 bg-slate-950 px-3 py-2 pr-10 text-sm text-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  placeholder="••••••••"
                  autoComplete="new-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute inset-y-0 right-0 flex items-center px-3 text-slate-300 transition hover:text-white"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  aria-pressed={showPassword}
                >
                  {showPassword ? (
                    <EyeOffIcon className="h-4 w-4" />
                  ) : (
                    <EyeIcon className="h-4 w-4" />
                  )}
                </button>
              </div>
            </label>
            <label className="block text-sm">
              <span className="text-slate-200">Verify password</span>
              <div className="relative mt-1">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange("confirmPassword")}
                  className="w-full rounded-md border border-white/10 bg-slate-950 px-3 py-2 pr-10 text-sm text-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  placeholder="••••••••"
                  autoComplete="new-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  className="absolute inset-y-0 right-0 flex items-center px-3 text-slate-300 transition hover:text-white"
                  aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                  aria-pressed={showConfirmPassword}
                >
                  {showConfirmPassword ? (
                    <EyeOffIcon className="h-4 w-4" />
                  ) : (
                    <EyeIcon className="h-4 w-4" />
                  )}
                </button>
              </div>
            </label>
            {error ? (
              <p className="text-sm text-rose-400" role="alert">
                {error}
              </p>
            ) : null}
            {success ? (
              <p className="text-sm text-emerald-400" role="status">
                {success}
              </p>
            ) : null}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-md bg-gradient-to-r from-amber-500 via-purple-500 to-indigo-500 px-4 py-2 text-sm font-semibold text-white transition hover:from-amber-400 hover:via-purple-400 hover:to-indigo-400 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? "Creating Ambassador Account..." : "Become an Ambassador"}
            </button>
          </form>
          <p className="mt-4 text-center text-sm text-slate-300">
            Already have an account?{" "}
            <a className="text-indigo-300 hover:text-indigo-200" href="/auth/login">
              Log in
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
