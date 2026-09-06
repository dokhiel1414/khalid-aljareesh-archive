import Link from "next/link";
import { ArrowLeft, Layers, ListOrdered } from "lucide-react";
import { itemCountLabel } from "@/lib/utils";

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
      className={`group relative overflow-hidden rounded-xl bg-gradient-to-br ${accent} p-4 text-sand shadow-soft hover:shadow-card hover:-translate-y-1 hover:ring-2 hover:ring-gold/40 transition flex flex-col`}
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
      <div className="absolute inset-0 pattern-geo opacity-[0.10] group-hover:opacity-[0.16] transition" aria-hidden />
      <div className="relative flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="h-9 w-9 shrink-0 rounded-lg bg-sand grid place-items-center border border-gold/40">
            <Icon className="h-5 w-5 text-ink" strokeWidth={2.25} />
          </div>
          <h3 className="font-display text-base font-bold leading-snug line-clamp-2">
            {topic.name}
          </h3>
        </div>
        <span className="chip bg-white/10 text-sand border border-white/15 text-[11px] shrink-0">
          {isProgram ? "برنامج" : "موضوع"}
        </span>
      </div>
      {topic.description && (
        <p className="relative mt-2.5 text-sand/80 text-xs leading-relaxed line-clamp-2">
          {topic.description}
        </p>
      )}
      <div className="relative mt-2.5 pt-2.5 flex items-center justify-between border-t border-white/10 text-xs text-sand/80">
        <span>{itemCountLabel(topic.count ?? 0)}</span>
        <ArrowLeft className="h-4 w-4 opacity-70 group-hover:-translate-x-1 transition" />
      </div>
    </Link>
  );
}
