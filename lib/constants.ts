export const GAME_OPTIONS = [
	"Dungeons & Dragons",
	"Pathfinder",
	"Starfinder",
	"ShadowDark",
	"Monster of the Week",
	"Call of Cthulhu",
	"Blades in the Dark",
	"Vampire: The Masquerade",
	"Shadowrun",
	"Gloomhaven",
	"Frosthaven",
	"Dragon Age RPG",
	"Dune RPG",
	"Cyberpunk RED",
	"Warhammer 40K RPG",
	"FATE",
	"Savage Worlds",
	"Numenera",
	"The Witcher RPG",
	"Star Wars RPG",
	"Mutants & Masterminds",
	"Legend of the Five Rings",
	"Other",
];

export const TIME_SLOTS = Array.from({ length: 24 }, (_, index) => {
	const hour = index % 12 || 12;
	const suffix = index < 12 ? "AM" : "PM";
	return `${hour}:00 ${suffix}`;
});
