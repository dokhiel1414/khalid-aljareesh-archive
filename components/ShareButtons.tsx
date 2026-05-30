"use client";

import { useState } from "react";
import { Check, Link as LinkIcon, Send, Share2 } from "lucide-react";

/** WhatsApp / Telegram / X share + copy link, for an item page. */
export default function ShareButtons({ url, title }: { url: string; title: string }) {
  const [copied, setCopied] = useState(false);
  const text = `${title}`;
  const enc = encodeURIComponent;

  const links = [
    {
      key: "whatsapp",
      label: "واتساب",
      href: `https://wa.me/?text=${enc(`${text}\n${url}`)}`,
      // WhatsApp brand glyph
      svg: (
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden>
          <path d="M.057 24l1.687-6.163a11.867 11.867 0 01-1.587-5.945C.16 5.335 5.495 0 12.05 0a11.82 11.82 0 018.413 3.488 11.82 11.82 0 013.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 01-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884a9.86 9.86 0 001.51 5.26l-.999 3.648 3.978-1.197zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.612-.916-2.207-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.247-.694.247-1.289.173-1.413z" />
        </svg>
      ),
      cls: "bg-[#25D366] text-white hover:brightness-95",
    },
    {
      key: "telegram",
      label: "تيليجرام",
      href: `https://t.me/share/url?url=${enc(url)}&text=${enc(text)}`,
      svg: <Send className="h-4 w-4" />,
      cls: "bg-[#229ED9] text-white hover:brightness-95",
    },
    {
      key: "x",
      label: "إكس",
      href: `https://twitter.com/intent/tweet?text=${enc(text)}&url=${enc(url)}`,
      svg: (
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden>
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      ),
      cls: "bg-ink text-sand hover:bg-ink-2",
    },
  ];

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="inline-flex items-center gap-1.5 text-sm text-muted ml-1">
        <Share2 className="h-4 w-4" />
        مشاركة:
      </span>
      {links.map((l) => (
        <a
          key={l.key}
          href={l.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`مشاركة عبر ${l.label}`}
          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium shadow-soft transition ${l.cls}`}
        >
          {l.svg}
          {l.label}
        </a>
      ))}
      <button
        onClick={copy}
        aria-label="نسخ الرابط"
        className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium border border-ink/15 dark:border-dark-border text-ink/80 dark:text-sand/80 hover:bg-ink/5 dark:hover:bg-white/10 transition"
      >
        {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <LinkIcon className="h-4 w-4" />}
        {copied ? "تم النسخ" : "نسخ الرابط"}
      </button>
    </div>
  );
}
