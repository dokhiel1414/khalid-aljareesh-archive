/**
 * عميل TanStack Query المركزي — كاش دائم عبر AsyncStorage
 * (قوائم ومواضيع تُعرض فوراً في الفتح التالي حتى بدون شبكة).
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import { QueryClient } from "@tanstack/react-query";
import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      // الشبكة تُدار يدوياً: seed يظهر فوراً، والتحديث في الخلفية.
      networkMode: "online",
      retry: 2,
    },
    mutations: {
      retry: 0,
    },
  },
});

export const queryPersister = createAsyncStoragePersister({
  storage: AsyncStorage,
  key: "kjarchive-query-v1",
});
