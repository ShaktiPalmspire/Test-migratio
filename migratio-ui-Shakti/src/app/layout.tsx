import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import ModeToggle from "@/components/mode-toggle"; // ✅ add this
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ProtectedLayout from "@/components/ProtectedLayout";
import { ReduxProvider } from "@/store/provider";
import { UserProvider } from "@/context/UserContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Migratio",
  description: "Migrate your data with ease",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning> {/* ✅ add */}
      <body className={inter.className}>
        <ReduxProvider>
          <UserProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              <ProtectedLayout>
                {children}
                <ToastContainer />
              </ProtectedLayout>

              {/* ✅ render the toggle globally */}
              <ModeToggle />
            </ThemeProvider>
          </UserProvider>
        </ReduxProvider>
      </body>
    </html>
  );
}
