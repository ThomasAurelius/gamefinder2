import Link from "next/link";
import { notFound } from "next/navigation";
import { isValidObjectId } from "@/lib/mongodb-utils";
import { readProfile } from "@/lib/profile-db";
import { listPublicCharacters } from "@/lib/characters/db";
import { getSkillDisplayName } from "@/lib/characters/skill-attributes";
import { categorizeStats } from "@/lib/characters/stat-display-utils";
import ShareButtons from "@/components/ShareButtons";
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

  // For ability scores, split into physical and mental stats if they match standard 6
  if (title === "Stats") {
    const { physical: physicalStats, mental: mentalStats, other: otherStats, hasStandardStats } = categorizeStats(items);
    
    if (hasStandardStats) {
      return (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-slate-100">{title}</h3>
          <div className="grid gap-2 grid-cols-2">
            <div className="space-y-2">
              {physicalStats.map((item) => (
                <div
                  key={item.name}
                  className="rounded-lg border border-slate-800 bg-slate-900/70 px-3 py-2 text-sm text-slate-100"
                >
                  <span className="block text-xs uppercase tracking-wide text-slate-400">
                    {item.name}
                  </span>
                  <span className="text-base font-medium">{item.value}</span>
                </div>
              ))}
            </div>
            <div className="space-y-2">
              {mentalStats.map((item) => (
                <div
                  key={item.name}
                  className="rounded-lg border border-slate-800 bg-slate-900/70 px-3 py-2 text-sm text-slate-100"
                >
                  <span className="block text-xs uppercase tracking-wide text-slate-400">
                    {item.name}
                  </span>
                  <span className="text-base font-medium">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
          {otherStats.length > 0 && (
            <div className="grid gap-2 md:grid-cols-2 mt-2">
              {otherStats.map((item) => (
                <div
                  key={item.name}
                  className="rounded-lg border border-slate-800 bg-slate-900/70 px-3 py-2 text-sm text-slate-100"
                >
                  <span className="block text-xs uppercase tracking-wide text-slate-400">
                    {item.name}
                  </span>
                  <span className="text-base font-medium">{item.value}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }
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
  if (!isValidObjectId(id)) {
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
    const characterUrl = `${process.env.NEXT_PUBLIC_APP_URL || "https://thegatheringcall.com"}/players/${id}/characters/${characterId}`;
    const characterDescription = `Check out ${character.name}${character.class ? `, a ${character.class}` : ""}${character.level ? ` (Level ${character.level})` : ""} character!`;

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
                {character.gold ? (
                  <span>Gold: {character.gold}</span>
                ) : null}
                {character.experience ? (
                  <span>XP: {character.experience}</span>
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

        {/* Share buttons */}
        <section>
          <ShareButtons 
            url={characterUrl}
            title={`${character.name} - Character`}
            description={characterDescription}
          />
        </section>

        {character.notes ? (
          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-slate-100">Character Notes</h2>
            <p className="whitespace-pre-line text-base text-slate-200">{character.notes}</p>
          </section>
        ) : null}

        {/* Basic Character Details */}
        {(character.race || character.background || character.alignment || 
          character.age || character.height || character.weight || 
          character.eyes || character.skin || character.hair) ? (
          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-slate-100">Basic Details</h2>
            <div className="grid gap-2 md:grid-cols-2">
              {character.race ? (
                <div className="rounded-lg border border-slate-800 bg-slate-900/70 px-3 py-2 text-sm text-slate-100">
                  <span className="block text-xs uppercase tracking-wide text-slate-400">
                    Race
                  </span>
                  <span className="text-base font-medium">{character.race}</span>
                </div>
              ) : null}
              {character.background ? (
                <div className="rounded-lg border border-slate-800 bg-slate-900/70 px-3 py-2 text-sm text-slate-100">
                  <span className="block text-xs uppercase tracking-wide text-slate-400">
                    Background
                  </span>
                  <span className="text-base font-medium">{character.background}</span>
                </div>
              ) : null}
              {character.alignment ? (
                <div className="rounded-lg border border-slate-800 bg-slate-900/70 px-3 py-2 text-sm text-slate-100">
                  <span className="block text-xs uppercase tracking-wide text-slate-400">
                    Alignment
                  </span>
                  <span className="text-base font-medium">{character.alignment}</span>
                </div>
              ) : null}
              {character.age ? (
                <div className="rounded-lg border border-slate-800 bg-slate-900/70 px-3 py-2 text-sm text-slate-100">
                  <span className="block text-xs uppercase tracking-wide text-slate-400">
                    Age
                  </span>
                  <span className="text-base font-medium">{character.age}</span>
                </div>
              ) : null}
              {character.height ? (
                <div className="rounded-lg border border-slate-800 bg-slate-900/70 px-3 py-2 text-sm text-slate-100">
                  <span className="block text-xs uppercase tracking-wide text-slate-400">
                    Height
                  </span>
                  <span className="text-base font-medium">{character.height}</span>
                </div>
              ) : null}
              {character.weight ? (
                <div className="rounded-lg border border-slate-800 bg-slate-900/70 px-3 py-2 text-sm text-slate-100">
                  <span className="block text-xs uppercase tracking-wide text-slate-400">
                    Weight
                  </span>
                  <span className="text-base font-medium">{character.weight}</span>
                </div>
              ) : null}
              {character.eyes ? (
                <div className="rounded-lg border border-slate-800 bg-slate-900/70 px-3 py-2 text-sm text-slate-100">
                  <span className="block text-xs uppercase tracking-wide text-slate-400">
                    Eyes
                  </span>
                  <span className="text-base font-medium">{character.eyes}</span>
                </div>
              ) : null}
              {character.skin ? (
                <div className="rounded-lg border border-slate-800 bg-slate-900/70 px-3 py-2 text-sm text-slate-100">
                  <span className="block text-xs uppercase tracking-wide text-slate-400">
                    Skin
                  </span>
                  <span className="text-base font-medium">{character.skin}</span>
                </div>
              ) : null}
              {character.hair ? (
                <div className="rounded-lg border border-slate-800 bg-slate-900/70 px-3 py-2 text-sm text-slate-100">
                  <span className="block text-xs uppercase tracking-wide text-slate-400">
                    Hair
                  </span>
                  <span className="text-base font-medium">{character.hair}</span>
                </div>
              ) : null}
            </div>
          </section>
        ) : null}

        {character.items && character.items.length > 0 ? (
          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-slate-100">Items</h2>
            <div className="flex flex-wrap gap-2">
              {character.items.map((item, index) => (
                <span
                  key={index}
                  className="inline-flex items-center rounded-full border border-slate-700 bg-slate-800/50 px-3 py-1 text-sm text-slate-200"
                >
                  {item}
                </span>
              ))}
            </div>
          </section>
        ) : null}

        {character.pdfUrls && character.pdfUrls.length > 0 ? (
          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-slate-100">Character Sheets</h2>
            <div className="flex flex-wrap gap-2">
              {character.pdfUrls.map((url, index) => (
                <a
                  key={index}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center rounded-md border border-sky-600/70 bg-sky-900/30 px-3 py-1.5 text-sm text-sky-200 transition hover:bg-sky-900/50"
                >
                  📄 Character Sheet {index + 1}
                </a>
              ))}
            </div>
          </section>
        ) : null}

        {character.system === "starfinder" && character.demiplaneUrl ? (
          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-slate-100">Demiplane Character</h2>
            <a
              href={character.demiplaneUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center rounded-md border border-purple-600/70 bg-purple-900/30 px-3 py-1.5 text-sm text-purple-200 transition hover:bg-purple-900/50"
            >
              🔗 View on Demiplane
            </a>
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
