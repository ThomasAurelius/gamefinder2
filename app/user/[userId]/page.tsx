import { notFound } from "next/navigation";
import Link from "next/link";
import { getUserBasicInfo } from "@/lib/users";
import { readProfile } from "@/lib/profile-db";
import { getDisplayedUserBadges } from "@/lib/badges/db";
import Badge from "@/components/Badge";
import HostRatingDisplay from "@/components/HostRatingDisplay";
import PlayerRatingDisplay from "@/components/PlayerRatingDisplay";

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
  const userBadges = await getDisplayedUserBadges(userId);

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
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold">{profile.commonName || userInfo.name}</h1>
              {userBadges.length > 0 && (
                <div className="flex gap-1">
                  {userBadges.map(({ badge }) => (
                    <Badge
                      key={badge._id?.toString()}
                      name={badge.name}
                      imageUrl={badge.imageUrl}
                      size="lg"
                      showTooltip={true}
                    />
                  ))}
                </div>
              )}
            </div>
            {profile.location && (
              <p className="mt-1 text-sm text-slate-400">{profile.location}</p>
            )}
            <div className="mt-2 space-y-1">
              <Link 
                href={`/feedback/${userId}`}
                className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-300 transition-colors"
              >
                <span>Host Rating:</span>
                <HostRatingDisplay hostId={userId} showDetails={true} />
              </Link>
              <Link 
                href={`/feedback/${userId}`}
                className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-300 transition-colors"
              >
                <span>Player Rating:</span>
                <PlayerRatingDisplay playerId={userId} showDetails={true} />
              </Link>
            </div>
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
