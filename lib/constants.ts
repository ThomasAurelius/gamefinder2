export const GAME_OPTIONS = [
	"Dungeons & Dragons",
	"Pathfinder",
	"Starfinder",
	"Shadowdark",
	"Other",
];

export const TIME_SLOTS = Array.from({ length: 24 }, (_, index) => {
	const hour = index % 12 || 12;
	const suffix = index < 12 ? "AM" : "PM";
	return `${hour}:00 ${suffix}`;
});
