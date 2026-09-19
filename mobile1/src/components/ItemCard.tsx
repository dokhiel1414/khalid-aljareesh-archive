/**
 * بطاقة عنصر — إعادة تصميم أصلية للجوال (ليست نسخة من بطاقات الموقع):
 * صف أفقي: مصغرة يمنى (RTL) + محتوى: عنوان، وصف، بيانات وصفية، إجراء رئيسي.
 * الضغط على البطاقة = التفاصيل؛ زر التشغيل = تشغيل فوري داخل القائمة.
 * لا منطق شبكة داخل البطاقة — البيانات تمر كخاصيات.
 */

import { StyleSheet, Text, View } from "react-native";
import { Headphones, Heart, Play } from "lucide-react-native";

import type { Category } from "@/types/api";
import { useTheme } from "@/theme/ThemeProvider";
import { fonts, radii, spacing, touch } from "@/theme/tokens";
import { formatRelativeDate, formatViews, toArabicDigits } from "@/utils/format";
import { PressableCard } from "./ui/PressableCard";
import { ItemThumb } from "./ItemThumb";
import { CategoryBadge } from "./CategoryBadge";
import { toItemLike, useLibraryStore } from "@/store/libraryStore";
import { usePlayerStore } from "@/services/audioEngine";
import { tap } from "@/utils/haptics";

/**
 * بيانات كافية لبطاقة عنصر — مجموعة بنيوية دنيا تسمح بالعرض
 * من المفضلة/السجل المخزّنين محلياً دون إعادة جلب من الشبكة.
 */
export interface CardItem {
  id: string;
  title: string;
  description: string | null;
  category: Category;
  thumbnail: string | null;
  driveFileId: string | null;
  driveLink: string | null;
  publishedAt?: string;
  viewCount?: number;
}

interface ItemCardProps {
  item: CardItem;
  onPress: (item: CardItem) => void;
  /** رقم الحلقة داخل برنامج (اختياري). */
  episodeOrder?: number | null;
  testID?: string;
}

export function ItemCard({ item, onPress, episodeOrder, testID }: ItemCardProps) {
  const { colors } = useTheme();
  const isFavorite = useLibraryStore((s) => s.isFavorite(item.id));
  const toggleFavorite = useLibraryStore((s) => s.toggleFavorite);
  const playQueue = usePlayerStore((s) => s.playQueue);

  const playable = item.category !== "WRITTEN";

  const handlePlay = () => {
    void tap();
    if (item.category === "AUDIO") {
      playQueue(
        [
          {
            id: item.id,
            title: item.title,
            category: item.category,
            driveFileId: item.driveFileId,
            driveLink: item.driveLink,
            thumbnail: item.thumbnail,
          },
        ],
        0,
      );
    } else {
      // مرئيات: التشغيل من شاشة التفاصيل (مشغّل فيديو كامل).
      onPress(item);
    }
  };

  return (
    <PressableCard
      onPress={() => onPress(item)}
      accessibilityLabel={`${item.title}${episodeOrder ? `، ${episodeText(episodeOrder)}` : ""}`}
      accessibilityHint={playable ? "يفتح التفاصيل، أو زر التشغيل لتشغيله مباشرة" : "يفتح المادة"}
      testID={testID}
    >
      <View style={styles.row}>
        <ItemThumb item={item} />
        <View style={styles.content}>
          <View style={styles.titleRow}>
            <Text numberOfLines={2} style={[styles.title, { color: colors.textPrimary }]}>
              {item.title}
            </Text>
            <PressableCard
              flat
              onPress={() => {
                void tap();
                toggleFavorite(toItemLike(item));
              }}
              accessibilityRole="button"
              accessibilityLabel={
                isFavorite ? "إزالة من المفضلة" : "إضافة إلى المفضلة"
              }
              accessibilityState={{ selected: isFavorite }}
              style={styles.heart}
            >
              <Heart
                size={17}
                color={colors.favorite}
                fill={isFavorite ? colors.favorite : "transparent"}
              />
            </PressableCard>
          </View>

          {item.description ? (
            <Text
              numberOfLines={2}
              style={[styles.description, { color: colors.textSecondary }]}
            >
              {item.description}
            </Text>
          ) : null}

          <View style={styles.metaRow}>
            <CategoryBadge category={item.category} />
            {episodeOrder ? (
              <Text style={[styles.metaText, { color: colors.textMuted }]}>
                {episodeText(episodeOrder)}
              </Text>
            ) : null}
            <Text style={[styles.metaText, { color: colors.textMuted }]}>
              {formatViews(item.viewCount ?? 0)}
            </Text>
            {item.publishedAt ? (
              <Text style={[styles.metaText, { color: colors.textMuted }]}>
                {formatRelativeDate(item.publishedAt)}
              </Text>
            ) : null}
          </View>
        </View>

        {playable ? (
          <PressableCard
            flat
            onPress={handlePlay}
            accessibilityRole="button"
            accessibilityLabel={`تشغيل ${item.title}`}
            style={[styles.playButton, { backgroundColor: colors.header }]}
          >
            {item.category === "AUDIO" ? (
              <Headphones size={18} color={colors.headerText} />
            ) : (
              <Play size={18} color={colors.headerText} />
            )}
          </PressableCard>
        ) : null}
      </View>
    </PressableCard>
  );
}

function episodeText(order: number): string {
  return `الحلقة ${toArabicDigits(order)}`;
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    padding: spacing.md,
  },
  content: { flex: 1, gap: 5, alignSelf: "stretch", justifyContent: "center" },
  titleRow: { flexDirection: "row", alignItems: "flex-start", gap: spacing.sm },
  title: {
    flex: 1,
    fontFamily: fonts.serifBold,
    fontSize: 15,
    lineHeight: 23,
  },
  heart: { width: 30, height: 30, borderRadius: 15, alignItems: "center", justifyContent: "center" },
  description: {
    fontFamily: fonts.serifRegular,
    fontSize: 12.5,
    lineHeight: 19,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginTop: 1,
  },
  metaText: {
    fontFamily: fonts.serifRegular,
    fontSize: 11,
    lineHeight: 16,
  },
  playButton: {
    width: touch.target,
    height: touch.target,
    borderRadius: radii.full,
    alignItems: "center",
    justifyContent: "center",
  },
});
