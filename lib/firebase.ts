// src/lib/firebase.ts
"use client";

import { getApps, initializeApp, type FirebaseApp } from "firebase/app";
import { getStorage, type FirebaseStorage } from "firebase/storage";
import { getAuth, signInAnonymously, type Auth } from "firebase/auth";
import { FIREBASE_CONFIG, getFirebaseConfig } from "./firebase-config";

let app: FirebaseApp | null = null;
let storage: FirebaseStorage | null = null;
let auth: Auth | null = null;

export function getFirebaseApp(): FirebaseApp {
	if (app) return app;
	
	try {
		// Get and validate config before initializing
		// This will throw if configuration is missing
		const config = getFirebaseConfig();
		
		app = getApps().length ? getApps()[0]! : initializeApp(config);
		return app!;
	} catch (error) {
		const errorMsg = error instanceof Error ? error.message : String(error);
		console.error("Failed to initialize Firebase App:", errorMsg);
		throw error;
	}
}

export async function getFirebaseStorage(): Promise<FirebaseStorage> {
	if (storage) return storage;
	storage = getStorage(getFirebaseApp());
	return storage!;
}

export async function ensureAnonAuth(): Promise<Auth> {
	if (auth?.currentUser) return auth!;
	const a = getAuth(getFirebaseApp());
	auth = a;
	if (!a.currentUser) {
		await signInAnonymously(a);
	}
	return a;
}
