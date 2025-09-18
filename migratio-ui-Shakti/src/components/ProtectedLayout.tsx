'use client';
import { usePathname } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import { DeactivatedUserRedirect } from "./DeactivatedUserRedirect";

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const publicRoutes = ["/", "/auth/login", "/auth/register", "/style-guide"];
  const isPublic = publicRoutes.includes(pathname);
  
  return (
    <>
      <DeactivatedUserRedirect />
      {isPublic ? <>{children}</> : <ProtectedRoute>{children}</ProtectedRoute>}
    </>
  );
} 