"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";

/**
 * Mobile bottom sheet: slides up from the bottom edge (220ms ease-out),
 * closes on overlay click / Escape / close button. Handles scroll lock,
 * initial focus and focus restore. Desktop can use it too — the caller
 * decides visibility.
 */
export default function BottomSheet({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const restoreFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;
    restoreFocusRef.current = document.activeElement as HTMLElement | null;
    document.body.style.overflow = "hidden";
    const t = setTimeout(() => {
      panelRef.current?.querySelector<HTMLElement>("[data-autofocus]")?.focus();
    }, 60);
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => {
      clearTimeout(t);
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
      restoreFocusRef.current?.focus?.();
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label={title}>
      <button
        aria-label="إغلاق"
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-ink/45 backdrop-blur-sm anim-overlay-fade"
      />
      <div
        ref={panelRef}
        className="absolute inset-x-0 bottom-0 max-h-[85vh] overflow-y-auto overscroll-contain rounded-t-2xl bg-white dark:bg-dark-card border-t border-x border-ink/10 dark:border-dark-border shadow-card anim-sheet-up"
      >
        {/* Drag-handle affordance */}
        <div className="sticky top-0 z-10 bg-white/95 dark:bg-dark-card/95 backdrop-blur rounded-t-2xl">
          <div className="mx-auto mt-2.5 h-1 w-10 rounded-full bg-ink/15 dark:bg-sand/20" aria-hidden />
          <div className="flex items-center justify-between gap-2 px-4 pt-1.5 pb-2.5">
            <h2 className="font-display font-bold text-ink dark:text-sand">{title}</h2>
            <button
              onClick={onClose}
              aria-label="إغلاق"
              className="btn-ghost h-9 w-9 p-0"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
        <div className="px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-2">
          {children}
        </div>
      </div>
    </div>
  );
}
