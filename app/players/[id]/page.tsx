import Link from "next/link";
import { notFound } from "next/navigation";
import { readProfile, getProfileHiddenStatus } from "@/lib/profile-db";
import { ObjectId } from "mongodb";
import { TIME_SLOT_GROUPS } from "@/lib/constants";
import SendMessageButton from "@/components/SendMessageButton";
import { listPublicCharacters } from "@/lib/characters/db";
import ProfileAdminControls from "@/components/ProfileAdminControls";

const DAYS_OF_WEEK = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

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

function AvailabilityGrid({
  availability,
}: {
  availability?: Record<string, string[]>;
}) {
  if (!availability) return null;

  return (
    <div className="space-y-3">
      {DAYS_OF_WEEK.map((day) => (
        <div key={day}>
          <div className="flex items-start gap-4">
            <div className="w-24 flex-shrink-0 text-sm font-medium text-slate-300">
              {day}
            </div>
            {availability[day]?.length ? (
              <div className="space-y-2 flex-1">
                {TIME_SLOT_GROUPS.map((group) => {
                  const groupSlots = availability[day].filter((slot) =>
                    group.slots.includes(slot)
                  );
                  if (groupSlots.length === 0) return null;
                  return (
                    <div key={group.label}>
                      <div className="text-xs font-medium text-slate-400 mb-1">
                        {group.label}:
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {groupSlots.map((slot) => (
                          <span
                            key={slot}
                            className="rounded-full border border-slate-700 bg-slate-800 px-2 py-1 text-xs text-slate-300"
                          >
                            {slot}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="mt-1 text-sm text-slate-500">No sessions</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export default async function PlayerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // Validate the ID format
  if (!ObjectId.isValid(id)) {
    notFound();
  }

  try {
    const profile = await readProfile(id);

    // If profile is empty (no userName), treat as not found
    if (!profile.userName) {
      notFound();
    }

    const displayName = profile.commonName || profile.userName;
    
    // Fetch public characters for this user
    const publicCharacters = await listPublicCharacters(id);
    
    // Get hidden status for admin controls
    const isHidden = await getProfileHiddenStatus(id);

    return (
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-8 px-4 py-8 text-slate-100">
        {/* Admin Controls */}
        <ProfileAdminControls profileUserId={id} initialIsHidden={isHidden} />
        
        {/* Header Section */}
        <div className="flex items-start gap-6">
          {profile.avatarUrl ? (
            <img
              src={profile.avatarUrl}
              alt={displayName}
              className="h-32 w-32 rounded-full border-2 border-slate-700 object-cover"
            />
          ) : (
            <div className="flex h-32 w-32 items-center justify-center rounded-full border-2 border-slate-700 bg-slate-800 text-4xl font-semibold text-slate-400">
              {displayName.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="space-y-2 flex-1">
            <div className="flex items-center justify-between gap-3">
              <h1 className="text-3xl font-bold">{displayName}</h1>
              <div className="flex items-center gap-2">
                {profile.bggUsername && (
                  <a
                    href={`https://boardgamegeek.com/user/${encodeURIComponent(profile.bggUsername)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-lg border border-slate-700 bg-slate-800/40 px-4 py-2 text-sm font-medium text-slate-200 transition hover:bg-slate-800/60"
                    title={`View ${displayName}'s BoardGameGeek profile`}
                  >
                    BGG Profile
                  </a>
                )}
                <Link
                  href={`/players/${id}/library`}
                  className="rounded-lg border border-sky-600 bg-sky-600/20 px-4 py-2 text-sm font-medium text-sky-100 transition hover:bg-sky-600/30"
                >
                  View Library
                </Link>
                <SendMessageButton
                  recipientId={id}
                  recipientName={displayName}
                />
              </div>
            </div>
            {profile.location && (
              <p className="text-sm text-slate-400">{profile.location}</p>
            )}
            {profile.primaryRole && (
              <p className="text-base text-sky-400">
                <span className="text-slate-500">Primary Role:</span>{" "}
                {profile.primaryRole}
              </p>
            )}
          </div>
        </div>

        {/* Bio Section */}
        {profile.bio && (
          <div className="space-y-2">
            <h2 className="text-lg font-semibold text-slate-100">About</h2>
            <p className="max-w-3xl whitespace-pre-line text-base text-slate-200">
              {profile.bio}
            </p>
          </div>
        )}

        {/* Favorite Games Section */}
        {profile.favoriteGames.length > 0 && (
          <div className="space-y-2">
            <h2 className="text-lg font-semibold text-slate-100">
              Favorite Games
            </h2>
            <div className="flex flex-wrap gap-2">
              {profile.favoriteGames.map((game) => (
                <span
                  key={game}
                  className="rounded-full border border-sky-600 bg-sky-500/20 px-3 py-1.5 text-sm text-sky-100"
                >
                  {game}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* All Games Section */}
        {profile.games.length > 0 && (
          <div className="space-y-2">
            <h2 className="text-lg font-semibold text-slate-100">
              Games Played
            </h2>
            <div className="flex flex-wrap gap-2">
              {profile.games.map((game) => (
                <span
                  key={game}
                  className="rounded-full border border-slate-700 bg-slate-800 px-3 py-1.5 text-sm text-slate-300"
                >
                  {game}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Availability Section */}
        {profile.availability && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-slate-100">
              Availability
            </h2>
            <AvailabilityGrid availability={profile.availability} />
          </div>
        )}

        {/* Timezone Section */}
        {profile.timezone && (
          <div className="space-y-2">
            <h2 className="text-lg font-semibold text-slate-100">Timezone</h2>
            <p className="text-base text-slate-300">{profile.timezone}</p>
          </div>
        )}

        {/* Characters Section */}
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-100">Characters</h2>
            <p className="text-sm text-slate-400">
              Public characters shared by {displayName}.
            </p>
          </div>

          {publicCharacters.length === 0 ? (
            <p className="text-slate-400">No public characters yet.</p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {publicCharacters.map((character) => (
                <Link
                  key={character.id}
                  href={`/players/${id}/characters/${character.id}`}
                  className="group rounded-xl border border-slate-800 bg-slate-900/60 p-4 transition hover:border-sky-500/60 hover:bg-slate-900"
                >
                  <div className="flex items-start gap-4">
                    {character.avatarUrl ? (
                      <img
                        src={character.avatarUrl}
                        alt={character.name}
                        className="h-16 w-16 rounded-full border-2 border-slate-700 object-cover flex-shrink-0"
                      />
                    ) : (
                      <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-slate-700 bg-slate-800 text-xl font-semibold text-slate-400 flex-shrink-0">
                        {character.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-xl font-semibold text-slate-100 group-hover:text-sky-100">
                            {character.name}
                          </h3>
                          <p className="text-sm text-slate-400">
                            {character.level && <span>Level {character.level} • </span>}
                            {character.role && <span>{character.role} • </span>}
                            Campaign: {character.campaign || "Unassigned"}
                          </p>
                        </div>
                        <span className="rounded-full border border-slate-700 px-2 py-1 text-xs uppercase tracking-wide text-slate-300 flex-shrink-0">
                          {formatGameSystem(character.system)}
                        </span>
                      </div>
                      <p className="mt-3 line-clamp-3 text-sm text-slate-300">
                        {character.notes}
                      </p>
                      <p className="mt-4 text-sm font-medium text-sky-300">
                        View details →
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  } catch (error) {
    console.error("Failed to load player profile:", error);
    notFound();
  }
}
