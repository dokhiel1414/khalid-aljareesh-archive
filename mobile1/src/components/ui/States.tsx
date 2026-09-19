/**
 * حالات العرض: فارغ / خطأ / دون اتصال — بأسلوب الأرشيف الهادئ.
 */

import { Pressable, StyleSheet, Text, View } from "react-native";
import { RefreshCw, WifiOff } from "lucide-react-native";

import { useTheme } from "@/theme/ThemeProvider";
import { fonts, radii, spacing } from "@/theme/tokens";
import { StarOrnament } from "@/components/StarOrnament";

export function EmptyState({
  title,
  hint,
  actionLabel,
  onAction,
}: {
  title: string;
  hint?: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  const { colors } = useTheme();
  return (
    <View style={styles.wrap} testID="empty-state">
      <StarOrnament size={44} color={colors.accent} opacity={0.55} />
      <Text style={[styles.title, { color: colors.textPrimary }]}>{title}</Text>
      {hint ? <Text style={[styles.hint, { color: colors.textMuted }]}>{hint}</Text> : null}
      {actionLabel && onAction ? (
        <Pressable
          onPress={onAction}
          accessibilityRole="button"
          style={[styles.action, { borderColor: colors.borderStrong }]}
          android_ripple={{ color: colors.border }}
        >
          <Text style={[styles.actionText, { color: colors.accentStrong }]}>{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

export function ErrorState({
  message = "تعذّر التحميل — تحقق من اتصالك.",
  onRetry,
}: {
  message?: string;
  onRetry?: () => void;
}) {
  const { colors } = useTheme();
  return (
    <View style={styles.wrap} testID="error-state">
      <RefreshCw size={30} color={colors.textMuted} />
      <Text style={[styles.title, { color: colors.textPrimary }]}>{message}</Text>
      {onRetry ? (
        <Pressable
          onPress={onRetry}
          accessibilityRole="button"
          accessibilityLabel="إعادة المحاولة"
          style={[styles.action, { backgroundColor: colors.header }]}
          android_ripple={{ color: colors.borderStrong }}
        >
          <Text style={[styles.actionText, { color: colors.headerText }]}>إعادة المحاولة</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

/** مؤشر هادئ «دون اتصال — تعرض آخر بيانات محفوظة» (يختفي عند عودة الشبكة). */
export function OfflineBar() {
  const { colors } = useTheme();
  return (
    <View
      style={[styles.offlineBar, { backgroundColor: colors.surfaceSunk, borderColor: colors.border }]}
      testID="offline-bar"
    >
      <WifiOff size={15} color={colors.textSecondary} />
      <Text style={[styles.offlineText, { color: colors.textSecondary }]}>
        دون اتصال — آخر بيانات محفوظة
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.huge,
    paddingHorizontal: spacing.xxxl,
    gap: spacing.md,
  },
  title: {
    fontFamily: fonts.serifMedium,
    fontSize: 16,
    lineHeight: 24,
    textAlign: "center",
  },
  hint: {
    fontFamily: fonts.serifRegular,
    fontSize: 13,
    lineHeight: 20,
    textAlign: "center",
  },
  action: {
    marginTop: spacing.sm,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm + 2,
    borderRadius: radii.full,
    borderWidth: 1,
    minHeight: 44,
    justifyContent: "center",
  },
  actionText: {
    fontFamily: fonts.serifMedium,
    fontSize: 14,
  },
  offlineBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.full,
    borderWidth: StyleSheet.hairlineWidth * 2,
  },
  offlineText: {
    fontFamily: fonts.serifRegular,
    fontSize: 12,
  },
});
