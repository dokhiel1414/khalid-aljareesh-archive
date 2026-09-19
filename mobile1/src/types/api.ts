/**
 * أنواع بيانات API — مطابقة لعقود خادم Next.js (app/api/*) المؤكدة فعلياً.
 * Light = عنصر بدون content (HTML المقال) لتقليل حجم الاستجابات.
 */

export type Category = "AUDIO" | "VIDEO" | "WRITTEN";
export type TopicType = "THEME" | "PROGRAM";

export interface Item {
  id: string;
  title: string;
  description: string | null;
  content: string | null;
  category: Category;
  driveLink: string | null;
  driveFileId: string | null;
  thumbnail: string | null;
  hidden: boolean;
  publishedAt: string;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
}

/** عنصر بدون نص المقال (light=1 في /api/search أو مواضيع). */
export type LightItem = Omit<Item, "content">;

export interface ItemDetailResponse {
  item: Item & { topics?: { topicId: string; episodeOrder: number | null }[] };
}

export interface Topic {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  type: TopicType;
  coverImage: string | null;
  order: number;
  createdAt: string;
  updatedAt: string;
  _count?: { items: number };
}

/** عنصر داخل موضوع — مع ترتيب الحلقة إن وُجد. */
export type TopicItem = LightItem & { episodeOrder: number | null };

export interface TopicDetailResponse {
  topic: Omit<Topic, "_count">;
  items: TopicItem[];
}

export interface ItemsResponse {
  items: Item[] | LightItem[];
}

export interface TopicsResponse {
  topics: Topic[];
}

export interface ViewResponse {
  viewCount: number;
}

export interface ContactPayload {
  name: string;
  email?: string;
  subject?: string;
  message: string;
  /** honeypot — يُترك فارغاً دائماً. */
  website?: string;
}
