/**
 * تفاصيل موضوع/برنامج — وصف + قائمة مواد مرتبة.
 * البرامج (PROGRAM): زر «تشغيل البرنامج كاملاً» يشغّل الحلقات بالترتيب
 * مع أرقام الحلقات والسابق/التالي داخل المشغل.
 */

import { useCallback, useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { Play } from "lucide-react-native";

import { useTopic } from "@/hooks/queryHooks";
import { useTheme } from "@/theme/ThemeProvider";
import { elevation, fonts, radii, spacing } from "@/theme/tokens";
import { TOPIC_TYPE_LABEL } from "@/utils/format";
import { ItemList } from "@/components/ItemList";
import type { CardItem } from "@/components/ItemCard";
import { ErrorState, OfflineBar } from "@/components/ui/States";
import { Button } from "@/components/ui/Buttons";
import { StarOrnament } from "@/components/StarOrnament";
import { usePlayerStore, type QueueEntry } from "@/services/audioEngine";
import { confirm } from "@/utils/haptics";

export default function TopicScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const router = useRouter();
  const { colors } = useTheme();
  const query = useTopic(slug ?? "");
  const playQueue = usePlayerStore((s) => s.playQueue);

  const topic = query.data?.topic ?? null;
  const items = useMemo(() => query.data?.items ?? [], [query.data?.items]);
  const isProgram = topic?.type === "PROGRAM";

  /** حلقات البرنامج الصوتية بالترتيب. */
  const programQueue = useMemo<QueueEntry[]>(() => {
    if (!isProgram) return [];
    return items
      .filter((i) => i.category === "AUDIO")
      .sort((a, b) => (a.episodeOrder ?? 0) - (b.episodeOrder ?? 0))
      .map((i) => ({
        id: i.id,
        title: i.title,
        category: i.category,
        driveFileId: i.driveFileId,
        driveLink: i.driveLink,
        thumbnail: i.thumbnail,
      }));
  }, [isProgram, items]);

  const openItem = useCallback(
    (item: CardItem) => router.push(`/item/${item.id}`),
    [router],
  );

  const getEpisodeOrder = useCallback(
    (item: CardItem) => (item as CardItem & { episodeOrder?: number | null }).episodeOrder ?? null,
    [],
  );

  if (query.isError && !topic) {
    return (
      <>
        <Stack.Screen options={{ title: "موضوع" }} />
        <ErrorState onRetry={() => void query.refetch()} />
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: topic?.name ?? "موضوع" }} />
      <View style={styles.flex}>
        <ItemList
          items={items}
          onPressItem={openItem}
          getEpisodeOrder={getEpisodeOrder}
          isLoading={query.isLoading && !query.data}
          isError={query.isError}
          onRetry={() => void query.refetch()}
          refreshing={query.isRefetching}
          onRefresh={() => void query.refetch()}
          emptyTitle="لا توجد مواد في هذا الموضوع بعد."
          testID={`topic-list-${slug}`}
          ListHeaderComponent={
            <View>
              {query.data?.isOfflineData ? (
                <View style={styles.offlineWrap}>
                  <OfflineBar />
                </View>
              ) : null}

              {topic ? (
                <View
                  style={[
                    styles.headerCard,
                    { backgroundColor: colors.surface, borderColor: colors.border },
                  ]}
                >
                  <View style={styles.headerTop}>
                    <StarOrnament size={30} color={colors.accent} opacity={0.8} />
                    <Text
                      style={[styles.typeLabel, { color: colors.accentStrong }]}
                    >
                      {TOPIC_TYPE_LABEL[topic.type]}
                    </Text>
                  </View>
                  {topic.description ? (
                    <Text style={[styles.description, { color: colors.textSecondary }]}>
                      {topic.description}
                    </Text>
                  ) : null}
                  {isProgram && programQueue.length > 0 ? (
                    <View style={styles.playAllWrap}>
                      <Button
                        label="تشغيل البرنامج كاملاً"
                        icon={<Play size={18} color="#1F1205" fill="#1F1205" />}
                        variant="gold"
                        onPress={() => {
                          void confirm();
                          playQueue(programQueue, 0);
                        }}
                        testID="topic-play-all"
                      />
                    </View>
                  ) : null}
                </View>
              ) : null}
            </View>
          }
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  offlineWrap: {
    paddingTop: spacing.sm,
  },
  headerCard: {
    marginBottom: spacing.lg,
    borderRadius: radii.lg,
    borderWidth: StyleSheet.hairlineWidth * 2,
    padding: spacing.lg,
    ...elevation.card,
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.sm,
  },
  typeLabel: {
    fontFamily: fonts.serifMedium,
    fontSize: 13,
    lineHeight: 19,
  },
  description: {
    fontFamily: fonts.serifRegular,
    fontSize: 14,
    lineHeight: 24,
  },
  playAllWrap: {
    marginTop: spacing.lg,
  },
});
