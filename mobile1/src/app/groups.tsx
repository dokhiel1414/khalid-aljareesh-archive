/**
 * المجموعات والقنوات المجتمعية — روابط واتساب/تيليجرام تفتح التطبيق الخارجي.
 */

import { Linking, ScrollView, StyleSheet, Text, View } from "react-native";
import { Stack } from "expo-router";
import { MessageCircle, Send } from "lucide-react-native";

import { GROUPS, type CommunityGroup } from "@/constants/site";
import { useTheme } from "@/theme/ThemeProvider";
import { fonts, radii, spacing, touch } from "@/theme/tokens";
import { PressableCard } from "@/components/ui/PressableCard";
import { tap } from "@/utils/haptics";

const PLATFORM_LABEL = { whatsapp: "واتساب", telegram: "تيليجرام" } as const;

export default function GroupsScreen() {
  const { colors } = useTheme();

  return (
    <>
      <Stack.Screen options={{ title: "المجموعات والقنوات" }} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={[styles.intro, { color: colors.textSecondary }]}>
          مجموعات وقنوات توعوية مرتبطة بالمكتبة — تُفتح في تطبيقها مباشرة.
        </Text>
        {GROUPS.map((group) => (
          <GroupCard key={group.name} group={group} />
        ))}
      </ScrollView>
    </>
  );
}

function GroupCard({ group }: { group: CommunityGroup }) {
  const { colors } = useTheme();

  return (
    <View
      style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
      testID={`group-${group.name}`}
    >
      <View style={styles.cardHead}>
        <Text style={[styles.name, { color: colors.textPrimary }]}>{group.name}</Text>
        {group.finished ? (
          <View style={[styles.finishedBadge, { backgroundColor: colors.surfaceSunk }]}>
            <Text style={[styles.finishedText, { color: colors.textMuted }]}>منتهٍ — للاطلاع</Text>
          </View>
        ) : null}
      </View>
      {group.description ? (
        <Text style={[styles.description, { color: colors.textSecondary }]}>
          {group.description}
        </Text>
      ) : null}

      <View style={styles.links}>
        {group.links.map((link, i) => (
          <PressableCard
            key={`${link.platform}-${i}`}
            flat
            onPress={() => {
              void tap();
              void Linking.openURL(link.url);
            }}
            accessibilityRole="link"
            accessibilityLabel={`فتح ${PLATFORM_LABEL[link.platform]} — ${group.name}`}
            style={[styles.linkButton, { borderColor: colors.borderStrong }]}
          >
            {link.platform === "whatsapp" ? (
              <MessageCircle size={17} color={colors.accentStrong} />
            ) : (
              <Send size={17} color={colors.accentStrong} />
            )}
            <Text style={[styles.linkText, { color: colors.accentStrong }]}>
              {PLATFORM_LABEL[link.platform]}
            </Text>
          </PressableCard>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.giant,
    gap: spacing.md,
  },
  intro: {
    fontFamily: fonts.serifRegular,
    fontSize: 14,
    lineHeight: 23,
  },
  card: {
    borderRadius: radii.lg,
    borderWidth: StyleSheet.hairlineWidth * 2,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  cardHead: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
  },
  name: {
    flex: 1,
    fontFamily: fonts.serifBold,
    fontSize: 15.5,
    lineHeight: 24,
  },
  finishedBadge: {
    borderRadius: radii.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
  },
  finishedText: {
    fontFamily: fonts.serifRegular,
    fontSize: 11,
    lineHeight: 15,
  },
  description: {
    fontFamily: fonts.serifRegular,
    fontSize: 13.5,
    lineHeight: 21,
  },
  links: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  linkButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderWidth: StyleSheet.hairlineWidth * 2,
    borderRadius: radii.full,
    paddingHorizontal: spacing.md,
    minHeight: touch.targetSmall,
  },
  linkText: {
    fontFamily: fonts.serifMedium,
    fontSize: 13,
    lineHeight: 19,
  },
});
