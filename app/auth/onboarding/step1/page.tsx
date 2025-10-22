"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function OnboardingStep1() {
	const router = useRouter();

	useEffect(() => {
		// Step 1 has been deprecated - registration now happens at /auth/register
		// Redirect users to registration page
		router.replace("/auth/register");
	}, [router]);

	return (
		<div className="flex min-h-screen items-center justify-center">
			<p className="text-slate-400">Redirecting...</p>
		</div>
	);
}
