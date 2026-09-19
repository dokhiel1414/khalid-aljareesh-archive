/**
 * تبويب المزيد — قائمة الإجراءات الثانوية: المفضلة، السجل، التنزيلات،
 * المجموعات، الإعدادات، التواصل، وزيارة الموقع.
 */

import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import Constants from "expo-constants";
import {
  Download,
  Globe,
  Heart,
  History,
  Mail,
  Settings,
  Users,
} from "lucide-react-native";

import { TabHeader } from "@/components/ui/TabHeader";
import { useTheme } from "@/theme/ThemeProvider";
import { fonts, radii, spacing, touch } from "@/theme/tokens";
import { SITE_NAME, SITE_URL } from "@/constants/site";
import { tap } from "@/utils/haptics";

const MENU = [
  { key: "favorites", label: "المفضلة", hint: "المواد التي حفظتها", icon: Heart, route: "/favorites" },
  { key: "history", label: "سجل الاستماع", hint: "آخر ما سمعت وشاهدت", icon: History, route: "/history" },
  { key: "downloads", label: "التنزيلات", hint: "الصوتيات المحفوظة للاستماع دون اتصال", icon: Download, route: "/downloads" },
  { key: "groups", label: "المجموعات والقنوات", hint: "واتساب وتيليجرام", icon: Users, route: "/groups" },
  { key: "settings", label: "الإعدادات", hint: "المظهر، الخط، اللمسات", icon: Settings, route: "/settings" },
  { key: "contact", label: "تواصل معنا", hint: "اقتراح أو ملاحظة أو استفسار", icon: Mail, route: "/contact" },
] as const;

export default function MoreScreen() {
  const { colors } = useTheme();
  const router = useRouter();

  return (
    <View style={styles.flex}>
      <TabHeader title="المزيد" />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {MENU.map((item) => {
          const Icon = item.icon;
          return (
            <Pressable
              key={item.key}
              onPress={() => {
                void tap();
                router.push(item.route);
              }}
              accessibilityRole="button"
              accessibilityLabel={item.label}
              accessibilityHint={item.hint}
              testID={`more-${item.key}`}
              style={({ pressed }) => [
                styles.row,
                { backgroundColor: colors.surface, borderColor: colors.border, opacity: pressed ? 0.85 : 1 },
              ]}
              android_ripple={{ color: colors.border }}
            >
              <View style={[styles.iconWrap, { backgroundColor: colors.header }]}>
                <Icon size={20} color={colors.headerText} />
              </View>
              <View style={styles.texts}>
                <Text style={[styles.label, { color: colors.textPrimary }]}>{item.label}</Text>
                <Text style={[styles.hint, { color: colors.textMuted }]}>{item.hint}</Text>
              </View>
            </Pressable>
          );
        })}

        {/* زيارة الموقع — خارج التطبيق */}
        <Pressable
          onPress={() => {
            void tap();
            void Linking.openURL(SITE_URL);
          }}
          accessibilityRole="link"
          accessibilityLabel={`زيارة الموقع ${SITE_URL}`}
          testID="more-site"
          style={({ pressed }) => [
            styles.row,
            { backgroundColor: colors.surface, borderColor: colors.border, opacity: pressed ? 0.85 : 1 },
          ]}
          android_ripple={{ color: colors.border }}
        >
          <View style={[styles.iconWrap, { backgroundColor: colors.header }]}>
            <Globe size={20} color={colors.headerText} />
          </View>
          <View style={styles.texts}>
            <Text style={[styles.label, { color: colors.textPrimary }]}>زيارة الموقع</Text>
            <Text style={[styles.hint, { color: colors.textMuted }]}>{SITE_URL}</Text>
          </View>
        </Pressable>

        <Text style={[styles.footer, { color: colors.textMuted }]}>
          {SITE_NAME}
          {"\n"}الإصدار {Constants.expoConfig?.version ?? "1.0.0"}
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: {
    padding: spacing.lg,
    gap: spacing.md,
    paddingBottom: spacing.xxxl,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radii.lg,
    borderWidth: StyleSheet.hairlineWidth * 2,
    minHeight: touch.target + 24,
  },
  iconWrap: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
  },
  texts: { flex: 1, gap: 2 },
  label: {
    fontFamily: fonts.serifMedium,
    fontSize: 15,
    lineHeight: 22,
  },
  hint: {
    fontFamily: fonts.serifRegular,
    fontSize: 12,
    lineHeight: 17,
  },
  footer: {
    textAlign: "center",
    fontFamily: fonts.serifRegular,
    fontSize: 12,
    lineHeight: 20,
    paddingTop: spacing.xl,
  },
});
