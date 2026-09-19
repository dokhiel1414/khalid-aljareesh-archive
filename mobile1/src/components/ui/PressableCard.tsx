/**
 * بطاقة قابلة للضغط — السطح الأساسي للواجهة.
 * حالة ضغط هادئة (خفوت + انكماش طفيف) تُحترم فيها حركات تقليل الحركة.
 */

import {
  Pressable,
  StyleSheet,
  type AccessibilityRole,
  type AccessibilityState,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { useMemo, useState, type PropsWithChildren } from "react";
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";

import { useTheme } from "@/theme/ThemeProvider";
import { elevation, motion, radii } from "@/theme/tokens";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface PressableCardProps extends PropsWithChildren {
  onPress?: () => void;
  onLongPress?: () => void;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  /** دور إمكانية الوصول — الافتراضي «button» عند وجود onPress. */
  accessibilityRole?: AccessibilityRole;
  accessibilityState?: AccessibilityState;
  /** تعطيل الضغط (أثناء التحميل مثلاً). */
  disabled?: boolean;
  /** بطاقة مسطحة بلا ظل/حدود (للعناصر داخل عناصر). */
  flat?: boolean;
  testID?: string;
}

export function PressableCard({
  onPress,
  onLongPress,
  style,
  accessibilityLabel,
  accessibilityHint,
  accessibilityRole,
  accessibilityState,
  disabled,
  flat,
  testID,
  children,
}: PressableCardProps) {
  const { colors } = useTheme();
  const reduced = useReducedMotion();
  const [pressed, setPressed] = useState(false);
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const cardStyle = useMemo(
    () => [
      styles.base,
      {
        backgroundColor: colors.surface,
        borderColor: flat ? "transparent" : colors.border,
        opacity: pressed ? 0.85 : 1,
      },
      !flat && elevation.card,
      style,
    ],
    [colors, flat, pressed, style],
  );

  return (
    <Animated.View style={animatedStyle}>
      <Pressable
        onPress={onPress}
        onLongPress={onLongPress}
        disabled={disabled}
        testID={testID}
        accessibilityRole={accessibilityRole ?? (onPress ? "button" : undefined)}
        accessibilityLabel={accessibilityLabel}
        accessibilityHint={accessibilityHint}
        accessibilityState={{ disabled: disabled ?? false, ...accessibilityState }}
        onPressIn={() => {
          setPressed(true);
          // eslint-disable-next-line react-hooks/immutability -- كتابة shared value هي واجهة Reanimated المقصودة
          if (!reduced) scale.value = withTiming(0.985, { duration: motion.fast });
        }}
        onPressOut={() => {
          setPressed(false);
          // eslint-disable-next-line react-hooks/immutability -- كتابة shared value هي واجهة Reanimated المقصودة
          scale.value = withTiming(1, { duration: motion.fast });
        }}
        android_ripple={flat ? undefined : { color: colors.border }}
        style={cardStyle}
      >
        {children}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radii.lg,
    borderWidth: StyleSheet.hairlineWidth * 2,
    overflow: "hidden",
  },
});

export type { ViewStyle };
