"use client";

import { useRouter } from "next/navigation";
import JoinWithdrawButton from "./JoinWithdrawButton";

interface GameDetailActionsProps {
  sessionId: string;
  currentUserId: string | null;
  isUserSignedUp: boolean;
  isHost: boolean;
}

export default function GameDetailActions({
  sessionId,
  currentUserId,
  isUserSignedUp,
  isHost,
}: GameDetailActionsProps) {
  const router = useRouter();

  const handleSessionUpdate = () => {
    // Refresh the page data
    router.refresh();
  };

  return (
    <JoinWithdrawButton
      sessionId={sessionId}
      currentUserId={currentUserId}
      isUserSignedUp={isUserSignedUp}
      isHost={isHost}
      onSessionUpdate={handleSessionUpdate}
    />
  );
}
