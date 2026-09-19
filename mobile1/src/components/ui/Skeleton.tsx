/**
 * هيكل تحميل (Skeleton) — نبض خافت بدل الدوّارات. يحترم تقليل الحركة.
 */

import { useEffect, useState } from "react";
import { Animated, StyleSheet, View, type DimensionValue } from "react-native";

import { useTheme } from "@/theme/ThemeProvider";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { radii } from "@/theme/tokens";

interface SkeletonProps {
  width?: DimensionValue;
  height?: number;
  radius?: number;
  style?: object;
}

export function Skeleton({ width = "100%", height = 16, radius = radii.sm, style }: SkeletonProps) {
  const { colors } = useTheme();
  const reduced = useReducedMotion();
  // تهيئة كسولة مرة واحدة (لا يتغير المرجع عبر العروض).
  const [opacity] = useState(() => new Animated.Value(0.5));

  useEffect(() => {
    if (reduced) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.5, duration: 700, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [opacity, reduced]);

  return (
    <Animated.View
      style={[
        { width, height, borderRadius: radius, backgroundColor: colors.skeleton, opacity },
        style,
      ]}
      accessibilityLabel="جارٍ التحميل"
      importantForAccessibility="no-hide-descendants"
    />
  );
}

/** هيكل بطاقة عنصر (للشبكات). */
export function ItemCardSkeleton() {
  return (
    <View style={styles.card}>
      <Skeleton width="100%" height={120} radius={12} />
      <View style={styles.body}>
        <Skeleton width="70%" height={18} />
        <Skeleton width="95%" height={14} />
        <Skeleton width="50%" height={12} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { gap: 12 },
  body: { gap: 8, paddingHorizontal: 4 },
});
