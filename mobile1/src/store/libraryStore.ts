/**
 * مكتبة المستخدم المحلية: المفضلة + سجل الاستماع + مواضع الاستئناف + البحث الأخير.
 * محلية بالكامل (لا حسابات مستخدمين في v1) — مخزنة عبر AsyncStorage.
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

/** بيانات عنصر كافية لعرضه في قوائم المفضلة/السجل دون اتصال. */
export interface ItemLike {
  id: string;
  title: string;
  description: string | null;
  category: "AUDIO" | "VIDEO" | "WRITTEN";
  thumbnail: string | null;
  driveFileId: string | null;
  driveLink: string | null;
  publishedAt?: string;
  viewCount?: number;
}

export interface RecentEntry extends ItemLike {
  listenedAt: number;
}

interface LibraryState {
  favorites: ItemLike[];
  recent: RecentEntry[];
  positions: Record<string, number>;
  recentSearches: string[];

  toggleFavorite: (item: ItemLike) => void;
  isFavorite: (id: string) => boolean;
  recordListen: (entry: ItemLike) => void;
  recordPosition: (id: string, seconds: number) => void;
  addRecentSearch: (q: string) => void;
  removeRecentSearch: (q: string) => void;
  clearRecentSearches: () => void;
}

const MAX_RECENT = 50;
const MAX_SEARCHES = 10;

/** تحويل أي عنصر (LightItem/QueueEntry...) إلى ItemLike للتخزين المحلي. */
export function toItemLike(
  item: Pick<ItemLike, "id" | "title" | "category"> & Partial<ItemLike>,
): ItemLike {
  return {
    id: item.id,
    title: item.title,
    description: item.description ?? null,
    category: item.category,
    thumbnail: item.thumbnail ?? null,
    driveFileId: item.driveFileId ?? null,
    driveLink: item.driveLink ?? null,
    publishedAt: item.publishedAt,
    viewCount: item.viewCount,
  };
}

export const useLibraryStore = create<LibraryState>()(
  persist(
    (set, get) => ({
      favorites: [],
      recent: [],
      positions: {},
      recentSearches: [],

      toggleFavorite: (item) =>
        set((s) => ({
          favorites: s.favorites.some((f) => f.id === item.id)
            ? s.favorites.filter((f) => f.id !== item.id)
            : [item, ...s.favorites],
        })),

      isFavorite: (id) => get().favorites.some((f) => f.id === id),

      recordListen: (entry) =>
        set((s) => ({
          recent: [
            { ...entry, listenedAt: Date.now() },
            ...s.recent.filter((r) => r.id !== entry.id),
          ].slice(0, MAX_RECENT),
        })),

      recordPosition: (id, seconds) =>
        set((s) => ({ positions: { ...s.positions, [id]: Math.floor(seconds) } })),

      addRecentSearch: (q) =>
        set((s) => ({
          recentSearches: [q, ...s.recentSearches.filter((x) => x !== q)].slice(0, MAX_SEARCHES),
        })),

      removeRecentSearch: (q) =>
        set((s) => ({ recentSearches: s.recentSearches.filter((x) => x !== q) })),

      clearRecentSearches: () => set({ recentSearches: [] }),
    }),
    {
      name: "kjarchive-library-v1",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);

/**
 * تسجيل استماع (من محرك الصوت): يسجّل في السجل + يحفظ الموضع.
 * دالة خارج المخزن لأن المحرك يستدعيها دورياً دون hook.
 */
export function recordListening(
  itemId: string,
  info: { position?: number } & Partial<Omit<RecentEntry, "id" | "listenedAt">>,
): void {
  const s = useLibraryStore.getState();
  if (info.position !== undefined) s.recordPosition(itemId, info.position);
  if (info.title) {
    s.recordListen({
      id: itemId,
      title: info.title,
      description: info.description ?? null,
      category: info.category ?? "AUDIO",
      thumbnail: info.thumbnail ?? null,
      driveFileId: info.driveFileId ?? null,
      driveLink: info.driveLink ?? null,
      publishedAt: info.publishedAt,
      viewCount: info.viewCount,
    });
  }
}
