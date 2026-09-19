/**
 * عميل API مركزي — النقطة الوحيدة للاتصال بخادم الموقع.
 * - مهلة 15 ثانية مع إلغاء عبر AbortSignal (البحث الحي يلغي الطلب السابق)
 * - إعادة محاولة مرتين لطلبات GET على أخطاء الشبكة/5xx (تراجع تصاعدي)
 * - أخطاء معرّبة موحّدة ApiError
 */

import { API_BASE_URL } from "@/constants/site";

const TIMEOUT_MS = 15_000;
const MAX_RETRIES = 2;
const RETRY_DELAYS = [600, 1800];

export class ApiError extends Error {
  readonly status: number | null;

  constructor(message: string, status: number | null = null) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

function isRetryable(status: number | null, error: unknown): boolean {
  if (error instanceof ApiError) return false; // خطأ خادم صريح — لا فائدة
  if (status === null) return true; // خطأ شبكة
  return status >= 500;
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export interface RequestOptions {
  method?: "GET" | "POST";
  body?: unknown;
  signal?: AbortSignal;
  /** تعطيل إعادة المحاولة (لطلبات الكتابة). */
  noRetry?: boolean;
}

/**
 * طلب JSON مع مهلة زمنية. يرمي ApiError برسالة عربية مناسبة للعرض.
 * يُمرر signal لدمج إلغاء المتصل مع مهلة العميل.
 */
export async function apiFetch<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { method = "GET", body, signal, noRetry } = options;
  const url = `${API_BASE_URL}${path}`;
  const maxAttempts = method === "GET" && !noRetry ? MAX_RETRIES + 1 : 1;

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);
    const onOuterAbort = () => controller.abort();
    signal?.addEventListener("abort", onOuterAbort);

    try {
      const response = await fetch(url, {
        method,
        signal: controller.signal,
        headers: body ? { "Content-Type": "application/json" } : undefined,
        body: body ? JSON.stringify(body) : undefined,
      });

      if (!response.ok) {
        let message = "حدث خطأ في الاتصال بالخادم.";
        try {
          const data = (await response.json()) as { error?: string };
          if (data.error) message = data.error;
        } catch {
          // استجابة غير JSON — الرسالة الافتراضية كافية.
        }
        throw new ApiError(message, response.status);
      }

      return (await response.json()) as T;
    } catch (error) {
      if (signal?.aborted) throw new ApiError("أُلغيت العملية.", null);
      if (error instanceof ApiError) {
        // خطأ 404/401/... — لا إعادة محاولة.
        throw error;
      }
      const aborted = controller.signal.aborted; // مهلة انتهت
      const retryable = isRetryable(null, error) && attempt < maxAttempts - 1;
      if (!retryable) {
        if (aborted && attempt === maxAttempts - 1) {
          throw new ApiError("تعذّر الاتصال — تحقق من الشبكة.", null);
        }
        throw error instanceof ApiError
          ? error
          : new ApiError("تعذّر الاتصال — تحقق من الشبكة.", null);
      }
      await delay(RETRY_DELAYS[Math.min(attempt, RETRY_DELAYS.length - 1)]);
    } finally {
      clearTimeout(timeout);
      signal?.removeEventListener("abort", onOuterAbort);
    }
  }

  throw new ApiError("تعذّر الاتصال — تحقق من الشبكة.", null);
}

/** بناء سلسلة استعلام آمنة. */
export function buildQuery(
  params: Record<string, string | number | undefined | null>,
): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== "") {
      search.set(key, String(value));
    }
  }
  const qs = search.toString();
  return qs ? `?${qs}` : "";
}
