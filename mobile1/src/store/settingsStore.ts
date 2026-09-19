/**
 * إعدادات التطبيق المحفوظة: المظهر + حجم خط المقالات + اللمسات.
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { setHapticsEnabled } from "@/utils/haptics";

export type ThemePreference = "system" | "light" | "dark";

/** مقاييس حجم خط المقال (مضاعف على الأساس). */
export const ARTICLE_FONT_SCALES = [0.9, 1, 1.15, 1.3, 1.5] as const;

interface SettingsState {
  theme: ThemePreference;
  articleFontScale: number;
  haptics: boolean;
  setTheme: (t: ThemePreference) => void;
  setArticleFontScale: (s: number) => void;
  setHaptics: (on: boolean) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      theme: "system",
      articleFontScale: 1,
      haptics: true,

      setTheme: (theme) => set({ theme }),
      setArticleFontScale: (articleFontScale) => set({ articleFontScale }),
      setHaptics: (on) => {
        setHapticsEnabled(on);
        set({ haptics: on });
      },
    }),
    {
      name: "kjarchive-settings-v1",
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        // تفعيل حالة اللمسات بعد استعادة الإعدادات.
        if (state) setHapticsEnabled(state.haptics);
      },
    },
  ),
);
