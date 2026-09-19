/**
 * المشغّل المصغّر — شريط دائم فوق تبويبات التنقل يظهر عند وجود قائمة تشغيل.
 * نقرة = شاشة المشغّل الكامل؛ الأزرار فيه تتحكم مباشرة دون مغادرة الشاشة.
 */

import { Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { Pause, Play, X } from "lucide-react-native";

import { usePlayerStore } from "@/services/audioEngine";
import { useTheme } from "@/theme/ThemeProvider";
import { elevation, fonts, radii, spacing, touch } from "@/theme/tokens";
import { ItemThumb } from "@/components/ItemThumb";
import { formatDuration } from "@/utils/format";
import { tap } from "@/utils/haptics";

export function MiniPlayer() {
  const router = useRouter();
  const { colors } = useTheme();
  const queue = usePlayerStore((s) => s.queue);
  const index = usePlayerStore((s) => s.index);
  const status = usePlayerStore((s) => s.status);
  const position = usePlayerStore((s) => s.position);
  const duration = usePlayerStore((s) => s.duration);
  const toggle = usePlayerStore((s) => s.toggle);
  const stop = usePlayerStore((s) => s.stop);

  const entry = queue[index];
  if (!entry) return null;

  const isPlaying = status === "playing" || status === "buffering";
  const progress = duration > 0 ? Math.min(position / duration, 1) : 0;

  return (
    <View
      style={[styles.wrap, { backgroundColor: colors.surface, borderColor: colors.border }]}
      testID="mini-player"
    >
      {/* خط التقدم الشعري */}
      <View style={[styles.progressTrack, { backgroundColor: colors.border }]}>
        <View
          style={[
            styles.progressFill,
            { width: `${progress * 100}%`, backgroundColor: colors.accent },
          ]}
        />
      </View>

      <Pressable
        onPress={() => router.push("/player")}
        style={styles.main}
        accessibilityRole="button"
        accessibilityLabel={`فتح المشغل: ${entry.title}، ${formatDuration(position)} من ${formatDuration(duration)}`}
        android_ripple={{ color: colors.border }}
      >
        <ItemThumb
          item={{
            thumbnail: entry.thumbnail,
            driveFileId: entry.driveFileId,
            category: entry.category,
            title: entry.title,
          }}
          size={44}
          radius={radii.sm}
        />
        <View style={styles.texts}>
          <Text
            numberOfLines={1}
            style={[styles.title, { color: colors.textPrimary }]}
          >
            {entry.title}
          </Text>
          <Text style={[styles.time, { color: colors.textMuted }]}>
            {formatDuration(position)} / {formatDuration(duration)}
          </Text>
        </View>
      </Pressable>

      <Pressable
        onPress={() => {
          void tap();
          toggle();
        }}
        accessibilityRole="button"
        accessibilityLabel={isPlaying ? "إيقاف مؤقت" : "تشغيل"}
        accessibilityState={{ selected: isPlaying }}
        hitSlop={6}
        style={[styles.button, { backgroundColor: colors.header }]}
        android_ripple={{ color: colors.borderStrong }}
      >
        {isPlaying ? (
          <Pause size={20} color={colors.headerText} />
        ) : (
          <Play size={20} color={colors.headerText} />
        )}
      </Pressable>

      <Pressable
        onPress={stop}
        accessibilityRole="button"
        accessibilityLabel="إغلاق المشغل"
        hitSlop={8}
        style={[styles.button, { backgroundColor: "transparent" }]}
      >
        <X size={18} color={colors.textMuted} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    borderTopWidth: StyleSheet.hairlineWidth * 2,
    ...elevation.floating,
  },
  progressTrack: {
    position: "absolute",
    top: 0,
    insetInlineStart: 0,
    insetInlineEnd: 0,
    height: 2,
  },
  progressFill: { height: 2, borderTopEndRadius: 2, borderBottomEndRadius: 2 },
  main: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    minHeight: touch.target,
  },
  texts: { flex: 1, gap: 1 },
  title: { fontFamily: fonts.serifMedium, fontSize: 13.5, lineHeight: 20 },
  time: { fontFamily: fonts.serifRegular, fontSize: 11, lineHeight: 15 },
  button: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
  },
});
