/**
 * رأس شاشات التبويبات — شريط حبر داكن (عنصر هوية) بعنوان وزر بحث.
 * التبويبات بلا رأس أصلي (headerShown: false) فتستخدم هذا المكوّن.
 */

import { StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Search } from "lucide-react-native";

import { useTheme } from "@/theme/ThemeProvider";
import { fonts, spacing, touch } from "@/theme/tokens";
import { IconButton } from "./Buttons";
import { tap } from "@/utils/haptics";

export function TabHeader({ title }: { title: string }) {
  const { colors } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.header,
        { backgroundColor: colors.header, paddingTop: insets.top + spacing.sm },
      ]}
    >
      <Text style={[styles.title, { color: colors.headerText }]} accessibilityRole="header">
        {title}
      </Text>
      <IconButton
        inverted
        icon={<Search size={touch.iconMd} color={colors.headerText} />}
        onPress={() => {
          void tap();
          router.push("/search");
        }}
        accessibilityLabel="البحث"
        testID="header-search"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  title: {
    fontFamily: fonts.serifBold,
    fontSize: 21,
    lineHeight: 30,
  },
});
