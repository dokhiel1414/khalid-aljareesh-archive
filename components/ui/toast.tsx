"use client";

import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
} from "react";
import { CheckCircle2, Info } from "lucide-react";
import { cn } from "@/lib/utils";

type ToastVariant = "info" | "success";

type ToastItem = {
  id: number;
  message: string;
  variant: ToastVariant;
  exiting: boolean;
};

type ToastFn = {
  (message: string, variant?: ToastVariant): void;
};

const ToastContext = createContext<ToastFn>(() => {});

export function useToast() {
  return useContext(ToastContext);
}

const VARIANT_ICON: Record<ToastVariant, React.ReactNode> = {
  info: <Info className="h-4 w-4 shrink-0 text-gold" aria-hidden />,
  success: <CheckCircle2 className="h-4 w-4 shrink-0 text-gold" aria-hidden />,
};

export default function ToastProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const nextId = useRef(1);

  const remove = useCallback((id: number) => {
    setToasts((list) => list.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback<ToastFn>(
    (message, variant = "info") => {
      const id = nextId.current++;
      setToasts((list) => [...list.slice(-2), { id, message, variant, exiting: false }]);
      // Auto-dismiss — short, per the ≤300ms motion doctrine the dwell time
      // should feel snappy; 2.4s is enough to read a short Arabic message.
      setTimeout(() => {
        setToasts((list) =>
          list.map((t) => (t.id === id ? { ...t, exiting: true } : t)),
        );
        setTimeout(() => remove(id), 160);
      }, 2400);
    },
    [remove],
  );

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-4 z-[70] flex flex-col items-center gap-2 px-4"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            onAnimationEnd={(e) => {
              if (t.exiting && e.animationName === "toast-out") remove(t.id);
            }}
            className={cn(
              "pointer-events-auto flex max-w-sm items-center gap-2 rounded-xl bg-ink px-4 py-2.5 text-sm text-sand shadow-card",
              "dark:bg-dark-card dark:border dark:border-dark-border",
              t.exiting ? "anim-toast-out" : "anim-toast-in",
            )}
          >
            {VARIANT_ICON[t.variant]}
            <span>{t.message}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
