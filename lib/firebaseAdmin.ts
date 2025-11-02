// src/lib/firebaseAdmin.ts
// Server-side Firebase Admin initialization with two credential options:
// 1) FILE:  FIREBASE_SERVICE_ACCOUNT_PATH=./firebase-service-account.json
// 2) INLINE: FIREBASE_SERVICE_ACCOUNT_JSON='{"type":"service_account", ...}'
// Also exports helpers to delete Storage objects by **download URL**.

import { readFileSync } from "fs";
import { resolve } from "path";
import { initializeApp, cert, getApps, getApp } from "firebase-admin/app";
import type { ServiceAccount, AppOptions } from "firebase-admin/app";
import { getStorage } from "firebase-admin/storage";

// Type for raw JSON service account (snake_case properties from JSON file)
interface RawServiceAccount {
	project_id?: string;
	private_key?: string;
	client_email?: string;
	[key: string]: unknown;
}

function tryParseJson(value: string, source: string): ServiceAccount {
	try {
		return JSON.parse(value);
	} catch (error) {
		throw new Error(
			`Invalid Firebase service account JSON from ${source}: ${String(error)}`
		);
	}
}

// Type guard to check if an object has a private_key property
function hasPrivateKey(obj: unknown): obj is { private_key: string } {
	return (
		typeof obj === "object" &&
		obj !== null &&
		"private_key" in obj &&
		typeof (obj as { private_key: unknown }).private_key === "string"
	);
}

// Normalize private key to have actual newline characters
// When stored in environment variables, \n is often stored as literal string instead of newline
function normalizePrivateKey(privateKey: string): string {
	// If the key contains literal \n strings, replace them with actual newlines
	// This handles cases like: "-----BEGIN PRIVATE KEY-----\nMIIE...\n-----END PRIVATE KEY-----"
	if (privateKey.includes("\\n")) {
		return privateKey.replace(/\\n/g, "\n");
	}
	return privateKey;
}

function loadServiceAccount() {
	// Check for inline JSON first
	const inline = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
	if (inline) {
		console.log("Using FIREBASE_SERVICE_ACCOUNT_JSON for Firebase Admin");
		const account = tryParseJson(inline, "FIREBASE_SERVICE_ACCOUNT_JSON");
		// Normalize private key if present
		if (hasPrivateKey(account)) {
			account.private_key = normalizePrivateKey(account.private_key);
		}
		return account;
	}

	// Check for base64 encoded JSON
	const base64 = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;
	if (base64) {
		console.log("Using FIREBASE_SERVICE_ACCOUNT_BASE64 for Firebase Admin");
		const decoded = Buffer.from(base64, "base64").toString("utf-8");
		const account = tryParseJson(decoded, "FIREBASE_SERVICE_ACCOUNT_BASE64");
		// Normalize private key if present
		if (hasPrivateKey(account)) {
			account.private_key = normalizePrivateKey(account.private_key);
		}
		return account;
	}

	// Check for file path
	const pathEnv =
		process.env.FIREBASE_SERVICE_ACCOUNT_PATH ||
		process.env.GOOGLE_APPLICATION_CREDENTIALS;
	if (pathEnv) {
		console.log(`Using file path for Firebase Admin: ${pathEnv}`);
		const resolvedPath = resolve(pathEnv);
		try {
			const fileContents = readFileSync(resolvedPath, "utf-8");
			const account = tryParseJson(fileContents, resolvedPath);
			// Normalize private key if present (though file-based keys are usually fine)
			if (hasPrivateKey(account)) {
				account.private_key = normalizePrivateKey(account.private_key);
			}
			return account;
		} catch (error) {
			throw new Error(
				`Unable to read Firebase service account file at ${resolvedPath}: ${error}`
			);
		}
	}

	// Provide detailed error message about what's missing
	const envVarsStatus = {
		FIREBASE_SERVICE_ACCOUNT_JSON: process.env.FIREBASE_SERVICE_ACCOUNT_JSON
			? "SET"
			: "NOT SET",
		FIREBASE_SERVICE_ACCOUNT_BASE64: process.env
			.FIREBASE_SERVICE_ACCOUNT_BASE64
			? "SET"
			: "NOT SET",
		FIREBASE_SERVICE_ACCOUNT_PATH: process.env.FIREBASE_SERVICE_ACCOUNT_PATH
			? "SET"
			: "NOT SET",
		GOOGLE_APPLICATION_CREDENTIALS: process.env.GOOGLE_APPLICATION_CREDENTIALS
			? "SET"
			: "NOT SET",
	};

	console.error(
		"Firebase Admin credentials not found. Environment variables status:",
		envVarsStatus
	);
	throw new Error(
		`Firebase Admin creds not found. Environment status: ${JSON.stringify(envVarsStatus)}. Set one of: FIREBASE_SERVICE_ACCOUNT_JSON, FIREBASE_SERVICE_ACCOUNT_BASE64, FIREBASE_SERVICE_ACCOUNT_PATH, or GOOGLE_APPLICATION_CREDENTIALS.`
	);
}

export function getFirebaseAdminApp() {
	if (!getApps().length) {
		const serviceAccount = loadServiceAccount();

		// Validate that we have the essential fields
		// Note: serviceAccount from JSON has project_id, but TypeScript ServiceAccount type uses projectId
		const rawAccount = serviceAccount as ServiceAccount & RawServiceAccount;
		const projectId = rawAccount.project_id || rawAccount.projectId;
		const privateKey = rawAccount.private_key || rawAccount.privateKey;
		const clientEmail = rawAccount.client_email || rawAccount.clientEmail;

		if (!projectId) {
			throw new Error(
				"Firebase service account is missing 'project_id'. Please check your service account JSON."
			);
		}
		if (!privateKey) {
			throw new Error(
				"Firebase service account is missing 'private_key'. Please check your service account JSON."
			);
		}

		// Validate that the private key has proper PEM format
		if (
			!privateKey.includes("-----BEGIN PRIVATE KEY-----") ||
			!privateKey.includes("-----END PRIVATE KEY-----")
		) {
			throw new Error(
				"Firebase service account 'private_key' is not in valid PEM format. " +
					"It should start with '-----BEGIN PRIVATE KEY-----' and end with '-----END PRIVATE KEY-----'. " +
					"If you're setting this via environment variable, ensure newlines are preserved correctly."
			);
		}
		if (!clientEmail) {
			throw new Error(
				"Firebase service account is missing 'client_email'. Please check your service account JSON."
			);
		}

		let bucket = process.env.FIREBASE_STORAGE_BUCKET?.trim();

		if (!bucket) {
			const inferredProjectId =
				process.env.FIREBASE_PROJECT_ID?.trim() || projectId?.trim();

			if (inferredProjectId) {
				bucket = `${inferredProjectId}.appspot.com`;
				console.log(`Inferred Firebase Storage bucket: ${bucket}`);
			}
		}

		const options: AppOptions = {
			credential: cert(serviceAccount),
		};

		if (bucket) {
			options.storageBucket = bucket;
			console.log(
				`Firebase Admin initialized with storage bucket: ${bucket}`
			);
		} else {
			console.warn(
				"No Firebase Storage bucket configured. Avatar uploads may fail."
			);
		}

		try {
			initializeApp(options);
			console.log("Firebase Admin app initialized successfully");
		} catch (error) {
			console.error("Failed to initialize Firebase Admin app:", error);
			throw new Error(
				`Firebase Admin initialization failed: ${error instanceof Error ? error.message : "Unknown error"}`
			);
		}
	}
	return getApp();
}

export function firebaseAdminAvailable(): boolean {
	try {
		getFirebaseAdminApp();
		return true;
	} catch {
		return false;
	}
}

// Parse Firebase download URL -> { bucket, objectPath }
function parseFirebaseDownloadUrl(url: string) {
	const u = new URL(url);
	// Supports:
	// 1) https://firebasestorage.googleapis.com/v0/b/<bucket>/o/<path-enc>?...
	// 2) https://<bucket>.storage.googleapis.com/<path>
	if (u.hostname === "firebasestorage.googleapis.com") {
		const parts = u.pathname.split("/"); // /v0/b/<bucket>/o/<path>
		const b = parts[parts.indexOf("b") + 1];
		const o = parts[parts.indexOf("o") + 1];
		if (!b || !o) throw new Error("Unrecognized Firebase download URL");
		return { bucket: b, objectPath: decodeURIComponent(o) };
	}
	if (u.hostname.endsWith(".storage.googleapis.com")) {
		const bucket = u.hostname.replace(".storage.googleapis.com", "");
		const objectPath = decodeURIComponent(u.pathname.replace(/^\/+/, ""));
		if (!bucket || !objectPath)
			throw new Error("Unrecognized Firebase download URL");
		return { bucket, objectPath };
	}
	throw new Error("Unrecognized Firebase download URL");
}

export async function deleteStorageByDownloadUrl(url: string) {
	const app = getFirebaseAdminApp();
	const { bucket, objectPath } = parseFirebaseDownloadUrl(url);
	const storage = getStorage(app);
	await storage
		.bucket(bucket)
		.file(objectPath)
		.delete({ ignoreNotFound: true });
}

export async function deleteManyStorageByUrls(urls: string[]) {
	for (const u of urls) {
		try {
			await deleteStorageByDownloadUrl(u);
		} catch {
			// ignore single-file failures
		}
	}
}
