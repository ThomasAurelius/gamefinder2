"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { formatDateInTimezone, DEFAULT_TIMEZONE } from "@/lib/timezone";
import PendingCampaignPlayersManager from "@/components/PendingCampaignPlayersManager";
import { isPaidCampaign } from "@/lib/campaign-utils";
import ShareToFacebook from "@/components/ShareToFacebook";

type PlayerSignup = {
  userId: string;
  characterId?: string;
  characterName?: string;
};

type Campaign = {
  id: string;
  userId: string;
  game: string;
  date: string;
  times: string[];
  description: string;
  maxPlayers: number;
  signedUpPlayers: string[];
  signedUpPlayersWithCharacters?: PlayerSignup[];
  waitlist: string[];
  waitlistWithCharacters?: PlayerSignup[];
  pendingPlayers: string[];
  pendingPlayersWithCharacters?: PlayerSignup[];
  createdAt: string;
  updatedAt: string;
  imageUrl?: string;
  location?: string;
  zipCode?: string;
  latitude?: number;
  longitude?: number;
  sessionsLeft?: number;
  classesNeeded?: string[];
  costPerSession?: number;
  meetingFrequency?: string;
  daysOfWeek?: string[];
  hostName?: string;
  hostAvatarUrl?: string;
};

type PendingPlayer = {
  id: string;
  name: string;
  avatarUrl?: string;
  characterName?: string;
};

type PlayerWithInfo = {
  userId: string;
  name: string;
  avatarUrl?: string;
  characterName?: string;
  hasActiveSubscription?: boolean;
};

type CampaignNote = {
  id: string;
  campaignId: string;
  userId: string;
  content: string;
  createdAt: string;
  updatedAt: string;
};

export default function CampaignDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [notes, setNotes] = useState<CampaignNote[]>([]);
  const [pendingPlayersList, setPendingPlayersList] = useState<PendingPlayer[]>([]);
  const [signedUpPlayersList, setSignedUpPlayersList] = useState<PlayerWithInfo[]>([]);
  const [waitlistPlayersList, setWaitlistPlayersList] = useState<PlayerWithInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"details" | "notes">("details");
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [userTimezone, setUserTimezone] = useState<string>(DEFAULT_TIMEZONE);
  const [newNoteContent, setNewNoteContent] = useState("");
  const [isSubmittingNote, setIsSubmittingNote] = useState(false);
  const [noteError, setNoteError] = useState<string | null>(null);
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [withdrawError, setWithdrawError] = useState<string | null>(null);
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false);
  const [isRedirectingToPortal, setIsRedirectingToPortal] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [messageSubject, setMessageSubject] = useState("");
  const [messageContent, setMessageContent] = useState("");
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [messageError, setMessageError] = useState<string | null>(null);
  const [messageSuccess, setMessageSuccess] = useState(false);

  const campaignId = params.id as string;

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch timezone
        const settingsResponse = await fetch("/api/settings");
        if (settingsResponse.ok) {
          const settingsData = await settingsResponse.json();
          setUserTimezone(settingsData.timezone || DEFAULT_TIMEZONE);
        }

        // Fetch current user ID
        const profileResponse = await fetch("/api/profile");
        let profileData: { userId: string } | null = null;
        if (profileResponse.ok) {
          profileData = await profileResponse.json();
          if (profileData?.userId) {
            setCurrentUserId(profileData.userId);
          }
        }

        // Fetch campaign
        const campaignResponse = await fetch(`/api/campaigns/${campaignId}`);
        if (!campaignResponse.ok) {
          if (campaignResponse.status === 404) {
            router.push("/find-campaigns");
            return;
          }
          throw new Error("Failed to fetch campaign");
        }
        const campaignData = await campaignResponse.json();
        
        // Fetch host information
        const hostResponse = await fetch('/api/users/batch', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userIds: [campaignData.userId] }),
        });
        
        if (hostResponse.ok) {
          const hostData = await hostResponse.json();
          const host = hostData[campaignData.userId];
          if (host) {
            campaignData.hostName = host.name;
            campaignData.hostAvatarUrl = host.avatarUrl;
          }
        }
        
        setCampaign(campaignData);

        // Fetch pending players with user info if there are any
        if (campaignData.pendingPlayers && campaignData.pendingPlayers.length > 0) {
          const pendingPlayersWithCharacters = campaignData.pendingPlayersWithCharacters || [];
          
          // Fetch user info for all pending players using batch API
          const batchResponse = await fetch('/api/users/batch', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userIds: campaignData.pendingPlayers }),
          });
          
          if (batchResponse.ok) {
            const usersData = await batchResponse.json();
            
            const pendingPlayers = campaignData.pendingPlayers.map((playerId: string) => {
              const userData = usersData[playerId];
              if (!userData) return null;
              
              const characterInfo = pendingPlayersWithCharacters.find((p: PlayerSignup) => p.userId === playerId);
              return {
                id: playerId,
                name: userData.name || "Unknown User",
                avatarUrl: userData.avatarUrl,
                characterName: characterInfo?.characterName,
              };
            }).filter((user: PendingPlayer | null): user is PendingPlayer => user !== null);
            
            setPendingPlayersList(pendingPlayers);
          }
        }

        // Fetch signed up players with user info if there are any
        if (campaignData.signedUpPlayers && campaignData.signedUpPlayers.length > 0) {
          const signedUpPlayersWithCharacters = campaignData.signedUpPlayersWithCharacters || [];
          
          // Fetch user info for all signed up players using batch API
          const batchResponse = await fetch('/api/users/batch', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userIds: campaignData.signedUpPlayers }),
          });
          
          if (batchResponse.ok) {
            const usersData = await batchResponse.json();
            
            const signedUpPlayers = campaignData.signedUpPlayers.map((playerId: string) => {
              const userData = usersData[playerId];
              if (!userData) return null;
              
              const characterInfo = signedUpPlayersWithCharacters.find((p: PlayerSignup) => p.userId === playerId);
              return {
                userId: playerId,
                name: userData.name || "Unknown User",
                avatarUrl: userData.avatarUrl,
                characterName: characterInfo?.characterName,
              };
            }).filter((user: PlayerWithInfo | null): user is PlayerWithInfo => user !== null);
            
            setSignedUpPlayersList(signedUpPlayers);
          }
        }

        // Fetch waitlist players with user info if there are any
        if (campaignData.waitlist && campaignData.waitlist.length > 0) {
          const waitlistWithCharacters = campaignData.waitlistWithCharacters || [];
          
          // Fetch user info for all waitlist players using batch API
          const batchResponse = await fetch('/api/users/batch', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userIds: campaignData.waitlist }),
          });
          
          if (batchResponse.ok) {
            const usersData = await batchResponse.json();
            
            const waitlistPlayers = campaignData.waitlist.map((playerId: string) => {
              const userData = usersData[playerId];
              if (!userData) return null;
              
              const characterInfo = waitlistWithCharacters.find((p: PlayerSignup) => p.userId === playerId);
              return {
                userId: playerId,
                name: userData.name || "Unknown User",
                avatarUrl: userData.avatarUrl,
                characterName: characterInfo?.characterName,
              };
            }).filter((user: PlayerWithInfo | null): user is PlayerWithInfo => user !== null);
            
            setWaitlistPlayersList(waitlistPlayers);
          }
        }

        // Fetch notes if user is the creator
        if (profileData && campaignData.userId === profileData.userId) {
          const notesResponse = await fetch(`/api/campaigns/${campaignId}/notes`);
          if (notesResponse.ok) {
            const notesData = await notesResponse.json();
            setNotes(notesData);
          }
        }
      } catch (error) {
        console.error("Failed to fetch campaign data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [campaignId, router]);

  // Check if user has an active subscription for this campaign
  useEffect(() => {
    const checkSubscriptionStatus = async () => {
      // Only check if there's a cost per session (payment required)
      if (!campaign || !campaign.costPerSession || campaign.costPerSession <= 0) {
        setHasActiveSubscription(false);
        return;
      }

      try {
        const response = await fetch(
          `/api/stripe/check-subscription?campaignId=${campaignId}`
        );
        
        if (response.ok) {
          const data = await response.json();
          setHasActiveSubscription(data.hasActiveSubscription || false);
        } else {
          // If check fails, assume no subscription
          setHasActiveSubscription(false);
        }
      } catch (err) {
        console.error("Failed to check subscription status:", err);
        // Don't show error to user, just assume no subscription
        setHasActiveSubscription(false);
      }
    };

    checkSubscriptionStatus();
  }, [campaign, campaignId]);

  const isCreator = currentUserId && campaign?.userId === currentUserId;

  // Helper variables for paid campaign logic
  const isApprovedPlayer = currentUserId && campaign?.signedUpPlayers.includes(currentUserId);
  const isPendingPlayer = currentUserId && campaign?.pendingPlayers.includes(currentUserId);
  const isWaitlistedPlayer = currentUserId && campaign?.waitlist.includes(currentUserId);
  const showPaymentSection = !isCreator && currentUserId && isPaidCampaign(campaign);

  // Fetch subscription status for all players when the campaign creator views their campaign
  useEffect(() => {
    const fetchPlayerSubscriptions = async () => {
      // Only fetch if user is the creator and campaign has a cost
      if (!isCreator || !campaign || !campaign.costPerSession || campaign.costPerSession <= 0) {
        return;
      }

      // Only fetch if there are signed up players
      if (!signedUpPlayersList || signedUpPlayersList.length === 0) {
        return;
      }

      try {
        const playerIds = signedUpPlayersList.map(player => player.userId);
        const response = await fetch('/api/stripe/check-players-subscriptions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            campaignId: campaignId,
            playerIds: playerIds,
          }),
        });

        if (response.ok) {
          const subscriptionStatuses: Record<string, boolean> = await response.json();
          
          // Update signed up players list with subscription status
          setSignedUpPlayersList(prev => 
            prev.map(player => ({
              ...player,
              hasActiveSubscription: subscriptionStatuses[player.userId] || false,
            }))
          );
        }
      } catch (error) {
        console.error('Failed to fetch player subscription statuses:', error);
      }
    };

    fetchPlayerSubscriptions();
  }, [isCreator, campaign, campaignId, signedUpPlayersList.length]);


  const handlePlayerApproved = (player: PendingPlayer) => {
    // Remove from pending list
    setPendingPlayersList((prev) => prev.filter((p) => p.id !== player.id));
    
    // Add to signed up players list
    setSignedUpPlayersList((prev) => [
      ...prev,
      {
        userId: player.id,
        name: player.name,
        avatarUrl: player.avatarUrl,
        characterName: player.characterName,
      },
    ]);
    
    // Update campaign state
    if (campaign) {
      setCampaign({
        ...campaign,
        pendingPlayers: campaign.pendingPlayers.filter((id) => id !== player.id),
        signedUpPlayers: [...campaign.signedUpPlayers, player.id],
      });
    }
  };

  const handlePlayerDenied = (playerId: string) => {
    // Remove from pending list
    setPendingPlayersList((prev) => prev.filter((p) => p.id !== playerId));
    
    // Update campaign state
    if (campaign) {
      setCampaign({
        ...campaign,
        pendingPlayers: campaign.pendingPlayers.filter((id) => id !== playerId),
      });
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteContent.trim() || isSubmittingNote) return;

    setIsSubmittingNote(true);
    setNoteError(null);

    try {
      const response = await fetch(`/api/campaigns/${campaignId}/notes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: newNoteContent.trim() }),
      });

      const data = (await response.json()) as CampaignNote & {
        error?: string;
      };

      if (!response.ok) {
        throw new Error(data?.error || "Failed to add note");
      }

      const newNote: CampaignNote = data;
      setNotes((prev) => [newNote, ...prev]);
      setNewNoteContent("");
    } catch (error) {
      setNoteError(error instanceof Error ? error.message : "Failed to add note");
    } finally {
      setIsSubmittingNote(false);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    if (!confirm("Are you sure you want to delete this note?")) return;

    try {
      const response = await fetch(`/api/campaigns/${campaignId}/notes/${noteId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete note");
      }

      setNotes((prev) => prev.filter((note) => note.id !== noteId));
    } catch (error) {
      console.error("Error deleting note:", error);
      alert("Failed to delete note");
    }
  };

  const handleWithdraw = async () => {
    if (!confirm("Are you sure you want to withdraw from this campaign?")) return;

    setIsWithdrawing(true);
    setWithdrawError(null);

    try {
      const response = await fetch(`/api/campaigns/${campaignId}/leave`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || "Failed to withdraw from campaign"
        );
      }

      // Redirect back to find campaigns page after successful withdrawal
      router.push("/find-campaigns");
    } catch (error) {
      setWithdrawError(
        error instanceof Error
          ? error.message
          : "Failed to withdraw from campaign"
      );
    } finally {
      setIsWithdrawing(false);
    }
  };

  const handleManageSubscription = async () => {
    try {
      setIsRedirectingToPortal(true);

      const response = await fetch("/api/stripe/create-portal-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          returnUrl: `${window.location.origin}/campaigns/${campaignId}`,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create portal session");
      }

      const data = await response.json();
      
      // Redirect to Stripe Customer Portal
      window.location.href = data.url;
    } catch (error) {
      console.error("Failed to open billing portal:", error);
      setIsRedirectingToPortal(false);
    }
  };

  const handleMessageAll = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessageError(null);
    setMessageSuccess(false);

    if (!messageSubject.trim() || !messageContent.trim()) {
      setMessageError("Please fill in both subject and message");
      return;
    }

    if (!currentUserId || !campaign) {
      setMessageError("Unable to send message. Please try again.");
      return;
    }

    setIsSendingMessage(true);

    try {
      const response = await fetch(`/api/campaigns/${campaignId}/message-all`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: currentUserId,
          userName: campaign.hostName || "Campaign Host",
          subject: messageSubject.trim(),
          content: messageContent.trim(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to send messages");
      }

      const result = await response.json();
      setMessageSuccess(true);
      setMessageSubject("");
      setMessageContent("");
      
      // Show success message and close modal after a delay
      setTimeout(() => {
        setShowMessageModal(false);
        setMessageSuccess(false);
      }, 2000);
    } catch (error) {
      console.error("Failed to send messages:", error);
      setMessageError(
        error instanceof Error ? error.message : "Failed to send messages"
      );
    } finally {
      setIsSendingMessage(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-slate-400">Loading campaign...</p>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-slate-400">Campaign not found</p>
      </div>
    );
  }

  const availableSlots = campaign.maxPlayers - campaign.signedUpPlayers.length;
  const isFull = availableSlots <= 0;

  // Get the full URL for sharing
  const campaignUrl = `${typeof window !== 'undefined' ? window.location.origin : 'https://thegatheringcall.com'}/campaigns/${campaignId}`;
  const shareQuote = `Join me for ${campaign.game} on ${formatDateInTimezone(campaign.date, userTimezone)}!`;

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-8">
      <Link
        href="/find-campaigns"
        className="inline-block text-sm text-sky-400 hover:text-sky-300"
      >
        ← Back to campaigns
      </Link>

      <div className="rounded-lg border border-slate-800 bg-slate-950/40 p-6">
        {isCreator ? (
          // Layout for creators: image below edit button
          <div>
            <div className="flex items-start justify-between gap-4">
              <h1 className="text-2xl font-bold text-slate-100">{campaign.game}</h1>
              <Link
                href={`/campaigns/${campaignId}/edit`}
                className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 focus:ring-offset-slate-950"
              >
                Edit Campaign
              </Link>
            </div>
            
            {/* Share to Facebook button */}
            <div className="mt-4">
              <ShareToFacebook url={campaignUrl} quote={shareQuote} />
            </div>
            
            {campaign.imageUrl && (
              <img
                src={campaign.imageUrl}
                alt={campaign.game}
                className="mt-4 h-32 w-32 rounded-lg border border-slate-700 object-cover"
              />
            )}
            
            {/* Pending Players Manager - shown directly under image */}
            {pendingPlayersList.length > 0 && (
              <div className="mt-4">
                <PendingCampaignPlayersManager
                  campaignId={campaignId}
                  pendingPlayers={pendingPlayersList}
                  onPlayerApproved={handlePlayerApproved}
                  onPlayerDenied={handlePlayerDenied}
                />
              </div>
            )}
            
            <div className="mt-4 space-y-2 text-sm text-slate-400">
              <p>
                <span className="text-slate-500">Date:</span>{" "}
                {formatDateInTimezone(campaign.date, userTimezone)}
              </p>
              <p>
                <span className="text-slate-500">Times:</span>{" "}
                {campaign.times.join(", ")}
              </p>
              {(campaign.location || campaign.zipCode) && (
                <p>
                  <span className="text-slate-500">Location:</span>{" "}
                  {campaign.location || campaign.zipCode}
                </p>
              )}
              <p>
                <span className="text-slate-500">Players:</span>{" "}
                <span className={isFull ? "text-orange-400" : "text-green-400"}>
                  {campaign.signedUpPlayers.length}/{campaign.maxPlayers}
                </span>
              </p>
              {campaign.waitlist.length > 0 && (
                <p>
                  <span className="text-slate-500">Waitlist:</span>{" "}
                  <span className="text-yellow-400">{campaign.waitlist.length}</span>
                </p>
              )}
              {campaign.meetingFrequency && (
                <p>
                  <span className="text-slate-500">Frequency:</span>{" "}
                  {campaign.meetingFrequency}
                </p>
              )}
              {campaign.sessionsLeft && (
                <p>
                  <span className="text-slate-500">Sessions Left:</span>{" "}
                  {campaign.sessionsLeft}
                </p>
              )}
              {campaign.costPerSession && (
                <p>
                  <span className="text-slate-500">Cost per Session:</span> $
                  {campaign.costPerSession}
                </p>
              )}
            </div>
          </div>
        ) : (
          // Layout for non-creators: image on the right
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-slate-100">{campaign.game}</h1>
              {campaign.hostName && (
                <p className="mt-2 text-sm text-slate-400">
                  <span className="text-slate-500">Host:</span>{" "}
                  <Link
                    href={`/user/${campaign.userId}`}
                    className="text-slate-300 hover:text-sky-300 transition-colors"
                  >
                    {campaign.hostName}
                  </Link>
                </p>
              )}
              
              {/* Share to Facebook button */}
              <div className="mt-4">
                <ShareToFacebook url={campaignUrl} quote={shareQuote} />
              </div>
              
              <div className="mt-4 space-y-2 text-sm text-slate-400">
                <p>
                  <span className="text-slate-500">Date:</span>{" "}
                  {formatDateInTimezone(campaign.date, userTimezone)}
                </p>
                <p>
                  <span className="text-slate-500">Times:</span>{" "}
                  {campaign.times.join(", ")}
                </p>
                {(campaign.location || campaign.zipCode) && (
                  <p>
                    <span className="text-slate-500">Location:</span>{" "}
                    {campaign.location || campaign.zipCode}
                  </p>
                )}
                <p>
                  <span className="text-slate-500">Players:</span>{" "}
                  <span className={isFull ? "text-orange-400" : "text-green-400"}>
                    {campaign.signedUpPlayers.length}/{campaign.maxPlayers}
                  </span>
                </p>
                {campaign.waitlist.length > 0 && (
                  <p>
                    <span className="text-slate-500">Waitlist:</span>{" "}
                    <span className="text-yellow-400">{campaign.waitlist.length}</span>
                  </p>
                )}
                {campaign.meetingFrequency && (
                  <p>
                    <span className="text-slate-500">Frequency:</span>{" "}
                    {campaign.meetingFrequency}
                  </p>
                )}
                {campaign.sessionsLeft && (
                  <p>
                    <span className="text-slate-500">Sessions Left:</span>{" "}
                    {campaign.sessionsLeft}
                  </p>
                )}
                {campaign.costPerSession && (
                  <p>
                    <span className="text-slate-500">Cost per Session:</span> $
                    {campaign.costPerSession}
                  </p>
                )}
              </div>
            </div>
            {campaign.imageUrl && (
              <img
                src={campaign.imageUrl}
                alt={campaign.game}
                className="h-32 w-32 rounded-lg border border-slate-700 object-cover"
              />
            )}
          </div>
        )}

      {campaign.description && (
        <div className="mt-4 border-t border-slate-800 pt-4">
          <p className="text-slate-300">{campaign.description}</p>
        </div>
      )}

      {/* Withdrawal button for non-creators who are signed up */}
      {!isCreator && currentUserId && (
        campaign.signedUpPlayers.includes(currentUserId) ||
        campaign.waitlist.includes(currentUserId) ||
        campaign.pendingPlayers.includes(currentUserId)
      ) && (
        <div className="mt-6 space-y-2">
          <button
            onClick={handleWithdraw}
            disabled={isWithdrawing}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-slate-950 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isWithdrawing ? "Withdrawing..." : "Withdraw from Campaign"}
          </button>
          {withdrawError && (
            <p className="text-sm text-red-400">{withdrawError}</p>
          )}
        </div>
      )}

      {/* Only show payment button for non-creators who are approved (in signedUpPlayers) */}
      {showPaymentSection && isApprovedPlayer && (
        <div className="mt-6">
          {hasActiveSubscription ? (
            <div className="space-y-4">
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-400">
                You have an active subscription for this campaign.
              </div>
              <button
                onClick={handleManageSubscription}
                disabled={isRedirectingToPortal}
                className="inline-block rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isRedirectingToPortal ? "Opening Portal..." : "Manage Subscription"}
              </button>
            </div>
          ) : (
            <Link
              href={`/campaigns/${campaign.id}/payment`}
              className="inline-flex items-center gap-2 rounded-xl border border-sky-500/40 bg-sky-500/10 px-4 py-2 text-sm font-medium text-sky-200 transition hover:border-sky-500 hover:bg-sky-500/20"
            >
              Proceed to payment
            </Link>
          )}
        </div>
      )}

      {/* Show status message for users who are pending or waitlisted */}
      {showPaymentSection && !isApprovedPlayer && (
        <div className="mt-6">
          {isPendingPlayer && (
            <div className="rounded-xl border border-orange-500/20 bg-orange-500/10 px-4 py-3 text-sm text-orange-200">
              Your request to join this campaign is pending approval from the host. You&apos;ll be able to proceed with payment once you&apos;ve been approved.
            </div>
          )}
          {isWaitlistedPlayer && (
            <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/10 px-4 py-3 text-sm text-yellow-200">
              You&apos;re currently on the waitlist for this campaign. You&apos;ll be able to proceed with payment once a spot becomes available and you&apos;re moved to the active players list.
            </div>
          )}
        </div>
      )}
    </div>

    {isCreator && (
        <div className="rounded-lg border border-slate-800 bg-slate-950/40">
          <div className="border-b border-slate-800">
            <div className="flex gap-4 px-6">
              <button
                onClick={() => setActiveTab("details")}
                className={`border-b-2 px-4 py-3 text-sm font-medium transition ${
                  activeTab === "details"
                    ? "border-sky-500 text-sky-400"
                    : "border-transparent text-slate-400 hover:text-slate-300"
                }`}
              >
                Campaign Details
              </button>
              <button
                onClick={() => setActiveTab("notes")}
                className={`border-b-2 px-4 py-3 text-sm font-medium transition ${
                  activeTab === "notes"
                    ? "border-sky-500 text-sky-400"
                    : "border-transparent text-slate-400 hover:text-slate-300"
                }`}
              >
                DM Notes
              </button>
            </div>
          </div>

          <div className="p-6">
            {activeTab === "details" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold text-slate-100">
                    Campaign Management
                  </h2>
                  <p className="text-sm text-slate-400">
                    Manage your campaign details, players, and settings here.
                  </p>
                </div>

                {/* Message All Players Button */}
                {campaign.signedUpPlayers.length > 0 && (
                  <div className="rounded-lg border border-indigo-800 bg-indigo-950/40 p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-base font-semibold text-indigo-100">
                          Message All Players
                        </h3>
                        <p className="mt-1 text-sm text-indigo-300">
                          Send a message to all {campaign.signedUpPlayers.length} signed up player{campaign.signedUpPlayers.length !== 1 ? "s" : ""} simultaneously
                        </p>
                      </div>
                      <button
                        onClick={() => setShowMessageModal(true)}
                        className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <span className="flex items-center gap-2">
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                          </svg>
                          Message All
                        </span>
                      </button>
                    </div>
                  </div>
                )}
                
                {/* Campaign Statistics */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-4">
                    <p className="text-xs uppercase tracking-wide text-slate-500">Total Players</p>
                    <p className="mt-1 text-2xl font-semibold text-slate-100">
                      {campaign.signedUpPlayers.length}/{campaign.maxPlayers}
                    </p>
                  </div>
                  <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-4">
                    <p className="text-xs uppercase tracking-wide text-slate-500">Waitlist</p>
                    <p className="mt-1 text-2xl font-semibold text-yellow-400">
                      {campaign.waitlist.length}
                    </p>
                  </div>
                  <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-4">
                    <p className="text-xs uppercase tracking-wide text-slate-500">Pending</p>
                    <p className="mt-1 text-2xl font-semibold text-orange-400">
                      {campaign.pendingPlayers.length}
                    </p>
                  </div>
                </div>
                
                {/* Current Players Section */}
                <div className="space-y-3">
                  <h3 className="text-base font-semibold text-slate-100">
                    Current Players
                  </h3>
                  {campaign.signedUpPlayers.length > 0 ? (
                    <div className="space-y-2">
                      {signedUpPlayersList.length > 0 ? (
                        signedUpPlayersList.map((player, index) => (
                          <div
                            key={player.userId}
                            className="rounded-lg border border-slate-800 bg-slate-950/60 px-4 py-3"
                          >
                            <div className="flex items-center gap-3">
                              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-sky-600 text-sm font-medium">
                                {index + 1}
                              </span>
                              <div className="flex flex-1 items-center justify-between">
                                <div className="flex flex-col">
                                  <span className="text-sm text-slate-200">{player.name}</span>
                                  {player.characterName && (
                                    <span className="text-xs text-slate-400">
                                      Character: {player.characterName}
                                    </span>
                                  )}
                                </div>
                                {campaign.costPerSession && campaign.costPerSession > 0 && (
                                  <div className="flex items-center gap-2">
                                    {player.hasActiveSubscription ? (
                                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-xs font-medium text-emerald-400 border border-emerald-500/30">
                                        <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                        Active Sub
                                      </span>
                                    ) : (
                                      <span className="inline-flex items-center gap-1 rounded-full bg-slate-700/50 px-2.5 py-0.5 text-xs font-medium text-slate-400 border border-slate-600/30">
                                        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        No Sub
                                      </span>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        campaign.signedUpPlayers.map((playerId, index) => (
                          <div
                            key={playerId}
                            className="rounded-lg border border-slate-800 bg-slate-950/60 px-4 py-3"
                          >
                            <div className="flex items-center gap-3">
                              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-sky-600 text-sm font-medium">
                                {index + 1}
                              </span>
                              <span className="text-sm text-slate-200">Player {index + 1}</span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-500">
                      No players have joined yet.
                    </p>
                  )}
                </div>
                
                {/* Waitlist Section */}
                {campaign.waitlist.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-base font-semibold text-slate-100">
                      Waitlist
                    </h3>
                    <div className="space-y-2">
                      {waitlistPlayersList.length > 0 ? (
                        waitlistPlayersList.map((player, index) => (
                          <div
                            key={player.userId}
                            className="rounded-lg border border-yellow-800 bg-yellow-900/20 px-4 py-3"
                          >
                            <div className="flex items-center gap-3">
                              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-yellow-600 text-sm font-medium">
                                {index + 1}
                              </span>
                              <div className="flex flex-col">
                                <span className="text-sm text-slate-200">{player.name}</span>
                                {player.characterName && (
                                  <span className="text-xs text-slate-400">
                                    Character: {player.characterName}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        campaign.waitlist.map((playerId, index) => (
                          <div
                            key={playerId}
                            className="rounded-lg border border-yellow-800 bg-yellow-900/20 px-4 py-3"
                          >
                            <div className="flex items-center gap-3">
                              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-yellow-600 text-sm font-medium">
                                {index + 1}
                              </span>
                              <span className="text-sm text-slate-200">Waitlist Position {index + 1}</span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
                
                {/* Campaign Settings Summary */}
                <div className="space-y-3">
                  <h3 className="text-base font-semibold text-slate-100">
                    Campaign Settings
                  </h3>
                  <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-4">
                    <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <div>
                        <dt className="text-xs uppercase tracking-wide text-slate-500">Game</dt>
                        <dd className="mt-1 text-sm text-slate-200">{campaign.game}</dd>
                      </div>
                      <div>
                        <dt className="text-xs uppercase tracking-wide text-slate-500">Max Players</dt>
                        <dd className="mt-1 text-sm text-slate-200">{campaign.maxPlayers}</dd>
                      </div>
                      {campaign.meetingFrequency && (
                        <div>
                          <dt className="text-xs uppercase tracking-wide text-slate-500">Frequency</dt>
                          <dd className="mt-1 text-sm text-slate-200">{campaign.meetingFrequency}</dd>
                        </div>
                      )}
                      {campaign.sessionsLeft && (
                        <div>
                          <dt className="text-xs uppercase tracking-wide text-slate-500">Sessions Left</dt>
                          <dd className="mt-1 text-sm text-slate-200">{campaign.sessionsLeft}</dd>
                        </div>
                      )}
                      {campaign.costPerSession && (
                        <div>
                          <dt className="text-xs uppercase tracking-wide text-slate-500">Cost per Session</dt>
                          <dd className="mt-1 text-sm text-slate-200">${campaign.costPerSession}</dd>
                        </div>
                      )}
                      {campaign.daysOfWeek && campaign.daysOfWeek.length > 0 && (
                        <div>
                          <dt className="text-xs uppercase tracking-wide text-slate-500">Days</dt>
                          <dd className="mt-1 text-sm text-slate-200">{campaign.daysOfWeek.join(", ")}</dd>
                        </div>
                      )}
                      {campaign.classesNeeded && campaign.classesNeeded.length > 0 && (
                        <div className="sm:col-span-2">
                          <dt className="text-xs uppercase tracking-wide text-slate-500">Classes Needed</dt>
                          <dd className="mt-1 text-sm text-slate-200">{campaign.classesNeeded.join(", ")}</dd>
                        </div>
                      )}
                    </dl>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "notes" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold text-slate-100">DM Notes</h2>
                  <p className="mt-1 text-sm text-slate-400">
                    Private notes visible only to you as the campaign creator.
                  </p>
                </div>

                <form onSubmit={handleAddNote} className="space-y-3">
                  <textarea
                    value={newNoteContent}
                    onChange={(e) => setNewNoteContent(e.target.value)}
                    placeholder="Add a new note..."
                    rows={4}
                    className="w-full rounded-md border border-slate-700 bg-slate-950/60 px-3 py-2 text-sm text-slate-100 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/40"
                  />
                  {noteError && (
                    <p className="text-sm text-red-400">{noteError}</p>
                  )}
                  <button
                    type="submit"
                    disabled={isSubmittingNote || !newNoteContent.trim()}
                    className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isSubmittingNote ? "Adding..." : "Add Note"}
                  </button>
                </form>

                <div className="space-y-3">
                  {notes.length === 0 ? (
                    <p className="text-sm text-slate-500">
                      No notes yet. Add your first note above.
                    </p>
                  ) : (
                    notes.map((note) => (
                      <div
                        key={note.id}
                        className="rounded-md border border-slate-800 bg-slate-950/50 p-4"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <p className="whitespace-pre-wrap text-sm text-slate-300">
                              {note.content}
                            </p>
                            <p className="mt-2 text-xs text-slate-500">
                              {new Date(note.createdAt).toLocaleString()}
                            </p>
                          </div>
                          <button
                            onClick={() => handleDeleteNote(note.id)}
                            className="text-sm text-red-400 hover:text-red-300"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Message All Players Modal */}
      {showMessageModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-2xl rounded-lg border border-slate-800 bg-slate-950 p-6">
            <div className="mb-4 flex items-start justify-between">
              <div>
                <h2 className="text-xl font-semibold text-slate-100">
                  Message All Players
                </h2>
                <p className="mt-1 text-sm text-slate-400">
                  Send a message to all {campaign?.signedUpPlayers.length} signed up players
                </p>
              </div>
              <button
                onClick={() => {
                  setShowMessageModal(false);
                  setMessageError(null);
                  setMessageSuccess(false);
                }}
                className="text-slate-400 hover:text-slate-300"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleMessageAll} className="space-y-4">
              <div>
                <label htmlFor="messageSubject" className="block text-sm font-medium text-slate-300">
                  Subject
                </label>
                <input
                  id="messageSubject"
                  type="text"
                  value={messageSubject}
                  onChange={(e) => setMessageSubject(e.target.value)}
                  placeholder="e.g., Campaign Cancelled"
                  className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                  disabled={isSendingMessage}
                />
              </div>

              <div>
                <label htmlFor="messageContent" className="block text-sm font-medium text-slate-300">
                  Message
                </label>
                <textarea
                  id="messageContent"
                  value={messageContent}
                  onChange={(e) => setMessageContent(e.target.value)}
                  placeholder="Enter your message to all players..."
                  rows={6}
                  className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                  disabled={isSendingMessage}
                />
              </div>

              <div className="rounded-lg border border-indigo-800 bg-indigo-950/40 p-3">
                <p className="text-xs text-indigo-300">
                  <strong>Note:</strong> This message will be sent to all signed up players via the internal messaging system. 
                  Players with phone numbers in their profile will also receive an SMS notification.
                </p>
              </div>

              {messageError && (
                <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-3">
                  <p className="text-sm text-red-400">{messageError}</p>
                </div>
              )}

              {messageSuccess && (
                <div className="rounded-lg border border-green-500/20 bg-green-500/10 p-3">
                  <p className="text-sm text-green-400">Messages sent successfully to all players!</p>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={isSendingMessage || !messageSubject.trim() || !messageContent.trim()}
                  className="flex-1 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isSendingMessage ? "Sending..." : "Send to All Players"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowMessageModal(false);
                    setMessageError(null);
                    setMessageSuccess(false);
                  }}
                  disabled={isSendingMessage}
                  className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium text-slate-300 transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-500 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
