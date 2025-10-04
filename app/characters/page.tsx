"use client";

import {
  ChangeEvent,
  FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  CharacterDetails,
  GameSystemKey,
  StatField,
  SkillField,
  StoredCharacter,
} from "@/lib/characters/types";
import AvatarCropper from "@/components/AvatarCropper";

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
  shadowdark: {
    label: "Shadowdark",
    description:
      "Delve into the darkness with classic ability scores and a streamlined talent-based system.",
    stats: [
      "Strength",
      "Dexterity",
      "Constitution",
      "Intelligence",
      "Wisdom",
      "Charisma",
    ],
    skills: [
      "Backstab",
      "Spellcasting",
      "Weapon Mastery",
      "Grit",
      "Languages",
      "Lore",
      "Stealth",
      "Thievery",
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

function createInitialCharacter(system: GameSystemKey): CharacterDetails {
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
    isPublic: false,
  };
}

function getSystemLabel(system: GameSystemKey) {
  return GAME_SYSTEMS[system]?.label ?? system;
}

function cloneFieldArray<T extends StatField | SkillField>(fields: T[]): T[] {
  return fields.map((field) => ({ ...field }));
}

export default function CharactersPage() {
  const [characters, setCharacters] = useState<StoredCharacter[]>([]);
  const [selectedSystem, setSelectedSystem] = useState<GameSystemKey>("dnd");
  const [character, setCharacter] = useState<CharacterDetails>(
    createInitialCharacter("dnd")
  );
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCharacterId, setEditingCharacterId] = useState<string | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingError, setLoadingError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);

  const systemConfig = useMemo(
    () => GAME_SYSTEMS[selectedSystem],
    [selectedSystem]
  );
  const isCustomSystem = selectedSystem === "other";

  const fetchCharacters = useCallback(async () => {
    setLoadingError(null);
    setActionError(null);
    setIsLoading(true);

    try {
      const response = await fetch("/api/characters", { cache: "no-store" });

      if (!response.ok) {
        throw new Error("Failed to fetch characters");
      }

      const data = (await response.json()) as StoredCharacter[];
      setCharacters(data);
    } catch (error) {
      console.error("Unable to load characters", error);
      setLoadingError(
        "We couldn't load your characters right now. Please try again shortly."
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCharacters();
  }, [fetchCharacters]);

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

  const handleAvatarUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Read the file and set it for cropping
    const reader = new FileReader();
    reader.onload = () => {
      setImageToCrop(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Clear the input so the same file can be selected again
    event.target.value = "";
  };

  const handleCropComplete = async (croppedImageBlob: Blob) => {
    setIsUploadingAvatar(true);
    setSubmitError(null);
    setImageToCrop(null);

    try {
      const formData = new FormData();
      formData.append("file", croppedImageBlob, "avatar.jpg");
      formData.append("type", "character");

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to upload image");
      }

      const { url } = await response.json();

      // Update the character state with the new avatar URL
      setCharacter((prev) => ({
        ...prev,
        avatarUrl: url,
      }));
      setFeedbackMessage("Avatar uploaded successfully.");
      setActionError(null);
    } catch (error) {
      setActionError(
        error instanceof Error ? error.message : "Failed to upload avatar"
      );
      setFeedbackMessage(null);
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleCropCancel = () => {
    setImageToCrop(null);
  };

  const resetForm = useCallback(() => {
    setSelectedSystem("dnd");
    setCharacter(createInitialCharacter("dnd"));
    setEditingCharacterId(null);
    setIsFormOpen(false);
    setSubmitError(null);
  }, []);

  const handleToggleForm = () => {
    if (isFormOpen) {
      resetForm();
      return;
    }

    setEditingCharacterId(null);
    setSelectedSystem("dnd");
    setCharacter(createInitialCharacter("dnd"));
    setSubmitError(null);
    setFeedbackMessage(null);
    setIsFormOpen(true);
  };

  const handleEditCharacter = (record: StoredCharacter) => {
    setEditingCharacterId(record.id);
    setSelectedSystem(record.system);
    setCharacter({
      name: record.name,
      campaign: record.campaign,
      stats: cloneFieldArray(record.stats),
      skills: cloneFieldArray(record.skills),
      notes: record.notes,
      avatarUrl: record.avatarUrl,
      isPublic: record.isPublic ?? false,
    });
    setSubmitError(null);
    setFeedbackMessage(null);
    setIsFormOpen(true);
  };

  const handleDeleteCharacter = async (id: string) => {
    const confirmation = window.confirm(
      "Are you sure you want to delete this character?"
    );

    if (!confirmation) {
      return;
    }

    try {
      const response = await fetch(`/api/characters/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete character");
      }

      if (editingCharacterId === id) {
        resetForm();
      }

      setFeedbackMessage("Character deleted successfully.");
      setActionError(null);
      await fetchCharacters();
    } catch (error) {
      console.error("Unable to delete character", error);
      setActionError("Failed to delete the character. Please try again.");
      setFeedbackMessage(null);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);
    setActionError(null);

    const payload = {
      system: selectedSystem,
      ...character,
    };

    try {
      const response = await fetch(
        editingCharacterId
          ? `/api/characters/${editingCharacterId}`
          : "/api/characters",
        {
          method: editingCharacterId ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to save character");
      }

      const savedCharacter = (await response.json()) as StoredCharacter;

      setFeedbackMessage(
        editingCharacterId
          ? "Character updated successfully."
          : "Character created successfully."
      );
      setActionError(null);

      await fetchCharacters();

      setIsSubmitting(false);

      setEditingCharacterId(savedCharacter.id);

      if (editingCharacterId) {
        setCharacter({
          name: savedCharacter.name,
          campaign: savedCharacter.campaign,
          stats: cloneFieldArray(savedCharacter.stats),
          skills: cloneFieldArray(savedCharacter.skills),
          notes: savedCharacter.notes,
          avatarUrl: savedCharacter.avatarUrl,
          isPublic: savedCharacter.isPublic ?? false,
        });
      } else {
        resetForm();
      }
    } catch (error) {
      console.error("Unable to save character", error);
      setSubmitError("We couldn't save the character. Please try again.");
      setFeedbackMessage(null);
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    resetForm();
  };

  return (
    <section className="space-y-6">
      {imageToCrop && (
        <AvatarCropper
          imageSrc={imageToCrop}
          onCropComplete={handleCropComplete}
          onCancel={handleCropCancel}
        />
      )}
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold">Characters</h1>
        <p className="text-sm text-slate-300">
          Craft, review, and iterate on the heroes and villains that bring your
          campaigns to life. Choose a supported game system or build something
          completely custom.
        </p>
      </div>

      {feedbackMessage && (
        <div className="rounded-md border border-emerald-700 bg-emerald-900/40 px-4 py-3 text-sm text-emerald-100">
          {feedbackMessage}
        </div>
      )}

      {loadingError && (
        <div className="rounded-md border border-rose-700 bg-rose-900/40 px-4 py-3 text-sm text-rose-100">
          {loadingError}
        </div>
      )}

      {actionError && (
        <div className="rounded-md border border-rose-700 bg-rose-900/40 px-4 py-3 text-sm text-rose-100">
          {actionError}
        </div>
      )}

      <div className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-100">
          Saved Characters
        </h2>
          {isLoading ? (
          <div className="rounded-md border border-slate-800 bg-slate-950/40 px-4 py-6 text-sm text-slate-300">
            Loading characters...
          </div>
        ) : characters.length === 0 ? (
          <div className="rounded-md border border-slate-800 bg-slate-950/40 px-4 py-6 text-sm text-slate-300">
            You haven&apos;t saved any characters yet. Use the button below to add
            your first adventurer.
          </div>
        ) : (
          <div className="space-y-3">
            {characters.map((item) => (
              <details
                key={item.id}
                className="overflow-hidden rounded-lg border border-slate-800 bg-slate-950/60 shadow"
              >
                <summary className="flex cursor-pointer flex-wrap items-center gap-3 bg-slate-900/60 px-4 py-3 text-sm font-medium text-slate-200 transition hover:bg-slate-900/80">
                  <span className="text-base font-semibold text-slate-100">
                    {item.name || "Untitled Character"}
                  </span>
                  <span className="rounded-full border border-indigo-500/60 bg-indigo-500/10 px-2 py-0.5 text-xs font-semibold uppercase tracking-wide text-indigo-200">
                    {getSystemLabel(item.system)}
                  </span>
                  <span className="text-sm text-slate-300">
                    Campaign: {item.campaign || "Unassigned"}
                  </span>
                </summary>
                <div className="space-y-4 border-t border-slate-800 bg-slate-950/40 px-4 py-4 text-sm text-slate-200">
                  <div className="flex flex-wrap justify-between gap-2">
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => handleEditCharacter(item)}
                        className="rounded-md border border-indigo-500/70 px-3 py-1 text-xs font-medium text-indigo-200 transition hover:bg-indigo-500/10"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteCharacter(item.id)}
                        className="rounded-md border border-rose-600/70 px-3 py-1 text-xs font-medium text-rose-200 transition hover:bg-rose-600/10"
                      >
                        Delete
                      </button>
                    </div>
                    <span className="text-xs text-slate-400">
                      Last updated: {new Date(item.updatedAt).toLocaleString()}
                    </span>
                  </div>

                  <div className="grid gap-3 md:grid-cols-2">
                    <div className="space-y-2">
                      <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                        Ability Scores
                      </h3>
                      <div className="grid gap-2 sm:grid-cols-2">
                        {item.stats.map((stat, index) => (
                          <div
                            key={`${stat.name}-${index}`}
                            className="rounded-md border border-slate-800 bg-slate-950/50 px-3 py-2"
                          >
                            <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                              {stat.name || "Stat"}
                            </div>
                            <div className="text-lg font-semibold text-slate-100">
                              {stat.value || "-"}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                        Skills
                      </h3>
                      <div className="grid gap-2 sm:grid-cols-2">
                        {item.skills.map((skill, index) => (
                          <div
                            key={`${skill.name}-${index}`}
                            className="rounded-md border border-slate-800 bg-slate-950/50 px-3 py-2"
                          >
                            <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                              {skill.name || "Skill"}
                            </div>
                            <div className="text-lg font-semibold text-slate-100">
                              {skill.value || "-"}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {item.notes && (
                    <div className="space-y-2">
                      <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                        Notes
                      </h3>
                      <p className="whitespace-pre-wrap rounded-md border border-slate-800 bg-slate-950/40 px-3 py-2 text-sm text-slate-200">
                        {item.notes}
                      </p>
                    </div>
                  )}
                </div>
              </details>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-lg border border-slate-800 bg-slate-950/60">
        <button
          type="button"
          onClick={handleToggleForm}
          className="flex w-full items-center justify-between gap-2 bg-slate-900/50 px-4 py-3 text-left text-sm font-semibold text-slate-100 transition hover:bg-slate-900/80"
        >
          <span>
            {isFormOpen
              ? editingCharacterId
                ? "Close character editor"
                : "Hide add character form"
              : "Add a character"}
          </span>
          <span className="text-xs uppercase tracking-wide text-slate-400">
            {isFormOpen ? "Collapse" : "Expand"}
          </span>
        </button>
        {isFormOpen && (
          <form
            onSubmit={handleSubmit}
            className="space-y-8 border-t border-slate-800 p-6"
          >
            <div className="grid gap-4 md:grid-cols-2">
              <label className="flex flex-col gap-2">
                <span className="text-sm font-medium text-slate-200">
                  Game System
                </span>
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
                <span className="text-xs text-slate-400">
                  {systemConfig.description}
                </span>
              </label>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="flex flex-col gap-2">
                  <span className="text-sm font-medium text-slate-200">
                    Name
                  </span>
                  <input
                    type="text"
                    value={character.name}
                    onChange={(event) =>
                      setCharacter((prev) => ({
                        ...prev,
                        name: event.target.value,
                      }))
                    }
                    placeholder="Eldrin the Bold"
                    className="rounded-md border border-slate-700 bg-slate-950/60 px-3 py-2 text-sm text-slate-100 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/40"
                  />
                </label>
                <label className="flex flex-col gap-2">
                  <span className="text-sm font-medium text-slate-200">
                    Campaign
                  </span>
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

              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={character.isPublic ?? false}
                  onChange={(event) =>
                    setCharacter((prev) => ({
                      ...prev,
                      isPublic: event.target.checked,
                    }))
                  }
                  className="h-5 w-5 rounded border-slate-700 bg-slate-950/60 text-indigo-500 outline-none transition focus:ring-2 focus:ring-indigo-500/40"
                />
                <span className="text-sm text-slate-200">
                  <span className="font-medium">Make this character public</span>
                  <span className="block text-xs text-slate-400">
                    Public characters will be visible on your player profile page
                  </span>
                </span>
              </label>
            </div>

            {/* Avatar Upload Section */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-slate-100">
                Character Avatar
              </h2>
              <div className="flex items-center gap-6">
                <div className="flex-shrink-0">
                  {character.avatarUrl ? (
                    <img
                      src={character.avatarUrl}
                      alt="Character Avatar"
                      className="h-24 w-24 rounded-full border-2 border-slate-700 object-cover"
                    />
                  ) : (
                    <div className="flex h-24 w-24 items-center justify-center rounded-full border-2 border-slate-700 bg-slate-800 text-2xl font-semibold text-slate-400">
                      {character.name
                        ? character.name.charAt(0).toUpperCase()
                        : "?"}
                    </div>
                  )}
                </div>
                <div className="flex-1 space-y-2">
                  <label
                    htmlFor="character-avatar-upload"
                    className="inline-block cursor-pointer rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isUploadingAvatar ? "Uploading..." : "Upload Avatar"}
                  </label>
                  <input
                    id="character-avatar-upload"
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    onChange={handleAvatarUpload}
                    disabled={isUploadingAvatar}
                    className="hidden"
                  />
                  <p className="text-xs text-slate-400">
                    JPG, PNG, WebP or GIF. Max 5MB.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-100">
                  Ability Scores
                </h2>
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
                <h2 className="text-lg font-semibold text-slate-100">
                  Skills
                </h2>
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
                  setCharacter((prev) => ({
                    ...prev,
                    notes: event.target.value,
                  }))
                }
                placeholder="Personality traits, ideals, bonds, flaws, and other custom details."
                rows={4}
                className="rounded-md border border-slate-700 bg-slate-950/60 px-3 py-2 text-sm text-slate-100 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/40"
              />
            </label>

            {submitError && (
              <div className="rounded-md border border-rose-700 bg-rose-900/40 px-4 py-3 text-sm text-rose-100">
                {submitError}
              </div>
            )}

            <div className="flex flex-wrap items-center justify-end gap-3">
              <button
                type="button"
                onClick={handleCancel}
                className="rounded-md border border-slate-700 px-4 py-2 text-sm font-medium text-slate-200 transition hover:bg-slate-800/60"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow transition hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/60 focus:ring-offset-2 focus:ring-offset-slate-950 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSubmitting
                  ? "Saving..."
                  : editingCharacterId
                  ? "Update Character"
                  : "Save Character"}
              </button>
            </div>
          </form>
        )}
      </div>
    </section>
  );
}
