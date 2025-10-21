// lib/firebase-auth.ts
"use client";

import {
	getAuth,
	signInWithEmailAndPassword,
	createUserWithEmailAndPassword,
	signOut,
	sendPasswordResetEmail,
	type Auth,
	type User,
	type UserCredential,
} from "firebase/auth";
import { getFirebaseApp } from "./firebase";
import { getFirebaseConfig } from "./firebase-config";

let auth: Auth | null = null;

export function getFirebaseAuth(): Auth {
	if (auth) return auth;
	try {
		// Validate that Firebase is properly configured before initializing
		const config = getFirebaseConfig();
		
		// Check if any required config is missing
		if (!config.apiKey || !config.authDomain || !config.projectId) {
			throw new Error(
				"Firebase configuration is incomplete. Please ensure all NEXT_PUBLIC_FIREBASE_* environment variables are set in your .env.local file."
			);
		}
		
		const app = getFirebaseApp();
		auth = getAuth(app);
		return auth;
	} catch (error) {
		const errorMsg = error instanceof Error ? error.message : String(error);
		console.error("Failed to initialize Firebase Auth:", errorMsg);
		throw new Error(
			`Firebase Authentication is not properly configured. ${errorMsg}`
		);
	}
}

export async function signInWithEmail(
	email: string,
	password: string
): Promise<UserCredential> {
	const auth = getFirebaseAuth();
	return signInWithEmailAndPassword(auth, email, password);
}

export async function registerWithEmail(
	email: string,
	password: string
): Promise<UserCredential> {
	const auth = getFirebaseAuth();
	return createUserWithEmailAndPassword(auth, email, password);
}

export async function signOutUser(): Promise<void> {
	const auth = getFirebaseAuth();
	return signOut(auth);
}

export async function sendPasswordReset(email: string): Promise<void> {
	const auth = getFirebaseAuth();
	return sendPasswordResetEmail(auth, email);
}

export function getCurrentUser(): User | null {
	const auth = getFirebaseAuth();
	return auth.currentUser;
}

export async function getCurrentUserToken(): Promise<string | null> {
	const auth = getFirebaseAuth();
	const user = auth.currentUser;
	if (!user) return null;
	return user.getIdToken();
}
