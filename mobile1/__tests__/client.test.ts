/**
 * اختبارات عميل API المركزي — نجاح، أخطاء خادم، مهلات، إلغاء، إعادة محاولة.
 */

import { ApiError, apiFetch } from "@/api/client";
import { API_BASE_URL } from "@/constants/site";

type FetchMock = jest.Mock;

function okResponse<T>(data: T): { ok: boolean; status: number; json: () => Promise<T> } {
  return { ok: true, status: 200, json: async () => data };
}

function errorResponse(status: number, error: string) {
  return { ok: false, status, json: async () => ({ error }) };
}

beforeEach(() => {
  jest.restoreAllMocks();
});

describe("apiFetch", () => {
  it("يرجع البيانات ويبني الرابط من القاعدة المركزية", async () => {
    const fetchMock = jest.fn().mockResolvedValue(okResponse({ items: [1, 2] }));
    global.fetch = fetchMock as unknown as typeof fetch;

    await expect(apiFetch<{ items: number[] }>("/api/items")).resolves.toEqual({
      items: [1, 2],
    });
    expect(fetchMock).toHaveBeenCalledWith(
      `${API_BASE_URL}/api/items`,
      expect.objectContaining({ method: "GET" }),
    );
  });

  it("يرمي ApiError مع الحالة على 404 دون إعادة محاولة", async () => {
    const fetchMock: FetchMock = jest
      .fn()
      .mockResolvedValue(errorResponse(404, "غير موجود"));
    global.fetch = fetchMock as unknown as typeof fetch;

    const promise = apiFetch("/api/items/nope");
    await expect(promise).rejects.toBeInstanceOf(ApiError);
    await expect(promise).rejects.toMatchObject({ status: 404, message: "غير موجود" });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("يعيد المحاولة مرتين على خطأ الشبكة ثم ينجح", async () => {
    jest.useFakeTimers();
    const fetchMock: FetchMock = jest
      .fn()
      .mockRejectedValueOnce(new TypeError("Network request failed"))
      .mockRejectedValueOnce(new TypeError("Network request failed"))
      .mockResolvedValueOnce(okResponse({ items: [] }));
    global.fetch = fetchMock as unknown as typeof fetch;

    const promise = apiFetch<{ items: unknown[] }>("/api/items");
    await jest.advanceTimersByTimeAsync(600);
    await jest.advanceTimersByTimeAsync(1800);

    await expect(promise).resolves.toEqual({ items: [] });
    expect(fetchMock).toHaveBeenCalledTimes(3);
    jest.useRealTimers();
  });

  it("يلغي برسالة عربية عند طلب الإلغاء", async () => {
    const controller = new AbortController();
    let rejectFetch!: (e: Error) => void;
    const fetchMock: FetchMock = jest.fn(
      () =>
        new Promise((_resolve, reject) => {
          rejectFetch = reject;
        }),
    );
    global.fetch = fetchMock as unknown as typeof fetch;

    const promise = apiFetch("/api/search?q=x", { signal: controller.signal });
    controller.abort();
    rejectFetch(new DOMException("Aborted", "AbortError"));

    await expect(promise).rejects.toMatchObject({ message: "أُلغيت العملية." });
  });

  it("لا يعيد محاولة طلبات الكتابة (POST)", async () => {
    const fetchMock: FetchMock = jest
      .fn()
      .mockRejectedValue(new TypeError("Network request failed"));
    global.fetch = fetchMock as unknown as typeof fetch;

    await expect(
      apiFetch("/api/contact", { method: "POST", body: { message: "س" } }),
    ).rejects.toBeInstanceOf(ApiError);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
