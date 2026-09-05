"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  CornerDownLeft,
  Headphones,
  Library,
  Search,
  Users,
  Video,
  X,
} from "lucide-react";
import { CATEGORY_LABEL, toArabicDigits } from "@/lib/utils";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/* Context: lets any component (Navbar, Hero…) open the palette        */
/* ------------------------------------------------------------------ */

const PaletteContext = createContext<{ open: () => void }>({ open: () => {} });

export function useCommandPalette() {
  return useContext(PaletteContext);
}

/* ------------------------------------------------------------------ */

type PaletteItem = {
  id: string;
  kind: "link" | "result" | "recent" | "all-results";
  label: string;
  sublabel?: string;
  href?: string;
  category?: "AUDIO" | "VIDEO" | "WRITTEN";
  icon: React.ReactNode;
};

const CATEGORY_ICON = {
  AUDIO: <Headphones className="h-4 w-4 shrink-0 text-brown dark:text-gold" aria-hidden />,
  VIDEO: <Video className="h-4 w-4 shrink-0 text-brown dark:text-gold" aria-hidden />,
  WRITTEN: <BookOpen className="h-4 w-4 shrink-0 text-brown dark:text-gold" aria-hidden />,
};

const QUICK_LINKS: PaletteItem[] = [
  { id: "q-audio", kind: "link", label: "الصوتيات", sublabel: "المحاضرات والدروس", href: "/audio", icon: <Headphones className="h-4 w-4 shrink-0 text-brown dark:text-gold" aria-hidden /> },
  { id: "q-video", kind: "link", label: "المرئيات", sublabel: "المرئيات والبرامج المصوّرة", href: "/video", icon: <Video className="h-4 w-4 shrink-0 text-brown dark:text-gold" aria-hidden /> },
  { id: "q-written", kind: "link", label: "المقروءات", sublabel: "المقالات والكتب", href: "/written", icon: <BookOpen className="h-4 w-4 shrink-0 text-brown dark:text-gold" aria-hidden /> },
  { id: "q-topics", kind: "link", label: "المواضيع والبرامج", sublabel: "تصفّح حسب الموضوع", href: "/topics", icon: <Library className="h-4 w-4 shrink-0 text-brown dark:text-gold" aria-hidden /> },
  { id: "q-groups", kind: "link", label: "مجموعات التواصل", sublabel: "مجموعات واتساب وتيليجرام", href: "/groups", icon: <Users className="h-4 w-4 shrink-0 text-brown dark:text-gold" aria-hidden /> },
];

const RECENTS_KEY = "cmdk-recent";

function loadRecents(): string[] {
  try {
    const raw = localStorage.getItem(RECENTS_KEY);
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr.slice(0, 3) : [];
  } catch {
    return [];
  }
}

function saveRecent(q: string) {
  try {
    const next = [q, ...loadRecents().filter((r) => r !== q)].slice(0, 3);
    localStorage.setItem(RECENTS_KEY, JSON.stringify(next));
  } catch {
    /* ignore */
  }
}

/* ------------------------------------------------------------------ */

export default function CommandPalette({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const value = useMemo(() => ({ open }), [open]);

  /* Global open shortcuts: Ctrl/Cmd+K, and "/" when not typing in a field */
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null;
      const typing =
        !!target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "SELECT" ||
          target.isContentEditable);
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsOpen((v) => !v);
      } else if (e.key === "/" && !typing && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        setIsOpen(true);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <PaletteContext.Provider value={value}>
      {children}
      {isOpen && <PaletteOverlay onClose={close} />}
    </PaletteContext.Provider>
  );
}

/* ------------------------------------------------------------------ */

function PaletteOverlay({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [results, setResults] = useState<PaletteItem[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [active, setActive] = useState(0);
  const [recents, setRecents] = useState<PaletteItem[]>([]);

  const inputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const restoreFocusRef = useRef<HTMLElement | null>(null);

  /* Reset per-open state, lock scroll, autofocus input */
  useEffect(() => {
    restoreFocusRef.current = document.activeElement as HTMLElement | null;
    setRecents(loadRecents().map((r, i) => ({
      id: `r-${i}`,
      kind: "recent" as const,
      label: r,
      icon: <Search className="h-4 w-4 shrink-0 text-ink/50 dark:text-sand/50" aria-hidden />,
    })));
    document.body.style.overflow = "hidden";
    const t = setTimeout(() => inputRef.current?.focus(), 30);
    return () => {
      clearTimeout(t);
      document.body.style.overflow = "";
      restoreFocusRef.current?.focus?.();
    };
  }, []);

  /* Debounced live search (light payload, 8 rows) */
  useEffect(() => {
    const query = q.trim();
    if (!query) {
      setResults(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    const controller = new AbortController();
    const t = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/search?q=${encodeURIComponent(query)}&light=1&limit=8`,
          { signal: controller.signal },
        );
        const data = await res.json();
        setResults(
          (data.items ?? []).map((it: { id: string; title: string; category: "AUDIO" | "VIDEO" | "WRITTEN" }) => ({
            id: it.id,
            kind: "result" as const,
            label: it.title,
            sublabel: CATEGORY_LABEL[it.category],
            category: it.category,
            icon: CATEGORY_ICON[it.category],
          })),
        );
      } catch {
        if (!controller.signal.aborted) setResults([]);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 220);
    return () => {
      clearTimeout(t);
      controller.abort();
    };
  }, [q]);

  const actions = useMemo<PaletteItem[]>(() => {
    if (!q.trim()) return [];
    return [{
      id: "all-results",
      kind: "all-results",
      label: `عرض كل النتائج عن «${q.trim()}»`,
      href: `/search?q=${encodeURIComponent(q.trim())}`,
      icon: <Search className="h-4 w-4 shrink-0 text-ink/50 dark:text-sand/50" aria-hidden />,
    }];
  }, [q]);

  const list: PaletteItem[] = useMemo(() => {
    if (!q.trim()) return [...QUICK_LINKS, ...recents];
    return [...actions, ...(results ?? [])];
  }, [q, actions, results, recents]);

  /* Keep the highlighted row in range when the list changes */
  useEffect(() => {
    setActive(0);
  }, [list.length, q]);

  const go = useCallback(
    (item: PaletteItem) => {
      if (item.kind === "recent") {
        setQ(item.label);
        return;
      }
      if (item.kind === "all-results" && q.trim()) saveRecent(q.trim());
      if (item.href) {
        onClose();
        router.push(item.href);
      }
    },
    [onClose, q, router],
  );

  /* Global shortcuts: Ctrl/Cmd+K toggles, "/" opens (outside form fields) */
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        onClose();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  /* In-dialog keyboard handling */
  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") {
      e.preventDefault();
      onClose();
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => (list.length ? (a + 1) % list.length : 0));
      return;
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => (list.length ? (a - 1 + list.length) % list.length : 0));
      return;
    }
    if (e.key === "Enter") {
      e.preventDefault();
      const item = list[active];
      if (item) go(item);
      return;
    }
    if (e.key === "Tab") {
      // Minimal focus trap: keep Tab cycling inside the dialog panel.
      const panel = panelRef.current;
      if (!panel) return;
      const focusables = panel.querySelectorAll<HTMLElement>(
        'button, input, [tabindex]:not([tabindex="-1"])',
      );
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-[10vh] sm:pt-[12vh]"
      onKeyDown={onKeyDown}
    >
      {/* Overlay */}
      <button
        aria-label="إغلاق البحث السريع"
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-ink/45 backdrop-blur-sm anim-overlay-fade"
      />

      {/* Panel */}
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="بحث سريع في الأرشيف"
        className="relative w-full max-w-xl overflow-hidden rounded-2xl bg-white shadow-card border border-ink/10 dark:bg-dark-card dark:border-dark-border anim-palette-in"
      >
        {/* Input row */}
        <div className="flex items-center gap-2 border-b border-ink/10 dark:border-dark-border px-4">
          <Search className="h-4 w-4 shrink-0 text-ink/50 dark:text-sand/50" aria-hidden />
          <input
            ref={inputRef}
            type="text"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="ابحث في الصوتيات، المرئيات، المقالات…"
            aria-label="ابحث في الأرشيف"
            autoComplete="off"
            className="w-full bg-transparent py-3.5 outline-none text-ink dark:text-sand placeholder:text-ink/40 dark:placeholder:text-sand/40 text-sm"
          />
          {loading && (
            <span className="h-4 w-4 shrink-0 rounded-full border-2 border-gold border-t-transparent animate-spin" aria-hidden />
          )}
          <button
            onClick={onClose}
            aria-label="إغلاق"
            className="btn-ghost h-8 w-8 p-0 shrink-0"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Results */}
        <div
          role="listbox"
          aria-label="النتائج"
          className="max-h-[52vh] overflow-y-auto overscroll-contain p-2"
        >
          {list.length === 0 && (
            <div className="px-4 py-8 text-center text-sm text-muted">
              {loading ? "جاري البحث…" : "لا توجد نتائج مطابقة"}
            </div>
          )}
          {list.map((item, i) => (
            <div
              key={item.id}
              role="option"
              aria-selected={i === active}
              id={`cmdk-opt-${i}`}
              tabIndex={-1}
              onMouseEnter={() => setActive(i)}
              onClick={() => go(item)}
              className={cn(
                "flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors",
                i === active
                  ? "bg-gold/15 text-ink dark:text-sand"
                  : "text-ink/80 dark:text-sand/80",
              )}
            >
              {item.icon}
              <span className="min-w-0 flex-1">
                <span className="block truncate">{item.label}</span>
                {item.sublabel && (
                  <span className="block text-xs text-muted truncate">{item.sublabel}</span>
                )}
              </span>
              {i === active && (
                <CornerDownLeft className="h-3.5 w-3.5 shrink-0 text-muted" aria-hidden />
              )}
            </div>
          ))}
        </div>

        {/* Footer hints */}
        <div className="flex items-center justify-between gap-2 border-t border-ink/10 dark:border-dark-border bg-sand-2/60 dark:bg-dark-surface/40 px-4 py-2 text-[11px] text-muted">
          <span className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="rounded border border-ink/15 dark:border-dark-border bg-white dark:bg-dark-card px-1.5 py-0.5 font-sans">↑↓</kbd>
              تنقّل
            </span>
            <span className="flex items-center gap-1">
              <kbd className="rounded border border-ink/15 dark:border-dark-border bg-white dark:bg-dark-card px-1.5 py-0.5 font-sans">Enter</kbd>
              فتح
            </span>
            <span className="hidden sm:flex items-center gap-1">
              <kbd className="rounded border border-ink/15 dark:border-dark-border bg-white dark:bg-dark-card px-1.5 py-0.5 font-sans">Esc</kbd>
              إغلاق
            </span>
          </span>
          <span className="tabular-nums">
            {q.trim() && results
              ? `${toArabicDigits(results.length)} نتيجة`
              : ""}
          </span>
        </div>
      </div>
    </div>
  );
}
