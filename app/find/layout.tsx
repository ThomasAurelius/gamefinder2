import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Find Board Games & TTRPG Sessions Near You | The Gathering Call",
	description: "Find board game nights, D&D, Pathfinder, Shadowdark, and TTRPG sessions near you. Browse available tabletop gaming sessions and connect with local players and game masters.",
	keywords: "find board games, find D&D games, find TTRPG sessions, board game near me, D&D near me, Pathfinder sessions, Shadowdark games, tabletop gaming, local game sessions, game master search",
	openGraph: {
		title: "Find Board Games & TTRPG Sessions Near You",
		description: "Find board game nights, D&D, Pathfinder, and TTRPG sessions near you. Connect with local players and game masters.",
		type: "website",
	},
	twitter: {
		card: "summary_large_image",
		title: "Find Board Games & TTRPG Sessions Near You",
		description: "Find board game nights, D&D, Pathfinder, and TTRPG sessions near you.",
	},
};

export default function FindLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return <>{children}</>;
}
