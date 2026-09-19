/**
 * نظام التصميم — رموز تصميم مركزية (Design Tokens) مستخرجة من هوية الموقع
 * (app/globals.css) ومحوّلة لتطبيق جوال أصلي. ممنوع تكرار قيم الألوان في الشاشات.
 *
 * الهوية: حبر عميق (ink) + ذهبي هادئ (gold) + رمل دافئ (sand)
 * شخصية: هادئة، رصينة، معاصرة، فاخرة بلا تكلّف — مناسبة للمحتوى الشرعي.
 */

// ─── الألوان الخام (من globals.css) ────────────────────────────────────────
export const rawColors = {
  ink: "#072C49",
  ink2: "#0A3A5E",
  gold: "#DEA470",
  brown: "#C17E5A",
  sand: "#ECE6DD",
  sand2: "#F5F1EA",
  darkBg: "#06223A",
  darkSurface: "#0A3A5E",
  darkCard: "#0D436C",
  darkBorder: "#13507F",
  white: "#FFFFFF",
} as const;

export type ThemeMode = "light" | "dark";

/** ألوان دلالية (Semantic) لكل وضع. الشاشات تستخدم هذه فقط. */
export interface ThemeColors {
  background: string; // خلفية الصفحة
  surface: string; // البطاقات والأسطح المرتفعة
  surfaceSunk: string; // مناطق غائرة (خلفية المشغّل، شريط البحث)
  header: string; // رؤوس الشاشات (حبر داكن في الوضعين — عنصر هوية)
  headerText: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  textOnAccent: string; // نص فوق الألوان الداكنة/الذهبية
  accent: string; // ذهبي
  accentStrong: string; // بني (أزرار/روابط فعّالة)
  border: string;
  borderStrong: string;
  overlay: string;
  skeleton: string;
  success: string;
  error: string;
  favorite: string;
}

export const colors: Record<ThemeMode, ThemeColors> = {
  light: {
    background: rawColors.sand2,
    surface: rawColors.white,
    surfaceSunk: rawColors.sand,
    header: rawColors.ink,
    headerText: rawColors.sand2,
    textPrimary: rawColors.ink,
    textSecondary: "#3D5A70",
    textMuted: "#7A8B99",
    textOnAccent: rawColors.white,
    accent: rawColors.gold,
    accentStrong: rawColors.brown,
    border: "rgba(7, 44, 73, 0.12)",
    borderStrong: "rgba(7, 44, 73, 0.24)",
    overlay: "rgba(6, 34, 58, 0.5)",
    skeleton: "rgba(7, 44, 73, 0.08)",
    success: "#2E7D5B",
    error: "#B3453A",
    favorite: "#C98A5B",
  },
  dark: {
    background: rawColors.darkBg,
    surface: rawColors.darkCard,
    surfaceSunk: rawColors.darkSurface,
    header: rawColors.darkSurface,
    headerText: rawColors.sand2,
    textPrimary: rawColors.sand2,
    textSecondary: "rgba(236, 230, 221, 0.76)",
    textMuted: "rgba(236, 230, 221, 0.5)",
    textOnAccent: rawColors.ink,
    accent: rawColors.gold,
    accentStrong: "#D9A17C",
    border: rawColors.darkBorder,
    borderStrong: "#1B5F94",
    overlay: "rgba(2, 16, 28, 0.62)",
    skeleton: "rgba(236, 230, 221, 0.08)",
    success: "#58B892",
    error: "#E08A7E",
    favorite: rawColors.gold,
  },
};

// ─── الخطوط (أسماء التسجيل في expo-font) ──────────────────────────────────
export const fonts = {
  // ThmanyahSerifDisplay — الخط الرسمي للواجهة
  serifLight: "ThmanyahSerif-Light",
  serifRegular: "ThmanyahSerif-Regular",
  serifMedium: "ThmanyahSerif-Medium",
  serifBold: "ThmanyahSerif-Bold",
  serifBlack: "ThmanyahSerif-Black",
  // خط جسم المقالات الطويلة (تصميم نسخ شرعي مريح)
  article: "TradArabicMorph",
} as const;

/**
 * مقياس الخطوط — ديناميكي: كل القيم نسبية لحجم خط النظام (allowFontScaling)
 * عبر scaleFactor المُمر من useTypography. لا ارتفاعات ثابتة تكسر التكبير.
 */
export interface Typography {
  display: { fontFamily: string; fontSize: number; lineHeight: number; fontWeight: "900" };
  h1: { fontFamily: string; fontSize: number; lineHeight: number; fontWeight: "700" };
  h2: { fontFamily: string; fontSize: number; lineHeight: number; fontWeight: "700" };
  h3: { fontFamily: string; fontSize: number; lineHeight: number; fontWeight: "500" };
  body: { fontFamily: string; fontSize: number; lineHeight: number; fontWeight: "400" };
  bodyStrong: { fontFamily: string; fontSize: number; lineHeight: number; fontWeight: "500" };
  small: { fontFamily: string; fontSize: number; lineHeight: number; fontWeight: "400" };
  caption: { fontFamily: string; fontSize: number; lineHeight: number; fontWeight: "400" };
  button: { fontFamily: string; fontSize: number; lineHeight: number; fontWeight: "500" };
}

export const typeBase: Typography = {
  display: { fontFamily: fonts.serifBlack, fontSize: 30, lineHeight: 42, fontWeight: "900" },
  h1: { fontFamily: fonts.serifBold, fontSize: 24, lineHeight: 34, fontWeight: "700" },
  h2: { fontFamily: fonts.serifBold, fontSize: 20, lineHeight: 30, fontWeight: "700" },
  h3: { fontFamily: fonts.serifMedium, fontSize: 17, lineHeight: 26, fontWeight: "500" },
  body: { fontFamily: fonts.serifRegular, fontSize: 15, lineHeight: 24, fontWeight: "400" },
  bodyStrong: { fontFamily: fonts.serifMedium, fontSize: 15, lineHeight: 24, fontWeight: "500" },
  small: { fontFamily: fonts.serifRegular, fontSize: 13, lineHeight: 20, fontWeight: "400" },
  caption: { fontFamily: fonts.serifRegular, fontSize: 12, lineHeight: 18, fontWeight: "400" },
  button: { fontFamily: fonts.serifMedium, fontSize: 15, lineHeight: 22, fontWeight: "500" },
};

// ─── المسافات (شبكة 4) ─────────────────────────────────────────────────────
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 40,
  giant: 48,
} as const;

// ─── أنصاف الأقطار ─────────────────────────────────────────────────────────
export const radii = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 999,
} as const;

// ─── الارتفاع/الظلال (مطابقة لـ shadow-card في الموقع) ───────────────────
export const elevation = {
  card: {
    shadowColor: rawColors.ink,
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  floating: {
    shadowColor: rawColors.ink,
    shadowOpacity: 0.16,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
} as const;

// ─── الحركة ────────────────────────────────────────────────────────────────
export const motion = {
  fast: 150,
  base: 250,
  slow: 400,
  /** منحنى قياسي هادئ (Material emphasis). */
  ease: { bezier: [0.2, 0, 0.2, 1] },
} as const;

// ─── أهداف اللمس والأيقونات (إرشادات أندرويد ≥48dp) ──────────────────────
export const touch = {
  /** الحد الأدنى لأي هدف لمس. */
  target: 48,
  targetSmall: 44, // للأهداف داخل عناصر كبيرة (شرائح تمرير...) — الحجم الأدنى لشريط الصوت
  iconSm: 18,
  iconMd: 22,
  iconLg: 26,
  iconXl: 32,
} as const;
