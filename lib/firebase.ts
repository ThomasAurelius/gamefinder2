// src/lib/firebase.ts
"use client";

import { getApps, initializeApp, type FirebaseApp } from "firebase/app";
import { getStorage, type FirebaseStorage } from "firebase/storage";
import { getAuth, signInAnonymously, type Auth } from "firebase/auth";
import { FIREBASE_CONFIG } from "./firebase-config";

let app: FirebaseApp | null = null;
let storage: FirebaseStorage | null = null;
let auth: Auth | null = null;

export function getFirebaseApp(): FirebaseApp {
	if (app) return app;
	app = getApps().length ? getApps()[0]! : initializeApp(FIREBASE_CONFIG);
	return app!;
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
