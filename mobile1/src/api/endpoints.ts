/**
 * نقاط API المطابقة لعقود خادم الموقع (app/api/*).
 * كل دالة تقبل signal لإلغاء الطلبات (بحث حي، مغادرة شاشة).
 */

import { apiFetch, buildQuery } from "./client";
import type {
  Category,
  ContactPayload,
  Item,
  ItemDetailResponse,
  ItemsResponse,
  Topic,
  TopicDetailResponse,
  TopicsResponse,
  ViewResponse,
} from "@/types/api";

export function fetchItems(params: {
  category?: Category;
  limit?: number;
  signal?: AbortSignal;
}): Promise<ItemsResponse> {
  return apiFetch<ItemsResponse>(
    `/api/items${buildQuery({ category: params.category, limit: params.limit })}`,
    { signal: params.signal },
  );
}

export function fetchItem(
  id: string,
  signal?: AbortSignal,
): Promise<ItemDetailResponse> {
  return apiFetch<ItemDetailResponse>(`/api/items/${encodeURIComponent(id)}`, {
    signal,
  });
}

export function fetchTopics(signal?: AbortSignal): Promise<TopicsResponse> {
  return apiFetch<TopicsResponse>("/api/topics", { signal });
}

/** موضوع بالمعرّف أو بالاسم المختصر — مع عناصره مرتبة حسب الحلقات. */
export function fetchTopic(
  idOrSlug: string,
  signal?: AbortSignal,
): Promise<TopicDetailResponse> {
  return apiFetch<TopicDetailResponse>(
    `/api/topics/${encodeURIComponent(idOrSlug)}`,
    { signal },
  );
}

export interface SearchParams {
  q: string;
  category?: Category;
  from?: string;
  to?: string;
  limit?: number;
  signal?: AbortSignal;
}

/** بحث خفيف (light=1) — بدون HTML المقالات. */
export function searchItems(params: SearchParams): Promise<ItemsResponse> {
  return apiFetch<ItemsResponse>(
    `/api/search${buildQuery({
      q: params.q,
      category: params.category,
      from: params.from,
      to: params.to,
      light: 1,
      limit: params.limit ?? 50,
    })}`,
    { signal: params.signal },
  );
}

/** زيادة عداد المشاهدات (مرة واحدة لكل فتح شاشة تفاصيل). */
export function postView(id: string): Promise<ViewResponse> {
  return apiFetch<ViewResponse>(`/api/items/${encodeURIComponent(id)}/view`, {
    method: "POST",
    noRetry: true,
  });
}

export function postContact(payload: ContactPayload): Promise<{ ok?: boolean }> {
  return apiFetch<{ ok?: boolean }>("/api/contact", {
    method: "POST",
    body: payload,
    noRetry: true,
  });
}

/** كل عناصر الموضوع (تستخدمها صفحة الموضوع مع الاستعلام الموحد). */
export type { Item, Topic };
