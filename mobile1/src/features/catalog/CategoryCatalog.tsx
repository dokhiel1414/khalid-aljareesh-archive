/**
 * شاشة فئة موحدة (صوتيات/مرئيات/مقالات):
 * رأس التبويب + قائمة عناصر مع سحب للتحديث وحالات فارغ/خطأ/دون اتصال.
 */

import { useCallback } from "react";
import { StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";

import type { Category } from "@/types/api";
import { useItems } from "@/hooks/queryHooks";
import { ItemList } from "@/components/ItemList";
import type { CardItem } from "@/components/ItemCard";
import { TabHeader } from "@/components/ui/TabHeader";
import { CATEGORY_LABEL } from "@/utils/format";

export function CategoryCatalog({ category }: { category: Category }) {
  const router = useRouter();
  const query = useItems(category);
  const items = (query.data?.items ?? []) as CardItem[];

  const openItem = useCallback(
    (item: CardItem) => router.push(`/item/${item.id}`),
    [router],
  );

  return (
    <View style={styles.flex}>
      <TabHeader title={CATEGORY_LABEL[category]} />
      <View style={styles.flex}>
        <ItemList
          items={items}
          onPressItem={openItem}
          isLoading={query.isLoading}
          isError={query.isError}
          onRetry={() => void query.refetch()}
          refreshing={query.isRefetching}
          onRefresh={() => void query.refetch()}
          emptyTitle={`لا توجد مواد في ${CATEGORY_LABEL[category]} بعد.`}
          testID={`list-${category.toLowerCase()}`}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
});
