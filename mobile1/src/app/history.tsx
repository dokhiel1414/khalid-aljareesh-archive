/**
 * سجل الاستماع — آخر ما شغّله المستخدم (محلي، بلا حسابات).
 */

import { useCallback } from "react";
import { Stack, useRouter } from "expo-router";

import { useLibraryStore } from "@/store/libraryStore";
import { ItemList } from "@/components/ItemList";
import type { CardItem } from "@/components/ItemCard";

export default function HistoryScreen() {
  const router = useRouter();
  const recent = useLibraryStore((s) => s.recent);

  const openItem = useCallback(
    (item: CardItem) => router.push(`/item/${item.id}`),
    [router],
  );

  return (
    <>
      <Stack.Screen options={{ title: "سجل الاستماع" }} />
      <ItemList
        items={recent}
        onPressItem={openItem}
        emptyTitle="لا يوجد سجل استماع بعد."
        emptyHint="شغّل صوتية أو مرئية وستظهر هنا لتكملتها بسهولة."
        testID="history-list"
      />
    </>
  );
}
