// src/lib/firebase-config.ts
"use client";

// Export the config so Next inlines NEXT_PUBLIC_* properly in the client bundle
export const FIREBASE_CONFIG = {
	apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
	authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
	projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
	storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
	appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
};

// Optional: runtime assertion (client-only)
for (const [k, v] of Object.entries(FIREBASE_CONFIG)) {
	if (!v || v === "undefined") {
		// eslint-disable-next-line no-console
		console.warn(
			`[firebase-config] Missing ${k}. Check your .env.local and restart dev server.`
		);
	}
}
