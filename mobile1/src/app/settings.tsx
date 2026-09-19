/**
 * الإعدادات — المظهر (تلقائي/فاتح/داكن)، حجم خط المقالات، اللمسات، عن التطبيق.
 */

import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from "react-native";
import { Stack } from "expo-router";
import Constants from "expo-constants";

import { useTheme } from "@/theme/ThemeProvider";
import { fonts, radii, spacing, touch } from "@/theme/tokens";
import { SITE_NAME, SITE_URL } from "@/constants/site";
import { ARTICLE_FONT_SCALES, useSettingsStore } from "@/store/settingsStore";
import { toArabicDigits } from "@/utils/format";
import { tap } from "@/utils/haptics";

const THEME_OPTIONS = [
  { value: "system", label: "تلقائي" },
  { value: "light", label: "فاتح" },
  { value: "dark", label: "داكن" },
] as const;

export default function SettingsScreen() {
  const { colors } = useTheme();
  const theme = useSettingsStore((s) => s.theme);
  const setTheme = useSettingsStore((s) => s.setTheme);
  const articleFontScale = useSettingsStore((s) => s.articleFontScale);
  const setArticleFontScale = useSettingsStore((s) => s.setArticleFontScale);
  const haptics = useSettingsStore((s) => s.haptics);
  const setHaptics = useSettingsStore((s) => s.setHaptics);

  return (
    <>
      <Stack.Screen options={{ title: "الإعدادات" }} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* المظهر */}
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>المظهر</Text>
        <View style={[styles.segment, { backgroundColor: colors.surfaceSunk, borderColor: colors.border }]}>
          {THEME_OPTIONS.map((option) => {
            const active = theme === option.value;
            return (
              <Pressable
                key={option.value}
                onPress={() => {
                  void tap();
                  setTheme(option.value);
                }}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                testID={`theme-${option.value}`}
                style={[styles.segmentItem, active && { backgroundColor: colors.header }]}
                android_ripple={{ color: colors.border }}
              >
                <Text
                  style={[
                    styles.segmentText,
                    { color: active ? colors.headerText : colors.textSecondary },
                  ]}
                >
                  {option.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* حجم خط المقالات */}
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>حجم خط المقالات</Text>
        <View
          style={[
            styles.scaleCard,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <Text
            style={[styles.preview, { color: colors.textPrimary, fontSize: 17 * articleFontScale }]}
          >
            خطٌّ مريح للقراءة الطويلة، تُضبط به مقالات المكتبة كلها.
          </Text>
          <View style={styles.scaleRow}>
            {ARTICLE_FONT_SCALES.map((scale) => {
              const active = articleFontScale === scale;
              return (
                <Pressable
                  key={scale}
                  onPress={() => {
                    void tap();
                    setArticleFontScale(scale);
                  }}
                  accessibilityRole="button"
                  accessibilityLabel={`حجم خط ${toArabicDigits(scale * 100)}٪`}
                  accessibilityState={{ selected: active }}
                  testID={`article-scale-${scale}`}
                  style={[
                    styles.scaleChip,
                    {
                      borderColor: active ? colors.accentStrong : colors.borderStrong,
                      backgroundColor: active ? colors.accent : "transparent",
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.scaleChipText,
                      { color: active ? "#1F1205" : colors.textSecondary },
                    ]}
                  >
                    {toArabicDigits(Math.round(scale * 100))}٪
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* اللمسات */}
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>اللمسات</Text>
        <View style={[styles.switchRow, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.switchTexts}>
            <Text style={[styles.switchLabel, { color: colors.textPrimary }]}>اهتزاز خفيف عند التفاعل</Text>
            <Text style={[styles.switchHint, { color: colors.textMuted }]}>
              لمسات هادئة — تُحترم خاصية تقليل الحركة.
            </Text>
          </View>
          <Switch
            value={haptics}
            onValueChange={setHaptics}
            trackColor={{ false: colors.borderStrong, true: colors.accent }}
            thumbColor="#FFFFFF"
            accessibilityLabel="اللمسات الاهتزازية"
            testID="settings-haptics"
          />
        </View>

        {/* عن التطبيق */}
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>عن التطبيق</Text>
        <View style={[styles.switchRow, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.switchTexts}>
            <Text style={[styles.switchLabel, { color: colors.textPrimary }]}>{SITE_NAME}</Text>
            <Text style={[styles.switchHint, { color: colors.textMuted }]}>
              الإصدار {Constants.expoConfig?.version ?? "1.0.0"} — {SITE_URL}
            </Text>
            <Text style={[styles.switchHint, { color: colors.textMuted }]}>
              بياناتك (المفضلة والسجل) محفوظة على جهازك فقط — لا حسابات ولا تتبع.
            </Text>
          </View>
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.giant,
  },
  sectionTitle: {
    fontFamily: fonts.serifBold,
    fontSize: 16,
    lineHeight: 24,
    marginBottom: spacing.sm,
    marginTop: spacing.lg,
  },
  segment: {
    flexDirection: "row",
    borderRadius: radii.full,
    borderWidth: StyleSheet.hairlineWidth * 2,
    padding: 3,
  },
  segmentItem: {
    flex: 1,
    minHeight: touch.target,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radii.full,
  },
  segmentText: {
    fontFamily: fonts.serifMedium,
    fontSize: 13.5,
    lineHeight: 20,
  },
  scaleCard: {
    borderRadius: radii.lg,
    borderWidth: StyleSheet.hairlineWidth * 2,
    padding: spacing.md,
    gap: spacing.md,
  },
  preview: {
    fontFamily: fonts.article,
    lineHeight: 28,
    textAlign: "right",
    writingDirection: "rtl",
  },
  scaleRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  scaleChip: {
    minWidth: 52,
    minHeight: touch.targetSmall,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radii.full,
    borderWidth: StyleSheet.hairlineWidth * 2,
    paddingHorizontal: spacing.sm,
  },
  scaleChipText: {
    fontFamily: fonts.serifMedium,
    fontSize: 12.5,
    lineHeight: 18,
  },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    borderRadius: radii.lg,
    borderWidth: StyleSheet.hairlineWidth * 2,
    padding: spacing.md,
    marginBottom: spacing.xs,
  },
  switchTexts: { flex: 1, gap: 3 },
  switchLabel: {
    fontFamily: fonts.serifMedium,
    fontSize: 14.5,
    lineHeight: 22,
  },
  switchHint: {
    fontFamily: fonts.serifRegular,
    fontSize: 12,
    lineHeight: 18,
  },
});
