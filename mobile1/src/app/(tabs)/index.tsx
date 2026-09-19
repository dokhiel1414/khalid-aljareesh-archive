/**
 * الرئيسية — Hero أصلي للجوال + مواضيع + آخر الإضافات.
 * FlashList واحدة: الرأس (Hero + شريط المواضيع) خارج الإفتراضية،
 * وآخر الإضافات كبيانات القائمة (٦ عناصر).
 */

import { useCallback } from "react";
import { StyleSheet, Text, View } from "react-native";
import { FlashList } from "@shopify/flash-list";
import { useRouter } from "expo-router";
import { ScrollView } from "react-native-gesture-handler";

import type { Category } from "@/types/api";
import { useItems, useTopics } from "@/hooks/queryHooks";
import { HomeHero } from "@/components/HomeHero";
import { TopicCard } from "@/components/TopicCard";
import { ItemCard, type CardItem } from "@/components/ItemCard";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { useTheme } from "@/theme/ThemeProvider";
import { fonts, spacing } from "@/theme/tokens";

export default function HomeScreen() {
  const { colors } = useTheme();
  const router = useRouter();

  const { data: itemsData } = useItems();
  const items = itemsData?.items ?? [];
  const { data: topics = [] } = useTopics();

  const counts = items.reduce<Partial<Record<Category, number>>>((acc, item) => {
    acc[item.category] = (acc[item.category] ?? 0) + 1;
    return acc;
  }, {});

  const latest = items.slice(0, 6);

  const openItem = useCallback(
    (item: CardItem) => router.push(`/item/${item.id}`),
    [router],
  );

  const renderItem = useCallback(
    ({ item }: { item: CardItem }) => <ItemCard item={item} onPress={openItem} />,
    [openItem],
  );

  return (
    <FlashList
      data={latest}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      contentContainerStyle={styles.content}
      ItemSeparatorComponent={Separator}
      showsVerticalScrollIndicator={false}
      testID="home-list"
      ListHeaderComponent={
        <View>
          <HomeHero counts={counts} />

          {/* المواضيع والبرامج — شريط أفقي */}
          <View style={styles.section}>
            <SectionHeader
              title="المواضيع والبرامج"
              actionLabel="جميع المواضيع"
              onAction={() => router.push("/topics")}
            />
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.topicsStrip}
            >
              {topics.map((topic) => (
                <View key={topic.id} style={styles.topicCardWrap}>
                  <TopicCard
                    topic={topic}
                    onPress={(t) => router.push(`/topic/${t.slug || t.id}`)}
                  />
                </View>
              ))}
            </ScrollView>
          </View>

          <SectionHeader title="آخر الإضافات" />
        </View>
      }
      ListFooterComponent={
        <Text style={[styles.footer, { color: colors.textMuted }]}>
          أرشيف خالد بن علي الجريش — كل الدروس والمحاضرات والمقالات
        </Text>
      }
    />
  );
}

function Separator() {
  return <View style={styles.separator} />;
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: spacing.xxxl,
  },
  section: {
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  topicsStrip: {
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
    paddingBottom: spacing.xs,
  },
  topicCardWrap: { width: 210 },
  separator: { height: spacing.md },
  footer: {
    textAlign: "center",
    fontFamily: fonts.serifRegular,
    fontSize: 12,
    lineHeight: 18,
    paddingHorizontal: spacing.xxxl,
    paddingVertical: spacing.xl,
  },
});
