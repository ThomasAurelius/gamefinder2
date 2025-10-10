import Link from "next/link";
import { notFound } from "next/navigation";
import { ObjectId } from "mongodb";
import { readProfile } from "@/lib/profile-db";
import { listPublicCharacters } from "@/lib/characters/db";
import { getSkillDisplayName } from "@/lib/characters/skill-attributes";
import type { GameSystemKey } from "@/lib/characters/types";

function formatGameSystem(system: string): string {
  const systemMap: Record<string, string> = {
    dnd: "D&D 5e",
    pathfinder: "Pathfinder",
    starfinder: "Starfinder",
    shadowdark: "Shadowdark",
    other: "Other",
  };

  return systemMap[system] || system;
}

function FieldList({
  title,
  items,
  system,
}: {
  title: string;
  items: { name: string; value: string }[];
  system?: GameSystemKey;
}) {
  if (items.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold text-slate-100">{title}</h3>
      <div className="grid gap-2 md:grid-cols-2">
        {items.map((item) => (
          <div
            key={item.name}
            className="rounded-lg border border-slate-800 bg-slate-900/70 px-3 py-2 text-sm text-slate-100"
          >
            <span className="block text-xs uppercase tracking-wide text-slate-400">
              {system && title === "Skills" ? getSkillDisplayName(item.name, system) : item.name}
            </span>
            <span className="text-base font-medium">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default async function CharacterDetailPage({
  params,
}: {
  params: Promise<{ id: string; characterId: string }>;
}) {
  const { id, characterId } = await params;

  // Validate the IDs
  if (!ObjectId.isValid(id)) {
    notFound();
  }

  try {
    // Get the player profile
    const profile = await readProfile(id);
    if (!profile.userName) {
      notFound();
    }

    // Get all public characters for this user
    const publicCharacters = await listPublicCharacters(id);
    
    // Find the specific character
    const character = publicCharacters.find((char) => char.id === characterId);
    
    if (!character) {
      notFound();
    }

    const displayName = profile.commonName || profile.userName;
    const updatedAt = character.updatedAt ? new Date(character.updatedAt) : null;

    return (
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-8 px-4 py-8 text-slate-100">
        <Link
          href={`/players/${id}`}
          className="text-sm font-medium text-sky-300 hover:text-sky-200"
        >
          ← Back to {displayName}
        </Link>

        <header className="space-y-4">
          <p className="text-sm uppercase tracking-wide text-slate-400">
            {displayName}
          </p>
          
          {/* Character Avatar and Name */}
          <div className="flex items-start gap-6">
            {character.avatarUrl ? (
              <img
                src={character.avatarUrl}
                alt={character.name}
                className="h-32 w-32 rounded-full border-2 border-slate-700 object-cover"
              />
            ) : (
              <div className="flex h-32 w-32 items-center justify-center rounded-full border-2 border-slate-700 bg-slate-800 text-4xl font-semibold text-slate-400">
                {character.name.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="flex-1 space-y-3">
              <h1 className="text-3xl font-bold text-slate-100">{character.name}</h1>
              <div className="flex flex-wrap items-center gap-3 text-sm text-slate-400">
                <span className="rounded-full border border-slate-700 px-3 py-1 text-xs uppercase tracking-wide text-slate-300">
                  {formatGameSystem(character.system)}
                </span>
                {character.level ? (
                  <span>Level: {character.level}</span>
                ) : null}
                {character.class ? (
                  <span>Class: {character.class}</span>
                ) : null}
                {character.role ? (
                  <span>Role: {character.role}</span>
                ) : null}
                {character.campaign ? (
                  <span>Campaign: {character.campaign}</span>
                ) : null}
                {updatedAt ? (
                  <span>Updated {updatedAt.toLocaleDateString()}</span>
                ) : null}
              </div>
            </div>
          </div>
        </header>

        {character.notes ? (
          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-slate-100">Character Notes</h2>
            <p className="whitespace-pre-line text-base text-slate-200">{character.notes}</p>
          </section>
        ) : null}

        <FieldList title="Stats" items={character.stats} />
        <FieldList title="Skills" items={character.skills} system={character.system} />
      </div>
    );
  } catch (error) {
    console.error("Failed to load character:", error);
    notFound();
  }
}
