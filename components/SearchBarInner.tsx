"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import BottomSheet from "./ui/BottomSheet";
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
  const [sheetOpen, setSheetOpen] = useState(false);

  function applyFilters() {
    const sp = new URLSearchParams();
    if (q.trim()) sp.set("q", q.trim());
    if (category && category !== "ALL") sp.set("category", category);
    if (from) sp.set("from", from);
    if (to) sp.set("to", to);
    setSheetOpen(false);
    startTransition(() => {
      router.push(`/search${sp.toString() ? `?${sp.toString()}` : ""}`);
    });
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    applyFilters();
  }

  const isHero = variant === "hero";
  const activeFilters =
    (category !== "ALL" ? 1 : 0) + (from ? 1 : 0) + (to ? 1 : 0);

  const filterFields = (
    <>
      <div>
        <label className="label" htmlFor="filter-category">الفئة</label>
        <select
          id="filter-category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="input"
          data-autofocus
        >
          <option value="ALL">جميع الفئات</option>
          <option value="AUDIO">صوتيات</option>
          <option value="VIDEO">مرئيات</option>
          <option value="WRITTEN">مقالات</option>
        </select>
      </div>
      <div>
        <label className="label" htmlFor="filter-from">من تاريخ</label>
        <input
          id="filter-from"
          type="date"
          value={from}
          onChange={(e) => setFrom(e.target.value)}
          className="input"
        />
      </div>
      <div>
        <label className="label" htmlFor="filter-to">إلى تاريخ</label>
        <input
          id="filter-to"
          type="date"
          value={to}
          onChange={(e) => setTo(e.target.value)}
          className="input"
        />
      </div>
    </>
  );

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
        {/* Mobile: filters open in a bottom sheet (44px touch target) */}
        {!compact && (
          <button
            type="button"
            onClick={() => setSheetOpen(true)}
            aria-label={`الفلاتر${activeFilters ? ` (${activeFilters} مفعّلة)` : ""}`}
            className={cn(
              "relative md:hidden inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border transition",
              activeFilters
                ? "border-gold/60 bg-gold/15 text-ink dark:text-sand"
                : "border-ink/10 dark:border-dark-border text-ink/60 dark:text-sand/60",
            )}
          >
            <SlidersHorizontal className="h-4 w-4" />
            {activeFilters > 0 && (
              <span
                aria-hidden
                className="absolute -top-1 -left-1 h-4 min-w-4 px-1 rounded-full bg-gold text-ink text-[10px] font-bold grid place-items-center tabular-nums"
              >
                {activeFilters}
              </span>
            )}
          </button>
        )}
        {!compact && (
          <button
            type="button"
            onClick={() => setAdvanced((v) => !v)}
            aria-label="بحث متقدم"
            aria-expanded={advanced}
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

      {/* Desktop: inline advanced panel */}
      {!compact && advanced && (
        <div className="mt-3 grid gap-3 md:grid-cols-3 bg-white border border-ink/10 rounded-2xl p-3 shadow-soft">
          {filterFields}
        </div>
      )}

      {/* Mobile: bottom sheet with the same fields + actions.
          A plain div (not <form>) — the sheet is nested inside the outer form. */}
      {!compact && (
        <BottomSheet
          open={sheetOpen}
          onClose={() => setSheetOpen(false)}
          title="فلاتر البحث"
        >
          <div className="grid gap-3">
            {filterFields}
            <div className="flex items-center gap-2 pt-1">
              <button type="button" onClick={applyFilters} className="btn-primary flex-1">
                تطبيق الفلاتر
              </button>
              <button
                type="button"
                className="btn-ghost"
                onClick={() => {
                  setCategory("ALL");
                  setFrom("");
                  setTo("");
                }}
              >
                مسح
              </button>
            </div>
          </div>
        </BottomSheet>
      )}
    </form>
  );
}
