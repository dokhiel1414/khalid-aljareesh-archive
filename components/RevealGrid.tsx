"use client";

import { Children, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { toArabicDigits } from "@/lib/utils";
import EmptyState from "./EmptyState";

/**
 * Renders a grid of cards but only paints `step` at a time, revealing more on
 * demand. Keeps the initial DOM small (faster first paint) for long lists.
 * Children are pre-rendered (server) ItemCard elements.
 *
 * Newly revealed batches fade-up with a small stagger; motion is disabled
 * for prefers-reduced-motion via the CSS animation guards in globals.css.
 */
export default function RevealGrid({
  children,
  step = 24,
}: {
  children: React.ReactNode;
  step?: number;
}) {
  const items = Children.toArray(children);
  const [count, setCount] = useState(step);
  const prevCount = useRef(step);

  if (items.length === 0) return <EmptyState />;

  const visible = items.slice(0, count);
  const remaining = items.length - count;
  const revealFrom = prevCount.current; // first index of the latest batch

  return (
    <>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {visible.map((child, i) =>
          i >= revealFrom ? (
            <div
              key={i}
              className="animate-fade-up"
              style={{ animationDelay: `${Math.min((i - revealFrom) * 35, 280)}ms` }}
              onAnimationEnd={() => {
                if (i === visible.length - 1) prevCount.current = count;
              }}
            >
              {child}
            </div>
          ) : (
            child
          ),
        )}
      </div>
      {remaining > 0 && (
        <div className="mt-10 flex flex-col items-center gap-2">
          <button
            onClick={() => {
              prevCount.current = count;
              setCount((c) => c + step);
            }}
            className="btn-primary"
          >
            <ChevronDown className="h-4 w-4" />
            تحميل المزيد
          </button>
          <span className="text-xs text-muted tabular-nums">
            عرض {toArabicDigits(visible.length)} من {toArabicDigits(items.length)}
          </span>
        </div>
      )}
    </>
  );
}
