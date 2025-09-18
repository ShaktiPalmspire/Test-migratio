"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function NotFound() {
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        router.replace("/dashboard/1");
      } else {
        router.replace("/auth/login");
      }
    };
    checkAuth();
  }, [router]);

  // Fallback UI in case redirect is slow
  return (
    <></>
  );
} 