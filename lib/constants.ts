export const GAME_OPTIONS = [
	"Dungeons & Dragons",
	"Pathfinder",
	"Starfinder",
	"Shadowdark",
	"Blades in the Dark",
	"Call of Cthulhu",
	"Cyberpunk Red",
	"Fate Core",
	"Shadowrun",
	"Vampire: The Masquerade",
	"Warhammer Fantasy Roleplay",
	"World of Darkness",
	"Daggerheart",
	"Other",
];

export const PREFERENCE_OPTIONS = [
	"Rules-light",
	"Rules-heavy",
	"Story-focused",
	"Combat-focused",
	"Module Driven",
	"Original Content",
	"Exploration",
	"Role-playing",
	"Puzzles",
	"Politics",
	"Horror",
	"Fantasy",
	"Sci-fi",
	"Steampunk",
	"Post-apocalyptic",
	"Historical",
	"Superhero",
	"Space Opera",
	"Thriller",
	"Parody",
	"Military",
	"Romance",
	"Drama",
	"Mystery",
	"Sandbox",
	"Linear Narrative",
	"Casual",
	"Serious",
	"Beginner-friendly",
	"Experienced players",
];

export const GAME_STYLE_OPTIONS = [
	"Theater of the mind",
	"Grid-based combat",
	"Miniatures",
	"Digital tools",
	"In-person only",
	"Online only",
	"Hybrid",
	"Voice chat",
	"Video chat",
	"Text-based",
	"Homebrew content",
	"Official content only",
	"Session zero",
	"Character-driven",
	"Collaborative storytelling",
];

export const SYSTEM_OPTIONS = ["Foundry", "Roll20", "Discord", "Other"];

export const DAYS_OF_WEEK = [
	"Monday",
	"Tuesday",
	"Wednesday",
	"Thursday",
	"Friday",
	"Saturday",
	"Sunday",
];

export const ROLE_OPTIONS = [
	"Healer",
	"Damage",
	"Caster",
	"Support",
	"DM",
	"Other",
] as const;

export const MEETING_FREQUENCY_OPTIONS = [
	"Weekly",
	"Bi-weekly",
	"Monthly",
	"Variable",
];

export const SAFETY_TOOLS_OPTIONS = [
	"X-Card",
	"Lines and Veils",
	"Stars and Wishes",
	"Script Change",
	"Open Door Policy",
	"Other",
];

/**
 * Map game names to game system keys for character filtering
 */
export function mapGameToSystemKey(gameName: string): string | null {
	const gameNameLower = gameName.toLowerCase().trim();

	if (
		gameNameLower.includes("dungeons") &&
		gameNameLower.includes("dragons")
	) {
		return "dnd";
	}
	if (gameNameLower.includes("pathfinder")) {
		return "pathfinder";
	}
	if (gameNameLower.includes("starfinder")) {
		return "starfinder";
	}
	if (gameNameLower.includes("shadowdark")) {
		return "shadowdark";
	}

	// For "Other" or unknown games, return null (show all characters)
	return null;
}

export const TIME_SLOTS = Array.from({ length: 24 }, (_, index) => {
	const hour = index % 12 || 12;
	const suffix = index < 12 ? "AM" : "PM";
	return `${hour}:00 ${suffix}`;
});

export type TimeSlotGroup = {
	label: string;
	slots: string[];
};

export const TIME_SLOT_GROUPS: TimeSlotGroup[] = [
	{
		label: "Late Night",
		slots: TIME_SLOTS.slice(0, 6), // 12:00 AM - 5:00 AM
	},
	{
		label: "Morning",
		slots: TIME_SLOTS.slice(6, 12), // 6:00 AM - 11:00 AM
	},
	{
		label: "Afternoon",
		slots: TIME_SLOTS.slice(12, 18), // 12:00 PM - 5:00 PM
	},
	{
		label: "Evening",
		slots: TIME_SLOTS.slice(18, 24), // 6:00 PM - 11:00 PM
	},
];

/**
 * Format time slots grouped by period of day
 * @param times - Array of time slot strings
 * @returns Formatted string with grouped times
 */
export function formatTimeSlotsByGroup(times: string[]): string {
	if (!times || times.length === 0) return "";

	const groups: string[] = [];

	for (const group of TIME_SLOT_GROUPS) {
		const groupTimes = times.filter((time) => group.slots.includes(time));
		if (groupTimes.length > 0) {
			// Format times without AM/PM suffix for cleaner display
			const formattedTimes = groupTimes.map((time) =>
				time.replace(" AM", "").replace(" PM", "")
			);
			groups.push(`${group.label}: ${formattedTimes.join(", ")}`);
		}
	}

	return groups.join("\n");
}

/**
 * Sort time slots in chronological order
 * @param times - Array of time slot strings
 * @returns Array of time slots sorted chronologically
 */
export function sortTimesByChronology(times: string[]): string[] {
	if (!times || times.length === 0) return [];

	// Sort by the index in TIME_SLOTS array to maintain chronological order
	return [...times].sort((a, b) => {
		const indexA = TIME_SLOTS.indexOf(a);
		const indexB = TIME_SLOTS.indexOf(b);
		return indexA - indexB;
	});
}
