import Link from "next/link";
import { Headphones, Video, BookOpen } from "lucide-react";
import SearchBar from "./SearchBar";
import { StarOrnament } from "./ui/ornaments";
import HeroGlow from "./HeroGlow";

const QUICK_LINKS = [
  { href: "/audio", label: "الصوتيات", icon: Headphones },
  { href: "/video", label: "المرئيات", icon: Video },
  { href: "/written", label: "المقروءات", icon: BookOpen },
];

export default function Hero() {
  return (
    <section className="gradient-hero text-sand relative overflow-hidden">
      {/* Drifting eight-point-star lattice */}
      <div
        className="absolute inset-0 pattern-geo pattern-geo-drift opacity-[0.12]"
        aria-hidden
      />
      {/* Soft glow orbs with whisper-quiet mouse parallax */}
      <HeroGlow />

      <div className="container relative py-16 md:py-24">
        <div className="text-center">
          {/* Ornament rule */}
          <div
            className="hero-in flex items-center justify-center gap-3"
            style={{ animationDelay: "40ms" }}
            aria-hidden
          >
            <span className="h-px w-10 md:w-20 bg-gradient-to-l from-transparent to-gold/70" />
            <StarOrnament className="h-5 w-5 text-gold" />
            <span className="h-px w-10 md:w-20 bg-gradient-to-r from-transparent to-gold/70" />
          </div>

          <h1
            className="hero-in mt-5 font-display text-[clamp(1.4rem,5vw,3.25rem)] font-bold tracking-tight leading-[1.35] text-balance"
            style={{ animationDelay: "170ms" }}
          >
            مكتبة <span className="text-gold-gradient">خالد بن علي الجريش</span> الرقمية
          </h1>

          <p
            className="hero-in mx-auto mt-4 max-w-3xl text-sand/80 md:text-lg leading-relaxed text-pretty"
            style={{ animationDelay: "310ms" }}
          >
            محاضرات ودروس ومقالات في مكان واحد —
            استمع، شاهد، واقرأ بكل سهولة وفي أي وقت.
          </p>

          <div
            className="hero-in mx-auto mt-8 max-w-2xl"
            style={{ animationDelay: "450ms" }}
          >
            <SearchBar variant="hero" />
          </div>

          {/* Quick links */}
          <div
            className="hero-in mt-5 flex flex-wrap items-center justify-center gap-2"
            style={{ animationDelay: "580ms" }}
          >
            {QUICK_LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3.5 py-1.5 text-xs text-sand/90 backdrop-blur hover:bg-white/20 hover:border-gold/40 transition"
              >
                <l.icon className="h-3.5 w-3.5 text-gold" aria-hidden />
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
