import Link from "next/link";
import { Home, Search } from "lucide-react";
import SearchBar from "./SearchBar";
import ThemeToggle from "./ThemeToggle";
import HijriToday from "./HijriToday";
import IslamicStar from "./IslamicStar";

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
            <div className="hidden md:block md:w-64 lg:w-80">
              <SearchBar compact />
            </div>

            <Link
              href="/search"
              className="md:hidden btn-ghost p-2"
              aria-label="بحث"
            >
              <Search className="h-5 w-5" />
            </Link>

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
