/**
 * المحرك الصوتي العالمي — مصدر الحقيقة الوحيد للتشغيل في التطبيق كله.
 *
 * قرار معماري: مخزن zustand + محرك expo-audio في وحدة واحدة (state + side effects
 * متلازمان) حتى لا توجد دورات استيراد، وكل الشاشات تقرأ/تأمر من هنا فقط.
 * - createAudioPlayer خارج React: يعيش عبر الشاشات كلها (لا يتحرر عند unmount)
 * - تشغيل خلفي + إشعار وسائط + شاشة قفل عبر setActiveForLockScreen
 * - حفظ موضع الاستماع دورياً + استئناف تلقائي
 * - السابق/التالي داخل قائمة التشغيل (برنامج/فئة/نتائج بحث)
 */

import { create } from "zustand";
import {
  createAudioPlayer,
  setAudioModeAsync,
  type AudioPlayer,
  type AudioStatus,
} from "expo-audio";
import { Image } from "react-native";

import { SHEIKH_NAME } from "@/constants/site";
import { resolveStreamUrl } from "@/utils/drive";
import { getDownloadLocalUri } from "./downloads";
import { useLibraryStore, recordListening } from "@/store/libraryStore";
import { fetchArtworkForLockScreen } from "./artwork";

export type PlayerStatus =
  | "idle"
  | "loading"
  | "playing"
  | "paused"
  | "buffering"
  | "error";

/** عنصر قائمة التشغيل — حقول خفيفة فقط (بدون content). */
export interface QueueEntry {
  id: string;
  title: string;
  category: "AUDIO" | "VIDEO" | "WRITTEN";
  driveFileId: string | null;
  driveLink: string | null;
  thumbnail: string | null;
}

export const PLAYBACK_RATES = [0.75, 1, 1.25, 1.5, 1.75, 2] as const;

interface PlayerState {
  queue: QueueEntry[];
  index: number;
  status: PlayerStatus;
  position: number; // ثوانٍ
  duration: number; // ثوانٍ
  rate: number;
  error: string | null;

  playQueue: (entries: QueueEntry[], startIndex: number) => void;
  /** القفز إلى عنصر داخل قائمة التشغيل الحالية. */
  jumpTo: (index: number) => void;
  toggle: () => void;
  seekTo: (seconds: number) => void;
  seekBy: (deltaSeconds: number) => void;
  skipNext: () => void;
  skipPrev: () => void;
  setRate: (rate: number) => void;
  stop: () => void;
}

// ─── نسخة المشغّل الوحيدة (تُنشأ عند أول استخدام) ─────────────────────────
let player: AudioPlayer | null = null;
let audioModeReady = false;

function getPlayer(): AudioPlayer {
  if (!player) {
    player = createAudioPlayer(null, { updateInterval: 1 });
  }
  return player;
}

async function ensureAudioMode(): Promise<void> {
  if (audioModeReady) return;
  try {
    await setAudioModeAsync({
      playsInSilentMode: true,
      shouldPlayInBackground: true,
      interruptionMode: "doNotMix", // تركيز صوتي صحيح + تحكم شاشة القفل
      allowsRecording: false,
    });
    audioModeReady = true;
  } catch {
    // بعض الأجهزة ترفض الوضع — التشغيل يعمل افتراضياً.
  }
}

export function initAudioEngine(): void {
  void ensureAudioMode();
}

// ─── المخزن ────────────────────────────────────────────────────────────────
export const usePlayerStore = create<PlayerState>()((set, get) => {
  /** تشغيل مدخل الفهرس الحالي (يُستدعى عند تغيير قائمة/فهرس). */
  const loadCurrent = async (state: PlayerState, resume: boolean) => {
    const entry = state.queue[state.index];
    if (!entry) return;
    const p = getPlayer();
    await ensureAudioMode();

    const localUri = await getDownloadLocalUri(entry.id);
    const sourceUri = localUri ?? resolveStreamUrl(entry.driveFileId, entry.driveLink);
    if (!sourceUri) {
      set({ status: "error", error: "لا يوجد مصدر صوت لهذه المادة." });
      return;
    }

    set({ status: "loading", error: null, position: 0 });
    // سجل الاستماع: يُسجَّل عند بدء التحميل (عنوان + فئة + مصغرة).
    recordListening(entry.id, {
      title: entry.title,
      category: entry.category,
      thumbnail: entry.thumbnail,
      driveFileId: entry.driveFileId,
      driveLink: entry.driveLink,
    });
    try {
      p.replace({ uri: sourceUri });
      void applyLockScreenArtwork(entry);
      p.play();
      if (resume) {
        // استئناف من آخر موضع — بعد اكتمال التحميل.
        void resumeFromSaved(entry.id, p);
      }
    } catch {
      set({ status: "error", error: "تعذّر تشغيل الصوت." });
    }
  };

  const updateFromStatus = (status: AudioStatus) => {
    const { queue, index, status: current } = get();
    set((s) => ({
      position: Number.isFinite(status.currentTime) ? status.currentTime : s.position,
      duration: Number.isFinite(status.duration) && status.duration > 0 ? status.duration : s.duration,
    }));

    if (status.isBuffering) {
      if (current !== "loading") set({ status: "buffering" });
      return;
    }
    if (status.playing) {
      if (current !== "playing") set({ status: "playing" });
      schedulePositionSave(queue[index]?.id, status.currentTime);
      return;
    }
    if (status.didJustFinish) {
      const next = queue[index + 1];
      if (next) {
        set({ index: index + 1 });
      } else {
        set({ status: "paused", position: status.duration });
      }
      return;
    }
    if (current !== "paused" && current !== "error" && current !== "loading") {
      set({ status: "paused" });
    }
  };

  // اشتراك واحد مدى الحياة في أحداث التشغيل.
  getPlayer().addListener("playbackStatusUpdate", updateFromStatus);

  return {
    queue: [],
    index: 0,
    status: "idle",
    position: 0,
    duration: 0,
    rate: 1,
    error: null,

    playQueue: (entries, startIndex) => {
      if (entries.length === 0) return;
      const state = get();
      const p = getPlayer();
      const sameQueue =
        state.queue.length === entries.length &&
        state.queue[0]?.id === entries[0]?.id &&
        state.queue[state.index]?.id === entries[startIndex]?.id;
      if (sameQueue && state.status !== "error") {
        p.play();
        set({ status: "playing" });
        return;
      }
      set({ queue: entries, index: startIndex, rate: state.rate });
      void loadCurrent(get(), true);
    },

    jumpTo: (index) => {
      const { queue } = get();
      if (index < 0 || index >= queue.length) return;
      set({ index });
      void loadCurrent(get(), true);
    },

    toggle: () => {
      const { status } = get();
      const p = getPlayer();
      if (status === "playing") {
        p.pause();
        set({ status: "paused" });
      } else if (status === "paused" || status === "buffering") {
        void ensureAudioMode().then(() => p.play());
        set({ status: "playing" });
      } else if (status === "idle" || status === "error") {
        void loadCurrent(get(), true);
      }
    },

    seekTo: (seconds) => {
      const { duration, status } = get();
      const clamped = Math.min(Math.max(seconds, 0), Math.max(duration, 0));
      const p = getPlayer();
      p.seekTo(clamped);
      set({ position: clamped });
      if (status === "paused" || status === "idle") void loadCurrent(get(), false);
    },

    seekBy: (deltaSeconds) => {
      const { position } = get();
      get().seekTo(position + deltaSeconds);
    },

    skipNext: () => {
      const { queue, index } = get();
      if (index < queue.length - 1) set({ index: index + 1 });
      void loadCurrent(get(), false);
    },

    skipPrev: () => {
      const { index, position } = get();
      if (position > 3 || index === 0) {
        get().seekTo(0);
        return;
      }
      set({ index: index - 1 });
      void loadCurrent(get(), false);
    },

    setRate: (rate) => {
      const clamped = Math.min(Math.max(rate, 0.75), 2);
      set({ rate: clamped });
      try {
        getPlayer().playbackRate = clamped;
      } catch {
        // تُطبق مع التحميل التالي إن رفضت الآن.
      }
    },

    stop: () => {
      try {
        getPlayer().pause();
        getPlayer().setActiveForLockScreen(false);
      } catch {
        // تجاهل.
      }
      set({ queue: [], index: 0, status: "idle", position: 0, duration: 0, error: null });
    },
  };
});

// ─── حفظ موضع الاستماع (كل ~5 ثوانٍ أثناء التشغيل) ────────────────────────
let lastSaveAt = 0;
let lastSavePosition = 0;

function schedulePositionSave(itemId: string | undefined, position: number): void {
  if (!itemId) return;
  const now = Date.now();
  if (now - lastSaveAt < 5000 || Math.abs(position - lastSavePosition) < 2) return;
  lastSaveAt = now;
  lastSavePosition = position;
  recordListening(itemId, { position });
}

async function resumeFromSaved(itemId: string, p: AudioPlayer): Promise<void> {
  try {
    const saved = useLibraryStore.getState().positions[itemId];
    if (saved && saved > 3) {
      p.seekTo(saved);
    }
  } catch {
    // بدون موضع محفوظ — يبدأ من البداية.
  }
}

/** أثر شاشة القفل: مصغرة العنصر (أو العمل الفني الافتراضي عند تعذّرها). */
async function applyLockScreenArtwork(entry: QueueEntry): Promise<void> {
  try {
    const artworkUrl = await fetchArtworkForLockScreen(entry.thumbnail);
    getPlayer().setActiveForLockScreen(true, {
      title: entry.title,
      artist: SHEIKH_NAME,
      artworkUrl,
    });
  } catch {
    getPlayer().setActiveForLockScreen(true, {
      title: entry.title,
      artist: SHEIKH_NAME,
      artworkUrl: defaultArtworkUrl(),
    });
  }
}

let defaultArtwork: string | null = null;

function defaultArtworkUrl(): string | undefined {
  if (!defaultArtwork) {
    try {
      defaultArtwork =
        Image.resolveAssetSource(require("@/assets/images/audio-artwork.png")).uri ?? null;
    } catch {
      defaultArtwork = null;
    }
  }
  return defaultArtwork ?? undefined;
}
