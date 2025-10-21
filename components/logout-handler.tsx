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
      });
      
      // Redirect to login page
      router.push("/auth/login");
    } catch (error) {
      console.error("Failed to logout:", error);
      // Even if there's an error, still redirect to login
      // This ensures the user is logged out from the UI perspective
      router.push("/auth/login");
    }
  };

  return handleLogout;
}
