"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { IconSun, IconMoon } from "@tabler/icons-react";

export default function ModeToggle() {
  const { resolvedTheme, setTheme } = useTheme(); // ✅ resolvedTheme
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  const isDark = resolvedTheme === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label="Toggle theme"
      className="fixed top-4 right-4 z-[100]
                 flex items-center gap-2 border p-2 rounded-md
                 bg-[var(--migratio_black)] text-[var(--migratio_white)]
                 dark:bg-[var(--migratio_black)] dark:text-[var(--migratio_white)]
                 border-[var(--migratio_border)] transition-[var(--migratio_transition)]"
    >
      {isDark ? <IconSun size={18} /> : <IconMoon size={18} />}
    </button>
  );
}
