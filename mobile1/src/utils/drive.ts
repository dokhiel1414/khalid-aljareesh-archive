/**
 * أدوات روابط Google Drive — منقولة من lib/drive.ts في الموقع.
 * البث عبر بروكسي الموقع /api/stream (يدعم Range) — التحميل عبر رابط مباشر.
 */

import { API_BASE_URL } from "@/constants/site";

const DRIVE_ID_PATTERNS = [
  /\/file\/d\/([a-zA-Z0-9_-]{20,})/,
  /[?&]id=([a-zA-Z0-9_-]{20,})/,
  /\/d\/([a-zA-Z0-9_-]{20,})/,
  /drive\.google\.com\/open\?id=([a-zA-Z0-9_-]{20,})/,
  /drive\.google\.com\/uc\?.*id=([a-zA-Z0-9_-]{20,})/,
];

export function extractDriveFileId(
  link: string | null | undefined,
): string | null {
  if (!link) return null;
  for (const pattern of DRIVE_ID_PATTERNS) {
    const match = link.match(pattern);
    if (match) return match[1];
  }
  return null;
}

/** بث صوت/فيديو عبر بروكسي الموقع (Range → سحب سريع داخل المشغّل). */
export function driveStreamUrl(fileId: string): string {
  return `${API_BASE_URL}/api/stream?id=${encodeURIComponent(fileId)}`;
}

/** رابط تحميل مباشر (للتنزيل دون اتصال). */
export function driveDownloadUrl(fileId: string): string {
  return `https://drive.usercontent.google.com/download?id=${encodeURIComponent(
    fileId,
  )}&export=download&authuser=0&confirm=t`;
}

/** مصغّرة فيديو/صوت من Drive (إن لم توجد thumbnail مخصصة). */
export function driveThumbnailUrl(fileId: string, size = 640): string {
  return `https://drive.google.com/thumbnail?id=${encodeURIComponent(
    fileId,
  )}&sz=w${size}`;
}

/** صفحة العرض الأصلية على Drive (فتح خارجي). */
export function driveViewUrl(fileId: string): string {
  return `https://drive.google.com/file/d/${encodeURIComponent(fileId)}/view`;
}

/**
 * رابط وسائط عنصر: مصغرة مخصصة > مصغرة Drive > null.
 * العناصر الصوتية بلا مصغرة تعرض بطاقة فنية مولّدة محلياً بدل الصورة.
 */
export function resolveItemThumbnail(
  thumbnail: string | null | undefined,
  driveFileId: string | null | undefined,
): string | null {
  if (thumbnail) return thumbnail;
  if (driveFileId) return driveThumbnailUrl(driveFileId, 640);
  return null;
}

/**
 * رابط بث لعنصر صوتي/مرئي:
 * - فيديوهات يوتيوب: تُكتشف لاحقاً ولا تُبث هنا (deep link بدلاً من ذلك)
 * - باقي الوسائط: بروكسي الموقع إن وُجد معرف Drive
 */
export function resolveStreamUrl(
  driveFileId: string | null | undefined,
  driveLink: string | null | undefined,
): string | null {
  const id = driveFileId ?? extractDriveFileId(driveLink);
  if (!id) return null;
  return driveStreamUrl(id);
}
