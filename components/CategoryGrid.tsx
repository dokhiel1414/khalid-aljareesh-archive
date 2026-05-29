import Link from "next/link";
import { Headphones, Video, BookOpen, ArrowLeft } from "lucide-react";

const tiles = [
  {
    href: "/audio",
    title: "الصوتيات",
    desc: "محاضرات ودروس صوتية متاحة للاستماع المباشر.",
    icon: Headphones,
    accent: "from-ink to-ink-2",
  },
  {
    href: "/video",
    title: "المرئيات",
    desc: "مرئيات مختارة وحلقات يمكن مشاهدتها مباشرة.",
    icon: Video,
    accent: "from-brown to-gold",
  },
  {
    href: "/written",
    title: "المقالات",
    desc: "كتب ومقالات للقراءة أو التحميل بصيغة PDF.",
    icon: BookOpen,
    accent: "from-ink to-brown",
  },
];

export default function CategoryGrid() {
  return (
    <section className="container py-14 md:py-20">
      <div className="flex items-end justify-between gap-4 mb-8">
        <div>
          <h2 className="section-title">تصفّح الأقسام</h2>
          <p className="text-muted mt-1 text-sm md:text-base">
            اختر القسم الذي يناسبك للاستفادة من المحتوى.
          </p>
        </div>
      </div>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {tiles.map((t) => (
          <Link
            key={t.href}
            href={t.href}
            className={`group relative overflow-hidden rounded-2xl bg-gradient-to-br ${t.accent} p-6 text-sand shadow-soft hover:shadow-card transition`}
          >
            <div className="absolute inset-0 arabesque opacity-[0.08]" aria-hidden />
            <div className="relative flex items-start justify-between">
              <div className="h-12 w-12 rounded-xl bg-white/10 grid place-items-center">
                <t.icon className="h-6 w-6 text-gold" />
              </div>
              <ArrowLeft className="h-5 w-5 opacity-60 group-hover:translate-x-[-4px] transition" />
            </div>
            <h3 className="relative mt-6 font-display text-2xl font-bold">{t.title}</h3>
            <p className="relative mt-2 text-sand/80 text-sm leading-relaxed">{t.desc}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
