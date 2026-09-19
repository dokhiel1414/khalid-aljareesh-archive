/**
 * التبويبات — شريط سفلي مخصص يستضيف المشغّل المصغّر فوقه مباشرة.
 * قرار موثق: NativeTabs لا يزال unstable-native-tabs في SDK 57،
 * لذلك تبويبات JS ثابتة مع tabBar مخصص (نفس السلوك + MiniPlayer دائم).
 * تبويبات: الرئيسية، الصوتيات، المرئيات، المقالات، المزيد.
 */

import { Pressable, StyleSheet, Text, View } from "react-native";
import { Tabs } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  BookOpen,
  Headphones,
  Home,
  Menu,
  MonitorPlay,
} from "lucide-react-native";

import { useTheme } from "@/theme/ThemeProvider";
import { elevation, fonts, spacing, touch } from "@/theme/tokens";
import { MiniPlayer } from "@/features/audio/MiniPlayer";
import { tap } from "@/utils/haptics";

const TABS = [
  { name: "index", label: "الرئيسية", icon: Home },
  { name: "audio", label: "الصوتيات", icon: Headphones },
  { name: "video", label: "المرئيات", icon: MonitorPlay },
  { name: "written", label: "المقالات", icon: BookOpen },
  { name: "more", label: "المزيد", icon: Menu },
] as const;

/** واجهة بنيوية دنيا لخاصيات tabBar (بدون اعتماد على حزم تنقل داخلية). */
interface TabBarProps {
  state: { routes: { key: string; name: string }[]; index: number };
  navigation: {
    emit: (event: { type: string; target: string; canPreventDefault: boolean }) => {
      defaultPrevented: boolean;
    };
    navigate: (name: string) => void;
  };
}

function CustomTabBar({ state, navigation }: TabBarProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.bar,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          paddingBottom: Math.max(insets.bottom, spacing.sm),
        },
      ]}
      testID="tab-bar"
    >
      {/* المشغّل المصغّر فوق التبويبات مباشرة (يظهر فقط مع قائمة تشغيل) */}
      <MiniPlayer />

      <View style={styles.tabsRow}>
        {state.routes.map((route, index) => {
          const tab = TABS.find((t) => t.name === route.name);
          if (!tab) return null;
          const focused = state.index === index;
          const Icon = tab.icon;
          return (
            <Pressable
              key={route.key}
              onPress={() => {
                const event = navigation.emit({
                  type: "tabPress",
                  target: route.key,
                  canPreventDefault: true,
                });
                if (!focused && !event.defaultPrevented) {
                  void tap();
                  navigation.navigate(route.name);
                }
              }}
              accessibilityRole="tab"
              accessibilityLabel={tab.label}
              accessibilityState={{ selected: focused }}
              testID={`tab-${tab.name}`}
              style={styles.tab}
              android_ripple={{ color: colors.border }}
            >
              <Icon
                size={touch.iconMd}
                color={focused ? colors.accentStrong : colors.textMuted}
              />
              <Text
                numberOfLines={1}
                style={[
                  styles.tabLabel,
                  {
                    color: focused ? colors.accentStrong : colors.textMuted,
                    fontFamily: focused ? fonts.serifMedium : fonts.serifRegular,
                  },
                ]}
              >
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...(props as unknown as TabBarProps)} />}
      screenOptions={{ headerShown: false }}
      backBehavior="history"
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="audio" />
      <Tabs.Screen name="video" />
      <Tabs.Screen name="written" />
      <Tabs.Screen name="more" />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  bar: {
    borderTopWidth: StyleSheet.hairlineWidth * 2,
    ...elevation.floating,
  },
  tabsRow: {
    flexDirection: "row",
  },
  tab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
    minHeight: touch.target + 8,
    paddingTop: spacing.xs,
  },
  tabLabel: {
    fontSize: 11,
    lineHeight: 15,
  },
});
