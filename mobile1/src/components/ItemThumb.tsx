/**
 * مصغرة عنصر: صورة من Drive (مع كاش expo-image)، أو بطاقة فنية هادئة
 * للعناصر الصوتية بلا مصغرة (تدرج حبر + نجمة + تسمية الفئة).
 */

import { StyleSheet, View } from "react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";

import type { Category } from "@/types/api";
import { resolveItemThumbnail } from "@/utils/drive";
import { rawColors, radii } from "@/theme/tokens";
import { StarOrnament } from "./StarOrnament";
import { CategoryBadge } from "./CategoryBadge";

interface ItemThumbProps {
  item: {
    thumbnail: string | null;
    driveFileId: string | null;
    category: Category;
    title: string;
  };
  size?: number;
  radius?: number;
}

export function ItemThumb({ item, size = 96, radius = radii.md }: ItemThumbProps) {
  const uri = resolveItemThumbnail(item.thumbnail, item.driveFileId);

  if (!uri) {
    return (
      <View
        style={[
          styles.fallback,
          { width: size, height: size, borderRadius: radius },
        ]}
        accessibilityLabel={`مادة ${item.category === "AUDIO" ? "صوتية" : "مرئية"} بدون صورة`}
      >
        <LinearGradient
          colors={[rawColors.ink, rawColors.ink2]}
          style={StyleSheet.absoluteFill}
        />
        <StarOrnament size={size * 0.34} color={rawColors.gold} opacity={0.8} />
        <View style={styles.fallbackBadge}>
          <CategoryBadge category={item.category} withLabel={false} inverted />
        </View>
      </View>
    );
  }

  return (
    <View style={{ width: size, height: size, borderRadius: radius, overflow: "hidden" }}>
      <Image
        source={{ uri }}
        style={{ width: size, height: size }}
        contentFit="cover"
        cachePolicy="memory-disk"
        transition={200}
        accessibilityLabel={`مصغرة: ${item.title}`}
      />
      {item.category !== "WRITTEN" ? (
        <View style={styles.mediaBadge}>
          <CategoryBadge category={item.category} withLabel={false} inverted />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  fallback: {
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  fallbackBadge: {
    position: "absolute",
    bottom: 6,
    insetInlineStart: 6,
  },
  mediaBadge: {
    position: "absolute",
    bottom: 6,
    insetInlineStart: 6,
  },
});
