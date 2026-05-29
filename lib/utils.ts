import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format a Date as a Hijri (Umm al-Qura) string in Arabic.
 * Example: "٢٣ شعبان ١٤٤٧ هـ"
 */
export function formatHijriDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  if (Number.isNaN(d.getTime())) return "";
  try {
    const parts = new Intl.DateTimeFormat("ar-SA-u-ca-islamic-umalqura", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).formatToParts(d);
    // Default output ends with "هـ" already in Arabic locale.
    return parts.map((p) => p.value).join("").trim();
  } catch {
    // Fallback to non-Saudi Islamic calendar if available.
    try {
      return new Intl.DateTimeFormat("ar-u-ca-islamic", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }).format(d);
    } catch {
      return d.toLocaleDateString("ar");
    }
  }
}

/** Back-compat shim: previous code called formatArabicDate(...) — now Hijri. */
export const formatArabicDate = formatHijriDate;

export const CATEGORY_LABEL: Record<"AUDIO" | "VIDEO" | "WRITTEN", string> = {
  AUDIO: "صوتيات",
  VIDEO: "مرئيات",
  WRITTEN: "مقالات وكتب",
};

export const TOPIC_TYPE_LABEL: Record<"THEME" | "PROGRAM", string> = {
  THEME: "موضوع",
  PROGRAM: "برنامج",
};

/**
 * Build a URL-friendly slug from a (possibly Arabic) name. Keeps Arabic
 * letters and latin alphanumerics, turns whitespace/separators into a single
 * hyphen, and strips other punctuation. Arabic slugs are valid in URLs
 * (they get percent-encoded by the browser).
 */
export function slugify(input: string): string {
  return (input || "")
    .trim()
    .replace(/[ـ]/g, "") // strip tatweel
    .replace(/['"“”‘’.,،؛:!؟?()\[\]{}/\\|@#$%^&*+=~`]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();
}

const AR_DIGITS = "٠١٢٣٤٥٦٧٨٩";
/** Convert any latin digits in a string to Arabic-Indic digits. */
export function toArabicDigits(input: string | number): string {
  return String(input).replace(/\d/g, (d) => AR_DIGITS[Number(d)]);
}
