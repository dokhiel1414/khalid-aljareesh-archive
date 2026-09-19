/**
 * بيانات seed المدمجة — لقطة من الأرشيف (322 عنصراً + مواضيع + ارتباطات)
 * تُصدَّر من قاعدة الموقع عبر scripts/export-seed.mjs.
 *
 * تُستخدم كبيانات أولية فورية عند أول تشغيل وفي حال انقطاع الشبكة
 * مع عدم وجود كاش محفوظ — ثم تحل محلها البيانات الحية تلقائياً.
 */

import type { Item, Topic, TopicType } from "@/types/api";

interface SeedAssignment {
  topicId: string;
  episodeOrder: number | null;
}

interface SeedData {
  exportedAt: string;
  items: Item[];
  topics: (Topic & { type: TopicType })[];
  assignments: (SeedAssignment & { itemId: string })[];
}

const seed: SeedData = require("@/data/seed.json") as SeedData;

export const SEED_EXPORTED_AT = seed.exportedAt;

export function seedItems(): Item[] {
  return seed.items;
}

export function seedTopics(): Topic[] {
  return seed.topics.map((t) => ({ ...t, _count: undefined }));
}

/** عناصر موضوع من seed (لمحاكاة /api/topics/[id] دون اتصال). */
export function seedTopicItems(topicId: string): { items: (Item & { episodeOrder: number | null })[] } {
  const rows = seed.assignments
    .filter((a) => a.topicId === topicId)
    .map((a) => ({
      item: seed.items.find((i) => i.id === a.itemId),
      episodeOrder: a.episodeOrder,
    }))
    .filter((r) => r.item) as {
    item: Item;
    episodeOrder: number | null;
  }[];
  rows.sort(
    (a, b) =>
      (a.episodeOrder ?? 999_999) - (b.episodeOrder ?? 999_999) ||
      new Date(b.item.publishedAt).getTime() - new Date(a.item.publishedAt).getTime(),
  );
  return {
    items: rows.map(({ item, episodeOrder }) => ({ ...item, episodeOrder })),
  };
}

export function seedTopicMeta(topicId: string): Topic | null {
  return seed.topics.find((t) => t.id === topicId) ?? null;
}
