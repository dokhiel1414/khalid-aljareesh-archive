"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

export default function ThemeToggle({ compact = false }: { compact?: boolean }) {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const current = document.documentElement.classList.contains("dark") ? "dark" : "light";
    setTheme(current);
  }, []);

  function toggle() {
    const next = theme === "dark" ? "light" : "dark";
    if (next === "dark") document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
    try { localStorage.setItem("theme", next); } catch {}
    setTheme(next);
  }

  // Avoid hydration mismatch: render a placeholder until mounted.
  if (!mounted) {
    return (
      <button
        aria-label="تبديل الوضع"
        className={`inline-flex items-center justify-center rounded-xl border border-ink/10 dark:border-dark-border ${compact ? "h-9 w-9" : "h-10 w-10"} text-ink/60 dark:text-sand/60`}
      >
        <Sun className="h-4 w-4" />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={theme === "dark" ? "الوضع الفاتح" : "الوضع الداكن"}
      title={theme === "dark" ? "الوضع الفاتح" : "الوضع الداكن"}
      className={`inline-flex items-center justify-center rounded-xl border border-ink/10 dark:border-dark-border ${compact ? "h-9 w-9" : "h-10 w-10"} text-ink dark:text-gold hover:bg-ink/5 dark:hover:bg-white/10 transition`}
    >
      {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  );
}
