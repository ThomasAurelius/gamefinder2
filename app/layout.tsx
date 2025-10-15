import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/navbar";
import Link from "next/link";
import StructuredData from "@/components/StructuredData";

export const metadata: Metadata = {
	title: "The Gathering Call - Find Board Games, D&D, Pathfinder & TTRPG Sessions",
	description:
		"Find and host board game nights, D&D, Pathfinder, Shadowdark and TTRPG sessions. Schedule tabletop gaming sessions, connect with players, and manage your campaigns with ease.",
	keywords:
		"board games, D&D, Dungeons and Dragons, Pathfinder, Shadowdark, TTRPG, tabletop RPG, game scheduling, find board games, host D&D, campaign management, tabletop gaming, game master, RPG sessions",
	authors: [{ name: "The Gathering Call" }],
	creator: "Midnight Oil Software",
	publisher: "The Gathering Call",
	metadataBase: new URL(
		process.env.NEXT_PUBLIC_APP_URL || "https://thegatheringcall.com"
	),
	alternates: {
		canonical: "/",
	},
	openGraph: {
		title: "The Gathering Call - Find Board Games & TTRPG Sessions",
		description:
			"Find and host board game nights, D&D, Pathfinder, Shadowdark and TTRPG sessions. Connect with players and manage your campaigns.",
		url: "/",
		siteName: "The Gathering Call",
		locale: "en_US",
		type: "website",
		images: [
			{
				url: "/answerlogo.png",
				width: 1000,
				height: 1000,
				alt: "The Gathering Call - Tabletop Gaming Platform",
			},
		],
	},
	twitter: {
		card: "summary_large_image",
		title: "The Gathering Call - Find Board Games & TTRPG Sessions",
		description:
			"Find and host board game nights, D&D, Pathfinder, and TTRPG sessions. Connect with players and manage your campaigns.",
		images: ["/newlogo.png"],
	},
	robots: {
		index: true,
		follow: true,
		googleBot: {
			index: true,
			follow: true,
			"max-video-preview": -1,
			"max-image-preview": "large",
			"max-snippet": -1,
		},
	},
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="en" className="bg-slate-950">
			<body className="min-h-screen bg-slate-950 text-slate-100 overflow-x-hidden">
				<StructuredData />
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
