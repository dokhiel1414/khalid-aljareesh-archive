"use client";

import { Play, Pause, Loader2, AudioLines } from "lucide-react";
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

/** Inline play affordance on an item page; drives the global persistent player. */
export default function LecturePlayCard({
  driveFileId,
  title,
}: {
  driveFileId: string;
  title?: string;
}) {
  const p = usePlayer();
  const active = p.isActive(driveFileId);
  const playing = active && p.playing;
  const loading = active && p.loading;
  const progress = active && p.duration > 0 ? (p.currentTime / p.duration) * 100 : 0;
  const trackBg = `linear-gradient(to left, #DEA470 0%, #DEA470 ${progress}%, rgba(236,230,221,0.25) ${progress}%, rgba(236,230,221,0.25) 100%)`;

  return (
    <div className="rounded-2xl bg-gradient-to-br from-ink to-ink-2 text-sand p-5 md:p-6 shadow-card">
      <div className="flex items-center gap-4">
        <button
          onClick={() => p.load({ id: driveFileId, title: title || "مقطع صوتي" })}
          aria-label={playing ? "إيقاف" : "تشغيل"}
          className="shrink-0 h-14 w-14 grid place-items-center rounded-full bg-gold text-ink shadow-card hover:bg-brown hover:text-sand transition active:scale-95"
        >
          {loading ? (
            <Loader2 className="h-6 w-6 animate-spin" />
          ) : playing ? (
            <Pause className="h-6 w-6" />
          ) : (
            <Play className="h-6 w-6 translate-x-[1px]" />
          )}
        </button>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 text-sm text-sand/85 mb-2">
            <AudioLines className="h-4 w-4 text-gold" />
            {playing ? "قيد التشغيل…" : active ? "متوقّف مؤقتاً" : "استمع الآن"}
          </div>
          {active ? (
            <div className="flex items-center gap-2">
              <input
                type="range"
                min={0}
                max={p.duration || 0}
                step={0.1}
                value={p.currentTime}
                onChange={(e) => p.seek(Number(e.target.value))}
                aria-label="موضع التشغيل"
                className="kjl-slider flex-1"
                style={{ background: trackBg }}
              />
              <span className="text-[11px] tabular-nums text-sand/70 w-24 text-center shrink-0">
                {fmt(p.currentTime)} / {fmt(p.duration)}
              </span>
            </div>
          ) : (
            <div className="h-1.5 rounded-full bg-white/15" />
          )}
        </div>
      </div>

      <p className="mt-3 text-[11px] text-sand/55">
        يستمرّ التشغيل في الشريط السفلي أثناء تصفّحك لبقية الموقع.
      </p>

      <style jsx>{`
        .kjl-slider {
          -webkit-appearance: none;
          appearance: none;
          height: 6px;
          border-radius: 9999px;
          outline: none;
          cursor: pointer;
        }
        .kjl-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 14px;
          height: 14px;
          background: #DEA470;
          border: 2px solid #fff;
          border-radius: 9999px;
          cursor: pointer;
        }
        .kjl-slider::-moz-range-thumb {
          width: 14px;
          height: 14px;
          background: #DEA470;
          border: 2px solid #fff;
          border-radius: 9999px;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
}
