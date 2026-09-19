/**
 * سجل التنزيلات دون اتصال — وصف للتحميلات (الملفات نفسها في مجلد التطبيق).
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type DownloadStatus = "downloading" | "done" | "error";

export interface DownloadRecord {
  id: string; // معرف العنصر
  title: string;
  fileName: string;
  bytes: number;
  progress: number; // 0..1 أثناء التنزيل
  status: DownloadStatus;
  downloadedAt: number | null;
}

interface DownloadsState {
  records: Record<string, DownloadRecord>;
  upsert: (record: DownloadRecord) => void;
  remove: (id: string) => void;
  setProgress: (id: string, progress: number, bytes: number) => void;
}

export const useDownloadsStore = create<DownloadsState>()(
  persist(
    (set) => ({
      records: {},

      upsert: (record) =>
        set((s) => ({ records: { ...s.records, [record.id]: record } })),

      remove: (id) =>
        set((s) => {
          const { [id]: _removed, ...rest } = s.records;
          return { records: rest };
        }),

      setProgress: (id, progress, bytes) =>
        set((s) => {
          const existing = s.records[id];
          if (!existing) return s;
          return {
            records: {
              ...s.records,
              [id]: { ...existing, progress, bytes, status: "downloading" as const },
            },
          };
        }),
    }),
    {
      name: "kjarchive-downloads-v1",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);

export function isDownloaded(id: string): boolean {
  const record = useDownloadsStore.getState().records[id];
  return record?.status === "done";
}

export function totalDownloadedBytes(): number {
  return Object.values(useDownloadsStore.getState().records).reduce(
    (sum, r) => sum + (r.status === "done" ? r.bytes : 0),
    0,
  );
}
