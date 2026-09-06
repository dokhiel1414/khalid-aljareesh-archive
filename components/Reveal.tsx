"use client";

import { useEffect, useRef } from "react";

/**
 * Scroll-reveal wrapper (transitions.dev "skeleton and reveal" pattern,
 * tuned to the skill's subtle tier: y-offset 14px, ~500ms, ease-out).
 *
 * - Content is server-rendered and stays in the DOM (SEO-safe).
 * - Without JS the `html.js` class is absent, so content is always visible.
 * - prefers-reduced-motion reveals instantly (CSS guard in globals.css).
 */
export default function Reveal({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  /** extra transition delay in ms — for small staggers (keep ≤ 3 steps) */
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      !("IntersectionObserver" in window)
    ) {
      el.classList.add("revealed");
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("revealed");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -6% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      data-reveal
      className={className}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </div>
  );
}
