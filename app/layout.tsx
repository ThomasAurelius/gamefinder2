import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/navbar";
import Link from "next/link";
import { get } from "http";

export const metadata: Metadata = {
	title: "The Gathering Call",
	description: "Discover tabletop games and manage your sessions with ease.",
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="en" className="bg-slate-950">
			<body className="min-h-screen bg-slate-950 text-slate-100">
				<Navbar />
				<main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
					{children}
				</main>
				<footer className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 text-center text-sm text-slate-500">
					<div>
						<Link href="/privacy">Privacy Policy</Link> -{" "}
						<Link href="/terms">Terms of Service</Link> -{" "}
						<Link href="/sms-consent">SMS Consent</Link>
					</div>
					<div>
						©{" "}
						<Link href="http://midnightoil.software">
							Midnight Oil Software
						</Link>{" "}
						2025
					</div>
				</footer>
			</body>
		</html>
	);
}
