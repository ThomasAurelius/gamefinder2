import { notFound } from "next/navigation";
import { isValidObjectId } from "@/lib/mongodb-utils";
import { getUserLibrary } from "@/lib/boardgames/library";
import { readProfile } from "@/lib/profile-db";
import Link from "next/link";

export default async function PlayerLibraryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // Validate the ID format
  if (!isValidObjectId(id)) {
    notFound();
  }

  try {
    // Get the profile to display the user's name
    const profile = await readProfile(id);

    // If profile is empty (no userName), treat as not found
    if (!profile.userName) {
      notFound();
    }

    const displayName = profile.commonName || profile.userName;

    // Get the user's library
    const library = await getUserLibrary(id);

    return (
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-8 px-4 py-8 text-slate-100">
        {/* Header Section */}
        <div className="space-y-2">
          <Link
            href={`/players/${id}`}
            className="text-sm text-sky-400 hover:text-sky-300"
          >
            ← Back to {displayName}&apos;s Profile
          </Link>
          <h1 className="text-3xl font-bold">{displayName}&apos;s Game Library</h1>
          <p className="text-slate-400">
            Board games owned and wishlisted by {displayName}
          </p>
        </div>

        {/* Owned Games Section */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-slate-100">
            Owned Games ({library.owned.length})
          </h2>
          {library.owned.length > 0 ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {library.owned.map((entry) => (
                <div
                  key={entry.gameId}
                  className="rounded-lg border border-slate-800 bg-slate-900/70 p-4"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-slate-100 flex-1">
                      {entry.gameName}
                    </h3>
                    {entry.isFavorite && (
                      <span className="text-yellow-500 flex-shrink-0" title="Favorite">
                        ★
                      </span>
                    )}
                  </div>
                  <p className="mt-2 text-xs text-slate-500">
                    Added: {new Date(entry.addedAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-400">No owned games yet.</p>
          )}
        </div>

        {/* Wishlist Section */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-slate-100">
            Wishlist ({library.wishlist.length})
          </h2>
          {library.wishlist.length > 0 ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {library.wishlist.map((entry) => (
                <div
                  key={entry.gameId}
                  className="rounded-lg border border-slate-800 bg-slate-900/70 p-4"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-slate-100 flex-1">
                      {entry.gameName}
                    </h3>
                    {entry.isFavorite && (
                      <span className="text-yellow-500 flex-shrink-0" title="Favorite">
                        ★
                      </span>
                    )}
                  </div>
                  <p className="mt-2 text-xs text-slate-500">
                    Added: {new Date(entry.addedAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-400">No games in wishlist yet.</p>
          )}
        </div>
      </div>
    );
  } catch (error) {
    console.error("Failed to load player library:", error);
    notFound();
  }
}
