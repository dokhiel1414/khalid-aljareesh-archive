"use client";

import { useState } from "react";
import { Check, Copy, Link as LinkIcon, Share2 } from "lucide-react";
import { useToast } from "./ui/toast";

export default function CopyLinkButton({
  path,
  label = "نسخ الرابط",
  variant = "default",
}: {
  /** absolute path on the site, e.g. "/item/abc123" */
  path: string;
  label?: string;
  variant?: "default" | "icon" | "gold";
}) {
  const [copied, setCopied] = useState(false);
  const toast = useToast();

  function markCopied() {
    setCopied(true);
    toast("تم نسخ الرابط", "success");
    setTimeout(() => setCopied(false), 1800);
  }

  async function onClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    const url =
      typeof window !== "undefined"
        ? new URL(path, window.location.origin).toString()
        : path;
    try {
      // Try native share first (mobile)
      if (
        typeof navigator !== "undefined" &&
        (navigator as Navigator & { share?: unknown }).share &&
        /Mobi|Android/i.test(navigator.userAgent)
      ) {
        await (navigator as Navigator & { share: (d: ShareData) => Promise<void> }).share({
          url,
        });
        return;
      }
      await navigator.clipboard.writeText(url);
      markCopied();
    } catch {
      // Fallback: select-then-copy via a temporary element
      const ta = document.createElement("textarea");
      ta.value = url;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand("copy"); markCopied(); } catch {
        toast("تعذّر النسخ — انسخ الرابط من شريط المتصفح", "info");
      }
      document.body.removeChild(ta);
    }
  }

  if (variant === "icon") {
    return (
      <button
        type="button"
        onClick={onClick}
        title={copied ? "تم النسخ" : label}
        aria-label={label}
        className="inline-flex items-center justify-center h-8 w-8 rounded-lg text-ink/60 hover:text-ink hover:bg-ink/5 transition"
      >
        {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <LinkIcon className="h-4 w-4" />}
      </button>
    );
  }

  if (variant === "gold") {
    return (
      <button type="button" onClick={onClick} className="btn-gold">
        {copied ? <Check className="h-4 w-4" /> : <Share2 className="h-4 w-4" />}
        {copied ? "تم النسخ" : label}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className="btn-ghost text-ink hover:bg-ink/5"
    >
      {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
      {copied ? "تم النسخ" : label}
    </button>
  );
}
