import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowRight,
  Calendar,
  Headphones,
  Video,
  BookOpen,
  Download,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import MediaEmbed from "@/components/MediaEmbed";
import CopyLinkButton from "@/components/CopyLinkButton";
import ItemViewTracker from "@/components/ItemViewTracker";
import { CATEGORY_LABEL, formatArabicDate } from "@/lib/utils";
import { driveDownloadUrl } from "@/lib/drive";

export const dynamic = "force-dynamic";

const ICONS = { AUDIO: Headphones, VIDEO: Video, WRITTEN: BookOpen };
const BACK_LINKS = {
  AUDIO: { href: "/audio", label: "كل الصوتيات" },
  VIDEO: { href: "/video", label: "كل المرئيات" },
  WRITTEN: { href: "/written", label: "كل المقالات والكتب" },
};
const DOWNLOAD_LABEL = {
  AUDIO: "تحميل الصوت",
  VIDEO: "تحميل الفيديو",
  WRITTEN: "تحميل الملف",
};

async function getItem(id: string) {
  try {
    return await prisma.item.findUnique({ where: { id } });
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
    </article>
  );
}
