"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { registerWithEmail } from "@/lib/firebase-auth";

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

export default function OnboardingStep1() {
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
	const [isSubmitting, setIsSubmitting] = useState(false);

	const handleChange =
		(field: keyof FormData) => (event: ChangeEvent<HTMLInputElement>) => {
			setFormData((prev) => ({ ...prev, [field]: event.target.value }));
		};

	const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		setError(null);

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

		if (trimmedPassword.length < 6) {
			setError("Password must be at least 6 characters long.");
			return;
		}

		if (trimmedPassword !== trimmedConfirmPassword) {
			setError("Passwords do not match.");
			return;
		}

		setIsSubmitting(true);

		(async () => {
			try {
				// Register with Firebase Authentication
				const userCredential = await registerWithEmail(
					trimmedEmail,
					trimmedPassword
				);
				const user = userCredential.user;

				// Get the ID token to send to the backend
				const idToken = await user.getIdToken();

				// Call the backend API to create user profile in MongoDB
				const response = await fetch("/api/auth/register", {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						idToken,
						name: trimmedName,
						email: trimmedEmail,
					}),
				});

				const body = await response.json();

				if (!response.ok) {
					const message =
						typeof body?.error === "string"
							? body.error
							: "Unable to create account.";
					setError(message);
					return;
				}

				// Move to step 2
				router.push("/auth/onboarding/step2");
			} catch (submitError: unknown) {
				console.error("Failed to submit registration", submitError);

				// Handle Firebase Auth errors
				let errorMessage = "Something went wrong. Please try again.";
				const error = submitError as { code?: string; message?: string };

				// Check for configuration errors first
				if (
					error?.message?.includes("Firebase") &&
					error?.message?.includes("configuration")
				) {
					errorMessage =
						"Authentication service is not properly configured. Please contact support.";
				} else if (error?.code === "auth/email-already-in-use") {
					errorMessage = "An account with that email already exists.";
				} else if (error?.code === "auth/invalid-email") {
					errorMessage = "Invalid email address.";
				} else if (error?.code === "auth/weak-password") {
					errorMessage =
						"Password is too weak. Please use at least 6 characters.";
				} else if (error?.code === "auth/network-request-failed") {
					errorMessage = "Network error. Please check your connection.";
				} else if (error?.code === "auth/invalid-api-key") {
					errorMessage =
						"Authentication service configuration error. Please contact support.";
				} else if (error?.message) {
					// Include the actual error message for debugging in development
					if (process.env.NODE_ENV === "development") {
						errorMessage = `Error: ${error.message}`;
					}
				}

				setError(errorMessage);
			} finally {
				setIsSubmitting(false);
			}
		})();
	};

	return (
		<div className="mx-auto max-w-5xl space-y-8 py-8">
			{/* Progress Indicator */}
			<div className="flex items-center justify-center gap-2">
				<div className="h-2 w-2 rounded-full bg-gradient-to-r from-amber-500 via-purple-500 to-indigo-500" />
				<div className="h-2 w-2 rounded-full bg-slate-700" />
				<div className="h-2 w-2 rounded-full bg-slate-700" />
				<div className="h-2 w-2 rounded-full bg-slate-700" />
			</div>

			<div className="mx-auto max-w-md space-y-6 rounded-2xl border border-white/10 bg-slate-900/60 p-8">
				<div className="text-center">
					<h1 className="text-3xl font-bold bg-gradient-to-r from-amber-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
						Welcome to The Gathering Call
					</h1>
					<p className="mt-4 text-sm text-slate-300">
						Let&apos;s get started by creating your account
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
							placeholder="Alex the Adventurer"
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
								aria-label={
									showPassword ? "Hide password" : "Show password"
								}
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
								aria-label={
									showConfirmPassword ? "Hide password" : "Show password"
								}
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
					<button
						type="submit"
						disabled={isSubmitting}
						className="w-full rounded-md bg-gradient-to-r from-amber-500 via-purple-500 to-indigo-500 px-4 py-2 text-sm font-semibold text-white transition hover:from-amber-400 hover:via-purple-400 hover:to-indigo-400 disabled:cursor-not-allowed disabled:opacity-70"
					>
						{isSubmitting ? "Creating account..." : "Continue"}
					</button>
				</form>

				<p className="text-center text-sm text-slate-300">
					Already have an account?{" "}
					<a
						className="text-indigo-300 hover:text-indigo-200"
						href="/auth/login"
					>
						Log in
					</a>
				</p>
			</div>
		</div>
	);
}
