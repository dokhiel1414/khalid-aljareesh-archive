"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Home, Search } from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import HijriToday from "./HijriToday";
import IslamicStar from "./IslamicStar";
import { useCommandPalette } from "./CommandPalette";

function SearchTrigger({ mobile = false }: { mobile?: boolean }) {
  const { open } = useCommandPalette();
  const [isMac, setIsMac] = useState(false);

  useEffect(() => {
    setIsMac(/Mac|iPod|iPhone|iPad/.test(navigator.platform));
  }, []);

  if (mobile) {
    return (
      <button
        type="button"
        onClick={open}
        className="md:hidden btn-ghost p-2"
        aria-label="بحث سريع"
      >
        <Search className="h-5 w-5" />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={open}
      aria-label="بحث سريع في الأرشيف"
      className="hidden md:inline-flex h-10 w-64 lg:w-80 items-center gap-2 rounded-2xl bg-white dark:bg-dark-card border border-ink/10 dark:border-dark-border shadow-soft px-3 text-sm text-ink/50 dark:text-sand/50 hover:border-gold/60 hover:text-ink dark:hover:text-sand transition cursor-pointer focus:outline-none focus:ring-2 focus:ring-gold/60"
    >
      <Search className="h-4 w-4 shrink-0" aria-hidden />
      <span className="flex-1 text-start">ابحث في الأرشيف…</span>
      <kbd className="shrink-0 rounded-md border border-ink/15 dark:border-dark-border bg-sand-2 dark:bg-dark-surface px-1.5 py-0.5 text-[10px] font-sans text-ink/60 dark:text-sand/60">
        {isMac ? "⌘K" : "Ctrl K"}
      </kbd>
    </button>
  );
}

export default function Navbar() {
  return (
    <header className="sticky top-0 z-40 backdrop-blur-md bg-sand/85 dark:bg-dark-bg/85 border-b border-ink/10 dark:border-dark-border">
      {/* Hijri date strip */}
      <div className="bg-ink dark:bg-dark-surface text-sand/90">
        <div className="container py-1.5 flex items-center justify-between gap-3 text-xs">
          <HijriToday compact />
          <span className="hidden sm:inline text-sand/60">
            الأرشيف الإسلامي · صوت · صورة · كتاب
          </span>
        </div>
      </div>

      <div className="container">
        <div className="flex items-center justify-between gap-4 py-3">
          <Link href="/" className="flex items-center gap-2 sm:gap-3 group">
            <div className="h-10 w-10 sm:h-11 sm:w-11 shrink-0 rounded-xl bg-ink dark:bg-gold text-gold dark:text-ink flex items-center justify-center shadow-soft p-1.5">
              <IslamicStar className="h-full w-full" strokeWidth={4} />
            </div>
            <div className="leading-tight">
              <div className="font-display font-bold text-ink dark:text-sand whitespace-nowrap text-[15px] sm:text-xl">
                خالد بن علي الجريش
              </div>
              <div className="text-[10px] sm:text-xs text-muted">
                مكتبة دعوية
              </div>
            </div>
          </Link>

          <div className="flex items-center gap-2">
            <SearchTrigger />
            <SearchTrigger mobile />

            <Link
              href="/"
              className="btn-ghost p-2"
              aria-label="الرئيسية"
            >
              <Home className="h-5 w-5" />
            </Link>

            <ThemeToggle compact />
          </div>
        </div>
      </div>
    </header>
  );
}
