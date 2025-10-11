import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Find D&D Campaigns, Pathfinder & TTRPG Campaigns | The Gathering Call",
	description: "Find ongoing D&D campaigns, Pathfinder, Shadowdark, and TTRPG campaigns. Join multi-session tabletop RPG campaigns and connect with dedicated game masters and player groups.",
	keywords: "find D&D campaigns, find Pathfinder campaigns, TTRPG campaigns, ongoing D&D, Shadowdark campaigns, RPG campaign search, tabletop campaigns, game master campaigns, multi-session D&D",
	openGraph: {
		title: "Find D&D Campaigns & TTRPG Campaigns",
		description: "Find ongoing D&D, Pathfinder, and TTRPG campaigns. Join multi-session tabletop RPG adventures.",
		type: "website",
	},
	twitter: {
		card: "summary_large_image",
		title: "Find D&D Campaigns & TTRPG Campaigns",
		description: "Find ongoing D&D, Pathfinder, and TTRPG campaigns.",
	},
};

export default function FindCampaignsLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return <>{children}</>;
}
