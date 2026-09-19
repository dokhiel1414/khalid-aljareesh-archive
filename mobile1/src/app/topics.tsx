/**
 * كل المواضيع والبرامج — شبكة عمودين.
 */

import { useCallback } from "react";
import { StyleSheet, View } from "react-native";
import { FlashList } from "@shopify/flash-list";
import { Stack, useRouter } from "expo-router";

import { useTopics } from "@/hooks/queryHooks";
import { TopicCard } from "@/components/TopicCard";
import { ErrorState } from "@/components/ui/States";
import { spacing } from "@/theme/tokens";
import type { Topic } from "@/types/api";

export default function TopicsScreen() {
  const router = useRouter();
  const query = useTopics();
  const topics = query.data ?? [];

  const openTopic = useCallback(
    (topic: Topic) => router.push(`/topic/${topic.slug || topic.id}`),
    [router],
  );

  if (query.isError && topics.length === 0) {
    return (
      <>
        <Stack.Screen options={{ title: "المواضيع والبرامج" }} />
        <ErrorState onRetry={() => void query.refetch()} />
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: "المواضيع والبرامج" }} />
      <FlashList
        data={topics}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.cell}>
            <TopicCard topic={item} onPress={openTopic} />
          </View>
        )}
        numColumns={2}
        contentContainerStyle={styles.content}
        refreshing={query.isRefetching}
        onRefresh={() => void query.refetch()}
        showsVerticalScrollIndicator={false}
        testID="topics-list"
      />
    </>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  cell: {
    flex: 1,
    margin: spacing.xs,
  },
});
