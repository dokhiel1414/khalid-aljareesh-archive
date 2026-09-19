/**
 * رأس قسم في الشاشات: عنوان + شارة خلفية (حبر/ذهبي) + إجراء جانبي اختياري.
 */

import { Pressable, StyleSheet, Text, View } from "react-native";
import { ArrowLeft } from "lucide-react-native";

import { useTheme } from "@/theme/ThemeProvider";
import { fonts, radii, spacing } from "@/theme/tokens";

interface SectionHeaderProps {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function SectionHeader({ title, actionLabel, onAction }: SectionHeaderProps) {
  const { colors } = useTheme();
  return (
    <View style={styles.row}>
      <View style={styles.titleWrap}>
        <View style={[styles.accent, { backgroundColor: colors.accent }]} />
        <Text style={[styles.title, { color: colors.textPrimary }]} accessibilityRole="header">
          {title}
        </Text>
      </View>
      {actionLabel && onAction ? (
        <Pressable
          onPress={onAction}
          accessibilityRole="button"
          accessibilityLabel={actionLabel}
          hitSlop={8}
          style={styles.action}
        >
          <Text style={[styles.actionText, { color: colors.accentStrong }]}>{actionLabel}</Text>
          {/* في RTL السهم يشير يساراً (اتجاه «التقدم») */}
          <ArrowLeft size={15} color={colors.accentStrong} />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  titleWrap: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  accent: { width: 4, height: 20, borderRadius: radii.full },
  title: { fontFamily: fonts.serifBold, fontSize: 19, lineHeight: 28 },
  action: { flexDirection: "row", alignItems: "center", gap: 4, minHeight: 48, paddingStart: spacing.sm },
  actionText: { fontFamily: fonts.serifMedium, fontSize: 13 },
});
