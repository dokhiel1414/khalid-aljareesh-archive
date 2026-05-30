"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

export type Track = { id: string; title: string };

type Ctx = {
  current: Track | null;
  playing: boolean;
  loading: boolean;
  error: boolean;
  currentTime: number;
  duration: number;
  rate: number;
  /** Load a track (optionally autoplay). If it's already current, just toggles. */
  load: (track: Track, autoplay?: boolean) => void;
  toggle: () => void;
  seek: (t: number) => void;
  skip: (delta: number) => void;
  cycleRate: () => void;
  close: () => void;
  isActive: (id: string) => boolean;
};

const PlayerContext = createContext<Ctx | null>(null);

export function usePlayer(): Ctx {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error("usePlayer must be used within <AudioPlayerProvider>");
  return ctx;
}

const RATES = [1, 1.25, 1.5, 1.75, 2, 0.75];

export default function AudioPlayerProvider({ children }: { children: React.ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const autoplayRef = useRef(false);

  const [current, setCurrent] = useState<Track | null>(null);
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [rate, setRate] = useState(1);

  const src = current ? `/api/stream?id=${encodeURIComponent(current.id)}` : "";

  // Wire audio element events once.
  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    const onLoaded = () => {
      setDuration(a.duration || 0);
      setLoading(false);
      if (autoplayRef.current) {
        autoplayRef.current = false;
        a.play().catch(() => setError(true));
      }
    };
    const onTime = () => setCurrentTime(a.currentTime || 0);
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    const onEnded = () => setPlaying(false);
    const onWaiting = () => setLoading(true);
    const onPlaying = () => { setLoading(false); setError(false); };
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

  // Keep playbackRate in sync.
  useEffect(() => {
    if (audioRef.current) audioRef.current.playbackRate = rate;
  }, [rate, current]);

  const load = useCallback(
    (track: Track, autoplay = true) => {
      const a = audioRef.current;
      if (current && current.id === track.id) {
        // Same track — toggle.
        if (a) (a.paused ? a.play().catch(() => setError(true)) : a.pause());
        return;
      }
      setError(false);
      setLoading(true);
      setCurrentTime(0);
      setDuration(0);
      autoplayRef.current = autoplay;
      setCurrent(track);
    },
    [current],
  );

  const toggle = useCallback(() => {
    const a = audioRef.current;
    if (!a || !current) return;
    if (a.paused) a.play().catch(() => setError(true));
    else a.pause();
  }, [current]);

  const seek = useCallback((t: number) => {
    const a = audioRef.current;
    if (!a) return;
    a.currentTime = t;
    setCurrentTime(t);
  }, []);

  const skip = useCallback((delta: number) => {
    const a = audioRef.current;
    if (!a) return;
    a.currentTime = Math.max(0, Math.min((a.currentTime || 0) + delta, a.duration || 0));
  }, []);

  const cycleRate = useCallback(() => {
    setRate((r) => RATES[(RATES.indexOf(r) + 1) % RATES.length] || 1);
  }, []);

  const close = useCallback(() => {
    const a = audioRef.current;
    if (a) a.pause();
    setCurrent(null);
    setPlaying(false);
    setCurrentTime(0);
    setDuration(0);
  }, []);

  const isActive = useCallback((id: string) => current?.id === id, [current]);

  return (
    <PlayerContext.Provider
      value={{
        current, playing, loading, error, currentTime, duration, rate,
        load, toggle, seek, skip, cycleRate, close, isActive,
      }}
    >
      {children}
      {/* The single, persistent audio element for the whole app. */}
      {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
      <audio ref={audioRef} src={src} preload="metadata" />
    </PlayerContext.Provider>
  );
}
