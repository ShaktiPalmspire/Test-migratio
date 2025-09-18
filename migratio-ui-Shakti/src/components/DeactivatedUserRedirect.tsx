"use client";
import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useUser } from "@/context/UserContext";

export function DeactivatedUserRedirect() {
  const { user, profile, isLoading } = useUser();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // If already on deactivated page, don't redirect
    if (pathname === '/deactivated') {
      return;
    }

    // If we have user and profile data, check status immediately
    if (user && profile) {
      // Check if user is deactivated or has requested reactivation
      if (profile.status === 'deactivated' || profile.status === 'reactivation_requested') {
        router.replace('/deactivated');
        return;
      }
    }

    // If still loading, wait a bit but don't wait too long
    if (isLoading) {
      return;
    }

    // If no user after loading, don't redirect (let other components handle auth)
    if (!user) {
      return;
    }

    // If no profile after loading, don't redirect (let other components handle profile loading)
    if (!profile) {
      return;
    }
  }, [user, profile, isLoading, router, pathname]);

  // This component doesn't render anything
  return null;
} 