"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  variant?: "hero" | "default";
  compact?: boolean;
};

export default function SearchBar({ variant = "default", compact = false }: Props) {
  const router = useRouter();
  const params = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [q, setQ] = useState(params.get("q") ?? "");
  const [category, setCategory] = useState(params.get("category") ?? "ALL");
  const [from, setFrom] = useState(params.get("from") ?? "");
  const [to, setTo] = useState(params.get("to") ?? "");
  const [advanced, setAdvanced] = useState(false);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const sp = new URLSearchParams();
    if (q.trim()) sp.set("q", q.trim());
    if (category && category !== "ALL") sp.set("category", category);
    if (from) sp.set("from", from);
    if (to) sp.set("to", to);
    startTransition(() => {
      router.push(`/search${sp.toString() ? `?${sp.toString()}` : ""}`);
    });
  }

  const isHero = variant === "hero";

  return (
    <form onSubmit={submit} className="w-full">
      <div
        className={cn(
          "flex items-center gap-2 rounded-2xl bg-white dark:bg-dark-card border shadow-soft overflow-hidden",
          isHero
            ? "border-white/30 p-2 ring-1 ring-white/10"
            : "border-ink/10 dark:border-dark-border p-1.5",
          compact && "p-1",
        )}
      >
        <div className="pl-2 pr-2 text-ink/50 dark:text-sand/50 shrink-0">
          <Search className="h-4 w-4" />
        </div>
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={compact ? "ابحث…" : "ابحث في الصوتيات، المرئيات، المقالات…"}
          className="flex-1 min-w-0 bg-transparent py-2 outline-none text-ink dark:text-sand placeholder:text-ink/40 dark:placeholder:text-sand/40 text-sm"
        />
        {!compact && (
          <button
            type="button"
            onClick={() => setAdvanced((v) => !v)}
            aria-label="بحث متقدم"
            className="hidden md:inline-flex btn-ghost h-9 px-3 shrink-0"
          >
            <SlidersHorizontal className="h-4 w-4" /> فلترة
          </button>
        )}
        <button
          type="submit"
          disabled={isPending}
          className={cn("btn-gold shrink-0", compact ? "h-8 px-3 text-sm" : "h-9 px-4")}
        >
          {isPending ? "…" : "بحث"}
        </button>
      </div>

      {!compact && advanced && (
        <div className="mt-3 grid gap-3 md:grid-cols-3 bg-white border border-ink/10 rounded-2xl p-3 shadow-soft">
          <div>
            <label className="label">الفئة</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="input"
            >
              <option value="ALL">جميع الفئات</option>
              <option value="AUDIO">صوتيات</option>
              <option value="VIDEO">مرئيات</option>
              <option value="WRITTEN">مقالات</option>
            </select>
          </div>
          <div>
            <label className="label">من تاريخ</label>
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="input"
            />
          </div>
          <div>
            <label className="label">إلى تاريخ</label>
            <input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="input"
            />
          </div>
        </div>
      )}
    </form>
  );
}
