/**
 * البحث — سريع: مناقشة ٣٠٠مث (debounce)، إلغاء الطلبات السابقة تلقائياً
 * (TanStack Query عبر المفتاح)، فلاتر فئة + نطاق تاريخ، وبحوث سابقة محلياً.
 */

import { useEffect, useRef, useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import { Stack, useRouter } from "expo-router";
import { DateTimePickerAndroid } from "@react-native-community/datetimepicker";
import { ArrowRight, Calendar, Search, X } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import type { Category } from "@/types/api";
import { useSearch } from "@/hooks/queryHooks";
import { useTheme } from "@/theme/ThemeProvider";
import { fonts, radii, spacing, touch } from "@/theme/tokens";
import { CATEGORY_LABEL } from "@/utils/format";
import { ItemList } from "@/components/ItemList";
import { PressableCard } from "@/components/ui/PressableCard";
import { OfflineBar } from "@/components/ui/States";
import { useLibraryStore } from "@/store/libraryStore";
import { tap } from "@/utils/haptics";
import type { CardItem } from "@/components/ItemCard";

const CATEGORY_FILTERS: (Category | "ALL")[] = ["ALL", "AUDIO", "VIDEO", "WRITTEN"];

/** مناقشة قيمة — يمنع طلباً لكل حرف. */
function useDebounced<T>(value: T, ms: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), ms);
    return () => clearTimeout(timer);
  }, [value, ms]);
  return debounced;
}

function toYmd(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate(),
  ).padStart(2, "0")}`;
}

export default function SearchScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [q, setQ] = useState("");
  const [category, setCategory] = useState<Category | "ALL">("ALL");
  const [from, setFrom] = useState<string | undefined>();
  const [to, setTo] = useState<string | undefined>();

  const debouncedQ = useDebounced(q, 300);
  const hasFilters = category !== "ALL" || !!from || !!to;
  const active = debouncedQ.trim().length >= 2 || hasFilters;

  const query = useSearch({
    q: debouncedQ.trim(),
    category: category === "ALL" ? undefined : category,
    from,
    to,
    enabled: active,
  });

  const recentSearches = useLibraryStore((s) => s.recentSearches);
  const addRecentSearch = useLibraryStore((s) => s.addRecentSearch);
  const removeRecentSearch = useLibraryStore((s) => s.removeRecentSearch);
  const clearRecentSearches = useLibraryStore((s) => s.clearRecentSearches);

  const inputRef = useRef<TextInput>(null);

  const showDatePicker = (which: "from" | "to") => {
    const current = which === "from" ? from : to;
    DateTimePickerAndroid.open({
      value: current ? new Date(`${current}T00:00:00`) : new Date(),
      mode: "date",
      onChange: (event, date) => {
        if (event.type === "set" && date) {
          if (which === "from") setFrom(toYmd(date));
          else setTo(toYmd(date));
        }
      },
    });
  };

  const openItem = (item: CardItem) => {
    if (debouncedQ.trim()) addRecentSearch(debouncedQ.trim());
    router.push(`/item/${item.id}`);
  };

  const submitQuery = () => {
    const trimmed = q.trim();
    if (trimmed) addRecentSearch(trimmed);
  };

  const showRecents = !active;

  return (
    <View style={[styles.flex, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* شريط البحث */}
      <View style={[styles.searchBar, { backgroundColor: colors.header }]}>
        <PressableCard
          flat
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="رجوع"
          style={styles.backButton}
        >
          <ArrowRight size={22} color={colors.headerText} />
        </PressableCard>
        <View style={[styles.inputWrap, { backgroundColor: "rgba(255,255,255,0.1)" }]}>
          <Search size={17} color={colors.headerText} />
          <TextInput
            ref={inputRef}
            value={q}
            onChangeText={setQ}
            onSubmitEditing={submitQuery}
            placeholder="ابحث في المكتبة…"
            placeholderTextColor="rgba(236,230,221,0.55)"
            style={[styles.input, { color: colors.headerText }]}
            returnKeyType="search"
            autoFocus
            testID="search-input"
            accessibilityLabel="حقل البحث"
          />
          {q.length > 0 ? (
            <PressableCard
              flat
              onPress={() => setQ("")}
              accessibilityRole="button"
              accessibilityLabel="مسح البحث"
              style={styles.clearButton}
            >
              <X size={16} color={colors.headerText} />
            </PressableCard>
          ) : null}
        </View>
      </View>

      {/* الفلاتر */}
      <View style={[styles.filterRow, { borderColor: colors.border }]}>
        <View style={styles.categoryChips}>
          {CATEGORY_FILTERS.map((c) => {
            const activeChip = category === c;
            const label = c === "ALL" ? "الكل" : CATEGORY_LABEL[c];
            return (
              <PressableCard
                key={c}
                flat
                onPress={() => {
                  void tap();
                  setCategory(c);
                }}
                accessibilityRole="button"
                accessibilityState={{ selected: activeChip }}
                style={[
                  styles.chip,
                  {
                    backgroundColor: activeChip ? colors.header : colors.surface,
                    borderColor: colors.borderStrong,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.chipText,
                    { color: activeChip ? colors.headerText : colors.textSecondary },
                  ]}
                >
                  {label}
                </Text>
              </PressableCard>
            );
          })}
        </View>

        <View style={styles.dateButtons}>
          <PressableCard
            flat
            onPress={() => showDatePicker("from")}
            accessibilityRole="button"
            accessibilityLabel="من تاريخ"
            style={[styles.chip, { backgroundColor: from ? colors.header : colors.surface, borderColor: colors.borderStrong }]}
          >
            <Calendar size={14} color={from ? colors.headerText : colors.textSecondary} />
            <Text style={[styles.chipText, { color: from ? colors.headerText : colors.textSecondary }]}>
              {from ? `من ${from}` : "من تاريخ"}
            </Text>
          </PressableCard>
          <PressableCard
            flat
            onPress={() => showDatePicker("to")}
            accessibilityRole="button"
            accessibilityLabel="إلى تاريخ"
            style={[styles.chip, { backgroundColor: to ? colors.header : colors.surface, borderColor: colors.borderStrong }]}
          >
            <Calendar size={14} color={to ? colors.headerText : colors.textSecondary} />
            <Text style={[styles.chipText, { color: to ? colors.headerText : colors.textSecondary }]}>
              {to ? `إلى ${to}` : "إلى تاريخ"}
            </Text>
          </PressableCard>
          {hasFilters ? (
            <PressableCard
              flat
              onPress={() => {
                void tap();
                setCategory("ALL");
                setFrom(undefined);
                setTo(undefined);
              }}
              accessibilityRole="button"
              accessibilityLabel="مسح الفلاتر"
              style={[styles.chip, { borderColor: colors.borderStrong, backgroundColor: colors.surface }]}
            >
              <X size={14} color={colors.accentStrong} />
              <Text style={[styles.chipText, { color: colors.accentStrong }]}>مسح</Text>
            </PressableCard>
          ) : null}
        </View>
      </View>

      {/* البحوث السابقة */}
      {showRecents ? (
        recentSearches.length > 0 ? (
          <View style={styles.recents}>
            <View style={styles.recentsHead}>
              <Text style={[styles.recentsTitle, { color: colors.textPrimary }]}>
                عمليات البحث الأخيرة
              </Text>
              <PressableCard
                flat
                onPress={() => {
                  void tap();
                  clearRecentSearches();
                }}
                accessibilityRole="button"
                accessibilityLabel="مسح كل عمليات البحث"
                style={styles.clearAll}
              >
                <Text style={[styles.clearAllText, { color: colors.accentStrong }]}>مسح الكل</Text>
              </PressableCard>
            </View>
            {recentSearches.map((term) => (
              <PressableCard
                key={term}
                flat
                onPress={() => {
                  void tap();
                  setQ(term);
                }}
                accessibilityRole="button"
                accessibilityLabel={`بحث عن ${term}`}
                style={[styles.recentRow, { borderColor: colors.border }]}
                testID={`recent-search-${term}`}
              >
                <Search size={15} color={colors.textMuted} />
                <Text style={[styles.recentText, { color: colors.textSecondary }]} numberOfLines={1}>
                  {term}
                </Text>
                <PressableCard
                  flat
                  onPress={() => removeRecentSearch(term)}
                  accessibilityRole="button"
                  accessibilityLabel={`حذف بحث ${term}`}
                  style={styles.recentDelete}
                >
                  <X size={14} color={colors.textMuted} />
                </PressableCard>
              </PressableCard>
            ))}
          </View>
        ) : (
          <View style={styles.hintWrap}>
            <Text style={[styles.hintText, { color: colors.textMuted }]}>
              اكتب كلمة للبحث في العناوين والأوصاف — أو حدّد فئة أو نطاق تاريخ.
            </Text>
          </View>
        )
      ) : (
        <View style={styles.flex}>
          <ItemList
            items={(query.data?.items ?? []) as CardItem[]}
            onPressItem={openItem}
            isLoading={query.isLoading}
            isError={query.isError}
            onRetry={() => void query.refetch()}
            emptyTitle="لا توجد نتائج مطابقة."
            emptyHint="جرّب كلمات أخرى أو وسّع الفلاتر."
            testID="search-results"
            ListHeaderComponent={query.data?.isOfflineData ? <View style={styles.offlineWrap}><OfflineBar /></View> : undefined}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  backButton: {
    width: touch.target,
    height: touch.target,
    borderRadius: radii.full,
    alignItems: "center",
    justifyContent: "center",
  },
  inputWrap: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    borderRadius: radii.full,
    paddingHorizontal: spacing.md,
    minHeight: touch.target,
  },
  input: {
    flex: 1,
    fontFamily: fonts.serifRegular,
    fontSize: 15,
    lineHeight: 22,
    paddingVertical: 0,
    textAlign: "right",
    writingDirection: "rtl",
  },
  clearButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  filterRow: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth * 2,
    gap: spacing.sm,
  },
  categoryChips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
  },
  dateButtons: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    borderRadius: radii.full,
    borderWidth: StyleSheet.hairlineWidth * 2,
    paddingHorizontal: spacing.md,
    minHeight: touch.targetSmall - 6,
  },
  chipText: {
    fontFamily: fonts.serifMedium,
    fontSize: 12.5,
    lineHeight: 18,
  },
  recents: {
    padding: spacing.lg,
    gap: spacing.sm,
  },
  recentsHead: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.xs,
  },
  recentsTitle: {
    fontFamily: fonts.serifMedium,
    fontSize: 14,
    lineHeight: 20,
  },
  clearAll: { minHeight: touch.targetSmall, justifyContent: "center", paddingHorizontal: spacing.sm },
  clearAllText: {
    fontFamily: fonts.serifMedium,
    fontSize: 12.5,
    lineHeight: 18,
  },
  recentRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth * 2,
    minHeight: touch.target,
    paddingHorizontal: spacing.xs,
  },
  recentText: {
    flex: 1,
    fontFamily: fonts.serifRegular,
    fontSize: 14,
    lineHeight: 20,
  },
  recentDelete: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  hintWrap: {
    padding: spacing.xxxl,
    alignItems: "center",
  },
  hintText: {
    fontFamily: fonts.serifRegular,
    fontSize: 13.5,
    lineHeight: 21,
    textAlign: "center",
  },
  offlineWrap: {
    paddingTop: spacing.sm,
  },
});
