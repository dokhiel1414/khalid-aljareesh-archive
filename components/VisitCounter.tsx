"use client";

import { useEffect, useState } from "react";
import { Eye } from "lucide-react";
import { toArabicDigits } from "@/lib/utils";

const STORAGE_KEY = "kj_last_visit_day";

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

/**
 * Hits /api/stats/visit on mount and shows the running total.
 * The server is the source of truth — it dedupes by (IP, day) so refreshing,
 * opening new tabs, or revisiting from the same device doesn't inflate the
 * count. The localStorage check below is just an optimization: if the same
 * browser already pinged today, we GET (read-only) instead of POSTing.
 */
export default function VisitCounter() {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    const day = todayKey();
    let alreadyPingedToday = false;
    try {
      alreadyPingedToday = localStorage.getItem(STORAGE_KEY) === day;
    } catch {}

    (async () => {
      try {
        const r = await fetch("/api/stats/visit", {
          method: alreadyPingedToday ? "GET" : "POST",
          cache: "no-store",
        });
        const data = await r.json().catch(() => ({ visits: 0 }));
        if (!cancelled) setCount(Number(data.visits) || 0);
        if (!alreadyPingedToday) {
          try { localStorage.setItem(STORAGE_KEY, day); } catch {}
        }
      } catch {
        if (!cancelled) setCount(0);
      }
    })();

    return () => { cancelled = true; };
  }, []);

  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-sand/70">
      <Eye className="h-3.5 w-3.5 text-gold" />
      عدد الزوار:
      <span className="font-medium text-sand tabular-nums">
        {count === null ? "…" : toArabicDigits(count.toLocaleString("en-US"))}
      </span>
    </span>
  );
}
