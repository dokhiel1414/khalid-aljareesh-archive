"use client";

import { useEffect, useState } from "react";
import { CalendarDays } from "lucide-react";
import { formatHijriDate } from "@/lib/utils";

/**
 * Renders today's Hijri (Umm al-Qura) date — computed on the client so it
 * always reflects the visitor's "today" without static-rendering hiccups.
 */
export default function HijriToday({ compact = false }: { compact?: boolean }) {
  const [text, setText] = useState<string>("");

  useEffect(() => {
    setText(formatHijriDate(new Date()));
    const id = setInterval(() => setText(formatHijriDate(new Date())), 60_000);
    return () => clearInterval(id);
  }, []);

  if (!text) {
    return (
      <span className={compact ? "h-5 w-32 bg-white/10 rounded animate-pulse inline-block" : "h-6 w-44 bg-white/10 rounded animate-pulse inline-block"} />
    );
  }

  // The Hijri strip lives on a dark background (bg-ink) in both light and
  // dark themes — always render with sand-toned text for contrast.
  return (
    <span className={`inline-flex items-center gap-1.5 ${compact ? "text-xs" : "text-sm"} text-sand/90 tabular-nums`}>
      <CalendarDays className={compact ? "h-3.5 w-3.5 text-gold" : "h-4 w-4 text-gold"} />
      {text}
    </span>
  );
}
