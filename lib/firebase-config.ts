// src/lib/firebase-config.ts
"use client";

// Validate environment variables at runtime (not build time)
function getRequiredEnvVar(name: string, value: string | undefined): string {
	// Check for missing, undefined string literal, or empty values
	if (!value || value === "undefined" || value.trim() === "") {
		const errorMessage = 
			`Missing required Firebase configuration: ${name}. ` +
			`Please add this to your .env.local file and restart the dev server. ` +
			`See .env.example for required environment variables.`;
		
		console.error(errorMessage);
		
		// Always throw an error - we cannot proceed without proper configuration
		// Firebase will fail with auth/invalid-api-key if we pass empty strings
		throw new Error(errorMessage);
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
	
	try {
		// Access environment variables directly - Next.js replaces these at build time
		_config = {
			apiKey: getRequiredEnvVar("NEXT_PUBLIC_FIREBASE_API_KEY", process.env.NEXT_PUBLIC_FIREBASE_API_KEY),
			authDomain: getRequiredEnvVar("NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN", process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN),
			projectId: getRequiredEnvVar("NEXT_PUBLIC_FIREBASE_PROJECT_ID", process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID),
			storageBucket: getRequiredEnvVar("NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET", process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET),
			appId: getRequiredEnvVar("NEXT_PUBLIC_FIREBASE_APP_ID", process.env.NEXT_PUBLIC_FIREBASE_APP_ID),
		};
		
		// Double-check that no empty strings made it through
		const hasEmptyValues = Object.entries(_config).some(([key, value]) => !value || value.trim() === "");
		if (hasEmptyValues) {
			throw new Error("One or more Firebase configuration values are empty. Please check your .env.local file.");
		}
		
		return _config;
	} catch (error) {
		// Reset config so it will retry on next call
		_config = null;
		throw error;
	}
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
