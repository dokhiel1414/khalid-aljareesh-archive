"use client";

import { useEffect, useState } from "react";
import { Eye } from "lucide-react";
import { toArabicDigits } from "@/lib/utils";

/**
 * Bumps the per-item view counter when mounted (once per item per session),
 * and displays the running view count.
 */
export default function ItemViewTracker({
  itemId,
  initial,
}: {
  itemId: string;
  initial: number;
}) {
  const [count, setCount] = useState(initial);

  useEffect(() => {
    const key = `kj_view_${itemId}`;
    let counted = false;
    try { counted = sessionStorage.getItem(key) === "1"; } catch {}
    if (counted) return;
    (async () => {
      try {
        const r = await fetch(`/api/items/${itemId}/view`, {
          method: "POST",
          cache: "no-store",
        });
        const data = await r.json().catch(() => null);
        if (data && typeof data.viewCount === "number") setCount(data.viewCount);
        try { sessionStorage.setItem(key, "1"); } catch {}
      } catch {}
    })();
  }, [itemId]);

  return (
    <span className="inline-flex items-center gap-1.5 chip">
      <Eye className="h-3.5 w-3.5 text-brown" />
      {toArabicDigits(count.toLocaleString("en-US"))} مشاهدة
    </span>
  );
}
