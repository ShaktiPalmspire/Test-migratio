'use client';

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { DeactivatedUserRedirect } from "./DeactivatedUserRedirect";
import { useUser } from "@/context/UserContext";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, profile, isLoading: userLoading } = useUser();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Allow homepage without auth
    if (pathname === "/") {
      setLoading(false);
      return;
    }

    // Wait for user context to finish loading
    if (userLoading) {
      return;
    }

    // If no user, redirect to login
    if (!user) {
      router.replace("/auth/login");
      return;
    }

    // Check if user is deactivated or has requested reactivation
    if (profile && (profile.status === 'deactivated' || profile.status === 'reactivation_requested')) {
      // Set loading to false so the deactivated page can render
      setLoading(false);
      router.replace('/deactivated');
      return;
    }

    // User is authenticated and active, allow access
    setLoading(false);
  }, [user, profile, userLoading, pathname, router]);

  // Show loading only if user context is still loading or if we're still in loading state
  if (loading || userLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <>
      <DeactivatedUserRedirect />
      {children}
    </>
  );
}