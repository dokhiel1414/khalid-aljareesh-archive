/**
 * خطافات بيانات الأرشيف — TanStack Query مع:
 * - seed مدمج كبيانات أولية (أول رسم فوري حتى بدون شبكة)
 * - كاش دائم عبر AsyncStorage (persistQueryClient في التخطيط الجذر)
 * - تراجع ذكي إلى seed عند انقطاع الشبكة (مع إشارة isOfflineData)
 */

import { useQuery, useMutation } from "@tanstack/react-query";
import { useMemo } from "react";

import {
  fetchItem,
  fetchItems,
  fetchTopic,
  fetchTopics,
  postView,
  searchItems,
  type SearchParams,
} from "@/api/endpoints";
import {
  seedItems,
  seedTopicItems,
  seedTopicMeta,
  seedTopics,
  SEED_EXPORTED_AT,
} from "@/api/seed";
import type { Category, Item, ItemDetailResponse, LightItem, Topic } from "@/types/api";
import { useIsOffline } from "./useNetworkStatus";

/** تحديث البيانات الحية في الخلفية بينما تظهر بيانات seed فوراً. */
const SEED_UPDATED_AT = new Date(SEED_EXPORTED_AT).getTime();

const STALE_TIME = 5 * 60 * 1000; // 5 دقائق
const CACHE_TIME = 24 * 60 * 60 * 1000; // يوم كامل

export const queryKeys = {
  items: (category?: Category) => ["items", category ?? "all"] as const,
  item: (id: string) => ["item", id] as const,
  topics: ["topics"] as const,
  topic: (idOrSlug: string) => ["topic", idOrSlug] as const,
  search: (params: Omit<SearchParams, "signal">) => ["search", params] as const,
};

function seedItemsFor(category?: Category): Item[] {
  const items = seedItems();
  if (!category) return items;
  return items.filter((i) => i.category === category);
}

/** قائمة عناصر فئة (أو الكل) — seed فوري ثم بيانات حية. */
export function useItems(category?: Category) {
  const offline = useIsOffline();
  const initial = useMemo(() => seedItemsFor(category), [category]);

  return useQuery({
    queryKey: queryKeys.items(category),
    queryFn: ({ signal }) => fetchItems({ category, limit: 200, signal }),
    initialData: { items: initial },
    initialDataUpdatedAt: SEED_UPDATED_AT,
    staleTime: STALE_TIME,
    gcTime: CACHE_TIME,
    refetchOnMount: offline ? false : undefined,
  });
}

export function useTopics() {
  const offline = useIsOffline();
  const initial = useMemo(
    () => seedTopics().sort((a, b) => a.order - b.order || a.name.localeCompare(b.name, "ar")),
    [],
  );

  return useQuery({
    queryKey: queryKeys.topics,
    queryFn: ({ signal }) => fetchTopics(signal),
    select: (data) => data.topics,
    initialData: { topics: initial },
    initialDataUpdatedAt: SEED_UPDATED_AT,
    staleTime: STALE_TIME,
    gcTime: CACHE_TIME,
    refetchOnMount: offline ? false : undefined,
  });
}

export interface TopicDetail {
  topic: Topic | null;
  items: (LightItem & { episodeOrder: number | null })[];
  /** true = البيانات من seed لأن الشبكة مقطوعة. */
  isOfflineData: boolean;
}

export function useTopic(idOrSlug: string) {
  const offline = useIsOffline();
  const initial = useMemo(() => {
    const meta = seedTopicMeta(idOrSlug);
    if (!meta) return undefined;
    return {
      topic: meta,
      items: seedTopicItems(idOrSlug).items,
    };
  }, [idOrSlug]);

  return useQuery({
    queryKey: queryKeys.topic(idOrSlug),
    queryFn: async ({ signal }): Promise<TopicDetail> => {
      try {
        const data = await fetchTopic(idOrSlug, signal);
        return { topic: data.topic, items: data.items, isOfflineData: false };
      } catch (error) {
        if (offline && initial) {
          return { ...initial, isOfflineData: true };
        }
        throw error;
      }
    },
    initialData: initial ? { ...initial, isOfflineData: true } : undefined,
    initialDataUpdatedAt: SEED_UPDATED_AT,
    staleTime: STALE_TIME,
    gcTime: CACHE_TIME,
  });
}

export function useItemDetail(id: string) {
  const offline = useIsOffline();
  const initial = useMemo(() => {
    const item = seedItems().find((i) => i.id === id);
    return item ? { item } : undefined;
  }, [id]);

  return useQuery<ItemDetailResponse>({
    queryKey: queryKeys.item(id),
    queryFn: async ({ signal }) => {
      try {
        return await fetchItem(id, signal);
      } catch (error) {
        if (offline && initial) return initial;
        throw error;
      }
    },
    initialData: initial,
    initialDataUpdatedAt: SEED_UPDATED_AT,
    staleTime: STALE_TIME,
    gcTime: CACHE_TIME,
    enabled: id.length > 0,
  });
}

export interface LiveSearchParams {
  q: string;
  category?: Category;
  from?: string;
  to?: string;
  enabled: boolean;
}

/** بحث حي — يُلغى الطلب السابق تلقائياً عند تغيّر المدخلات. */
export function useSearch(params: LiveSearchParams) {
  const offline = useIsOffline();

  return useQuery({
    queryKey: queryKeys.search({
      q: params.q,
      category: params.category,
      from: params.from,
      to: params.to,
    }),
    queryFn: async ({ signal }): Promise<{ items: LightItem[]; isOfflineData: boolean }> => {
      try {
        const data = await searchItems({
          q: params.q,
          category: params.category,
          from: params.from,
          to: params.to,
          limit: 50,
          signal,
        });
        return { items: data.items as LightItem[], isOfflineData: false };
      } catch (error) {
        if (offline) {
          // بحث محلي فوق seed (عناوين/أوصاف فقط) عند انقطاع الشبكة.
          const q = params.q.trim();
          const items = seedItems()
            .filter(
              (i) =>
                (!params.category || i.category === params.category) &&
                (i.title.includes(q) || (i.description ?? "").includes(q)),
            )
            .slice(0, 50);
          return { items, isOfflineData: true };
        }
        throw error;
      }
    },
    enabled: params.enabled,
    staleTime: 30_000,
    gcTime: 5 * 60 * 1000,
  });
}

/** زيادة عداد المشاهدات — مرة واحدة لكل زيارة شاشة التفاصيل. */
export function useViewCount(id: string) {
  return useMutation({
    mutationFn: () => postView(id),
    retry: false,
  });
}

export type { Item, LightItem, Topic };
