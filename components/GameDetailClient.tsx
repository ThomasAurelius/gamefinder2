"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { formatDateInTimezone, DEFAULT_TIMEZONE } from "@/lib/timezone";
import { formatTimeSlotsByGroup } from "@/lib/constants";
import PendingPlayersManager from "@/components/PendingPlayersManager";
import GameActions from "@/components/GameActions";
import ShareButtons from "@/components/ShareButtons";
import GameDetailActions from "@/components/GameDetailActions";
import { isPaidGame } from "@/lib/game-utils";
import SignedUpPlayersList from "@/components/SignedUpPlayersList";
import WaitlistPlayersList from "@/components/WaitlistPlayersList";
import CalendarExportButtons from "@/components/CalendarExportButtons";

type Player = {
  id: string;
  name: string;
  avatarUrl?: string;
  characterName?: string;
  characterId?: string;
  characterIsPublic?: boolean;
};

type Vendor = {
  id: string;
  vendorName: string;
  address1: string;
  city: string;
  state: string;
  zip: string;
};

type GameSession = {
  id: string;
  userId: string;
  game: string;
  date: string;
  times: string[];
  description: string;
  maxPlayers: number;
  signedUpPlayers: string[];
  waitlist: string[];
  pendingPlayers: string[];
  costPerSession?: number;
  imageUrl?: string;
  location?: string;
  createdAt: string;
  updatedAt: string;
};

type GameDetailClientProps = {
  session: GameSession;
  host: Player | null;
  vendor: Vendor | null;
  signedUpPlayersList: Player[];
  waitlistPlayersList: Player[];
  pendingPlayersList: Player[];
  currentUserId: string | null;
  isHost: boolean;
  isUserSignedUp: boolean;
  gameUrl: string;
  shareDescription: string;
};

export default function GameDetailClient({
  session,
  host,
  vendor,
  signedUpPlayersList,
  waitlistPlayersList,
  pendingPlayersList,
  currentUserId,
  isHost,
  isUserSignedUp,
  gameUrl,
  shareDescription,
}: GameDetailClientProps) {
  const router = useRouter();
  const isFull = session.signedUpPlayers.length >= session.maxPlayers;
  const availableSlots = session.maxPlayers - session.signedUpPlayers.length;

  const handlePlayerRemoved = () => {
    router.refresh();
  };

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-8 px-4 py-8 text-slate-100">
      {/* Back link */}
      <Link
        href="/find"
        className="text-sm font-medium text-sky-300 hover:text-sky-200"
      >
        ← Back to Find Games
      </Link>

      {/* Game Image */}
      {session.imageUrl && (
        <div className="aspect-video w-full overflow-hidden rounded-lg border border-slate-800 bg-slate-900/50">
          <img
            src={session.imageUrl}
            alt={session.game}
            className="h-full w-full object-cover"
          />
        </div>
      )}

      {/* Game title and basic info */}
      <header className="space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-100">
              {session.game}
            </h1>
            <p className="mt-2 text-sm uppercase tracking-wide text-slate-400">
              Game Session
            </p>
          </div>

          {/* Edit and Delete buttons - only visible to host */}
          {isHost && <GameActions session={session} />}
        </div>

        {/* Share buttons */}
        <div className="flex flex-col gap-3">
          <ShareButtons 
            url={gameUrl} 
            title={`${session.game} - Game Session`}
            description={shareDescription}
          />
          <CalendarExportButtons
            type="game"
            id={session.id}
            game={session.game}
            date={session.date}
            times={session.times}
            description={session.description}
            location={session.location}
            hostName={host?.name}
          />
          <GameDetailActions
            sessionId={session.id}
            currentUserId={currentUserId}
            isUserSignedUp={isUserSignedUp}
            isHost={isHost}
            gameSystem={session.game}
          />
        </div>

        {/* Payment Section for non-hosts */}
        {!isHost && currentUserId && isPaidGame(session) && (
          <div className="mt-4">
            {session.signedUpPlayers.includes(currentUserId) ? (
              <div className="rounded-xl border border-sky-600/40 bg-sky-900/20 px-4 py-3">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-sky-200">Payment Required</p>
                    <p className="text-xs text-slate-400 mt-1">
                      Complete payment to confirm your spot (${session.costPerSession?.toFixed(2)})
                    </p>
                  </div>
                  <Link
                    href={`/games/${session.id}/payment`}
                    className="inline-flex items-center gap-2 rounded-lg border border-sky-500/40 bg-sky-500/20 px-4 py-2 text-sm font-medium text-sky-200 transition hover:border-sky-500 hover:bg-sky-500/30"
                  >
                    Proceed to payment
                  </Link>
                </div>
              </div>
            ) : session.pendingPlayers.includes(currentUserId) ? (
              <div className="rounded-xl border border-orange-500/20 bg-orange-500/10 px-4 py-3 text-sm text-orange-200">
                Your request to join this game is pending approval from the host. You&apos;ll be able to proceed with payment once you&apos;ve been approved.
              </div>
            ) : session.waitlist.includes(currentUserId) ? (
              <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/10 px-4 py-3 text-sm text-yellow-200">
                You&apos;re currently on the waitlist for this game. You&apos;ll be able to proceed with payment once a spot becomes available.
              </div>
            ) : null}
          </div>
        )}

        <div className="flex flex-wrap items-center gap-4 text-sm">
          <div className="rounded-lg border border-slate-800 bg-slate-900/70 px-4 py-2">
            <span className="block text-xs uppercase tracking-wide text-slate-400">
              Date
            </span>
            <span className="text-base font-medium text-slate-100">
              {formatDateInTimezone(session.date, DEFAULT_TIMEZONE)}
            </span>
          </div>

          <div className="rounded-lg border border-slate-800 bg-slate-900/70 px-4 py-2">
            <span className="block text-xs uppercase tracking-wide text-slate-400">
              Time Slots
            </span>
            <span className="whitespace-pre-line text-base font-medium text-slate-100">
              {formatTimeSlotsByGroup(session.times)}
            </span>
          </div>

          <div className="rounded-lg border border-slate-800 bg-slate-900/70 px-4 py-2">
            <span className="block text-xs uppercase tracking-wide text-slate-400">
              Players
            </span>
            <span
              className={`text-base font-medium ${isFull ? "text-orange-400" : "text-green-400"}`}
            >
              {session.signedUpPlayers.length}/{session.maxPlayers}
            </span>
          </div>

          {session.costPerSession !== undefined && session.costPerSession > 0 && (
            <div className="rounded-lg border border-sky-600/40 bg-sky-900/20 px-4 py-2">
              <span className="block text-xs uppercase tracking-wide text-sky-400">
                Cost
              </span>
              <span className="text-base font-medium text-sky-100">
                ${session.costPerSession.toFixed(2)}
              </span>
            </div>
          )}
        </div>
      </header>

      {/* Description */}
      {session.description && (
        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-slate-100">
            Description
          </h2>
          <p className="whitespace-pre-line text-base text-slate-200">
            {session.description}
          </p>
        </section>
      )}

      {/* Host Information */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-100">
          Game Master
        </h2>
        <div className="rounded-lg border border-slate-800 bg-slate-900/70 p-4">
          <Link
            href={`/user/${session.userId}`}
            className="flex items-center gap-4 hover:opacity-80 transition-opacity"
          >
            {host?.avatarUrl ? (
              <img
                src={host.avatarUrl}
                alt={host.name}
                className="h-12 w-12 rounded-full border-2 border-slate-700 object-cover"
              />
            ) : (
              <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-slate-700 bg-slate-800 text-lg font-semibold text-slate-400">
                {host ? host.name.charAt(0).toUpperCase() : "?"}
              </div>
            )}
            <p className="text-base text-slate-100">
              {host ? host.name : "Unknown Host"}
            </p>
          </Link>
        </div>
      </section>

      {/* Venue Information */}
      {vendor && (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-slate-100">
            Venue
          </h2>
          <div className="rounded-lg border border-slate-800 bg-slate-900/70 p-4">
            <Link
              href={`/vendor/${vendor.id}`}
              className="block hover:opacity-80 transition-opacity"
            >
              <p className="text-base font-medium text-sky-400 hover:text-sky-300">
                {vendor.vendorName}
              </p>
              <p className="text-sm text-slate-400 mt-1">
                {vendor.address1}
              </p>
              <p className="text-sm text-slate-400">
                {vendor.city}, {vendor.state} {vendor.zip}
              </p>
            </Link>
          </div>
        </section>
      )}

      {/* Pending Players (only visible to host) */}
      {isHost && pendingPlayersList.length > 0 && (
        <PendingPlayersManager
          sessionId={session.id}
          pendingPlayers={pendingPlayersList.map(p => ({
            id: p.id,
            name: p.name,
            avatarUrl: p.avatarUrl,
            characterName: p.characterName,
            characterId: p.characterId,
            characterIsPublic: p.characterIsPublic,
          }))}
        />
      )}

      {/* Signed Up Players */}
      <SignedUpPlayersList
        sessionId={session.id}
        sessionType="game"
        players={signedUpPlayersList}
        maxPlayers={session.maxPlayers}
        isHost={isHost}
        onPlayerRemoved={handlePlayerRemoved}
      />

      {/* Waitlist */}
      {(waitlistPlayersList.length > 0 || isFull) && (
        <WaitlistPlayersList
          sessionId={session.id}
          sessionType="game"
          players={waitlistPlayersList}
          isHost={isHost}
          onPlayerRemoved={handlePlayerRemoved}
        />
      )}

      {/* Game metadata */}
      <section className="rounded-lg border border-slate-800 bg-slate-900/40 p-4">
        <div className="space-y-2 text-xs text-slate-400">
          <p>
            <span className="font-medium">Created:</span>{" "}
            {new Date(session.createdAt).toLocaleString()}
          </p>
          <p>
            <span className="font-medium">Last Updated:</span>{" "}
            {new Date(session.updatedAt).toLocaleString()}
          </p>
        </div>
      </section>
    </div>
  );
}
