/**
 * بطاقة موضوع/برنامج — غلاف إن وُجد، أو بطاقة فنية بتدرج حبر + نجمة،
 * مع شارة النوع وعدد المواد.
 */

import { StyleSheet, Text, View } from "react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { Layers } from "lucide-react-native";

import type { Topic } from "@/types/api";
import { TOPIC_TYPE_LABEL, itemCountLabel, toArabicDigits } from "@/utils/format";
import { useTheme } from "@/theme/ThemeProvider";
import { fonts, radii, rawColors, spacing } from "@/theme/tokens";
import { StarOrnament } from "./StarOrnament";
import { PressableCard } from "./ui/PressableCard";

export function TopicCard({
  topic,
  onPress,
}: {
  topic: Topic;
  onPress: (topic: Topic) => void;
}) {
  const { colors } = useTheme();
  const count = topic._count?.items ?? 0;
  const isProgram = topic.type === "PROGRAM";

  return (
    <PressableCard
      onPress={() => onPress(topic)}
      accessibilityLabel={`${TOPIC_TYPE_LABEL[topic.type]} ${topic.name}، ${toArabicDigits(count)} مادة`}
      testID={`topic-card-${topic.id}`}
    >
      <View style={styles.coverWrap}>
        {topic.coverImage ? (
          <Image
            source={{ uri: topic.coverImage }}
            style={styles.cover}
            contentFit="cover"
            transition={200}
            cachePolicy="memory-disk"
          />
        ) : (
          <LinearGradient
            colors={isProgram ? [rawColors.ink, rawColors.ink2] : [rawColors.brown, rawColors.ink]}
            style={styles.cover}
          />
        )}
        {!topic.coverImage ? (
          <View style={styles.fallbackArt}>
            <StarOrnament size={40} color={rawColors.gold} opacity={0.85} />
          </View>
        ) : null}
        <View style={styles.typeBadge}>
          <View style={styles.typePill}>
            <Layers size={12} color="#F5F1EA" />
            <Text style={styles.typeText}>{TOPIC_TYPE_LABEL[topic.type]}</Text>
          </View>
        </View>
      </View>

      <View style={styles.body}>
        <Text numberOfLines={2} style={[styles.name, { color: colors.textPrimary }]}>
          {topic.name}
        </Text>
        <Text style={[styles.count, { color: colors.textMuted }]}>
          {itemCountLabel("AUDIO", count)}
        </Text>
      </View>
    </PressableCard>
  );
}

const styles = StyleSheet.create({
  coverWrap: {
    height: 110,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  cover: { position: "absolute", top: 0, right: 0, bottom: 0, left: 0 },
  fallbackArt: { opacity: 0.9 },
  typeBadge: { position: "absolute", top: spacing.sm, insetInlineStart: spacing.sm },
  typePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(6,34,58,0.65)",
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radii.full,
  },
  typeText: {
    fontFamily: fonts.serifMedium,
    fontSize: 11,
    color: "#F5F1EA",
  },
  body: { padding: spacing.md, gap: 4 },
  name: {
    fontFamily: fonts.serifBold,
    fontSize: 15,
    lineHeight: 22,
  },
  count: {
    fontFamily: fonts.serifRegular,
    fontSize: 12,
    lineHeight: 17,
  },
});
