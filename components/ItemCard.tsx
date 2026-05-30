import Link from "next/link";
import {
  Headphones,
  Video,
  BookOpen,
  Play,
  BookOpenCheck,
  Eye,
  Calendar,
} from "lucide-react";
import { CATEGORY_LABEL, formatArabicDate, toArabicDigits } from "@/lib/utils";
import { driveThumbnailUrl } from "@/lib/drive";
import CopyLinkButton from "./CopyLinkButton";

type Item = {
  id: string;
  title: string;
  description?: string | null;
  content?: string | null;
  category: "AUDIO" | "VIDEO" | "WRITTEN";
  driveLink?: string | null;
  driveFileId?: string | null;
  thumbnail?: string | null;
  publishedAt: string | Date;
  viewCount?: number | null;
};

const ICONS = {
  AUDIO: Headphones,
  VIDEO: Video,
  WRITTEN: BookOpen,
};

export default function ItemCard({ item }: { item: Item }) {
  const Icon = ICONS[item.category];
  const driveId = item.driveFileId ?? item.driveLink ?? null;
  const cover =
    item.thumbnail ||
    (item.category !== "AUDIO" && !item.content
      ? driveThumbnailUrl(driveId, 640)
      : null);
  const href = `/item/${item.id}`;
  const actionLabel =
    item.category === "AUDIO" ? "استمع الآن" :
    item.category === "VIDEO" ? "شاهد الآن" : "اقرأ الآن";
  const views = item.viewCount ?? 0;
  // A merged lecture: a media item (audio/video) that also carries a transcript.
  const isCombined =
    item.category !== "WRITTEN" && !!item.content && item.content.trim().length > 0;
  const combinedLabel = item.category === "VIDEO" ? "مرئي + نص" : "صوتي + نص";
  const combinedBadge = isCombined ? (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-brown/10 text-brown dark:text-gold border border-brown/20 whitespace-nowrap">
      <BookOpenCheck className="h-3 w-3" />
      {combinedLabel}
    </span>
  ) : null;

  // Article-style card (no thumbnail) — title-first, text-focused.
  if (!cover) {
    const ActionIcon = item.category === "WRITTEN" ? BookOpenCheck : Play;
    return (
      <article className="card group flex flex-col p-5 md:p-6">
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="chip-gold">
              <Icon className="h-3.5 w-3.5" />
              {CATEGORY_LABEL[item.category]}
            </span>
            {combinedBadge}
          </div>
          <span className="inline-flex items-center gap-1 text-xs text-muted">
            <Eye className="h-3.5 w-3.5" />
            {toArabicDigits(views.toLocaleString("en-US"))}
          </span>
        </div>

        <Link
          href={href}
          className="font-display font-bold text-ink dark:text-sand text-lg leading-snug hover:text-brown dark:hover:text-gold transition line-clamp-2"
        >
          {item.title}
        </Link>

        {item.description && (
          <p className="mt-2 text-sm text-muted leading-relaxed line-clamp-3">
            {item.description}
          </p>
        )}

        <div className="mt-auto pt-4 flex items-center justify-between gap-2 text-xs text-muted border-t border-ink/5 dark:border-dark-border">
          <span className="inline-flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5 text-brown dark:text-gold" />
            {formatArabicDate(item.publishedAt)}
          </span>
          <div className="flex items-center gap-1">
            <Link
              href={href}
              className="inline-flex items-center gap-1 text-brown dark:text-gold hover:text-ink dark:hover:text-sand font-medium px-2 py-1"
            >
              <ActionIcon className="h-3.5 w-3.5" />
              {actionLabel}
            </Link>
            <CopyLinkButton path={href} variant="icon" label="نسخ رابط المادة" />
          </div>
        </div>
      </article>
    );
  }

  // Visual card with cover (audio with custom thumbnail, video, PDF written
  // items that have a Drive thumbnail and no inline text).
  const ActionIcon = item.category === "WRITTEN" ? BookOpenCheck : Play;
  return (
    <article className="card group flex flex-col">
      <Link
        href={href}
        className="relative block aspect-[16/10] bg-gradient-to-br from-ink to-ink-2 overflow-hidden"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={cover}
          alt={item.title}
          className="absolute inset-0 h-full w-full object-cover opacity-90 group-hover:scale-[1.03] transition duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/20 to-transparent" />
        <div className="absolute top-3 right-3 chip-gold backdrop-blur">
          <Icon className="h-3.5 w-3.5" />
          {CATEGORY_LABEL[item.category]}
        </div>
        <div className="absolute top-3 left-3 inline-flex items-center gap-1 px-2 py-1 rounded-full bg-ink/60 text-sand text-[10px] backdrop-blur">
          <Eye className="h-3 w-3 text-gold" />
          {toArabicDigits(views.toLocaleString("en-US"))}
        </div>
        <div className="absolute bottom-3 left-3 h-10 w-10 rounded-full bg-gold text-ink grid place-items-center shadow-card group-hover:scale-110 transition">
          <ActionIcon className="h-5 w-5" />
        </div>
      </Link>

      <div className="p-4 flex flex-col gap-3 grow">
        <Link
          href={href}
          className="font-display font-bold text-ink dark:text-sand leading-snug line-clamp-2 hover:text-brown dark:hover:text-gold transition"
        >
          {item.title}
        </Link>
        {combinedBadge && <div className="-mt-1">{combinedBadge}</div>}
        {item.description && (
          <p className="text-sm text-muted leading-relaxed line-clamp-3">
            {item.description}
          </p>
        )}
        <div className="mt-auto flex items-center justify-between pt-2 text-xs text-muted gap-2">
          <time>{formatArabicDate(item.publishedAt)}</time>
          <div className="flex items-center gap-1">
            <Link
              href={href}
              className="text-brown dark:text-gold hover:text-ink dark:hover:text-sand font-medium px-2"
            >
              {actionLabel}
            </Link>
            <CopyLinkButton path={href} variant="icon" label="نسخ رابط المادة" />
          </div>
        </div>
      </div>
    </article>
  );
}
