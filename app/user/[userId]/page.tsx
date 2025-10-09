import { notFound } from "next/navigation";
import { getUserBasicInfo } from "@/lib/users";
import { readProfile } from "@/lib/profile-db";

export default async function UserProfilePage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await params;
  
  const userInfo = await getUserBasicInfo(userId);
  
  if (!userInfo) {
    notFound();
  }

  const profile = await readProfile(userId);

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-8 px-4 py-8 text-slate-100">
      <div className="space-y-4">
        {/* Avatar and Name */}
        <div className="flex items-center gap-4">
          {userInfo.avatarUrl ? (
            <img
              src={userInfo.avatarUrl}
              alt={userInfo.name}
              className="h-24 w-24 rounded-full border-2 border-slate-700 object-cover"
            />
          ) : (
            <div className="flex h-24 w-24 items-center justify-center rounded-full border-2 border-slate-700 bg-slate-800 text-3xl font-semibold text-slate-400">
              {userInfo.name.charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <h1 className="text-3xl font-bold">{profile.commonName || userInfo.name}</h1>
            {profile.location && (
              <p className="mt-1 text-sm text-slate-400">{profile.location}</p>
            )}
            {profile.bggUsername && (
              <a
                href={`https://boardgamegeek.com/user/${profile.bggUsername}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-flex items-center gap-1 text-sm text-sky-400 hover:text-sky-300"
              >
                <span>BGG Profile</span>
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
              </a>
            )}
          </div>
        </div>

        {/* Bio */}
        {profile.bio && (
          <p className="max-w-3xl text-base text-slate-200">{profile.bio}</p>
        )}
      </div>

      {/* Favorite Games */}
      {profile.favoriteGames && profile.favoriteGames.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-lg font-semibold text-slate-100">Favorite Games</h2>
          <div className="flex flex-wrap gap-2">
            {profile.favoriteGames.map((game) => (
              <span
                key={game}
                className="rounded-full border border-sky-500/40 bg-sky-500/10 px-3 py-1 text-sm text-sky-100"
              >
                {game}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Availability */}
      {profile.availability && Object.keys(profile.availability).length > 0 && (
        <div className="space-y-2">
          <h2 className="text-lg font-semibold text-slate-100">Availability</h2>
          <div className="grid gap-3 md:grid-cols-2">
            {Object.entries(profile.availability).map(([day, slots]) => {
              if (!Array.isArray(slots) || slots.length === 0) return null;
              return (
                <div
                  key={day}
                  className="rounded-lg border border-slate-800 bg-slate-900/70 p-3"
                >
                  <div className="text-sm font-semibold uppercase tracking-wide text-slate-400">
                    {day}
                  </div>
                  <ul className="mt-1 space-y-1 text-sm text-slate-200">
                    {slots.map((slot) => (
                      <li key={slot}>{slot}</li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Primary Role */}
      {profile.primaryRole && (
        <div className="space-y-2">
          <h2 className="text-lg font-semibold text-slate-100">Primary Role</h2>
          <p className="text-slate-200">{profile.primaryRole}</p>
        </div>
      )}
    </div>
  );
}
