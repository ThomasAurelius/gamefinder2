"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function OnboardingPage() {
	const router = useRouter();

	useEffect(() => {
		router.replace("/auth/onboarding/step1");
	}, [router]);

	return (
		<div className="flex min-h-screen items-center justify-center">
			<p className="text-slate-400">Redirecting...</p>
		</div>
	);
}
