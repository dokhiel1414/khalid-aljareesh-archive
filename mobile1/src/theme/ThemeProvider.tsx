/**
 * موفّر المظهر: دمج تفضيل المستخدم (تلقائي/فاتح/داكن) مع نظام الجهاز.
 * المكونات تستهلك useTheme() للحصول على الألوان الدلالية — لا hex مبعثر.
 */

import {
  createContext,
  useContext,
  useMemo,
  type PropsWithChildren,
} from "react";
import { useColorScheme } from "react-native";

import { useSettingsStore } from "@/store/settingsStore";
import { colors, type ThemeColors, type ThemeMode } from "./tokens";

interface ThemeContextValue {
  /** الوضع الفعلي المطبّق (بعد حل «النظام»). */
  mode: ThemeMode;
  /** تفضيل المستخدم الخام. */
  preference: "system" | "light" | "dark";
  colors: ThemeColors;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: PropsWithChildren) {
  const preference = useSettingsStore((s) => s.theme);
  const systemScheme = useColorScheme();

  const value = useMemo<ThemeContextValue>(() => {
    const mode: ThemeMode =
      preference === "system"
        ? systemScheme === "dark"
          ? "dark"
          : "light"
        : preference;
    return { mode, preference, colors: colors[mode] };
  }, [preference, systemScheme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme يجب استخدامه داخل ThemeProvider");
  return ctx;
}
