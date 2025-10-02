import Link from "next/link";
import { notFound } from "next/navigation";

import { formatGameSystem, getPublicProfile } from "@/lib/public-profiles";

function AvailabilityGrid({
  availability,
}: {
  availability?: Record<string, string[]>;
}) {
  if (!availability || Object.keys(availability).length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      <h2 className="text-lg font-semibold text-slate-100">Availability</h2>
      <div className="grid gap-3 md:grid-cols-2">
        {Object.entries(availability).map(([day, slots]) => (
          <div key={day} className="rounded-lg border border-slate-800 bg-slate-900/70 p-3">
            <div className="text-sm font-semibold uppercase tracking-wide text-slate-400">
              {day}
            </div>
            {slots.length > 0 ? (
              <ul className="mt-1 space-y-1 text-sm text-slate-200">
                {slots.map((slot) => (
                  <li key={slot}>{slot}</li>
                ))}
              </ul>
            ) : (
              <p className="mt-1 text-sm text-slate-500">No sessions</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default async function PublicProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const profile = await getPublicProfile(username);

  if (!profile) {
    notFound();
  }

  const { profile: details, characters } = profile;

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-8 px-4 py-8 text-slate-100">
      <div className="space-y-2">
        <p className="text-sm uppercase tracking-wide text-sky-400">
          @{profile.username}
        </p>
        <h1 className="text-3xl font-bold">{details.displayName}</h1>
        {details.location ? (
          <p className="text-sm text-slate-400">{details.location}</p>
        ) : null}
        <p className="max-w-3xl text-base text-slate-200">{details.bio}</p>
      </div>

      {details.favoriteGames.length > 0 ? (
        <div className="space-y-2">
          <h2 className="text-lg font-semibold text-slate-100">Favorite Games</h2>
          <div className="flex flex-wrap gap-2">
            {details.favoriteGames.map((game) => (
              <span
                key={game}
                className="rounded-full border border-sky-500/40 bg-sky-500/10 px-3 py-1 text-sm text-sky-100"
              >
                {game}
              </span>
            ))}
          </div>
        </div>
      ) : null}

      <AvailabilityGrid availability={details.availability} />

      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-100">Characters</h2>
          <p className="text-sm text-slate-400">
            Explore the characters shared by {details.displayName}.
          </p>
        </div>

        {characters.length === 0 ? (
          <p className="text-slate-400">No public characters yet.</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {characters.map((character) => (
              <Link
                key={character.slug}
                href={`/profile/${profile.username}/${character.slug}`}
                className="group rounded-xl border border-slate-800 bg-slate-900/60 p-4 transition hover:border-sky-500/60 hover:bg-slate-900"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-semibold text-slate-100 group-hover:text-sky-100">
                      {character.name}
                    </h3>
                    <p className="text-sm text-slate-400">
                      Campaign: {character.campaign || "Unassigned"}
                    </p>
                  </div>
                  <span className="rounded-full border border-slate-700 px-2 py-1 text-xs uppercase tracking-wide text-slate-300">
                    {formatGameSystem(character.system)}
                  </span>
                </div>
                <p className="mt-3 line-clamp-3 text-sm text-slate-300">
                  {character.notes}
                </p>
                <p className="mt-4 text-sm font-medium text-sky-300">
                  View details →
                </p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
