import Link from "next/link";
import { BookOpen, Headphones, Video, Home, Search, Mail } from "lucide-react";
import SearchBar from "./SearchBar";
import ThemeToggle from "./ThemeToggle";
import HijriToday from "./HijriToday";
import IslamicStar from "./IslamicStar";

const links = [
  { href: "/", label: "الرئيسية", icon: Home },
  { href: "/audio", label: "صوتيات", icon: Headphones },
  { href: "/video", label: "مرئيات", icon: Video },
  { href: "/written", label: "مقالات وكتب", icon: BookOpen },
  { href: "/contact", label: "تواصل معنا", icon: Mail },
];

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
          <Link href="/" className="flex items-center gap-3 group">
            <div className="h-11 w-11 rounded-xl bg-ink dark:bg-gold text-gold dark:text-ink flex items-center justify-center shadow-soft p-1.5">
              <IslamicStar className="h-full w-full" strokeWidth={4} />
            </div>
            <div className="leading-tight">
              <div className="font-display font-bold text-ink dark:text-sand">
                الشيخ خالد بن علي الجريش
              </div>
              <div className="text-xs text-muted">
                مكتبة رقمية للمحاضرات والكتب
              </div>
            </div>
          </Link>

          <nav className="hidden lg:flex items-center gap-1">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="px-3 py-2 rounded-lg text-sm font-medium text-ink/80 dark:text-sand/80 hover:text-ink dark:hover:text-sand hover:bg-ink/5 dark:hover:bg-white/10 transition flex items-center gap-2"
              >
                <l.icon className="h-4 w-4 text-brown dark:text-gold" />
                {l.label}
              </Link>
            ))}
          </nav>

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

            <ThemeToggle compact />
          </div>
        </div>

        <nav className="flex lg:hidden items-center gap-1 pb-3 overflow-x-auto">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="shrink-0 px-3 py-1.5 rounded-full text-xs font-medium bg-white dark:bg-dark-card border border-ink/10 dark:border-dark-border text-ink/80 dark:text-sand/80 hover:bg-gold dark:hover:bg-gold hover:text-ink hover:border-gold transition flex items-center gap-1.5"
            >
              <l.icon className="h-3.5 w-3.5" />
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
