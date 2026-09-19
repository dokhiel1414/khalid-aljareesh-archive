/**
 * أزرار: رئيسي (حبر)، ذهبي، شفاف، أيقوني — أهداف لمس ≥48dp.
 */

import { Pressable, StyleSheet, Text, type StyleProp, type ViewStyle } from "react-native";
import type { ReactNode } from "react";

import { useTheme } from "@/theme/ThemeProvider";
import { fonts, radii, spacing, touch } from "@/theme/tokens";

type ButtonVariant = "primary" | "gold" | "ghost";

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  icon?: ReactNode;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  accessibilityHint?: string;
  testID?: string;
}

export function Button({
  label,
  onPress,
  variant = "primary",
  icon,
  disabled,
  style,
  accessibilityHint,
  testID,
}: ButtonProps) {
  const { colors } = useTheme();

  const palette = {
    primary: { bg: colors.header, text: colors.headerText, border: "transparent" as string },
    gold: { bg: colors.accent, text: "#1F1205", border: "transparent" as string },
    ghost: { bg: "transparent", text: colors.textPrimary, border: colors.borderStrong },
  }[variant];

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: disabled ?? false }}
      android_ripple={{ color: variant === "primary" ? colors.borderStrong : colors.border }}
      style={({ pressed }) => [
        styles.base,
        { backgroundColor: palette.bg, borderColor: palette.border, opacity: pressed ? 0.85 : 1 },
        disabled && { opacity: 0.4 },
        style,
      ]}
    >
      {icon}
      <Text style={[styles.label, { color: palette.text }]}>{label}</Text>
    </Pressable>
  );
}

interface IconButtonProps {
  icon: ReactNode;
  onPress: () => void;
  accessibilityLabel: string;
  size?: number;
  /** زر فوق خلفيات داكنة (أيقونة فاتحة). */
  inverted?: boolean;
  testID?: string;
}

export function IconButton({
  icon,
  onPress,
  accessibilityLabel,
  size = touch.target,
  inverted,
  testID,
}: IconButtonProps) {
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      android_ripple={{ color: inverted ? "rgba(255,255,255,0.18)" : colors.border }}
      style={({ pressed }) => [
        styles.iconButton,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: inverted ? "rgba(255,255,255,0.12)" : "transparent",
          opacity: pressed ? 0.7 : 1,
        },
      ]}
    >
      {icon}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    minHeight: touch.target,
    paddingHorizontal: spacing.xl,
    borderRadius: radii.full,
    borderWidth: StyleSheet.hairlineWidth * 2,
  },
  label: {
    fontFamily: fonts.serifMedium,
    fontSize: 15,
    lineHeight: 22,
  },
  iconButton: {
    alignItems: "center",
    justifyContent: "center",
  },
});
