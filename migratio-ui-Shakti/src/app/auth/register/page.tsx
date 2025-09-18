"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import AuthRedirect from "@/components/AuthRedirect";
import Heading from "../../../components/Headings/heading";
import Button from "../../../components/Buttons/button";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { IconEye, IconEyeOff } from "@tabler/icons-react";
import Link from 'next/link';
import { clearCacheOnNewUserLogin } from "@/utils/cacheUtils";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function RegisterPage() {
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [textHideGoogle, setTextHideGoogle] = useState(false);
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    const email = (
      e.currentTarget.elements.namedItem("email") as HTMLInputElement
    ).value;
    const password = (
      e.currentTarget.elements.namedItem("password") as HTMLInputElement
    ).value;
    const confirmPassword = (
      e.currentTarget.elements.namedItem("confirm-password") as HTMLInputElement
    ).value;
    const fullName = (
      e.currentTarget.elements.namedItem("full_name") as HTMLInputElement
    ).value;
    const freeEmailDomains = [
      "gmail.com",
      "yahoo.com",
      "hotmail.com",
      "outlook.com",
      "aol.com",
      "icloud.com",
      "mail.com",
      "gmx.com",
      "protonmail.com",
      "zoho.com",
      "yandex.com",
      "live.com",
      "msn.com",
      "ymail.com",
      "inbox.com",
      "me.com",
      "rediffmail.com",
      "fastmail.com",
      "hushmail.com",
      "rocketmail.com",
      "mail.ru",
      "qq.com",
      "naver.com",
      "163.com",
      "126.com",
      "sina.com",
      "yeah.net",
      "googlemail.com",
    ];
    const emailDomain = email.split("@")[1]?.toLowerCase();
    if (!emailDomain || freeEmailDomains.includes(emailDomain)) {
      toast.warn("Please use your business email address to register.");
      setIsLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      setIsLoading(false);
      return;
    }

    const { error } = await supabase.auth.signUp({ 
      email, password, options: {
        data: {
          display_name: fullName
        }
      }
    });

    if (error) {
      toast.error(error.message);
      setIsLoading(false);
    } else {
      toast.success(
        <span>
          Confirm Your Mail{" "}
          <a
            href="https://gmail.com"
            target="_blank"
            rel="noopener noreferrer"
            className="underline text-blue-500"
          >
            Check your inbox.
          </a>
          <p>
            Confirmation mail is only sent for new user.
          </p>
        </span>
      );
      router.push("/auth/login");
    }
  };

  const handleGoogleSignUp = async () => {
    setTextHideGoogle(true);
    // Clear any previous user's cache before OAuth redirect
    clearCacheOnNewUserLogin();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_DOMAIN}/dashboard/1`,
      },
    });
  };

  return (
    <AuthRedirect>
      <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
        <div className="flex w-full max-w-[600px] flex-col gap-6">
          <Heading as="h2" className="mb-6 text-center">
            <Link href="/" className="no-underline hover:no-underline text-[var(--migratio_white)] fw-600 migratio-link">
              Migratio
            </Link>
          </Heading>
          <div className="flex flex-col gap-6">
            <div className="bg-[var(--migratio_bg_light)] rounded-lg card_border shadow p-6 flex flex-col gap-6">
              <h2 className="fw-600 text-center mb-2">
                Create an account
              </h2>
              <form className="grid gap-4" onSubmit={handleRegister}>
                <div className="grid gap-2">
                  <label htmlFor="email" className="fw-500">
                    Name
                  </label>
                  <input
                    id="full_name"
                    name="full_name"
                    type="text"
                    required
                    placeholder="User Name"
                    className="border rounded px-3 py-2 w-full"
                    disabled={isLoading}
                  />
                </div>

                <div className="grid gap-2">
                  <label htmlFor="email" className="fw-500">
                    Email
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="m@example.com"
                    required
                    className="border rounded px-3 py-2 w-full"
                    disabled={isLoading}
                  />
                </div>

                <div className="grid gap-2 relative">
                  <label htmlFor="password" className="fw-500">
                    Password
                  </label>
                  <input
                    id="password"
                    name="password"
                    placeholder="ABCD012@#$%"
                    type={showPassword ? "text" : "password"}
                    required
                    disabled={isLoading}
                    className="border rounded px-3 py-2 w-full pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3 top-11 text-muted-foreground"
                    tabIndex={-1}
                  >
                    {showPassword ? <IconEyeOff size={20} /> : <IconEye size={20} />}
                  </button>
                </div>

                <div className="grid gap-2 relative">
                  <label
                    htmlFor="confirm-password"
                    className="fw-500"
                  >
                    Confirm Password
                  </label>
                  <input
                    id="confirm-password"
                    name="confirm-password"
                    placeholder="ABCD012@#$%"
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    disabled={isLoading}
                    className="border rounded px-3 py-2 w-full pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    className="absolute right-3 top-11 text-muted-foreground"
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? <IconEyeOff size={20} /> : <IconEye size={20} />}
                  </button>
                </div>

                {error && (
                  <div className="text-[var(--migratio_error)]">
                    {error}
                  </div>
                )}
                <Button type="submit" variant="primary" disabled={isLoading}>
                  {isLoading ? "Creating account..." : "Create account"}
                </Button>
              </form>

              <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
                <span className="bg-[var(--migratio_bg_light)] text-muted-foreground relative z-10 px-2">
                  Or continue with
                </span>
              </div>

              <div className="flex flex-col gap-4">
                <Button
                  onClick={handleGoogleSignUp}
                  className="w-full flex items-center justify-center gap-2 border rounded px-4 py-2 hover:bg-muted transition"
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
                  {textHideGoogle ? "Signing..." : "Sign up with Google"}
                </Button>
              </div>

              <div className="text-center text-sm">
                Already have an account?{" "}
                <Link href="/auth/login" className="underline underline-offset-4">
                  Login
                </Link>
              </div>
            </div>

            <div className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4">
              By clicking continue, you agree to our{" "}
              <Link href="/terms-of-services">Terms of Service</Link> and{" "}
              <Link href="/privacy-policy">Privacy Policy</Link>.
            </div>
          </div>
        </div>
      </div>
    </AuthRedirect>
  );
}