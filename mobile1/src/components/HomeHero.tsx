/**
 * رأس الرئيسية — إعادة تخيّل أصلية للجوال (وليست نسخة من Hero الموقع):
 * تدرج حبر داكن + زخرفة نجمية هادئة، العنوان الكبير، شارة اليوم الهجري،
 * حقل بحث يفتح شاشة البحث، وثلاث بوابات للفئات بعدّادات حية.
 * لا منطق شبكة هنا — العدّادات تمر كخاصيات من الشاشة.
 */

import { Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { BookOpen, Headphones, MonitorPlay, Search } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import type { Category } from "@/types/api";
import { fonts, radii, rawColors, spacing, touch } from "@/theme/tokens";
import { CATEGORY_LABEL, toArabicDigits } from "@/utils/format";
import { StarOrnament } from "./StarOrnament";
import { HijriBadge } from "./HijriBadge";
import { tap } from "@/utils/haptics";

const LIBRARY_NAME = "مكتبة خالد بن علي الجريش الرقمية";

const CATEGORY_TILES: {
  category: Category;
  icon: typeof Headphones;
  route: "/audio" | "/video" | "/written";
}[] = [
  { category: "AUDIO", icon: Headphones, route: "/audio" },
  { category: "VIDEO", icon: MonitorPlay, route: "/video" },
  { category: "WRITTEN", icon: BookOpen, route: "/written" },
];

export function HomeHero({
  counts,
}: {
  counts: Partial<Record<Category, number>>;
}) {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <LinearGradient
      colors={[rawColors.ink, rawColors.ink2, rawColors.ink]}
      start={{ x: 0.1, y: 0 }}
      end={{ x: 0.9, y: 1 }}
      style={[styles.wrap, { paddingTop: insets.top + spacing.xl }]}
    >
      {/* زخارف هادئة — لا تدخل شجرة إمكانية الوصول */}
      <View style={styles.ornamentA} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
        <StarOrnament size={90} color={rawColors.gold} opacity={0.07} />
      </View>
      <View style={styles.ornamentB} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
        <StarOrnament size={46} color={rawColors.gold} opacity={0.13} />
      </View>

      <View style={styles.head}>
        <Text style={styles.kicker} accessibilityRole="header">
          {LIBRARY_NAME}
        </Text>
        <Text style={styles.subtitle}>دروس ومحاضرات ومقالات الشيخ خالد بن علي الجريش</Text>
        <View style={styles.badgeRow}>
          <HijriBadge inverted />
        </View>
      </View>

      {/* مدخل البحث */}
      <Pressable
        onPress={() => {
          void tap();
          router.push("/search");
        }}
        accessibilityRole="button"
        accessibilityLabel="البحث في المكتبة"
        testID="hero-search"
        style={({ pressed }) => [styles.searchPill, pressed && styles.pressed]}
        android_ripple={{ color: "rgba(255,255,255,0.12)" }}
      >
        <Search size={18} color={rawColors.gold} />
        <Text style={styles.searchText}>ابحث في الدروس والمحاضرات والمقالات…</Text>
      </Pressable>

      {/* بوابات الفئات */}
      <View style={styles.tiles}>
        {CATEGORY_TILES.map(({ category, icon: Icon, route }) => {
          const count = counts[category];
          return (
            <Pressable
              key={category}
              onPress={() => {
                void tap();
                router.push(`/(tabs)${route}`);
              }}
              accessibilityRole="button"
              accessibilityLabel={`${CATEGORY_LABEL[category]}${
                count !== undefined ? `، ${toArabicDigits(count)} مادة` : ""
              }`}
              testID={`hero-category-${category.toLowerCase()}`}
              style={({ pressed }) => [styles.tile, pressed && styles.pressed]}
              android_ripple={{ color: "rgba(255,255,255,0.12)" }}
            >
              <View style={styles.tileIcon}>
                <Icon size={22} color={rawColors.gold} />
              </View>
              <Text style={styles.tileLabel}>{CATEGORY_LABEL[category]}</Text>
              <Text style={styles.tileCount}>
                {count !== undefined ? toArabicDigits(count) : "—"}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
    borderBottomStartRadius: radii.xl,
    borderBottomEndRadius: radii.xl,
    overflow: "hidden",
  },
  ornamentA: { position: "absolute", top: -24, insetInlineEnd: -18 },
  ornamentB: { position: "absolute", top: 96, insetInlineStart: -14 },
  head: { alignItems: "center", gap: spacing.sm },
  kicker: {
    fontFamily: fonts.serifBlack,
    fontSize: 24,
    lineHeight: 38,
    color: rawColors.sand2,
    textAlign: "center",
  },
  subtitle: {
    fontFamily: fonts.serifRegular,
    fontSize: 13.5,
    lineHeight: 22,
    color: "rgba(236,230,221,0.78)",
    textAlign: "center",
  },
  badgeRow: { marginTop: spacing.sm },
  searchPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    marginTop: spacing.lg,
    minHeight: touch.target + 4,
    paddingHorizontal: spacing.lg,
    borderRadius: radii.full,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderWidth: 1,
    borderColor: "rgba(222,164,112,0.35)",
  },
  searchText: {
    flex: 1,
    fontFamily: fonts.serifRegular,
    fontSize: 13.5,
    color: "rgba(236,230,221,0.75)",
  },
  tiles: {
    flexDirection: "row",
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  tile: {
    flex: 1,
    alignItems: "center",
    gap: 4,
    paddingVertical: spacing.md,
    borderRadius: radii.lg,
    backgroundColor: "rgba(255,255,255,0.07)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    minHeight: touch.target + 40,
    justifyContent: "center",
  },
  tileIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(222,164,112,0.14)",
    alignItems: "center",
    justifyContent: "center",
  },
  tileLabel: {
    fontFamily: fonts.serifMedium,
    fontSize: 13,
    color: rawColors.sand2,
  },
  tileCount: {
    fontFamily: fonts.serifRegular,
    fontSize: 11,
    color: "rgba(236,230,221,0.55)",
  },
  pressed: { opacity: 0.85 },
});
