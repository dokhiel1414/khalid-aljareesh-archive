/**
 * العمل الفني لشاشة القفل/إشعار الوسائط.
 * مصغرة العنصر تُنزّل محلياً (صغيرة) لأن إشعار أندرويد يحتاج Uri محلياً
 * موثوقاً — مع تراجع إلى العمل الفني الافتراضي المدمج.
 */

import { Directory, File, Paths } from "expo-file-system";
import { Image } from "react-native";

const CACHE_NAME = "lock-artwork";

export async function fetchArtworkForLockScreen(
  thumbnailUrl: string | null | undefined,
): Promise<string | undefined> {
  if (!thumbnailUrl) return defaultArtworkUri();
  try {
    const dir = new Directory(Paths.cache, CACHE_NAME);
    dir.create({ intermediates: true, idempotent: true });
    const hash = thumbnailUrl.split("").reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 0);
    const file = new File(dir, `${hash}.img`);
    if (!file.exists || (file.size ?? 0) < 512) {
      // مهلة قصيرة حتى لا يعطّل التشغيل أبداً.
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 4000);
      try {
        await File.downloadFileAsync(thumbnailUrl, file, { signal: controller.signal });
      } finally {
        clearTimeout(timeout);
      }
    }
    if ((file.size ?? 0) < 512) return defaultArtworkUri();
    return file.uri;
  } catch {
    return defaultArtworkUri();
  }
}

let cachedDefault: string | undefined;

function defaultArtworkUri(): string | undefined {
  if (cachedDefault === undefined) {
    try {
      cachedDefault =
        Image.resolveAssetSource(require("@/assets/images/audio-artwork.png")).uri ?? undefined;
    } catch {
      cachedDefault = undefined;
    }
  }
  return cachedDefault;
}
