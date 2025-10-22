"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

/**
 * AuthGuard component that protects pages from unauthorized access.
 * Redirects to login if user is not authenticated.
 * Prevents back button access after logout by checking auth on mount.
 */
export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/auth/status", {
          cache: "no-store",
          headers: {
            "Cache-Control": "no-cache",
          },
        });
        const data = await response.json();
        
        if (!data.isAuthenticated) {
          // Store the intended destination to redirect after login
          const redirectUrl = pathname !== "/auth/login" ? pathname : "/dashboard";
          router.replace(`/auth/login?redirect=${encodeURIComponent(redirectUrl)}`);
          setIsAuthenticated(false);
        } else {
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error("Failed to check auth status:", error);
        router.replace("/auth/login");
        setIsAuthenticated(false);
      } finally {
        setIsChecking(false);
      }
    };

    checkAuth();
  }, [router, pathname]);

  // Show nothing while checking authentication
  if (isChecking || !isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-slate-300">Loading...</div>
      </div>
    );
  }

  return <>{children}</>;
}
