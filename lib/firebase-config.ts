// src/lib/firebase-config.ts
"use client";

// Validate environment variables at runtime (not build time)
function getRequiredEnvVar(name: string): string {
	const value = process.env[name];
	if (!value || value === "undefined" || value.trim() === "") {
		// Only throw if we're in the browser (not during SSR/build)
		if (typeof window !== "undefined") {
			throw new Error(
				`Missing required Firebase configuration: ${name}. ` +
				`Please add this to your .env.local file and restart the dev server. ` +
				`See .env.example for required environment variables.`
			);
		}
		// Return empty string during SSR/build to avoid build failures
		// The error will be thrown when the user actually tries to use the app
		return "";
	}
	return value;
}

// Export the config so Next inlines NEXT_PUBLIC_* properly in the client bundle
export const FIREBASE_CONFIG = {
	apiKey: getRequiredEnvVar("NEXT_PUBLIC_FIREBASE_API_KEY"),
	authDomain: getRequiredEnvVar("NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN"),
	projectId: getRequiredEnvVar("NEXT_PUBLIC_FIREBASE_PROJECT_ID"),
	storageBucket: getRequiredEnvVar("NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET"),
	appId: getRequiredEnvVar("NEXT_PUBLIC_FIREBASE_APP_ID"),
};
