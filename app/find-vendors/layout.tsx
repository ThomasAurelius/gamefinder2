import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Find Gaming Vendors & TTRPG Stores | The Gathering Call",
	description: "Find gaming stores, hobby shops, and TTRPG venues near you. Discover local gaming vendors, board game stores, and tabletop RPG venues by location.",
	keywords: "gaming stores, TTRPG venues, board game shops, hobby stores, tabletop gaming stores, D&D shops, gaming venues, local game stores",
	openGraph: {
		title: "Find Gaming Vendors & TTRPG Stores",
		description: "Find gaming stores, hobby shops, and TTRPG venues near you.",
		type: "website",
	},
	twitter: {
		card: "summary_large_image",
		title: "Find Gaming Vendors & TTRPG Stores",
		description: "Find gaming stores, hobby shops, and TTRPG venues near you.",
	},
};

export default function FindVendorsLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return <>{children}</>;
}
