import { prisma } from "@/lib/prisma";

export type ThemeName = "classic" | "ocean";
export const THEMES: ThemeName[] = ["classic", "ocean"];

export const THEME_LABEL: Record<ThemeName, string> = {
  classic: "الكلاسيكي (ذهبي دافئ)",
  ocean: "المحيط (أزرق هادئ)",
};

export function normalizeTheme(v: unknown): ThemeName {
  return v === "ocean" ? "ocean" : "classic";
}

/** Reads the active site theme. Falls back to "classic" on any error. */
export async function getActiveTheme(): Promise<ThemeName> {
  try {
    const row = await prisma.siteSetting.findUnique({ where: { id: 1 } });
    return normalizeTheme(row?.theme);
  } catch {
    return "classic";
  }
}

export async function setActiveTheme(theme: ThemeName): Promise<ThemeName> {
  const row = await prisma.siteSetting.upsert({
    where: { id: 1 },
    update: { theme },
    create: { id: 1, theme },
  });
  return normalizeTheme(row.theme);
}
