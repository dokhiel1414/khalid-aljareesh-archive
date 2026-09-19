/**
 * شارة فئة العنصر — أيقونة + تسمية ملونة وفق الفئة (صوتيات/مرئيات/مقالات).
 */

import { StyleSheet, Text, View } from "react-native";
import { BookOpen, Headphones, MonitorPlay } from "lucide-react-native";

import type { Category } from "@/types/api";
import { CATEGORY_LABEL } from "@/utils/format";
import { useTheme } from "@/theme/ThemeProvider";
import { fonts, radii, rawColors, spacing } from "@/theme/tokens";

const CATEGORY_ICON = {
  AUDIO: Headphones,
  VIDEO: MonitorPlay,
  WRITTEN: BookOpen,
} as const;

export function categoryTint(category: Category): string {
  // هوية هادئة: صوتيات ذهبي، مرئيات بني، مقالات حبر — لا ألوان صارخة.
  switch (category) {
    case "AUDIO":
      return rawColors.gold;
    case "VIDEO":
      return rawColors.brown;
    case "WRITTEN":
      return rawColors.ink2;
  }
}

export function CategoryBadge({
  category,
  size = "sm",
  withLabel = true,
  inverted = false,
}: {
  category: Category;
  size?: "sm" | "md";
  withLabel?: boolean;
  inverted?: boolean;
}) {
  const { colors } = useTheme();
  const Icon = CATEGORY_ICON[category];
  const tint = categoryTint(category);
  const iconSize = size === "sm" ? 13 : 16;

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: inverted ? "rgba(0,0,0,0.45)" : `${tint}22`,
          paddingVertical: size === "sm" ? 3 : 5,
          paddingHorizontal: size === "sm" ? spacing.sm : spacing.md,
        },
      ]}
      accessibilityLabel={`الفئة: ${CATEGORY_LABEL[category]}`}
    >
      <Icon size={iconSize} color={inverted ? "#FFFFFF" : tint} strokeWidth={2.2} />
      {withLabel ? (
        <Text
          style={[
            styles.label,
            {
              color: inverted ? "#FFFFFF" : colors.textPrimary,
              fontSize: size === "sm" ? 11 : 12,
            },
          ]}
        >
          {CATEGORY_LABEL[category]}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderRadius: radii.full,
    alignSelf: "flex-start",
  },
  label: {
    fontFamily: fonts.serifMedium,
  },
});
