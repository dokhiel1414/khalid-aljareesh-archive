"use client";

import { useEffect, useRef, useState } from "react";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  RotateCcw,
  RotateCw,
  Loader2,
  AlertCircle,
} from "lucide-react";

type Props = {
  /** Drive file id — used to build the proxy URL. */
  driveFileId: string;
  title?: string;
};

function fmt(t: number): string {
  if (!Number.isFinite(t) || t < 0) return "00:00";
  const s = Math.floor(t);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  return h > 0 ? `${pad(h)}:${pad(m)}:${pad(sec)}` : `${pad(m)}:${pad(sec)}`;
}

export default function CustomAudioPlayer({ driveFileId, title }: Props) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [rate, setRate] = useState(1);

  const src = `/api/stream?id=${encodeURIComponent(driveFileId)}`;

  // Reset when source changes
  useEffect(() => {
    setPlaying(false);
    setLoading(true);
    setError(false);
    setCurrent(0);
    setDuration(0);
  }, [driveFileId]);

  // Wire up event handlers
  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    const onLoaded = () => {
      setDuration(a.duration || 0);
      setLoading(false);
    };
    const onTime = () => setCurrent(a.currentTime || 0);
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    const onEnded = () => setPlaying(false);
    const onWaiting = () => setLoading(true);
    const onPlaying = () => setLoading(false);
    const onCanPlay = () => setLoading(false);
    const onError = () => { setError(true); setLoading(false); };

    a.addEventListener("loadedmetadata", onLoaded);
    a.addEventListener("durationchange", onLoaded);
    a.addEventListener("timeupdate", onTime);
    a.addEventListener("play", onPlay);
    a.addEventListener("pause", onPause);
    a.addEventListener("ended", onEnded);
    a.addEventListener("waiting", onWaiting);
    a.addEventListener("playing", onPlaying);
    a.addEventListener("canplay", onCanPlay);
    a.addEventListener("error", onError);
    return () => {
      a.removeEventListener("loadedmetadata", onLoaded);
      a.removeEventListener("durationchange", onLoaded);
      a.removeEventListener("timeupdate", onTime);
      a.removeEventListener("play", onPlay);
      a.removeEventListener("pause", onPause);
      a.removeEventListener("ended", onEnded);
      a.removeEventListener("waiting", onWaiting);
      a.removeEventListener("playing", onPlaying);
      a.removeEventListener("canplay", onCanPlay);
      a.removeEventListener("error", onError);
    };
  }, []);

  function toggle() {
    const a = audioRef.current;
    if (!a) return;
    if (a.paused) a.play().catch(() => setError(true));
    else a.pause();
  }

  function seek(value: number) {
    const a = audioRef.current;
    if (!a || !Number.isFinite(duration)) return;
    a.currentTime = value;
    setCurrent(value);
  }

  function skip(delta: number) {
    const a = audioRef.current;
    if (!a) return;
    a.currentTime = Math.max(0, Math.min((a.currentTime || 0) + delta, duration || 0));
  }

  function changeVolume(v: number) {
    const a = audioRef.current;
    setVolume(v);
    if (a) {
      a.volume = v;
      if (v > 0 && muted) { setMuted(false); a.muted = false; }
    }
  }

  function toggleMute() {
    const a = audioRef.current;
    if (!a) return;
    const next = !muted;
    setMuted(next);
    a.muted = next;
  }

  function cycleRate() {
    const a = audioRef.current;
    const order = [1, 1.25, 1.5, 1.75, 2, 0.75];
    const next = order[(order.indexOf(rate) + 1) % order.length] || 1;
    setRate(next);
    if (a) a.playbackRate = next;
  }

  const progress = duration > 0 ? (current / duration) * 100 : 0;
  // RTL-friendly gradient — fill the *right* side as time advances.
  const trackBg = `linear-gradient(to left, #DEA470 0%, #DEA470 ${progress}%, rgba(7,44,73,0.15) ${progress}%, rgba(7,44,73,0.15) 100%)`;

  return (
    <div className="rounded-2xl bg-white dark:bg-dark-card border border-ink/10 dark:border-dark-border shadow-card overflow-hidden">
      {/* Title bar */}
      {title && (
        <div className="px-4 md:px-5 py-3 bg-ink dark:bg-dark-surface text-sand border-b border-ink/20 dark:border-dark-border">
          <div className="flex items-center gap-2 text-sm">
            <span className="h-2 w-2 rounded-full bg-gold animate-pulse" />
            <span className="font-medium truncate">{title}</span>
          </div>
        </div>
      )}

      <audio ref={audioRef} src={src} preload="metadata" />

      <div className="p-4 md:p-5">
        {error ? (
          <div className="flex items-center gap-3 text-red-700 dark:text-red-300">
            <AlertCircle className="h-5 w-5" />
            <div className="text-sm">
              تعذّر تشغيل الملف. تأكد أنه مشارَك «لأي شخص لديه الرابط».
            </div>
          </div>
        ) : (
          <>
            {/* Top row: play + time + speed */}
            <div className="flex items-center gap-3 md:gap-4">
              <button
                type="button"
                onClick={() => skip(-10)}
                aria-label="رجوع 10 ثوانٍ"
                title="رجوع 10 ثوانٍ"
                className="h-9 w-9 grid place-items-center rounded-full text-ink/70 dark:text-sand/70 hover:bg-ink/5 dark:hover:bg-white/10 transition"
              >
                <RotateCcw className="h-4 w-4" />
              </button>

              <button
                type="button"
                onClick={toggle}
                aria-label={playing ? "إيقاف" : "تشغيل"}
                className="h-12 w-12 md:h-14 md:w-14 grid place-items-center rounded-full bg-gold text-ink shadow-card hover:bg-brown hover:text-sand transition active:scale-95"
              >
                {loading && !error ? (
                  <Loader2 className="h-5 w-5 md:h-6 md:w-6 animate-spin" />
                ) : playing ? (
                  <Pause className="h-5 w-5 md:h-6 md:w-6" />
                ) : (
                  <Play className="h-5 w-5 md:h-6 md:w-6 translate-x-[1px]" />
                )}
              </button>

              <button
                type="button"
                onClick={() => skip(10)}
                aria-label="تقدّم 10 ثوانٍ"
                title="تقدّم 10 ثوانٍ"
                className="h-9 w-9 grid place-items-center rounded-full text-ink/70 dark:text-sand/70 hover:bg-ink/5 dark:hover:bg-white/10 transition"
              >
                <RotateCw className="h-4 w-4" />
              </button>

              <div className="flex-1 flex items-center gap-2 text-xs tabular-nums text-ink/70 dark:text-sand/70">
                <span className="w-12 text-center">{fmt(current)}</span>
                <span className="text-ink/30 dark:text-sand/30">/</span>
                <span className="w-12 text-center">{fmt(duration)}</span>
              </div>

              <button
                type="button"
                onClick={cycleRate}
                aria-label="السرعة"
                title="السرعة"
                className="text-xs font-medium px-2.5 py-1 rounded-lg border border-ink/15 dark:border-dark-border text-ink/80 dark:text-sand/80 hover:bg-ink/5 dark:hover:bg-white/10 transition tabular-nums"
              >
                {rate}×
              </button>
            </div>

            {/* Progress bar */}
            <div className="mt-4">
              <input
                type="range"
                min={0}
                max={duration || 0}
                step={0.1}
                value={current}
                onChange={(e) => seek(Number(e.target.value))}
                aria-label="موضع التشغيل"
                className="kj-slider w-full"
                style={{ background: trackBg }}
              />
            </div>

            {/* Volume row */}
            <div className="mt-3 flex items-center gap-2">
              <button
                type="button"
                onClick={toggleMute}
                aria-label={muted ? "إلغاء الكتم" : "كتم الصوت"}
                className="h-8 w-8 grid place-items-center rounded-lg text-ink/60 dark:text-sand/60 hover:bg-ink/5 dark:hover:bg-white/10 transition"
              >
                {muted || volume === 0 ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              </button>
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={muted ? 0 : volume}
                onChange={(e) => changeVolume(Number(e.target.value))}
                aria-label="مستوى الصوت"
                className="kj-slider w-32 max-w-[40%]"
                style={{
                  background: `linear-gradient(to left, #C17E5A 0%, #C17E5A ${(muted ? 0 : volume) * 100}%, rgba(7,44,73,0.15) ${(muted ? 0 : volume) * 100}%, rgba(7,44,73,0.15) 100%)`,
                }}
              />
            </div>
          </>
        )}
      </div>

      {/* Slider styling — keeps a consistent gold thumb across browsers */}
      <style jsx>{`
        .kj-slider {
          -webkit-appearance: none;
          appearance: none;
          height: 8px;
          border-radius: 9999px;
          outline: none;
          cursor: pointer;
        }
        .kj-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 16px;
          height: 16px;
          background: #DEA470;
          border: 2px solid #fff;
          border-radius: 9999px;
          box-shadow: 0 2px 6px rgba(7,44,73,0.25);
          cursor: pointer;
          transition: transform 0.15s ease;
        }
        .kj-slider::-webkit-slider-thumb:hover { transform: scale(1.1); }
        .kj-slider::-moz-range-thumb {
          width: 16px;
          height: 16px;
          background: #DEA470;
          border: 2px solid #fff;
          border-radius: 9999px;
          box-shadow: 0 2px 6px rgba(7,44,73,0.25);
          cursor: pointer;
        }
      `}</style>
    </div>
  );
}
