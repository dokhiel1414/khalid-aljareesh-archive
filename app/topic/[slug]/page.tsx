import Link from "next/link";
import { notFound } from "next/navigation";
import { Layers, ListOrdered } from "lucide-react";
import SectionHeader from "@/components/SectionHeader";
import ItemGrid from "@/components/ItemGrid";
import { prisma } from "@/lib/prisma";
import { CATEGORY_LABEL, toArabicDigits } from "@/lib/utils";

export const revalidate = 60;

const CATEGORIES = ["AUDIO", "VIDEO", "WRITTEN"] as const;
type Cat = (typeof CATEGORIES)[number];

async function getTopic(slug: string) {
  try {
    return await prisma.topic.findUnique({
      where: { slug },
      include: {
        items: {
          where: { item: { hidden: false } },
          include: { item: true },
          orderBy: [{ episodeOrder: "asc" }, { item: { publishedAt: "desc" } }],
        },
      },
    });
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}) {
  const slug = decodeURIComponent(params.slug);
  const topic = await getTopic(slug);
  if (!topic) return { title: "الموضوع غير موجود" };
  return {
    title: topic.name,
    description:
      topic.description || `محتوى الأرشيف ضمن ${topic.name}`,
  };
}

export default async function TopicPage({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams: { type?: string };
}) {
  const slug = decodeURIComponent(params.slug);
  const topic = await getTopic(slug);
  if (!topic) notFound();

  const isProgram = topic.type === "PROGRAM";

  // All items under this topic, already ordered by the query.
  const all = topic.items
    .map((rel) => ({ ...rel.item, episodeOrder: rel.episodeOrder }))
    .filter(Boolean);

  // For THEME topics the natural order is newest-first.
  if (!isProgram) {
    all.sort(
      (a, b) =>
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
    );
  }

  const activeType = CATEGORIES.includes(searchParams.type as Cat)
    ? (searchParams.type as Cat)
    : null;

  const counts: Record<Cat, number> = { AUDIO: 0, VIDEO: 0, WRITTEN: 0 };
  for (const it of all) counts[it.category as Cat] += 1;

  const shown = activeType
    ? all.filter((it) => it.category === activeType)
    : all;

  const base = `/topic/${encodeURIComponent(slug)}`;

  return (
    <>
      <SectionHeader
        title={topic.name}
        description={topic.description || undefined}
        icon={isProgram ? ListOrdered : Layers}
      />
      <section className="container py-10">
        {/* Media-type sub-filter */}
        <div className="mb-6 flex flex-wrap items-center gap-2">
          <FilterChip href={base} active={!activeType} label="الكل" count={all.length} />
          {CATEGORIES.map((c) =>
            counts[c] > 0 ? (
              <FilterChip
                key={c}
                href={`${base}?type=${c}`}
                active={activeType === c}
                label={CATEGORY_LABEL[c]}
                count={counts[c]}
              />
            ) : null,
          )}
        </div>

        {isProgram && (
          <p className="mb-4 text-sm text-muted">
            حلقات البرنامج مرتّبة حسب التسلسل.
          </p>
        )}

        <ItemGrid
          items={shown.map((i) => ({
            ...i,
            publishedAt:
              i.publishedAt instanceof Date
                ? i.publishedAt.toISOString()
                : String(i.publishedAt),
          }))}
        />
      </section>
    </>
  );
}

function FilterChip({
  href,
  active,
  label,
  count,
}: {
  href: string;
  active: boolean;
  label: string;
  count: number;
}) {
  return (
    <Link
      href={href}
      className={
        "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border transition " +
        (active
          ? "bg-gold text-ink border-gold"
          : "bg-white dark:bg-dark-card text-ink/80 dark:text-sand/80 border-ink/10 dark:border-dark-border hover:border-gold")
      }
    >
      {label}
      <span className={active ? "text-ink/70" : "text-muted"}>
        {toArabicDigits(count)}
      </span>
    </Link>
  );
}
