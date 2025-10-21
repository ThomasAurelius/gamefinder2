"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import { sendPasswordReset } from "@/lib/firebase-auth";

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setEmail(event.target.value);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      setError("Email is required.");
      return;
    }

    setIsSubmitting(true);

    (async () => {
      try {
        await sendPasswordReset(trimmedEmail);
        setSuccess("Password reset email sent! Check your inbox.");
        setEmail("");
      } catch (submitError: any) {
        console.error("Failed to send reset email", submitError);
        
        // Handle Firebase Auth errors
        let errorMessage = "Something went wrong. Please try again.";
        if (submitError?.code === "auth/user-not-found") {
          errorMessage = "No account found with this email.";
        } else if (submitError?.code === "auth/invalid-email") {
          errorMessage = "Invalid email address.";
        } else if (submitError?.code === "auth/too-many-requests") {
          errorMessage = "Too many requests. Please try again later.";
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
        <h1 className="text-2xl font-semibold">Reset your password</h1>
        <p className="mt-2 text-sm text-slate-300">
          Enter your email address and we will send you a reset link.
        </p>
      </div>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <label className="block text-sm">
          <span className="text-slate-200">Email</span>
          <input
            type="email"
            name="email"
            value={email}
            onChange={handleChange}
            className="mt-1 w-full rounded-md border border-white/10 bg-slate-950 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            placeholder="you@example.com"
            autoComplete="email"
            required
          />
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
          {isSubmitting ? "Sending..." : "Send reset link"}
        </button>
      </form>
      <p className="text-sm text-slate-300">
        Remember your password?{" "}
        <a className="text-indigo-300 hover:text-indigo-200" href="/auth/login">
          Log in
        </a>
      </p>
    </div>
  );
}
