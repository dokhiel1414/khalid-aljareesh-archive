/**
 * فتح PDF — القرار الموثق v1: التنزيل إلى الكاش ثم فتحه في عارض النظام
 * (Intent ACTION_VIEW عبر content:// FileProvider). الخيارات الأخرى:
 * - react-native-pdf: يتطلب dev build + react-native-blob-util — ترقية مستقبلية
 *   موثقة في README للعرض داخل التطبيق.
 * - WebView: آخر الحلول فقط (غير مستخدم هنا).
 */

import { Directory, File, Paths } from "expo-file-system";
import * as IntentLauncher from "expo-intent-launcher";
import { Linking, Platform } from "react-native";

/** مجلد كاش الـ PDF — يُمسح تلقائياً عند ضغط المساحة. */
function pdfCacheDir(): Directory {
  const dir = new Directory(Paths.cache, "pdfs");
  dir.create({ intermediates: true, idempotent: true });
  return dir;
}

function pdfFile(title: string): File {
  const safe = title.replace(/[^\w؀-ۿ]+/g, "_").slice(0, 80) || "document";
  return new File(pdfCacheDir(), `${safe}.pdf`);
}

/** فتح الملف في عارض PDF الخارجي مع منح صلاحية القراءة للمحتوى. */
async function launchPdf(file: File): Promise<void> {
  if (Platform.OS !== "android") {
    await Linking.openURL(file.uri);
    return;
  }
  await IntentLauncher.startActivityAsync("android.intent.action.VIEW", {
    data: file.contentUri,
    type: "application/pdf",
    // FLAG_GRANT_READ_URI_PERMISSION — صلاحية قراءة لعارض النظام.
    flags: 1,
  });
}

/**
 * تنزيل PDF وفتحه في عارض النظام.
 * يعيد true عند نجاح الفتح، false عند عدم توفر رابط صالح.
 */
export async function openPdf(url: string | null, title: string): Promise<boolean> {
  if (!url) return false;
  try {
    const file = pdfFile(title);
    if (!file.exists || ((file.size ?? 0) as number) < 1024) {
      await File.downloadFileAsync(url, file, {
        signal: AbortSignal.timeout(60_000),
      });
    }
    await launchPdf(file);
    return true;
  } catch {
    // بديل أخير: فتح الرابط في المتصفح.
    try {
      await Linking.openURL(url);
      return true;
    } catch {
      return false;
    }
  }
}
