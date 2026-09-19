/**
 * مدير التنزيلات دون اتصال (صوتيات) — واجهة expo-file-system الجديدة.
 * - تنزيل مع تقدم + إلغاء + حذف + مساحة التخزين + تحقق قبل التشغيل
 * - الملفات في Paths.document/audio (تبقى بعد إعادة التشغيل)
 * - السجل الوصفي في downloadsStore (AsyncStorage)
 */

import { Directory, File, Paths } from "expo-file-system";

import { useDownloadsStore } from "@/store/downloadsStore";
import { resolveStreamUrl } from "@/utils/drive";

const AUDIO_DIR_NAME = "audio";

/** المهام النشطة — للسماح بإلغاء تنزيل جارٍ. */
const activeTasks = new Map<string, { task: { cancel: () => void } }>();

function audioDir(): Directory {
  const dir = new Directory(Paths.document, AUDIO_DIR_NAME);
  dir.create({ intermediates: true, idempotent: true });
  return dir;
}

function audioFile(itemId: string): File {
  return new File(audioDir(), `${itemId}.mp3`);
}

/** رابط تنزيل مباشر (أسرع من بروكسي الموقع ولا يمر عبر Vercel). */
export function downloadSourceUrl(item: {
  driveFileId: string | null;
  driveLink: string | null;
}): string | null {
  return resolveStreamUrl(item.driveFileId, item.driveLink);
}

export interface StartDownloadInput {
  id: string;
  title: string;
  driveFileId: string | null;
  driveLink: string | null;
}

/** بدء تنزيل عنصر صوتي — يحدّث السجل والتقدم. */
export async function startDownload(input: StartDownloadInput): Promise<void> {
  const url = downloadSourceUrl(input);
  if (!url) {
    useDownloadsStore.getState().upsert({
      id: input.id,
      title: input.title,
      fileName: `${input.id}.mp3`,
      bytes: 0,
      progress: 0,
      status: "error",
      downloadedAt: null,
    });
    return;
  }

  useDownloadsStore.getState().upsert({
    id: input.id,
    title: input.title,
    fileName: `${input.id}.mp3`,
    bytes: 0,
    progress: 0,
    status: "downloading",
    downloadedAt: null,
  });

  try {
    const task = File.createDownloadTask(url, audioFile(input.id), {
      onProgress: ({ bytesWritten, totalBytes }) => {
        const progress = totalBytes > 0 ? bytesWritten / totalBytes : 0;
        useDownloadsStore.getState().setProgress(input.id, progress, bytesWritten);
      },
    });
    activeTasks.set(input.id, { task });
    const file = await task.downloadAsync();
    const bytes = (file?.size ?? 0) as number;
    if (!file || bytes < 1024) {
      throw new Error("ملف فارغ");
    }
    useDownloadsStore.getState().upsert({
      id: input.id,
      title: input.title,
      fileName: `${input.id}.mp3`,
      bytes,
      progress: 1,
      status: "done",
      downloadedAt: Date.now(),
    });
  } catch {
    useDownloadsStore.getState().upsert({
      id: input.id,
      title: input.title,
      fileName: `${input.id}.mp3`,
      bytes: 0,
      progress: 0,
      status: "error",
      downloadedAt: null,
    });
  } finally {
    activeTasks.delete(input.id);
  }
}

/** إلغاء تنزيل جارٍ. */
export async function cancelDownload(id: string): Promise<void> {
  const active = activeTasks.get(id);
  if (active) {
    try {
      active.task.cancel();
    } catch {
      // تجاهل.
    }
    activeTasks.delete(id);
  }
  useDownloadsStore.getState().remove(id);
}

/** حذف ملف محفوظ. */
export async function deleteDownload(id: string): Promise<void> {
  try {
    audioFile(id).delete();
  } catch {
    // الملف غير موجود أصلاً.
  }
  useDownloadsStore.getState().remove(id);
}

/**
 * التحقق من أن التنزيل سليم قبل التشغيل منه:
 * موجود في السجل + الملف موجود على القرص + حجمه معقول.
 */
export async function verifyDownload(id: string): Promise<boolean> {
  const record = useDownloadsStore.getState().records[id];
  if (!record || record.status !== "done") return false;
  try {
    const file = audioFile(id);
    if (!file.exists) return false;
    return (file.size ?? 0) >= 1024;
  } catch {
    return false;
  }
}

/** مسار الملف المحلي إن كان محمّلاً وسليماً، وإلا null (تشغيل من الشبكة). */
export async function getDownloadLocalUri(id: string): Promise<string | null> {
  if (!(await verifyDownload(id))) return null;
  return audioFile(id).uri;
}

/** المساحة المستخدمة بالتنزيلات (بايت). */
export async function downloadsDiskUsage(): Promise<number> {
  try {
    return audioDir().list().reduce((sum, f) => sum + ((f.size ?? 0) as number), 0);
  } catch {
    return 0;
  }
}

/** المساحة المتاحة على الجهاز (بايت). */
export function availableDiskSpace(): number {
  return Paths.availableDiskSpace;
}
