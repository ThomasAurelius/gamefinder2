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

let auth: Auth | null = null;

export function getFirebaseAuth(): Auth {
	if (auth) return auth;
	auth = getAuth(getFirebaseApp());
	return auth;
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
