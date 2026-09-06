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
  const [display, setDisplay] = useState<number | null>(null);

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
        if (!cancelled) {
          const value = Number(data.visits) || 0;
          setCount(value);
          countUp(value);
        }
        if (!alreadyPingedToday) {
          try { localStorage.setItem(STORAGE_KEY, day); } catch {}
        }
      } catch {
        if (!cancelled) { setCount(0); setDisplay(0); }
      }
    })();

    return () => { cancelled = true; };
  }, []);

  /** Ease-out count-up on first load — a small, purposeful delight
      (draws the eye to the community counter). Instant under
      prefers-reduced-motion. */
  function countUp(target: number) {
    if (
      typeof window === "undefined" ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      setDisplay(target);
      return;
    }
    const duration = 700;
    const start = performance.now();
    function step(now: number) {
      const p = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplay(Math.round(target * eased));
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  const shown = display ?? count;

  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-sand/70">
      <Eye className="h-3.5 w-3.5 text-gold" />
      عدد الزوار:
      <span className="font-medium text-sand tabular-nums">
        {shown === null || shown === undefined
          ? "…"
          : toArabicDigits(shown.toLocaleString("en-US"))}
      </span>
    </span>
  );
}
