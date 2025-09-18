'use client';
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AuthRedirect({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    // Get the domain from env
    const domain = process.env.NEXT_PUBLIC_SUPABASE_DOMAIN;
    const key = `sb-${domain}-auth-token`;
    const token = typeof window !== "undefined" ? localStorage.getItem(key) : null;
    if (token) {
      router.replace("/dashboard/1");
    }
  }, [router]);

  // If not logged in, show children (login/register form)
  return <>{children}</>;
}