import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Host Board Games, D&D & TTRPG Sessions | The Gathering Call",
	description: "Host your own board game nights, D&D sessions, Pathfinder, Shadowdark, and TTRPG campaigns. Create and schedule tabletop gaming sessions, manage players, and build your gaming community.",
	keywords: "host board games, host D&D, host TTRPG, create game session, schedule D&D, host Pathfinder, game master tools, DM tools, create campaign, organize board games, TTRPG hosting",
	openGraph: {
		title: "Host Board Games & TTRPG Sessions",
		description: "Host your own board game nights and TTRPG campaigns. Create and schedule sessions easily.",
		type: "website",
	},
	twitter: {
		card: "summary_large_image",
		title: "Host Board Games & TTRPG Sessions",
		description: "Host your own board game nights and TTRPG campaigns.",
	},
};

export default function PostLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return <>{children}</>;
}
