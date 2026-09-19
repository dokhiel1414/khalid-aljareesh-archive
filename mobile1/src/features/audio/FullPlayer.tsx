/**
 * شاشة المشغّل الكامل — سطح داكن هادئ دائماً (كتطبيقات الصوتيات):
 * عمل فني كبير، عنوان، شريط تمرير، أزرار ±١٥ ثانية، سرعات، تحميل/مشاركة/مفضلة،
 * وقائمة التشغيل (التالي) مع تمييز الحالي. RTL كامل: «السابق» يمين، «التالي» يسار.
 */

import { useState } from "react";
import {
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Slider from "@react-native-community/slider";
import { useRouter } from "expo-router";
import {
  Check,
  Download,
  Heart,
  Pause,
  Play,
  RotateCcw,
  RotateCw,
  Share2,
  SkipBack,
  SkipForward,
  Trash2,
} from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";

import { PLAYBACK_RATES, usePlayerStore } from "@/services/audioEngine";
import { rawColors, fonts, radii, spacing, touch } from "@/theme/tokens";
import { CATEGORY_LABEL, formatDuration, toArabicDigits } from "@/utils/format";
import { SITE_URL } from "@/constants/site";
import { toItemLike, useLibraryStore } from "@/store/libraryStore";
import { useDownloadsStore } from "@/store/downloadsStore";
import { deleteDownload, startDownload } from "@/services/downloads";
import { ItemThumb } from "@/components/ItemThumb";
import { StarOrnament } from "@/components/StarOrnament";
import { confirm, tap } from "@/utils/haptics";

export function FullPlayer() {
  const router = useRouter();
  const queue = usePlayerStore((s) => s.queue);
  const index = usePlayerStore((s) => s.index);
  const status = usePlayerStore((s) => s.status);
  const position = usePlayerStore((s) => s.position);
  const duration = usePlayerStore((s) => s.duration);
  const rate = usePlayerStore((s) => s.rate);
  const error = usePlayerStore((s) => s.error);
  const toggle = usePlayerStore((s) => s.toggle);
  const seekTo = usePlayerStore((s) => s.seekTo);
  const seekBy = usePlayerStore((s) => s.seekBy);
  const skipNext = usePlayerStore((s) => s.skipNext);
  const skipPrev = usePlayerStore((s) => s.skipPrev);
  const setRate = usePlayerStore((s) => s.setRate);
  const jumpTo = usePlayerStore((s) => s.jumpTo);
  const stop = usePlayerStore((s) => s.stop);

  const isFavorite = useLibraryStore((s) =>
    queue[index] ? s.isFavorite(queue[index].id) : false,
  );
  const toggleFavorite = useLibraryStore((s) => s.toggleFavorite);
  const downloadRecord = useDownloadsStore((s) => s.records[queue[index]?.id ?? ""]);

  const [dragging, setDragging] = useState(false);
  const [dragValue, setDragValue] = useState(0);

  const entry = queue[index];
  if (!entry) {
    return (
      <View style={[styles.wrap, styles.emptyWrap]}>
        <StarOrnament size={56} color={rawColors.gold} opacity={0.7} />
        <Text style={styles.emptyTitle}>لا يوجد صوت قيد التشغيل</Text>
        <Pressable
          onPress={() => router.back()}
          accessibilityRole="button"
          style={styles.emptyBack}
        >
          <Text style={styles.emptyBackText}>العودة</Text>
        </Pressable>
      </View>
    );
  }

  const isPlaying = status === "playing" || status === "buffering";
  const isDownloaded = downloadRecord?.status === "done";
  const isDownloading = downloadRecord?.status === "downloading";
  const shownPosition = dragging ? dragValue : position;
  const canPrev = index > 0;
  const canNext = index < queue.length - 1;

  const handleShare = async () => {
    void confirm();
    await Share.share({
      title: entry.title,
      message: `${entry.title}\n${SITE_URL}/item/${entry.id}`,
    });
  };

  const handleDownload = async () => {
    void confirm();
    if (isDownloaded) {
      await deleteDownload(entry.id);
    } else if (!isDownloading) {
      await startDownload({
        id: entry.id,
        title: entry.title,
        driveFileId: entry.driveFileId,
        driveLink: entry.driveLink,
      });
    }
  };

  return (
    <View style={styles.wrap}>
      <LinearGradient
        colors={[rawColors.darkBg, rawColors.ink]}
        style={StyleSheet.absoluteFill}
      />

      <ScrollView contentContainerStyle={styles.content} bounces={false}>
        {/* عمل فني كبير */}
        <View style={styles.artworkWrap}>
          <ItemThumb
            item={{
              thumbnail: entry.thumbnail,
              driveFileId: entry.driveFileId,
              category: entry.category,
              title: entry.title,
            }}
            size={280}
            radius={radii.xl}
          />
        </View>

        {/* العنوان */}
        <View style={styles.titleBlock}>
          <Text style={styles.category}>{CATEGORY_LABEL[entry.category]}</Text>
          <Text style={styles.title} accessibilityRole="header">
            {entry.title}
          </Text>
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
        </View>

        {/* شريط التقدم */}
        <View style={styles.seekBlock}>
          <Slider
            style={styles.slider}
            minimumValue={0}
            maximumValue={Math.max(duration, 1)}
            value={shownPosition}
            onValueChange={(v) => {
              setDragging(true);
              setDragValue(v);
            }}
            onSlidingStart={() => {
              setDragging(true);
              setDragValue(position);
            }}
            onSlidingComplete={(v) => {
              setDragging(false);
              seekTo(v);
              void tap();
            }}
            minimumTrackTintColor={rawColors.gold}
            maximumTrackTintColor="rgba(236,230,221,0.18)"
            thumbTintColor={rawColors.gold}
            accessibilityLabel="شريط تقدم التشغيل"
            testID="player-seek-slider"
          />
          <View style={styles.timeRow}>
            <Text style={styles.timeText}>{formatDuration(shownPosition)}</Text>
            <Text style={styles.timeText}>{formatDuration(duration)}</Text>
          </View>
        </View>

        {/* أزرار التحكم */}
        <View style={styles.controls}>
          <ControlButton
            icon={<SkipForward size={26} color="#F5F1EA" />}
            label="السابق"
            onPress={() => {
              void tap();
              skipPrev();
            }}
            disabled={!canPrev}
          />
          <ControlButton
            icon={<RotateCcw size={26} color="#F5F1EA" />}
            label="رجوع ١٥ ثانية"
            onPress={() => {
              void tap();
              seekBy(-15);
            }}
          />
          <Pressable
            onPress={() => {
              void confirm();
              toggle();
            }}
            accessibilityRole="button"
            accessibilityLabel={isPlaying ? "إيقاف مؤقت" : "تشغيل"}
            accessibilityState={{ selected: isPlaying }}
            testID="player-play-pause"
            style={styles.mainPlay}
            android_ripple={{ color: "rgba(255,255,255,0.2)" }}
          >
            {isPlaying ? (
              <Pause size={34} color={rawColors.ink} fill={rawColors.ink} />
            ) : (
              <Play size={34} color={rawColors.ink} fill={rawColors.ink} />
            )}
          </Pressable>
          <ControlButton
            icon={<RotateCw size={26} color="#F5F1EA" />}
            label="تقديم ١٥ ثانية"
            onPress={() => {
              void tap();
              seekBy(15);
            }}
          />
          <ControlButton
            icon={<SkipBack size={26} color="#F5F1EA" />}
            label="التالي"
            onPress={() => {
              void tap();
              skipNext();
            }}
            disabled={!canNext}
          />
        </View>

        {/* السرعة */}
        <View style={styles.rateRow}>
          {PLAYBACK_RATES.map((r) => (
            <Pressable
              key={r}
              onPress={() => {
                void tap();
                setRate(r);
              }}
              accessibilityRole="button"
              accessibilityLabel={`سرعة ${toArabicDigits(r)}`}
              accessibilityState={{ selected: rate === r }}
              style={[
                styles.rateChip,
                rate === r && styles.rateChipActive,
              ]}
            >
              <Text
                style={[styles.rateText, rate === r && styles.rateTextActive]}
              >
                {toArabicDigits(r)}×
              </Text>
            </Pressable>
          ))}
        </View>

        {/* إجراءات */}
        <View style={styles.actionsRow}>
          <ActionButton
            icon={
              isDownloaded ? (
                <Check size={19} color={rawColors.gold} />
              ) : (
                <Download size={19} color="#F5F1EA" />
              )
            }
            label={
              isDownloaded ? "محمّل" : isDownloading ? "جارٍ التنزيل…" : "تحميل"
            }
            onPress={() => void handleDownload()}
          />
          <ActionButton
            icon={<Share2 size={19} color="#F5F1EA" />}
            label="مشاركة"
            onPress={() => void handleShare()}
          />
          <ActionButton
            icon={
              <Heart
                size={19}
                color={isFavorite ? rawColors.gold : "#F5F1EA"}
                fill={isFavorite ? rawColors.gold : "transparent"}
              />
            }
            label={isFavorite ? "في المفضلة" : "المفضلة"}
            onPress={() => {
              void tap();
              toggleFavorite(toItemLike(entry));
            }}
          />
          {isDownloaded ? (
            <ActionButton
              icon={<Trash2 size={19} color="#E08A7E" />}
              label="حذف التنزيل"
              onPress={() => void handleDownload()}
            />
          ) : null}
        </View>

        {/* قائمة التشغيل */}
        {queue.length > 1 ? (
          <View style={styles.queueSection}>
            <Text style={styles.queueTitle}>التالي</Text>
            {queue.slice(index + 1, index + 20).map((q, offset) => {
              const qi = index + 1 + offset;
              return (
                <Pressable
                  key={`${q.id}-${qi}`}
                  onPress={() => {
                    void tap();
                    jumpTo(qi);
                  }}
                  accessibilityRole="button"
                  accessibilityLabel={`تشغيل ${q.title}`}
                  style={styles.queueRow}
                  android_ripple={{ color: "rgba(255,255,255,0.08)" }}
                >
                  <Text style={styles.queueIndex}>{toArabicDigits(qi + 1)}</Text>
                  <Text numberOfLines={1} style={styles.queueItemTitle}>
                    {q.title}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        ) : null}

        <Pressable
          onPress={stop}
          accessibilityRole="button"
          accessibilityLabel="إيقاف وإغلاق المشغل"
          style={styles.closeRow}
        >
          <Text style={styles.closeText}>إيقاف وإغلاق المشغل</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

function ControlButton({
  icon,
  label,
  onPress,
  disabled,
}: {
  icon: React.ReactNode;
  label: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: disabled ?? false }}
      style={[styles.controlButton, disabled && styles.controlDisabled]}
    >
      {icon}
    </Pressable>
  );
}

function ActionButton({
  icon,
  label,
  onPress,
}: {
  icon: React.ReactNode;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={styles.actionButton}
      android_ripple={{ color: "rgba(255,255,255,0.08)" }}
    >
      {icon}
      <Text numberOfLines={1} style={styles.actionText}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1 },
  emptyWrap: {
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xl,
    backgroundColor: rawColors.darkBg,
  },
  emptyTitle: {
    fontFamily: fonts.serifMedium,
    fontSize: 18,
    color: rawColors.sand2,
  },
  emptyBack: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: radii.full,
    backgroundColor: rawColors.darkSurface,
  },
  emptyBackText: { fontFamily: fonts.serifMedium, color: rawColors.gold, fontSize: 15 },
  content: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxxl,
    paddingBottom: spacing.giant,
    alignItems: "center",
  },
  artworkWrap: {
    marginBottom: spacing.xxxl,
    elevation: 12,
    shadowColor: "#000",
    shadowOpacity: 0.4,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 10 },
  },
  titleBlock: { alignItems: "center", gap: spacing.sm, paddingHorizontal: spacing.lg },
  category: {
    fontFamily: fonts.serifMedium,
    fontSize: 13,
    color: rawColors.gold,
  },
  title: {
    fontFamily: fonts.serifBold,
    fontSize: 22,
    lineHeight: 34,
    color: rawColors.sand2,
    textAlign: "center",
  },
  errorText: {
    fontFamily: fonts.serifRegular,
    fontSize: 13,
    color: "#E08A7E",
    textAlign: "center",
  },
  seekBlock: { width: "100%", marginTop: spacing.xxxl },
  slider: { width: "100%", height: touch.targetSmall },
  timeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: spacing.xs,
  },
  timeText: {
    fontFamily: fonts.serifRegular,
    fontSize: 12,
    color: "rgba(236,230,221,0.6)",
  },
  controls: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    marginTop: spacing.xl,
    paddingHorizontal: spacing.sm,
  },
  controlButton: {
    width: touch.target + 4,
    height: touch.target + 4,
    alignItems: "center",
    justifyContent: "center",
  },
  controlDisabled: { opacity: 0.3 },
  mainPlay: {
    width: 78,
    height: 78,
    borderRadius: 39,
    backgroundColor: rawColors.gold,
    alignItems: "center",
    justifyContent: "center",
  },
  rateRow: {
    flexDirection: "row",
    gap: spacing.sm,
    marginTop: spacing.xxl,
    flexWrap: "wrap",
    justifyContent: "center",
  },
  rateChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: "rgba(236,230,221,0.25)",
    minHeight: touch.targetSmall,
    justifyContent: "center",
  },
  rateChipActive: {
    backgroundColor: rawColors.gold,
    borderColor: rawColors.gold,
  },
  rateText: {
    fontFamily: fonts.serifMedium,
    fontSize: 13,
    color: "rgba(236,230,221,0.85)",
  },
  rateTextActive: { color: rawColors.ink },
  actionsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: spacing.lg,
    marginTop: spacing.xxxl,
  },
  actionButton: {
    alignItems: "center",
    gap: 6,
    minWidth: 72,
    minHeight: touch.target,
    justifyContent: "center",
  },
  actionText: {
    fontFamily: fonts.serifRegular,
    fontSize: 11.5,
    color: "rgba(236,230,221,0.75)",
  },
  queueSection: {
    width: "100%",
    marginTop: spacing.xxxl,
    borderTopWidth: 1,
    borderTopColor: "rgba(236,230,221,0.12)",
    paddingTop: spacing.lg,
  },
  queueTitle: {
    fontFamily: fonts.serifMedium,
    fontSize: 14,
    color: rawColors.gold,
    marginBottom: spacing.sm,
  },
  queueRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingVertical: spacing.md,
    minHeight: touch.target,
  },
  queueIndex: {
    fontFamily: fonts.serifMedium,
    fontSize: 12,
    color: "rgba(236,230,221,0.4)",
    minWidth: 24,
    textAlign: "center",
  },
  queueItemTitle: {
    flex: 1,
    fontFamily: fonts.serifRegular,
    fontSize: 14,
    color: "rgba(236,230,221,0.9)",
  },
  closeRow: { marginTop: spacing.xxxl, paddingVertical: spacing.md },
  closeText: {
    fontFamily: fonts.serifRegular,
    fontSize: 13,
    color: "rgba(236,230,221,0.5)",
  },
});
