import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowRight,
  ArrowLeft,
  Calendar,
  Headphones,
  Video,
  BookOpen,
  Download,
  Layers,
  ListOrdered,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import MediaEmbed from "@/components/MediaEmbed";
import CopyLinkButton from "@/components/CopyLinkButton";
import ItemViewTracker from "@/components/ItemViewTracker";
import { CATEGORY_LABEL, formatArabicDate, toArabicDigits } from "@/lib/utils";
import { driveDownloadUrl } from "@/lib/drive";

export const dynamic = "force-dynamic";

const ICONS = { AUDIO: Headphones, VIDEO: Video, WRITTEN: BookOpen };
const BACK_LINKS = {
  AUDIO: { href: "/audio", label: "كل الصوتيات" },
  VIDEO: { href: "/video", label: "كل المرئيات" },
  WRITTEN: { href: "/written", label: "كل المقالات" },
};
const DOWNLOAD_LABEL = {
  AUDIO: "تحميل الصوت",
  VIDEO: "تحميل الفيديو",
  WRITTEN: "تحميل الملف",
};

async function getItem(id: string) {
  try {
    return await prisma.item.findUnique({
      where: { id },
      include: {
        topics: {
          include: { topic: true },
          orderBy: { topic: { type: "asc" } },
        },
      },
    });
  } catch {
    return null;
  }
}

/** Find the previous/next episode within a program (ordered series). */
async function getProgramNav(topicId: string, currentItemId: string) {
  try {
    const eps = await prisma.itemTopic.findMany({
      where: { topicId },
      orderBy: [{ episodeOrder: "asc" }, { item: { publishedAt: "asc" } }],
      select: {
        episodeOrder: true,
        item: { select: { id: true, title: true } },
      },
    });
    const idx = eps.findIndex((e) => e.item.id === currentItemId);
    if (idx === -1) return null;
    return {
      total: eps.length,
      current: eps[idx],
      position: idx + 1,
      prev: idx > 0 ? eps[idx - 1] : null,
      next: idx < eps.length - 1 ? eps[idx + 1] : null,
    };
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: { params: { id: string } }) {
  const item = await getItem(params.id);
  if (!item) return { title: "العنصر غير موجود" };
  return {
    title: item.title,
    description: item.description || `${CATEGORY_LABEL[item.category]} للشيخ خالد بن علي الجريش`,
  };
}

export default async function ItemPage({ params }: { params: { id: string } }) {
  const item = await getItem(params.id);
  if (!item) notFound();

  const Icon = ICONS[item.category];
  const back = BACK_LINKS[item.category];
  const topicRels = item.topics ?? [];
  const programRel = topicRels.find((r) => r.topic.type === "PROGRAM");
  const programNav = programRel
    ? await getProgramNav(programRel.topicId, item.id)
    : null;
  const driveId = item.driveFileId ?? item.driveLink ?? null;
  const downloadUrl = driveDownloadUrl(driveId);
  const hasArticleBody = !!item.content && item.content.trim().length > 0;
  // For written items, the article body (if any) is the primary view.
  // Drive iframe is only shown when there's a file AND no article body.
  const showMediaEmbed = !!driveId && !(item.category === "WRITTEN" && hasArticleBody);

  return (
    <article className="container py-8 md:py-12">
      <div className="mb-6 flex items-center justify-between gap-4 flex-wrap">
        <Link
          href={back.href}
          className="inline-flex items-center gap-2 text-sm text-muted hover:text-ink dark:hover:text-sand"
        >
          <ArrowRight className="h-4 w-4" />
          {back.label}
        </Link>
        <CopyLinkButton path={`/item/${item.id}`} variant="gold" label="مشاركة الرابط" />
      </div>

      <header className="mb-6">
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <span className="chip-gold">
            <Icon className="h-3.5 w-3.5" />
            {CATEGORY_LABEL[item.category]}
          </span>
          <span className="chip">
            <Calendar className="h-3.5 w-3.5" />
            {formatArabicDate(item.publishedAt)}
          </span>
          <ItemViewTracker itemId={item.id} initial={item.viewCount} />
        </div>
        <h1 className="font-display text-2xl md:text-4xl font-bold text-ink dark:text-sand leading-tight">
          {item.title}
        </h1>

        {/* Topic / program chips */}
        {topicRels.length > 0 && (
          <div className="mt-4 flex flex-wrap items-center gap-2">
            {topicRels.map((rel) => {
              const isProgram = rel.topic.type === "PROGRAM";
              return (
                <Link
                  key={rel.topicId}
                  href={`/topic/${encodeURIComponent(rel.topic.slug)}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-white dark:bg-dark-card border border-ink/10 dark:border-dark-border text-ink/80 dark:text-sand/80 hover:border-gold hover:text-ink dark:hover:text-sand transition"
                >
                  {isProgram ? (
                    <ListOrdered className="h-3.5 w-3.5 text-brown dark:text-gold" />
                  ) : (
                    <Layers className="h-3.5 w-3.5 text-brown dark:text-gold" />
                  )}
                  {rel.topic.name}
                  {isProgram && rel.episodeOrder != null && (
                    <span className="text-muted">
                      · الحلقة {toArabicDigits(rel.episodeOrder)}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        )}
      </header>

      {showMediaEmbed && (
        <div className="mb-6">
          <MediaEmbed
            kind={item.category}
            driveLink={item.driveLink}
            driveFileId={item.driveFileId}
            title={item.title}
          />
        </div>
      )}

      {/* Inline article body (HTML rendered with .prose typography). */}
      {hasArticleBody && (
        <section className="bg-white dark:bg-dark-card border border-ink/10 dark:border-dark-border rounded-2xl p-6 md:p-10 shadow-soft">
          <div
            className="prose"
            dir="rtl"
            dangerouslySetInnerHTML={{ __html: item.content! }}
          />
        </section>
      )}

      {/* Download button (works for both audio/video files and PDF books). */}
      {driveId && downloadUrl && (
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <a
            href={downloadUrl}
            target="_blank"
            rel="noopener"
            className="btn-primary"
          >
            <Download className="h-4 w-4" />
            {DOWNLOAD_LABEL[item.category]}
          </a>
        </div>
      )}

      {/* Description (only shown if there's no inline article body, to avoid duplication). */}
      {item.description && !hasArticleBody && (
        <section className="mt-6 bg-white dark:bg-dark-card border border-ink/10 dark:border-dark-border rounded-2xl p-5 md:p-6 shadow-soft">
          <h2 className="font-display font-bold text-ink dark:text-sand mb-2">
            الوصف
          </h2>
          <p className="text-ink/80 dark:text-sand/80 leading-loose whitespace-pre-wrap">
            {item.description}
          </p>
        </section>
      )}

      {/* Empty-state when there's nothing to render. */}
      {!showMediaEmbed && !hasArticleBody && !item.description && (
        <div className="rounded-2xl border border-dashed border-ink/15 dark:border-dark-border bg-white dark:bg-dark-card p-8 text-center text-muted">
          لا يوجد محتوى لهذا العنصر بعد.
        </div>
      )}

      {/* Program episode navigation (previous / next) */}
      {programRel && programNav && (programNav.prev || programNav.next) && (
        <nav className="mt-8 border-t border-ink/10 dark:border-dark-border pt-6">
          <div className="flex items-center justify-between gap-3 mb-4">
            <Link
              href={`/topic/${encodeURIComponent(programRel.topic.slug)}`}
              className="inline-flex items-center gap-2 text-sm font-medium text-brown dark:text-gold hover:text-ink dark:hover:text-sand"
            >
              <ListOrdered className="h-4 w-4" />
              {programRel.topic.name}
            </Link>
            <span className="text-xs text-muted">
              الحلقة {toArabicDigits(programNav.position)} من{" "}
              {toArabicDigits(programNav.total)}
            </span>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {programNav.prev ? (
              <Link
                href={`/item/${programNav.prev.item.id}`}
                className="group flex items-center gap-3 rounded-2xl border border-ink/10 dark:border-dark-border bg-white dark:bg-dark-card p-4 hover:border-gold transition"
              >
                <ArrowRight className="h-5 w-5 shrink-0 text-brown dark:text-gold" />
                <span className="min-w-0">
                  <span className="block text-xs text-muted">الحلقة السابقة</span>
                  <span className="block font-medium text-ink dark:text-sand truncate">
                    {programNav.prev.item.title}
                  </span>
                </span>
              </Link>
            ) : (
              <span className="hidden sm:block" />
            )}
            {programNav.next && (
              <Link
                href={`/item/${programNav.next.item.id}`}
                className="group flex items-center justify-end gap-3 rounded-2xl border border-ink/10 dark:border-dark-border bg-white dark:bg-dark-card p-4 hover:border-gold transition text-left"
              >
                <span className="min-w-0">
                  <span className="block text-xs text-muted">الحلقة التالية</span>
                  <span className="block font-medium text-ink dark:text-sand truncate">
                    {programNav.next.item.title}
                  </span>
                </span>
                <ArrowLeft className="h-5 w-5 shrink-0 text-brown dark:text-gold" />
              </Link>
            )}
          </div>
        </nav>
      )}
    </article>
  );
}
