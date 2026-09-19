/**
 * تشغيل عنصر صوتي مع قائمة برنامج إن وُجد:
 * - عنصر داخل برنامج (episodeOrder ≠ null) → تُشغَّل حلقات البرنامج كاملة
 *   بدءاً من هذا العنصر (السابق/التالي داخل البرنامج).
 * - عنصر مستقل → قائمة عنصر واحد.
 */

import { useCallback } from "react";

import { fetchTopic } from "@/api/endpoints";
import { usePlayerStore, type QueueEntry } from "@/services/audioEngine";
import type { LightItem } from "@/types/api";

function toEntry(item: LightItem): QueueEntry {
  return {
    id: item.id,
    title: item.title,
    category: item.category,
    driveFileId: item.driveFileId,
    driveLink: item.driveLink,
    thumbnail: item.thumbnail,
  };
}

export function usePlayItem() {
  const playQueue = usePlayerStore((s) => s.playQueue);

  return useCallback(
    async (item: LightItem, programTopicId?: string | null) => {
      const entry = toEntry(item);

      if (programTopicId) {
        try {
          const { items } = await fetchTopic(programTopicId);
          const queue = items
            .filter((i) => i.category === "AUDIO")
            .map(toEntry);
          const startIndex = Math.max(
            0,
            queue.findIndex((e) => e.id === item.id),
          );
          if (queue.length > 0) {
            playQueue(queue, startIndex);
            return;
          }
        } catch {
          // تعذّر جلب البرنامج — تشغيل العنصر وحده أهون من منع التشغيل.
        }
      }

      playQueue([entry], 0);
    },
    [playQueue],
  );
}
