import Link from "next/link";
import { ArrowLeft, Headphones, Video, BookOpen } from "lucide-react";
import SearchBar from "./SearchBar";

export default function Hero() {
  return (
    <section className="gradient-hero text-sand relative overflow-hidden">
      <div className="absolute inset-0 arabesque opacity-[0.07]" aria-hidden />
      <div className="container relative py-16 md:py-24">
        <div className="max-w-3xl mx-auto text-center animate-fade-up">
          <div className="inline-flex items-center gap-2 chip bg-gold/15 text-gold border border-gold/20">
            <span className="h-1.5 w-1.5 rounded-full bg-gold animate-pulse" />
            الأرشيف الرقمي
          </div>
          <h1 className="mt-5 font-display text-3xl md:text-5xl font-bold tracking-tight">
            مكتبة الشيخ <span className="text-gold">خالد بن علي الجريش</span> الرقمية
          </h1>
          <p className="mt-4 text-sand/80 md:text-lg leading-relaxed">
            مجموعة منظّمة من المحاضرات والدروس والمقالات في مكان واحد —
            استمع، شاهد، واقرأ بكل سهولة وفي أي وقت.
          </p>

          <div className="mt-8 max-w-2xl mx-auto">
            <SearchBar variant="hero" />
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link href="/audio" className="btn-gold">
              <Headphones className="h-4 w-4" /> الصوتيات
            </Link>
            <Link href="/video" className="btn bg-white/10 text-sand hover:bg-white/15 border border-white/15">
              <Video className="h-4 w-4" /> المرئيات
            </Link>
            <Link href="/written" className="btn bg-white/10 text-sand hover:bg-white/15 border border-white/15">
              <BookOpen className="h-4 w-4" /> المقالات والكتب
            </Link>
            <Link href="/search" className="btn-ghost text-sand hover:bg-white/10">
              تصفّح الكل <ArrowLeft className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
