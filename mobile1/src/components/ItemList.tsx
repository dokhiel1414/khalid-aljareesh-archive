/**
 * قائمة عناصر — FlashList خفيفة مع سحب للتحديث وحالات فارغ/خطأ/دون اتصال.
 * renderItem ثابت (مُعرَّف خارج المكون) حتى لا تُعاد بناء البطاقات عبثاً.
 */

import { useCallback, type ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import { FlashList } from "@shopify/flash-list";

import { spacing } from "@/theme/tokens";
import { ItemCard, type CardItem } from "./ItemCard";
import { ItemCardSkeleton } from "./ui/Skeleton";
import { EmptyState, ErrorState, OfflineBar } from "./ui/States";
import { useIsOffline } from "@/hooks/useNetworkStatus";

interface ItemListProps {
  items: CardItem[];
  onPressItem: (item: CardItem) => void;
  getEpisodeOrder?: (item: CardItem) => number | null | undefined;
  isLoading?: boolean;
  isError?: boolean;
  onRetry?: () => void;
  refreshing?: boolean;
  onRefresh?: () => void;
  emptyTitle?: string;
  emptyHint?: string;
  ListHeaderComponent?: ReactNode;
  testID?: string;
}

export function ItemList({
  items,
  onPressItem,
  getEpisodeOrder,
  isLoading,
  isError,
  onRetry,
  refreshing,
  onRefresh,
  emptyTitle = "لا توجد مواد هنا بعد.",
  emptyHint,
  ListHeaderComponent,
  testID,
}: ItemListProps) {
  const offline = useIsOffline();

  const renderItem = useCallback(
    ({ item }: { item: CardItem }) => (
      <ItemCard
        item={item}
        onPress={onPressItem}
        episodeOrder={getEpisodeOrder?.(item)}
        testID={`item-card-${item.id}`}
      />
    ),
    [getEpisodeOrder, onPressItem],
  );

  if (isLoading) {
    return (
      <View style={styles.skeletonList} testID="item-list-loading">
        {[0, 1, 2, 3].map((i) => (
          <ItemCardSkeleton key={i} />
        ))}
      </View>
    );
  }

  if (isError) {
    return <ErrorState onRetry={onRetry} />;
  }

  return (
    <FlashList
      testID={testID}
      data={items}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      contentContainerStyle={styles.content}
      ItemSeparatorComponent={Separator}
      ListHeaderComponent={
        <>
          {offline ? <OfflineBar /> : null}
          {ListHeaderComponent}
        </>
      }
      ListEmptyComponent={
        <EmptyState title={emptyTitle} hint={emptyHint} />
      }
      refreshing={refreshing}
      onRefresh={onRefresh}
      showsVerticalScrollIndicator={false}
      removeClippedSubviews
    />
  );
}

function Separator() {
  return <View style={styles.separator} />;
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  separator: { height: spacing.md },
  skeletonList: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    gap: spacing.lg,
  },
});
