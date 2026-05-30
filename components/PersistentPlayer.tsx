"use client";

import { Play, Pause, RotateCcw, RotateCw, Loader2, X } from "lucide-react";
import { usePlayer } from "./AudioPlayerProvider";

function fmt(t: number): string {
  if (!Number.isFinite(t) || t < 0) return "00:00";
  const s = Math.floor(t);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  return h > 0 ? `${pad(h)}:${pad(m)}:${pad(sec)}` : `${pad(m)}:${pad(sec)}`;
}

export default function PersistentPlayer() {
  const p = usePlayer();
  if (!p.current) return null;

  const progress = p.duration > 0 ? (p.currentTime / p.duration) * 100 : 0;
  const trackBg = `linear-gradient(to left, #DEA470 0%, #DEA470 ${progress}%, rgba(236,230,221,0.25) ${progress}%, rgba(236,230,221,0.25) 100%)`;

  return (
    <>
    <div className="h-20" aria-hidden />
    <div className="fixed bottom-0 inset-x-0 z-50 bg-ink/95 dark:bg-dark-surface/95 backdrop-blur border-t border-gold/30 text-sand shadow-[0_-4px_24px_rgba(0,0,0,0.25)]">
      <div className="container py-2.5">
        <div className="flex items-center gap-3">
          <button
            onClick={() => p.skip(-10)}
            aria-label="رجوع 10 ثوانٍ"
            className="hidden sm:grid h-9 w-9 place-items-center rounded-full text-sand/70 hover:bg-white/10 transition"
          >
            <RotateCcw className="h-4 w-4" />
          </button>

          <button
            onClick={p.toggle}
            aria-label={p.playing ? "إيقاف" : "تشغيل"}
            className="shrink-0 h-11 w-11 grid place-items-center rounded-full bg-gold text-ink hover:bg-brown hover:text-sand transition active:scale-95"
          >
            {p.loading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : p.playing ? (
              <Pause className="h-5 w-5" />
            ) : (
              <Play className="h-5 w-5 translate-x-[1px]" />
            )}
          </button>

          <button
            onClick={() => p.skip(10)}
            aria-label="تقدّم 10 ثوانٍ"
            className="hidden sm:grid h-9 w-9 place-items-center rounded-full text-sand/70 hover:bg-white/10 transition"
          >
            <RotateCw className="h-4 w-4" />
          </button>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="h-1.5 w-1.5 rounded-full bg-gold animate-pulse shrink-0" />
              <span className="text-xs sm:text-sm font-medium truncate">{p.current.title}</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min={0}
                max={p.duration || 0}
                step={0.1}
                value={p.currentTime}
                onChange={(e) => p.seek(Number(e.target.value))}
                aria-label="موضع التشغيل"
                className="kjp-slider flex-1"
                style={{ background: trackBg }}
              />
              <span className="text-[10px] tabular-nums text-sand/70 w-24 text-center shrink-0">
                {fmt(p.currentTime)} / {fmt(p.duration)}
              </span>
            </div>
          </div>

          <button
            onClick={p.cycleRate}
            aria-label="السرعة"
            className="hidden sm:block text-xs font-medium px-2 py-1 rounded-lg border border-white/20 text-sand/80 hover:bg-white/10 transition tabular-nums shrink-0"
          >
            {p.rate}×
          </button>

          <button
            onClick={p.close}
            aria-label="إغلاق المشغّل"
            className="shrink-0 h-9 w-9 grid place-items-center rounded-full text-sand/60 hover:bg-white/10 transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      <style jsx>{`
        .kjp-slider {
          -webkit-appearance: none;
          appearance: none;
          height: 6px;
          border-radius: 9999px;
          outline: none;
          cursor: pointer;
        }
        .kjp-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 14px;
          height: 14px;
          background: #DEA470;
          border: 2px solid #fff;
          border-radius: 9999px;
          cursor: pointer;
        }
        .kjp-slider::-moz-range-thumb {
          width: 14px;
          height: 14px;
          background: #DEA470;
          border: 2px solid #fff;
          border-radius: 9999px;
          cursor: pointer;
        }
      `}</style>
    </div>
    </>
  );
}
