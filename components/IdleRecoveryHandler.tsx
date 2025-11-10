"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

const IDLE_THRESHOLD_MS = 10 * 60 * 1000; // 10 minutes
const RECOVERY_FALLBACK_MS = 3000; // 3 seconds fallback for hard reload

/**
 * Ensures the application recovers after long idle periods by refreshing the
 * router (with a hard reload fallback) when the tab becomes active again.
 *
 * Users reported that after the site sits idle for an extended period, client
 * side navigation stops working until the page is manually refreshed. This
 * component proactively performs that recovery step when the browser tab has
 * been hidden for a while or when no interactions have happened for a long
 * time.
 */
export function IdleRecoveryHandler({
  idleThresholdMs = IDLE_THRESHOLD_MS,
}: {
  idleThresholdMs?: number;
}) {
  const router = useRouter();
  const lastHiddenAtRef = useRef<number | null>(null);
  const idleTimerRef = useRef<number | null>(null);
  const fallbackTimerRef = useRef<number | null>(null);
  const recoveryScheduledRef = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined" || typeof document === "undefined") {
      return;
    }

    const clearIdleTimer = () => {
      if (idleTimerRef.current !== null) {
        window.clearTimeout(idleTimerRef.current);
        idleTimerRef.current = null;
      }
    };

    const clearFallbackTimer = () => {
      if (fallbackTimerRef.current !== null) {
        window.clearTimeout(fallbackTimerRef.current);
        fallbackTimerRef.current = null;
      }
    };

    const triggerRecovery = () => {
      if (recoveryScheduledRef.current) {
        return;
      }

      recoveryScheduledRef.current = true;
      clearIdleTimer();

      try {
        router.refresh();
      } catch (error) {
        console.error("Failed to refresh router after idle", error);
      }

      // Always fall back to a full reload shortly after the refresh to cover
      // cases where the client-side router is completely unresponsive.
      fallbackTimerRef.current = window.setTimeout(() => {
        if (document.visibilityState === "visible") {
          window.location.reload();
        }
      }, RECOVERY_FALLBACK_MS);
    };

    const scheduleIdleTimer = () => {
      if (recoveryScheduledRef.current) {
        return;
      }

      clearIdleTimer();
      idleTimerRef.current = window.setTimeout(() => {
        if (document.visibilityState === "visible") {
          triggerRecovery();
        }
      }, idleThresholdMs);
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        lastHiddenAtRef.current = Date.now();
        recoveryScheduledRef.current = false;
        clearIdleTimer();
        clearFallbackTimer();
        return;
      }

      if (document.visibilityState === "visible") {
        const lastHiddenAt = lastHiddenAtRef.current;
        lastHiddenAtRef.current = null;

        if (lastHiddenAt && Date.now() - lastHiddenAt >= idleThresholdMs) {
          triggerRecovery();
        } else {
          scheduleIdleTimer();
        }
      }
    };

    const handleFocus = () => {
      if (!lastHiddenAtRef.current) {
        return;
      }

      if (Date.now() - lastHiddenAtRef.current >= idleThresholdMs) {
        triggerRecovery();
      }
    };

    const handleInteraction = () => {
      if (!recoveryScheduledRef.current) {
        scheduleIdleTimer();
      }
    };

    const interactionEvents: (keyof WindowEventMap)[] = [
      "click",
      "mousemove",
      "keydown",
      "scroll",
      "touchstart",
    ];

    interactionEvents.forEach((event) => {
      window.addEventListener(event, handleInteraction);
    });

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleFocus);

    scheduleIdleTimer();

    return () => {
      interactionEvents.forEach((event) => {
        window.removeEventListener(event, handleInteraction);
      });

      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleFocus);

      clearIdleTimer();
      clearFallbackTimer();
    };
  }, [idleThresholdMs, router]);

  return null;
}

