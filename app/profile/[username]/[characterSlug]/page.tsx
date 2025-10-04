import Link from "next/link";
import { notFound } from "next/navigation";

import { formatGameSystem, getPublicCharacter } from "@/lib/public-profiles";

function FieldList({
  title,
  items,
}: {
  title: string;
  items: { name: string; value: string }[];
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
              {item.name}
            </span>
            <span className="text-base font-medium">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default async function CharacterPage({
  params,
}: {
  params: Promise<{ username: string; characterSlug: string }>;
}) {
  const { username, characterSlug } = await params;
  const result = await getPublicCharacter(username, characterSlug);

  if (!result) {
    notFound();
  }

  const { owner, character } = result;
  const updatedAt = character.updatedAt ? new Date(character.updatedAt) : null;

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-8 px-4 py-8 text-slate-100">
      <Link
        href={`/profile/${owner.username}`}
        className="text-sm font-medium text-sky-300 hover:text-sky-200"
      >
        ← Back to @{owner.username}
      </Link>

      <header className="space-y-3">
        <p className="text-sm uppercase tracking-wide text-slate-400">
          {owner.profile.displayName}
        </p>
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
      </header>

      {character.notes ? (
        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-slate-100">Character Notes</h2>
          <p className="whitespace-pre-line text-base text-slate-200">{character.notes}</p>
        </section>
      ) : null}

      <FieldList title="Stats" items={character.stats} />
      <FieldList title="Skills" items={character.skills} />
    </div>
  );
}
