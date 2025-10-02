"use client";

import { ChangeEvent, FormEvent, useMemo, useState } from "react";

type StatField = {
  name: string;
  value: string;
};

type SkillField = {
  name: string;
  value: string;
};

type CharacterState = {
  name: string;
  campaign: string;
  stats: StatField[];
  skills: SkillField[];
  notes: string;
};

type GameSystemKey = "dnd" | "pathfinder" | "starfinder" | "other";

type GameSystemConfig = {
  label: string;
  description: string;
  stats: string[];
  skills: string[];
};

const GAME_SYSTEMS: Record<GameSystemKey, GameSystemConfig> = {
  dnd: {
    label: "Dungeons & Dragons 5e",
    description:
      "Build legendary heroes with the classic six ability scores and the core D&D 5e skill list.",
    stats: [
      "Strength",
      "Dexterity",
      "Constitution",
      "Intelligence",
      "Wisdom",
      "Charisma",
    ],
    skills: [
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
    ],
  },
  pathfinder: {
    label: "Pathfinder 2e",
    description:
      "Craft versatile adventurers with the Pathfinder 2e proficiency-based skill system.",
    stats: [
      "Strength",
      "Dexterity",
      "Constitution",
      "Intelligence",
      "Wisdom",
      "Charisma",
    ],
    skills: [
      "Acrobatics",
      "Arcana",
      "Athletics",
      "Crafting",
      "Deception",
      "Diplomacy",
      "Intimidation",
      "Medicine",
      "Nature",
      "Occultism",
      "Performance",
      "Religion",
      "Society",
      "Stealth",
      "Survival",
      "Thievery",
    ],
  },
  starfinder: {
    label: "Starfinder",
    description:
      "Track your explorers across the Pact Worlds with Starfinder's ability scores and skills.",
    stats: [
      "Strength",
      "Dexterity",
      "Constitution",
      "Intelligence",
      "Wisdom",
      "Charisma",
    ],
    skills: [
      "Acrobatics",
      "Athletics",
      "Bluff",
      "Computers",
      "Culture",
      "Diplomacy",
      "Disguise",
      "Engineering",
      "Intimidate",
      "Life Science",
      "Medicine",
      "Mysticism",
      "Perception",
      "Physical Science",
      "Piloting",
      "Profession",
      "Sense Motive",
      "Sleight of Hand",
      "Stealth",
      "Survival",
    ],
  },
  other: {
    label: "Other / Custom",
    description:
      "Build a bespoke character sheet with custom ability scores and skill names.",
    stats: [],
    skills: [],
  },
};

function createInitialCharacter(system: GameSystemKey): CharacterState {
  const config = GAME_SYSTEMS[system];

  const stats: StatField[] =
    system === "other"
      ? [
          { name: "Stat Name", value: "" },
          { name: "Stat Name", value: "" },
          { name: "Stat Name", value: "" },
          { name: "Stat Name", value: "" },
          { name: "Stat Name", value: "" },
          { name: "Stat Name", value: "" },
        ]
      : config.stats.map((stat) => ({ name: stat, value: "" }));

  const skills: SkillField[] =
    system === "other"
      ? [
          { name: "Skill Name", value: "" },
          { name: "Skill Name", value: "" },
          { name: "Skill Name", value: "" },
        ]
      : config.skills.map((skill) => ({ name: skill, value: "" }));

  return {
    name: "",
    campaign: "",
    stats,
    skills,
    notes: "",
  };
}

export default function CharactersPage() {
  const [selectedSystem, setSelectedSystem] = useState<GameSystemKey>("dnd");
  const [character, setCharacter] = useState<CharacterState>(createInitialCharacter("dnd"));

  const systemConfig = useMemo(
    () => GAME_SYSTEMS[selectedSystem],
    [selectedSystem]
  );

  const isCustomSystem = selectedSystem === "other";

  const handleSystemChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const system = event.target.value as GameSystemKey;
    setSelectedSystem(system);
    setCharacter(createInitialCharacter(system));
  };

  const updateStat = (
    index: number,
    field: keyof StatField,
    value: string
  ) => {
    setCharacter((prev) => {
      const updated = [...prev.stats];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, stats: updated };
    });
  };

  const updateSkill = (
    index: number,
    field: keyof SkillField,
    value: string
  ) => {
    setCharacter((prev) => {
      const updated = [...prev.skills];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, skills: updated };
    });
  };

  const addCustomStat = () => {
    setCharacter((prev) => ({
      ...prev,
      stats: [...prev.stats, { name: "Stat Name", value: "" }],
    }));
  };

  const addCustomSkill = () => {
    setCharacter((prev) => ({
      ...prev,
      skills: [...prev.skills, { name: "Skill Name", value: "" }],
    }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // Placeholder for persistence logic
    console.log("Character saved", {
      system: selectedSystem,
      character,
    });
  };

  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold">Characters</h1>
        <p className="text-sm text-slate-300">
          Craft, review, and iterate on the heroes and villains that bring your
          campaigns to life. Choose a supported game system or build something
          completely custom.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-8 rounded-lg border border-slate-800 bg-slate-900/60 p-6 shadow-lg"
      >
        <div className="grid gap-4 md:grid-cols-2">
          <label className="flex flex-col gap-2">
            <span className="text-sm font-medium text-slate-200">Game System</span>
            <select
              value={selectedSystem}
              onChange={handleSystemChange}
              className="rounded-md border border-slate-700 bg-slate-950/60 px-3 py-2 text-sm text-slate-100 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/40"
            >
              {Object.entries(GAME_SYSTEMS).map(([key, config]) => (
                <option key={key} value={key}>
                  {config.label}
                </option>
              ))}
            </select>
            <span className="text-xs text-slate-400">{systemConfig.description}</span>
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium text-slate-200">Name</span>
              <input
                type="text"
                value={character.name}
                onChange={(event) =>
                  setCharacter((prev) => ({ ...prev, name: event.target.value }))
                }
                placeholder="Eldrin the Bold"
                className="rounded-md border border-slate-700 bg-slate-950/60 px-3 py-2 text-sm text-slate-100 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/40"
              />
            </label>
            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium text-slate-200">Campaign</span>
              <input
                type="text"
                value={character.campaign}
                onChange={(event) =>
                  setCharacter((prev) => ({
                    ...prev,
                    campaign: event.target.value,
                  }))
                }
                placeholder="Shadows of Neverwinter"
                className="rounded-md border border-slate-700 bg-slate-950/60 px-3 py-2 text-sm text-slate-100 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/40"
              />
            </label>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-100">Ability Scores</h2>
            {isCustomSystem && (
              <button
                type="button"
                onClick={addCustomStat}
                className="rounded-md border border-indigo-600 px-3 py-1 text-xs font-medium text-indigo-300 transition hover:bg-indigo-600/10"
              >
                Add Stat
              </button>
            )}
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {character.stats.map((stat, index) => (
              <div
                key={`${stat.name}-${index}`}
                className="rounded-md border border-slate-800 bg-slate-950/50 p-3"
              >
                <label className="flex flex-col gap-2">
                  <span className="text-xs uppercase tracking-wide text-slate-400">
                    {isCustomSystem ? (
                      <input
                        type="text"
                        value={stat.name}
                        onChange={(event) =>
                          updateStat(index, "name", event.target.value)
                        }
                        placeholder="Stat Name"
                        className="w-full rounded border border-slate-700 bg-slate-900/70 px-2 py-1 text-xs text-slate-100 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/40"
                      />
                    ) : (
                      stat.name
                    )}
                  </span>
                  <input
                    type="number"
                    inputMode="numeric"
                    value={stat.value}
                    onChange={(event) =>
                      updateStat(index, "value", event.target.value)
                    }
                    placeholder="0"
                    className="rounded-md border border-slate-700 bg-slate-950/60 px-3 py-2 text-sm text-slate-100 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/40"
                  />
                </label>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-100">Skills</h2>
            {isCustomSystem && (
              <button
                type="button"
                onClick={addCustomSkill}
                className="rounded-md border border-indigo-600 px-3 py-1 text-xs font-medium text-indigo-300 transition hover:bg-indigo-600/10"
              >
                Add Skill
              </button>
            )}
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {character.skills.map((skill, index) => (
              <div
                key={`${skill.name}-${index}`}
                className="rounded-md border border-slate-800 bg-slate-950/50 p-3"
              >
                <label className="flex flex-col gap-2">
                  <span className="text-xs uppercase tracking-wide text-slate-400">
                    {isCustomSystem ? (
                      <input
                        type="text"
                        value={skill.name}
                        onChange={(event) =>
                          updateSkill(index, "name", event.target.value)
                        }
                        placeholder="Skill Name"
                        className="w-full rounded border border-slate-700 bg-slate-900/70 px-2 py-1 text-xs text-slate-100 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/40"
                      />
                    ) : (
                      skill.name
                    )}
                  </span>
                  <input
                    type="text"
                    value={skill.value}
                    onChange={(event) =>
                      updateSkill(index, "value", event.target.value)
                    }
                    placeholder={isCustomSystem ? "Rank / Modifier" : "+0"}
                    className="rounded-md border border-slate-700 bg-slate-950/60 px-3 py-2 text-sm text-slate-100 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/40"
                  />
                </label>
              </div>
            ))}
          </div>
        </div>

        <label className="flex flex-col gap-2">
          <span className="text-sm font-medium text-slate-200">Notes</span>
          <textarea
            value={character.notes}
            onChange={(event) =>
              setCharacter((prev) => ({ ...prev, notes: event.target.value }))
            }
            placeholder="Personality traits, ideals, bonds, flaws, and other custom details."
            rows={4}
            className="rounded-md border border-slate-700 bg-slate-950/60 px-3 py-2 text-sm text-slate-100 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/40"
          />
        </label>

        <div className="flex justify-end">
          <button
            type="submit"
            className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow transition hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/60 focus:ring-offset-2 focus:ring-offset-slate-950"
          >
            Save Character
          </button>
        </div>
      </form>
    </section>
  );
}
