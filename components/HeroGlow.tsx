"use client";

import { useEffect, useRef } from "react";

/**
 * Two soft glow orbs floating over the hero backdrop with a whisper-quiet
 * mouse parallax (±14px). Desktop fine-pointer only; disabled entirely for
 * prefers-reduced-motion and touch devices — falls back to static orbs.
 */
export default function HeroGlow() {
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!window.matchMedia("(prefers-reduced-motion: no-preference)").matches)
      return;
    if (!window.matchMedia("(pointer: fine)").matches) return;

    let raf = 0;
    let targetX = 0;
    let targetY = 0;

    function onMove(e: MouseEvent) {
      targetX = e.clientX / window.innerWidth - 0.5;
      targetY = e.clientY / window.innerHeight - 0.5;
      if (!raf) raf = requestAnimationFrame(apply);
    }

    function apply() {
      raf = 0;
      const wrap = wrapRef.current;
      if (!wrap) return;
      const [a, b] = wrap.children;
      if (a instanceof HTMLElement) {
        a.style.transform = `translate3d(${targetX * 22}px, ${targetY * 14}px, 0)`;
      }
      if (b instanceof HTMLElement) {
        b.style.transform = `translate3d(${targetX * -16}px, ${targetY * -10}px, 0)`;
      }
    }

    window.addEventListener("mousemove", onMove, { passive: true });
    return () => {
      window.removeEventListener("mousemove", onMove);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div ref={wrapRef} className="pointer-events-none absolute inset-0" aria-hidden>
      <div className="absolute -top-28 right-[8%] h-[26rem] w-[26rem] rounded-full bg-gold/15 blur-3xl transition-transform duration-700 ease-out" />
      <div className="absolute -bottom-32 left-[4%] h-[24rem] w-[24rem] rounded-full bg-brown/15 blur-3xl transition-transform duration-700 ease-out" />
    </div>
  );
}
