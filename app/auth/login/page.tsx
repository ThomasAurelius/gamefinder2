"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmail } from "@/lib/firebase-auth";

type FormData = {
  email: string;
  password: string;
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

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
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

    const trimmedEmail = formData.email.trim();
    const trimmedPassword = formData.password.trim();

    if (!trimmedEmail) {
      setError("Email is required.");
      return;
    }

    if (!trimmedPassword) {
      setError("Password is required.");
      return;
    }

    setIsSubmitting(true);

    (async () => {
      try {
        // Sign in with Firebase Authentication
        const userCredential = await signInWithEmail(trimmedEmail, trimmedPassword);
        const user = userCredential.user;

        // Get the ID token to send to the backend
        const idToken = await user.getIdToken();

        // Call the backend API to create a session
        const response = await fetch("/api/auth/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            idToken,
            email: trimmedEmail,
          }),
        });

        const body = await response.json();

        if (!response.ok) {
          const message = typeof body?.error === "string" ? body.error : "Unable to sign in.";
          setError(message);
          return;
        }

        setSuccess("Welcome back! Redirecting to your dashboard...");
        setFormData({ email: "", password: "" });

        window.setTimeout(() => {
          router.push("/dashboard");
        }, 800);
      } catch (submitError: any) {
        console.error("Failed to sign in", submitError);
        
        // Handle Firebase Auth errors
        let errorMessage = "Something went wrong. Please try again.";
        if (submitError?.code === "auth/invalid-credential" || submitError?.code === "auth/wrong-password") {
          errorMessage = "Invalid email or password.";
        } else if (submitError?.code === "auth/user-not-found") {
          errorMessage = "No account found with this email.";
        } else if (submitError?.code === "auth/too-many-requests") {
          errorMessage = "Too many failed attempts. Please try again later.";
        } else if (submitError?.code === "auth/network-request-failed") {
          errorMessage = "Network error. Please check your connection.";
        }
        
        setError(errorMessage);
      } finally {
        setIsSubmitting(false);
      }
    })();
  };

  return (
    <div className="mx-auto max-w-md space-y-6 rounded-2xl border border-white/10 bg-slate-900/60 p-8">
      <div>
        <h1 className="text-2xl font-semibold">Log in</h1>
        <p className="mt-2 text-sm text-slate-300">
          Access your campaigns and continue where you left off.
        </p>
      </div>
      <form className="space-y-4" onSubmit={handleSubmit}>
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
              autoComplete="current-password"
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
          className="w-full rounded-md bg-indigo-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSubmitting ? "Signing in..." : "Sign in"}
        </button>
      </form>
      <div className="flex flex-col gap-2 text-sm text-slate-300">
        <a className="text-indigo-300 hover:text-indigo-200" href="/auth/reset-password">
          Forgot your password?
        </a>
        <a className="text-indigo-300 hover:text-indigo-200" href="/auth/register">
          Create a new account
        </a>
      </div>
    </div>
  );
}
