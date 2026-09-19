/**
 * أدوات يوتيوب — منقولة من lib/youtube.ts في الموقع.
 * الفيديوهات المخزنة كروابط يوتيوب تُفتح بتطبيق يوتيوب/المتصفح عبر deep link
 * (متوافق مع شروط خدمة يوتيوب — لا استخراج بث ولا تشغيل مضمّن مخالف).
 */

const YOUTUBE_PATTERNS = [
  /youtube\.com\/watch\?(?:.*&)?v=([A-Za-z0-9_-]{11})/,
  /youtube\.com\/shorts\/([A-Za-z0-9_-]{11})/,
  /youtube\.com\/embed\/([A-Za-z0-9_-]{11})/,
  /youtube\.com\/live\/([A-Za-z0-9_-]{11})/,
  /youtu\.be\/([A-Za-z0-9_-]{11})/,
];

export function extractYouTubeId(link: string | null | undefined): string | null {
  if (!link) return null;
  for (const pattern of YOUTUBE_PATTERNS) {
    const match = link.match(pattern);
    if (match) return match[1];
  }
  return null;
}

export function isYouTube(link: string | null | undefined): boolean {
  return extractYouTubeId(link) !== null;
}

/** رابط المشاهدة الرسمي (يفتح في تطبيق يوتيوب إن وُجد). */
export function youtubeWatchUrl(id: string): string {
  return `https://www.youtube.com/watch?v=${id}`;
}

/** مصغرة الفيديو (بدون مفتاح API). */
export function youtubeThumbnailUrl(id: string): string {
  return `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
}
