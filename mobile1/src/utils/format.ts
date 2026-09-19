/**
 * أدوات التنسيق — منقولة من lib/utils.ts في الموقع وموسّعة لتطبيق الجوال.
 */

import type { Category, TopicType } from "@/types/api";

const ARABIC_DIGITS = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];

export function toArabicDigits(input: string | number): string {
  return String(input).replace(/[0-9]/g, (d) => ARABIC_DIGITS[Number(d)]);
}

export const CATEGORY_LABEL: Record<Category, string> = {
  AUDIO: "صوتيات",
  VIDEO: "مرئيات",
  WRITTEN: "مقالات",
};

export const CATEGORY_SINGULAR: Record<Category, string> = {
  AUDIO: "صوتية",
  VIDEO: "مرئية",
  WRITTEN: "مقالة",
};

export const TOPIC_TYPE_LABEL: Record<TopicType, string> = {
  THEME: "موضوع",
  PROGRAM: "برنامج",
};

/** اسم الفئة المناسب للعدد: صوتية/صوتيتان/صوتيات (تقريب أندرويدي مبسّط 1-2-كثير). */
export function itemNoun(category: Category, count: number): string {
  const singular = CATEGORY_SINGULAR[category];
  const plural = CATEGORY_LABEL[category];
  if (count === 1) return singular;
  // المثنى: «صوتية» ← «صوتيتان» (التاء المربوطة تنقلب تاء مفتوحة).
  if (count === 2) {
    return singular.endsWith("ة")
      ? `${singular.slice(0, -1)}تان`
      : `${singular}ان`;
  }
  if (count <= 10) return `${toArabicDigits(count)} ${plural.slice(0, -2)}ات`;
  return `${toArabicDigits(count)} ${plural}`;
}

export function itemCountLabel(category: Category, count: number): string {
  return `${itemNoun(category, count)}`;
}

const hijriFormatter = new Intl.DateTimeFormat("ar-SA-u-ca-islamic-umalqura", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

const gregorianLong = new Intl.DateTimeFormat("ar-SA", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

const gregorianShort = new Intl.DateTimeFormat("ar-SA", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

/** التاريخ الهجري (أم القرى) مع تراجع آمن إلى الميلادي إن لم يدعمه الجهاز. */
export function formatHijriDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  try {
    return hijriFormatter.format(d);
  } catch {
    return gregorianLong.format(d);
  }
}

/** تاريخ نشر مختصر للميلادي (مثل: ١٩ سبتمبر ٢٠٢٦). */
export function formatGregorianShort(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  try {
    return gregorianShort.format(d);
  } catch {
    return d.toLocaleDateString();
  }
}

/** «اليوم» / «أمس» / «قبل ٣ أيام» — للقوائم الحديثة. */
export function formatRelativeDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  const startOfDay = (x: Date) => new Date(x.getFullYear(), x.getMonth(), x.getDate());
  const diffDays = Math.round(
    (startOfDay(now).getTime() - startOfDay(d).getTime()) / 86_400_000,
  );
  if (diffDays <= 0) return "اليوم";
  if (diffDays === 1) return "أمس";
  if (diffDays < 7) return `قبل ${toArabicDigits(diffDays)} أيام`;
  return formatGregorianShort(d);
}

/** تنسيق مدة صوت: ١:٢٣:٤٥ أو ٠٥:١٢. */
export function formatDuration(totalSeconds: number): string {
  if (!Number.isFinite(totalSeconds) || totalSeconds < 0) return "٠٠:٠٠";
  const s = Math.floor(totalSeconds);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const mm = String(m).padStart(2, "0");
  const ss = String(sec).padStart(2, "0");
  const out = h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
  return toArabicDigits(out);
}

/** عدد المشاهدات: «١٢٣ مشاهدة». */
export function formatViews(count: number): string {
  return `${toArabicDigits(count)} مشاهدة`;
}

/** حجم ملف: «١٢٫٤ م.ب». */
export function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return "٠ بايت";
  const units = ["بايت", "ك.ب", "م.ب", "ج.ب"];
  let value = bytes;
  let i = 0;
  while (value >= 1024 && i < units.length - 1) {
    value /= 1024;
    i += 1;
  }
  const rounded = value >= 10 ? Math.round(value) : Math.round(value * 10) / 10;
  // الفاصلة العشرية العربية «٫» بدل النقطة.
  return `${toArabicDigits(rounded).replace(".", "٫")} ${units[i]}`;
}

/** رقم الحلقة: «الحلقة ٣» / «الدرس ٣». */
export function formatEpisodeLabel(order: number | null, count?: number): string {
  const n = toArabicDigits(order ?? 1);
  if (count && count > 1) return `الحلقة ${n} من ${toArabicDigits(count)}`;
  return `الحلقة ${n}`;
}
