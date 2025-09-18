"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import Button from "../components/Buttons/button";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import { IconEye, IconEyeOff } from "@tabler/icons-react";
import Link from 'next/link';
import { clearCacheOnNewUserLogin } from "@/utils/cacheUtils";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Validation functions
const validateEmail = (email: string): { isValid: boolean; error?: string } => {
  if (!email) {
    return { isValid: false, error: "Email is required" };
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { isValid: false, error: "Please enter a valid email address" };
  }
  
  if (email.length > 254) {
    return { isValid: false, error: "Email is too long" };
  }
  
  return { isValid: true };
};

const validatePassword = (password: string): { isValid: boolean; error?: string } => {
  if (!password) {
    return { isValid: false, error: "Password is required" };
  }
  
  if (password.length < 6) {
    return { isValid: false, error: "Password must be at least 6 characters" };
  }
  
  if (password.length > 128) {
    return { isValid: false, error: "Password is too long" };
  }
  
  return { isValid: true };
};

const sanitizeInput = (input: string): string => {
  return input.trim().replace(/[<>]/g, '');
};

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [loginError, setLoginError] = useState("");
  const [magicLinkError, setMagicLinkError] = useState("");
  const [recoveryMessage, setRecoveryMessage] = useState("");
  const [magicLinkLoading, setMagicLinkLoading] = useState(false);
  const [recoveryLoading, setRecoveryLoading] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [textHideGoogle, setTextHideGoogle] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{ email?: string; password?: string }>({});
  const router = useRouter();

  useEffect(() => {
    if (loginError) toast.error(loginError);
  }, [loginError]);

  useEffect(() => {
    if (magicLinkError) toast.error(magicLinkError);
  }, [magicLinkError]);

  useEffect(() => {
    if (recoveryMessage) toast.success(recoveryMessage);
  }, [recoveryMessage]);

  const clearErrors = () => {
    setLoginError("");
    setMagicLinkError("");
    setValidationErrors({});
  };

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    clearErrors();
    
    const emailInput = e.currentTarget.elements.namedItem("email") as HTMLInputElement;
    const passwordInput = e.currentTarget.elements.namedItem("password") as HTMLInputElement;
    
    const email = sanitizeInput(emailInput.value);
    const password = passwordInput.value; // Don't sanitize password

    // Client-side validation
    const emailValidation = validateEmail(email);
    const passwordValidation = validatePassword(password);
    
    const errors: { email?: string; password?: string } = {};
    
    if (!emailValidation.isValid) {
      errors.email = emailValidation.error;
    }
    
    if (!passwordValidation.isValid) {
      errors.password = passwordValidation.error;
    }
    
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    setLoginLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setLoginError(error.message);
      } else {
        // Clear any previous user's cache before redirecting
        clearCacheOnNewUserLogin();
        router.push("/dashboard/1");
      }
    } catch (error) {
      console.error("❌ Unexpected error during login:", error);
      setLoginError("An unexpected error occurred. Please try again.");
    } finally {
      setLoginLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    try {
      setTextHideGoogle(true);
      clearErrors();
      
      // Clear any previous user's cache before OAuth redirect
      clearCacheOnNewUserLogin();
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${process.env.NEXT_PUBLIC_DOMAIN}/dashboard/1`,
        },
      });

      if (error) {
        setLoginError(error.message);
        setTextHideGoogle(false);
      }
    } catch (error) {
      console.error("❌ Error during Google OAuth:", error);
      setLoginError("Failed to initiate Google login. Please try again.");
      setTextHideGoogle(false);
    }
  };

  const handleMagicLinkLogin = async (
    e: React.MouseEvent<HTMLButtonElement>
  ) => {
    e.preventDefault();
    clearErrors();
    setMagicLinkLoading(true);

    try {
      const emailInput = document.getElementById("email") as HTMLInputElement;
      const email = emailInput?.value;

      if (!email) {
        setValidationErrors({ email: "Please enter your email." });
        return;
      }

      const emailValidation = validateEmail(email);
      if (!emailValidation.isValid) {
        setValidationErrors({ email: emailValidation.error });
        return;
      }

      const { error } = await supabase.auth.signInWithOtp({ email });

      if (error) {
        setMagicLinkError(error.message);
      } else {
        toast.success("Check your email for the magic link!");
      }
    } catch (error) {
      console.error("❌ Error during magic link login:", error);
      setMagicLinkError("Failed to send magic link. Please try again.");
    } finally {
      setMagicLinkLoading(false);
    }
  };

  const handlePasswordRecovery = async (
    e: React.MouseEvent<HTMLAnchorElement>
  ) => {
    e.preventDefault();
    clearErrors();
    setRecoveryLoading(true);

    try {
      const emailInput = document.getElementById("email") as HTMLInputElement;
      const email = emailInput?.value;

      if (!email) {
        setValidationErrors({ email: "Please enter your email." });
        return;
      }

      const emailValidation = validateEmail(email);
      if (!emailValidation.isValid) {
        setValidationErrors({ email: emailValidation.error });
        return;
      }

      const { error } = await supabase.auth.resetPasswordForEmail(email);

      if (error) {
        toast.error(error.message);
      } else {
        setRecoveryMessage("Password recovery email sent! Check your inbox.");
      }
    } catch (error) {
      console.error("❌ Error during password recovery:", error);
      toast.error("Failed to send recovery email. Please try again.");
    } finally {
      setRecoveryLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <h2 className="text-center">Login to your account</h2>
          <CardDescription>
            Enter your credentials to access your account
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleLogin}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-3">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  required
                  className={validationErrors.email ? "border-red-500" : ""}
                  aria-invalid={!!validationErrors.email}
                  aria-describedby={validationErrors.email ? "email-error" : undefined}
                />
                {validationErrors.email && (
                  <div id="email-error" className="text-red-500 text-sm">
                    {validationErrors.email}
                  </div>
                )}
              </div>

              <div className="grid gap-3">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                  <a
                    href="#"
                    onClick={handlePasswordRecovery}
                    className="ml-auto inline-block text-sm underline-offset-4 hover:underline disabled:opacity-50"
                    style={{
                      pointerEvents: recoveryLoading ? "none" : undefined,
                    }}
                    aria-disabled={recoveryLoading}
                  >
                    {recoveryLoading ? "Sending Mail..." : "Forgot your password?"}
                  </a>
                </div>

                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    required
                    className={cn("pr-10", validationErrors.password ? "border-red-500" : "")}
                    aria-invalid={!!validationErrors.password}
                    aria-describedby={validationErrors.password ? "password-error" : undefined}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute inset-y-0 right-2 flex items-center text-muted-foreground"
                    tabIndex={-1}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <IconEyeOff size={20} stroke={1.5} />
                    ) : (
                      <IconEye size={20} stroke={1.5} />
                    )}
                  </button>
                </div>
                {validationErrors.password && (
                  <div id="password-error" className="text-red-500 text-sm">
                    {validationErrors.password}
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-3">
                <Button type="submit" variant="primary" disabled={loginLoading}>
                  {loginLoading ? "Logging..." : "Login"}
                </Button>
              </div>
            </div>
          </form>

          <div className="flex flex-col gap-3 mt-3">
            <Button
              onClick={handleMagicLinkLogin}
              variant="secondary"
              disabled={magicLinkLoading}
            >
              {magicLinkLoading ? "Sending Mail..." : "Login With Magic Link"}
            </Button>
          </div>
        </CardContent>

        <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
          <span className="bg-[var(--migratio_bg_light)] text-muted-foreground relative z-10 px-2">
            Or continue with
          </span>
        </div>

        <div className="flex flex-col gap-4">
          <Button
            onClick={handleGoogleSignUp}
            className="w-full flex items-center justify-center gap-2 border rounded px-4 py-2 hover:bg-muted transition"
            disabled={textHideGoogle}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              className="size-5"
            >
              <path
                d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                fill="currentColor"
              />
            </svg>
            {textHideGoogle ? "Logging..." : "Log In with Google"}
          </Button>
        </div>

        <div className="text-center">
          <p>Don&apos;t have an account?</p>
          <Link href="/auth/register" className="underline underline-offset-4">
            Sign up
          </Link>
        </div>
      </Card>
    </div>
  );
}
