"use client";

import { useState } from "react";

// Types for D&D 5e API data
interface APIReference {
	index: string;
	name: string;
	url: string;
}

interface Character {
	name: string;
	race: string;
	class: string;
	level: number;
	background: string;
	alignment: string;
	experiencePoints: number;
	// Ability Scores
	strength: number;
	dexterity: number;
	constitution: number;
	intelligence: number;
	wisdom: number;
	charisma: number;
	// Combat Stats
	armorClass: number;
	initiative: number;
	speed: number;
	hitPointMax: number;
	currentHitPoints: number;
	temporaryHitPoints: number;
	hitDice: string;
	// Proficiencies and traits
	proficiencyBonus: number;
	savingThrows: string[];
	skills: string[];
	traits: string[];
	features: string[];
	// Equipment
	items: Item[];
}

interface Item {
	name: string;
	worn: boolean;
	quantity: number;
}

export default function DndCharacterBuilder() {
	const [character, setCharacter] = useState<Character>({
		name: "",
		race: "",
		class: "",
		level: 1,
		background: "",
		alignment: "",
		experiencePoints: 0,
		strength: 10,
		dexterity: 10,
		constitution: 10,
		intelligence: 10,
		wisdom: 10,
		charisma: 10,
		armorClass: 10,
		initiative: 0,
		speed: 30,
		hitPointMax: 10,
		currentHitPoints: 10,
		temporaryHitPoints: 0,
		hitDice: "1d8",
		proficiencyBonus: 2,
		savingThrows: [],
		skills: [],
		traits: [],
		features: [],
		items: [],
	});

	const [races] = useState<APIReference[]>([
		{ index: "dragonborn", name: "Dragonborn", url: "/api/races/dragonborn" },
		{ index: "dwarf", name: "Dwarf", url: "/api/races/dwarf" },
		{ index: "elf", name: "Elf", url: "/api/races/elf" },
		{ index: "gnome", name: "Gnome", url: "/api/races/gnome" },
		{ index: "half-elf", name: "Half-Elf", url: "/api/races/half-elf" },
		{ index: "half-orc", name: "Half-Orc", url: "/api/races/half-orc" },
		{ index: "halfling", name: "Halfling", url: "/api/races/halfling" },
		{ index: "human", name: "Human", url: "/api/races/human" },
		{ index: "tiefling", name: "Tiefling", url: "/api/races/tiefling" },
	]);
	const [classes] = useState<APIReference[]>([
		{ index: "barbarian", name: "Barbarian", url: "/api/classes/barbarian" },
		{ index: "bard", name: "Bard", url: "/api/classes/bard" },
		{ index: "cleric", name: "Cleric", url: "/api/classes/cleric" },
		{ index: "druid", name: "Druid", url: "/api/classes/druid" },
		{ index: "fighter", name: "Fighter", url: "/api/classes/fighter" },
		{ index: "monk", name: "Monk", url: "/api/classes/monk" },
		{ index: "paladin", name: "Paladin", url: "/api/classes/paladin" },
		{ index: "ranger", name: "Ranger", url: "/api/classes/ranger" },
		{ index: "rogue", name: "Rogue", url: "/api/classes/rogue" },
		{ index: "sorcerer", name: "Sorcerer", url: "/api/classes/sorcerer" },
		{ index: "warlock", name: "Warlock", url: "/api/classes/warlock" },
		{ index: "wizard", name: "Wizard", url: "/api/classes/wizard" },
	]);
	const [alignments] = useState<string[]>([
		"Lawful Good",
		"Neutral Good",
		"Chaotic Good",
		"Lawful Neutral",
		"True Neutral",
		"Chaotic Neutral",
		"Lawful Evil",
		"Neutral Evil",
		"Chaotic Evil",
	]);
	const [backgrounds] = useState<string[]>([
		"Acolyte",
		"Charlatan",
		"Criminal",
		"Entertainer",
		"Folk Hero",
		"Guild Artisan",
		"Hermit",
		"Noble",
		"Outlander",
		"Sage",
		"Sailor",
		"Soldier",
		"Urchin",
	]);

	const [skills] = useState<string[]>([
		"Acrobatics",
		"Animal Handling",
		"Arcana",
		"Athletics",
		"Deception",
		"History",
		"Insight",
		"Intimidation",
		"Investigation",
		"Medicine",
		"Nature",
		"Perception",
		"Performance",
		"Persuasion",
		"Religion",
		"Sleight of Hand",
		"Stealth",
		"Survival",
	]);

	const [itemSearch, setItemSearch] = useState("");
	const [searchResults, setSearchResults] = useState<APIReference[]>([]);
	const [isSearching, setIsSearching] = useState(false);

	// Common D&D equipment from SRD
	const [equipment] = useState<APIReference[]>([
		{ index: "longsword", name: "Longsword", url: "/api/equipment/longsword" },
		{ index: "shortsword", name: "Shortsword", url: "/api/equipment/shortsword" },
		{ index: "greatsword", name: "Greatsword", url: "/api/equipment/greatsword" },
		{ index: "dagger", name: "Dagger", url: "/api/equipment/dagger" },
		{ index: "handaxe", name: "Handaxe", url: "/api/equipment/handaxe" },
		{ index: "battleaxe", name: "Battleaxe", url: "/api/equipment/battleaxe" },
		{ index: "greataxe", name: "Greataxe", url: "/api/equipment/greataxe" },
		{ index: "mace", name: "Mace", url: "/api/equipment/mace" },
		{ index: "warhammer", name: "Warhammer", url: "/api/equipment/warhammer" },
		{ index: "spear", name: "Spear", url: "/api/equipment/spear" },
		{ index: "longbow", name: "Longbow", url: "/api/equipment/longbow" },
		{ index: "shortbow", name: "Shortbow", url: "/api/equipment/shortbow" },
		{ index: "crossbow-light", name: "Crossbow, light", url: "/api/equipment/crossbow-light" },
		{ index: "crossbow-heavy", name: "Crossbow, heavy", url: "/api/equipment/crossbow-heavy" },
		{ index: "padded-armor", name: "Padded Armor", url: "/api/equipment/padded-armor" },
		{ index: "leather-armor", name: "Leather Armor", url: "/api/equipment/leather-armor" },
		{ index: "studded-leather-armor", name: "Studded Leather", url: "/api/equipment/studded-leather-armor" },
		{ index: "hide-armor", name: "Hide Armor", url: "/api/equipment/hide-armor" },
		{ index: "chain-shirt", name: "Chain Shirt", url: "/api/equipment/chain-shirt" },
		{ index: "scale-mail", name: "Scale Mail", url: "/api/equipment/scale-mail" },
		{ index: "breastplate", name: "Breastplate", url: "/api/equipment/breastplate" },
		{ index: "half-plate", name: "Half Plate", url: "/api/equipment/half-plate" },
		{ index: "ring-mail", name: "Ring Mail", url: "/api/equipment/ring-mail" },
		{ index: "chain-mail", name: "Chain Mail", url: "/api/equipment/chain-mail" },
		{ index: "splint", name: "Splint", url: "/api/equipment/splint" },
		{ index: "plate", name: "Plate", url: "/api/equipment/plate" },
		{ index: "shield", name: "Shield", url: "/api/equipment/shield" },
		{ index: "backpack", name: "Backpack", url: "/api/equipment/backpack" },
		{ index: "bedroll", name: "Bedroll", url: "/api/equipment/bedroll" },
		{ index: "rope-hempen-50-feet", name: "Rope, hempen (50 feet)", url: "/api/equipment/rope-hempen-50-feet" },
		{ index: "torch", name: "Torch", url: "/api/equipment/torch" },
		{ index: "tinderbox", name: "Tinderbox", url: "/api/equipment/tinderbox" },
		{ index: "rations-1-day", name: "Rations (1 day)", url: "/api/equipment/rations-1-day" },
		{ index: "waterskin", name: "Waterskin", url: "/api/equipment/waterskin" },
		{ index: "potion-of-healing", name: "Potion of Healing", url: "/api/equipment/potion-of-healing" },
		{ index: "burglar-pack", name: "Burglar's Pack", url: "/api/equipment/burglar-pack" },
		{ index: "diplomat-pack", name: "Diplomat's Pack", url: "/api/equipment/diplomat-pack" },
		{ index: "dungeoneer-pack", name: "Dungeoneer's Pack", url: "/api/equipment/dungeoneer-pack" },
		{ index: "entertainer-pack", name: "Entertainer's Pack", url: "/api/equipment/entertainer-pack" },
		{ index: "explorer-pack", name: "Explorer's Pack", url: "/api/equipment/explorer-pack" },
		{ index: "priest-pack", name: "Priest's Pack", url: "/api/equipment/priest-pack" },
		{ index: "scholar-pack", name: "Scholar's Pack", url: "/api/equipment/scholar-pack" },
		{ index: "cloak", name: "Cloak", url: "/api/equipment/cloak" },
		{ index: "common-clothes", name: "Common Clothes", url: "/api/equipment/common-clothes" },
		{ index: "costume", name: "Costume", url: "/api/equipment/costume" },
		{ index: "fine-clothes", name: "Fine Clothes", url: "/api/equipment/fine-clothes" },
		{ index: "robes", name: "Robes", url: "/api/equipment/robes" },
		{ index: "travelers-clothes", name: "Traveler's Clothes", url: "/api/equipment/travelers-clothes" },
		{ index: "holy-symbol", name: "Holy Symbol", url: "/api/equipment/holy-symbol" },
		{ index: "spellbook", name: "Spellbook", url: "/api/equipment/spellbook" },
		{ index: "component-pouch", name: "Component Pouch", url: "/api/equipment/component-pouch" },
		{ index: "arcane-focus", name: "Arcane Focus", url: "/api/equipment/arcane-focus" },
		{ index: "druidic-focus", name: "Druidic Focus", url: "/api/equipment/druidic-focus" },
	]);

	const searchItems = () => {
		if (!itemSearch.trim()) {
			setSearchResults([]);
			return;
		}

		setIsSearching(true);
		const filtered = equipment.filter((item: APIReference) =>
			item.name.toLowerCase().includes(itemSearch.toLowerCase())
		);
		setSearchResults(filtered);
		setIsSearching(false);
	};

	const calculateModifier = (score: number): number => {
		return Math.floor((score - 10) / 2);
	};

	const addItem = (itemName: string) => {
		const existingItem = character.items.find((i) => i.name === itemName);
		if (existingItem) {
			setCharacter({
				...character,
				items: character.items.map((i) =>
					i.name === itemName ? { ...i, quantity: i.quantity + 1 } : i
				),
			});
		} else {
			setCharacter({
				...character,
				items: [...character.items, { name: itemName, worn: false, quantity: 1 }],
			});
		}
		setItemSearch("");
		setSearchResults([]);
	};

	const removeItem = (itemName: string) => {
		setCharacter({
			...character,
			items: character.items.filter((i) => i.name !== itemName),
		});
	};

	const toggleWorn = (itemName: string) => {
		setCharacter({
			...character,
			items: character.items.map((i) =>
				i.name === itemName ? { ...i, worn: !i.worn } : i
			),
		});
	};

	const updateAbilityScore = (ability: string, value: number) => {
		setCharacter({ ...character, [ability]: value });
	};

	const toggleSkill = (skill: string) => {
		if (character.skills.includes(skill)) {
			setCharacter({
				...character,
				skills: character.skills.filter((s) => s !== skill),
			});
		} else {
			setCharacter({
				...character,
				skills: [...character.skills, skill],
			});
		}
	};

	const exportCharacter = () => {
		const dataStr = JSON.stringify(character, null, 2);
		const dataUri =
			"data:application/json;charset=utf-8," + encodeURIComponent(dataStr);
		const exportFileDefaultName = `${character.name || "character"}.json`;

		const linkElement = document.createElement("a");
		linkElement.setAttribute("href", dataUri);
		linkElement.setAttribute("download", exportFileDefaultName);
		linkElement.click();
	};

	return (
		<section className="space-y-6">
			<div>
				<h1 className="text-2xl font-semibold">D&D Character Builder</h1>
				<p className="text-sm text-slate-300">
					Create and manage your D&D 5e character using data from the D&D 5e API
				</p>
			</div>

			{/* Basic Information */}
			<div className="rounded-lg border border-slate-800 bg-slate-900/70 p-4">
				<h2 className="mb-3 text-lg font-semibold">Basic Information</h2>
				<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
					<div>
						<label className="mb-1 block text-sm text-slate-300">
							Character Name
						</label>
						<input
							type="text"
							value={character.name}
							onChange={(e) =>
								setCharacter({ ...character, name: e.target.value })
							}
							className="w-full rounded border border-slate-700 bg-slate-800 px-2 py-1 text-sm text-slate-100"
							placeholder="Enter name"
						/>
					</div>
					<div>
						<label className="mb-1 block text-sm text-slate-300">Race</label>
						<select
							value={character.race}
							onChange={(e) =>
								setCharacter({ ...character, race: e.target.value })
							}
							className="w-full rounded border border-slate-700 bg-slate-800 px-2 py-1 text-sm text-slate-100"
						>
							<option value="">Select Race</option>
							{races.map((race) => (
								<option key={race.index} value={race.name}>
									{race.name}
								</option>
							))}
						</select>
					</div>
					<div>
						<label className="mb-1 block text-sm text-slate-300">Class</label>
						<select
							value={character.class}
							onChange={(e) =>
								setCharacter({ ...character, class: e.target.value })
							}
							className="w-full rounded border border-slate-700 bg-slate-800 px-2 py-1 text-sm text-slate-100"
						>
							<option value="">Select Class</option>
							{classes.map((cls) => (
								<option key={cls.index} value={cls.name}>
									{cls.name}
								</option>
							))}
						</select>
					</div>
					<div>
						<label className="mb-1 block text-sm text-slate-300">Level</label>
						<input
							type="number"
							min="1"
							max="20"
							value={character.level}
							onChange={(e) =>
								setCharacter({
									...character,
									level: parseInt(e.target.value) || 1,
								})
							}
							className="w-full rounded border border-slate-700 bg-slate-800 px-2 py-1 text-sm text-slate-100"
						/>
					</div>
					<div>
						<label className="mb-1 block text-sm text-slate-300">
							Background
						</label>
						<select
							value={character.background}
							onChange={(e) =>
								setCharacter({ ...character, background: e.target.value })
							}
							className="w-full rounded border border-slate-700 bg-slate-800 px-2 py-1 text-sm text-slate-100"
						>
							<option value="">Select Background</option>
							{backgrounds.map((bg) => (
								<option key={bg} value={bg}>
									{bg}
								</option>
							))}
						</select>
					</div>
					<div>
						<label className="mb-1 block text-sm text-slate-300">
							Alignment
						</label>
						<select
							value={character.alignment}
							onChange={(e) =>
								setCharacter({ ...character, alignment: e.target.value })
							}
							className="w-full rounded border border-slate-700 bg-slate-800 px-2 py-1 text-sm text-slate-100"
						>
							<option value="">Select Alignment</option>
							{alignments.map((align) => (
								<option key={align} value={align}>
									{align}
								</option>
							))}
						</select>
					</div>
				</div>
			</div>

			{/* Ability Scores */}
			<div className="rounded-lg border border-slate-800 bg-slate-900/70 p-4">
				<h2 className="mb-3 text-lg font-semibold">Ability Scores</h2>
				<div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
					{[
						{ name: "Strength", key: "strength" },
						{ name: "Dexterity", key: "dexterity" },
						{ name: "Constitution", key: "constitution" },
						{ name: "Intelligence", key: "intelligence" },
						{ name: "Wisdom", key: "wisdom" },
						{ name: "Charisma", key: "charisma" },
					].map((ability) => (
						<div key={ability.key} className="text-center">
							<label className="mb-1 block text-sm font-medium text-slate-300">
								{ability.name}
							</label>
							<input
								type="number"
								min="1"
								max="30"
								value={character[ability.key as keyof Character] as number}
								onChange={(e) =>
									updateAbilityScore(
										ability.key,
										parseInt(e.target.value) || 10
									)
								}
								className="mb-1 w-full rounded border border-slate-700 bg-slate-800 px-2 py-1 text-center text-sm text-slate-100"
							/>
							<div className="text-xs text-slate-400">
								Modifier:{" "}
								{calculateModifier(
									character[ability.key as keyof Character] as number
								) >= 0
									? "+"
									: ""}
								{calculateModifier(
									character[ability.key as keyof Character] as number
								)}
							</div>
						</div>
					))}
				</div>
			</div>

			{/* Combat Stats */}
			<div className="rounded-lg border border-slate-800 bg-slate-900/70 p-4">
				<h2 className="mb-3 text-lg font-semibold">Combat Stats</h2>
				<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
					<div>
						<label className="mb-1 block text-sm text-slate-300">
							Armor Class
						</label>
						<input
							type="number"
							value={character.armorClass}
							onChange={(e) =>
								setCharacter({
									...character,
									armorClass: parseInt(e.target.value) || 10,
								})
							}
							className="w-full rounded border border-slate-700 bg-slate-800 px-2 py-1 text-sm text-slate-100"
						/>
					</div>
					<div>
						<label className="mb-1 block text-sm text-slate-300">
							Initiative
						</label>
						<input
							type="number"
							value={character.initiative}
							onChange={(e) =>
								setCharacter({
									...character,
									initiative: parseInt(e.target.value) || 0,
								})
							}
							className="w-full rounded border border-slate-700 bg-slate-800 px-2 py-1 text-sm text-slate-100"
						/>
					</div>
					<div>
						<label className="mb-1 block text-sm text-slate-300">Speed</label>
						<input
							type="number"
							value={character.speed}
							onChange={(e) =>
								setCharacter({
									...character,
									speed: parseInt(e.target.value) || 30,
								})
							}
							className="w-full rounded border border-slate-700 bg-slate-800 px-2 py-1 text-sm text-slate-100"
						/>
					</div>
					<div>
						<label className="mb-1 block text-sm text-slate-300">
							Hit Dice
						</label>
						<input
							type="text"
							value={character.hitDice}
							onChange={(e) =>
								setCharacter({ ...character, hitDice: e.target.value })
							}
							className="w-full rounded border border-slate-700 bg-slate-800 px-2 py-1 text-sm text-slate-100"
							placeholder="1d8"
						/>
					</div>
					<div>
						<label className="mb-1 block text-sm text-slate-300">
							Max HP
						</label>
						<input
							type="number"
							value={character.hitPointMax}
							onChange={(e) =>
								setCharacter({
									...character,
									hitPointMax: parseInt(e.target.value) || 10,
								})
							}
							className="w-full rounded border border-slate-700 bg-slate-800 px-2 py-1 text-sm text-slate-100"
						/>
					</div>
					<div>
						<label className="mb-1 block text-sm text-slate-300">
							Current HP
						</label>
						<input
							type="number"
							value={character.currentHitPoints}
							onChange={(e) =>
								setCharacter({
									...character,
									currentHitPoints: parseInt(e.target.value) || 10,
								})
							}
							className="w-full rounded border border-slate-700 bg-slate-800 px-2 py-1 text-sm text-slate-100"
						/>
					</div>
					<div>
						<label className="mb-1 block text-sm text-slate-300">
							Temp HP
						</label>
						<input
							type="number"
							value={character.temporaryHitPoints}
							onChange={(e) =>
								setCharacter({
									...character,
									temporaryHitPoints: parseInt(e.target.value) || 0,
								})
							}
							className="w-full rounded border border-slate-700 bg-slate-800 px-2 py-1 text-sm text-slate-100"
						/>
					</div>
					<div>
						<label className="mb-1 block text-sm text-slate-300">
							Prof. Bonus
						</label>
						<input
							type="number"
							value={character.proficiencyBonus}
							onChange={(e) =>
								setCharacter({
									...character,
									proficiencyBonus: parseInt(e.target.value) || 2,
								})
							}
							className="w-full rounded border border-slate-700 bg-slate-800 px-2 py-1 text-sm text-slate-100"
						/>
					</div>
				</div>
			</div>

			{/* Skills */}
			<div className="rounded-lg border border-slate-800 bg-slate-900/70 p-4">
				<h2 className="mb-3 text-lg font-semibold">Skills</h2>
				<div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
					{skills.map((skill) => (
						<label
							key={skill}
							className="flex cursor-pointer items-center gap-2 rounded border border-slate-700 bg-slate-800 px-3 py-2 text-sm transition hover:bg-slate-750"
						>
							<input
								type="checkbox"
								checked={character.skills.includes(skill)}
								onChange={() => toggleSkill(skill)}
								className="h-4 w-4 rounded border-slate-600 bg-slate-700 text-sky-600 focus:ring-sky-500"
							/>
							<span className="text-slate-200">{skill}</span>
						</label>
					))}
				</div>
			</div>

			{/* Equipment & Inventory */}
			<div className="rounded-lg border border-slate-800 bg-slate-900/70 p-4">
				<h2 className="mb-3 text-lg font-semibold">Equipment & Inventory</h2>

				{/* Item Search */}
				<div className="mb-4">
					<label className="mb-1 block text-sm text-slate-300">
						Search Items
					</label>
					<div className="flex gap-2">
						<input
							type="text"
							value={itemSearch}
							onChange={(e) => setItemSearch(e.target.value)}
							onKeyDown={(e) => e.key === "Enter" && searchItems()}
							placeholder="Search for equipment..."
							className="flex-1 rounded border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100"
						/>
						<button
							onClick={searchItems}
							disabled={isSearching}
							className="rounded bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-700 disabled:opacity-50"
						>
							{isSearching ? "Searching..." : "Search"}
						</button>
					</div>

					{/* Search Results */}
					{searchResults.length > 0 && (
						<div className="mt-2 max-h-40 overflow-y-auto rounded border border-slate-700 bg-slate-800">
							{searchResults.map((item) => (
								<button
									key={item.index}
									onClick={() => addItem(item.name)}
									className="block w-full px-3 py-2 text-left text-sm text-slate-200 hover:bg-slate-700"
								>
									{item.name}
								</button>
							))}
						</div>
					)}
				</div>

				{/* Current Items */}
				<div className="space-y-2">
					{character.items.length === 0 ? (
						<p className="text-center text-sm text-slate-400">
							No items yet. Search and add equipment above.
						</p>
					) : (
						character.items.map((item, index) => (
							<div
								key={index}
								className="flex items-center justify-between rounded border border-slate-700 bg-slate-800 px-3 py-2"
							>
								<div className="flex items-center gap-3">
									<label className="flex cursor-pointer items-center gap-2">
										<input
											type="checkbox"
											checked={item.worn}
											onChange={() => toggleWorn(item.name)}
											className="h-4 w-4 rounded border-slate-600 bg-slate-700 text-sky-600 focus:ring-sky-500"
										/>
										<span className="text-xs text-slate-400">Worn</span>
									</label>
									<span className="text-sm text-slate-200">
										{item.name}
									</span>
									<span className="text-xs text-slate-400">
										x{item.quantity}
									</span>
								</div>
								<button
									onClick={() => removeItem(item.name)}
									className="rounded bg-red-600 px-2 py-1 text-xs text-white hover:bg-red-700"
								>
									Remove
								</button>
							</div>
						))
					)}
				</div>
			</div>

			{/* Features & Traits */}
			<div className="grid gap-4 lg:grid-cols-2">
				<div className="rounded-lg border border-slate-800 bg-slate-900/70 p-4">
					<h2 className="mb-3 text-lg font-semibold">Features</h2>
					<textarea
						value={character.features.join("\n")}
						onChange={(e) =>
							setCharacter({
								...character,
								features: e.target.value.split("\n").filter((f) => f.trim()),
							})
						}
						placeholder="Enter class features (one per line)"
						className="h-32 w-full rounded border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100"
					/>
				</div>
				<div className="rounded-lg border border-slate-800 bg-slate-900/70 p-4">
					<h2 className="mb-3 text-lg font-semibold">Traits</h2>
					<textarea
						value={character.traits.join("\n")}
						onChange={(e) =>
							setCharacter({
								...character,
								traits: e.target.value.split("\n").filter((t) => t.trim()),
							})
						}
						placeholder="Enter racial traits (one per line)"
						className="h-32 w-full rounded border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100"
					/>
				</div>
			</div>

			{/* Export Button */}
			<div className="flex justify-center">
				<button
					onClick={exportCharacter}
					className="rounded-lg bg-green-600 px-6 py-3 font-medium text-white hover:bg-green-700"
				>
					Export Character (JSON)
				</button>
			</div>
		</section>
	);
}
