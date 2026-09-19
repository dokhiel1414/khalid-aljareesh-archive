/**
 * شارة اليوم الهجري (أم القرى) — عنصر هوية هادئ في رأس الرئيسية.
 */

import { StyleSheet, Text, View } from "react-native";

import { formatHijriDate } from "@/utils/format";
import { useTheme } from "@/theme/ThemeProvider";
import { fonts, radii, spacing } from "@/theme/tokens";

export function HijriBadge({ inverted = true }: { inverted?: boolean }) {
  const { colors } = useTheme();
  const today = formatHijriDate(new Date());

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: inverted ? "rgba(255,255,255,0.12)" : colors.surfaceSunk,
        },
      ]}
      accessibilityLabel={`اليوم: ${today}`}
    >
      <Text
        style={[
          styles.text,
          { color: inverted ? colors.headerText : colors.textSecondary },
        ]}
      >
        {today}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: spacing.md,
    paddingVertical: 5,
    borderRadius: radii.full,
  },
  text: {
    fontFamily: fonts.serifMedium,
    fontSize: 12.5,
    lineHeight: 18,
  },
});
