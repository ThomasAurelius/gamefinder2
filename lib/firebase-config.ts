// src/lib/firebase-config.ts
"use client";

// Validate environment variables at runtime (not build time)
function getRequiredEnvVar(name: string, value: string | undefined): string {
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

// Lazy initialization - only validate when accessed
let _config: {
	apiKey: string;
	authDomain: string;
	projectId: string;
	storageBucket: string;
	appId: string;
} | null = null;

export function getFirebaseConfig() {
	if (_config) return _config;
	
	// Access environment variables directly - Next.js replaces these at build time
	_config = {
		apiKey: getRequiredEnvVar("NEXT_PUBLIC_FIREBASE_API_KEY", process.env.NEXT_PUBLIC_FIREBASE_API_KEY),
		authDomain: getRequiredEnvVar("NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN", process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN),
		projectId: getRequiredEnvVar("NEXT_PUBLIC_FIREBASE_PROJECT_ID", process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID),
		storageBucket: getRequiredEnvVar("NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET", process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET),
		appId: getRequiredEnvVar("NEXT_PUBLIC_FIREBASE_APP_ID", process.env.NEXT_PUBLIC_FIREBASE_APP_ID),
	};
	
	return _config;
}

// Keep FIREBASE_CONFIG for backwards compatibility but make it lazy
export const FIREBASE_CONFIG = new Proxy({} as {
	apiKey: string;
	authDomain: string;
	projectId: string;
	storageBucket: string;
	appId: string;
}, {
	get(_target, prop: string) {
		const config = getFirebaseConfig();
		return config[prop as keyof typeof config];
	}
});
