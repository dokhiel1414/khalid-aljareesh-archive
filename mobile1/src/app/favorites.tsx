/**
 * المفضلة — مواد محفوظة محلياً (تُعرض فوراً دون شبكة).
 */

import { useCallback } from "react";
import { Stack, useRouter } from "expo-router";

import { useLibraryStore } from "@/store/libraryStore";
import { ItemList } from "@/components/ItemList";
import type { CardItem } from "@/components/ItemCard";

export default function FavoritesScreen() {
  const router = useRouter();
  const favorites = useLibraryStore((s) => s.favorites);

  const openItem = useCallback(
    (item: CardItem) => router.push(`/item/${item.id}`),
    [router],
  );

  return (
    <>
      <Stack.Screen options={{ title: "المفضلة" }} />
      <ItemList
        items={favorites}
        onPressItem={openItem}
        emptyTitle="لا توجد مواد في المفضلة بعد."
        emptyHint="اضغط قلب البطاقة أو زر «مفضلة» في شاشة المادة لحفظها هنا."
        testID="favorites-list"
      />
    </>
  );
}
