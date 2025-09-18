"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import Button from "../../../components/Buttons/button";
import Heading from "../../../components/Headings/heading";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
} from "@/components/ui/card";
import { IconEye, IconEyeOff } from "@tabler/icons-react";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) {
      setError(error.message);
    } else {
      setSuccess("Password updated successfully! You can now log in.");
      setTimeout(() => router.push("/auth/login"), 2000);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center flex-col gap-8">
      <Heading as="h2" className="text-margin-zero text-center">
        Migratio
      </Heading>
      <Card className="w-full max-w-[600px]">
        <CardHeader>
          <Heading as="h2" className="text-center">
            Reset your password
          </Heading>
          <CardTitle>Enter your new Password</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="New password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground"
                tabIndex={-1}
              >
                {showPassword ? (
                  <IconEyeOff size={18} />
                ) : (
                  <IconEye size={18} />
                )}
              </button>
            </div>

            <Button type="submit" variant="primary" disabled={loading}>
              {loading ? "Updating..." : "Set New Password"}
            </Button>

            {error && <div className="text-red-500 text-sm">{error}</div>}
            {success && (
              <div className="text-green-600 text-sm">{success}</div>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
