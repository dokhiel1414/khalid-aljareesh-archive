import Link from "next/link";
import { ArrowLeft, Layers, ListOrdered } from "lucide-react";
import { toArabicDigits } from "@/lib/utils";

type Topic = {
  slug: string;
  name: string;
  description?: string | null;
  type: "THEME" | "PROGRAM";
  coverImage?: string | null;
  count?: number;
};

export default function TopicCard({ topic }: { topic: Topic }) {
  const isProgram = topic.type === "PROGRAM";
  const Icon = isProgram ? ListOrdered : Layers;
  const accent = isProgram ? "from-brown to-gold" : "from-ink to-ink-2";
  return (
    <Link
      href={`/topic/${encodeURIComponent(topic.slug)}`}
      className={`group relative overflow-hidden rounded-2xl bg-gradient-to-br ${accent} p-6 text-sand shadow-soft hover:shadow-card transition flex flex-col`}
    >
      {topic.coverImage && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={topic.coverImage}
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-25 group-hover:scale-[1.03] transition duration-500"
          loading="lazy"
        />
      )}
      <div className="absolute inset-0 arabesque opacity-[0.08]" aria-hidden />
      <div className="relative flex items-start justify-between">
        <div className="h-12 w-12 rounded-xl bg-sand grid place-items-center shadow-card border border-gold/40">
          <Icon className="h-6 w-6 text-ink" strokeWidth={2.25} />
        </div>
        <span className="chip bg-white/10 text-sand border border-white/15">
          {isProgram ? "برنامج" : "موضوع"}
        </span>
      </div>
      <h3 className="relative mt-5 font-display text-xl font-bold">{topic.name}</h3>
      {topic.description && (
        <p className="relative mt-2 text-sand/80 text-sm leading-relaxed line-clamp-2">
          {topic.description}
        </p>
      )}
      <div className="relative mt-4 pt-3 flex items-center justify-between border-t border-white/10 text-sm text-sand/80">
        <span>{toArabicDigits(topic.count ?? 0)} عنصر</span>
        <ArrowLeft className="h-4 w-4 opacity-70 group-hover:-translate-x-1 transition" />
      </div>
    </Link>
  );
}
