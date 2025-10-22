"use client";

import { useRouter } from "next/navigation";
import { signOutUser } from "@/lib/firebase-auth";

export function useLogout() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      // Sign out from Firebase client-side
      await signOutUser();
      
      // Call the backend logout API to clear the session cookie
      await fetch("/api/auth/logout", {
        method: "POST",
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
        },
      });
      
      // Use replace instead of push to prevent back button navigation
      // This removes the current page from history
      router.replace("/auth/login");
      
      // Force a hard refresh to clear any cached state
      if (typeof window !== "undefined") {
        window.location.href = "/auth/login";
      }
    } catch (error) {
      console.error("Failed to logout:", error);
      // Even if there's an error, still redirect to login
      // This ensures the user is logged out from the UI perspective
      if (typeof window !== "undefined") {
        window.location.href = "/auth/login";
      } else {
        router.replace("/auth/login");
      }
    }
  };

  return handleLogout;
}
