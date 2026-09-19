/**
 * تفاصيل مادة — سلوك حسب الفئة:
 * - صوتية: غلاف كبير + تشغيل (مع قائمة البرنامج إن كانت حلقة) + تحميل/مشاركة/مفضلة + نص التفريغ
 * - مرئية: عارض فيديو أصلي + مشاركة/مفضلة
 * - مقالة: قراءة عربية مريحة + نسخ/مشاركة + تحكم بحجم الخط + فتح ملف PDF إن وُجد
 * عداد المشاهدات يُسجَّل مرة واحدة لكل فتح.
 */

import { useEffect, useMemo } from "react";
import { Pressable, ScrollView, Share, StyleSheet, Text, View } from "react-native";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import * as Clipboard from "expo-clipboard";
import {
  Check,
  Copy,
  Download,
  FileText,
  Heart,
  Minus,
  Play,
  Plus,
  Share2,
} from "lucide-react-native";

import { useItemDetail, useTopics, useViewCount } from "@/hooks/queryHooks";
import { useTheme } from "@/theme/ThemeProvider";
import { elevation, fonts, radii, spacing, touch } from "@/theme/tokens";
import { formatRelativeDate, formatViews } from "@/utils/format";
import { SITE_URL } from "@/constants/site";
import { driveDownloadUrl } from "@/utils/drive";
import { ItemThumb } from "@/components/ItemThumb";
import { CategoryBadge } from "@/components/CategoryBadge";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { ErrorState } from "@/components/ui/States";
import { ItemCardSkeleton } from "@/components/ui/Skeleton";
import { HtmlView } from "@/components/article/HtmlView";
import { VideoViewer } from "@/features/video/VideoViewer";
import { usePlayItem } from "@/features/audio/usePlayItem";
import { toItemLike, useLibraryStore } from "@/store/libraryStore";
import { useSettingsStore, ARTICLE_FONT_SCALES } from "@/store/settingsStore";
import { useDownloadsStore } from "@/store/downloadsStore";
import { deleteDownload, startDownload } from "@/services/downloads";
import { openPdf } from "@/services/pdf";
import { confirm, tap } from "@/utils/haptics";

export default function ItemDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const query = useItemDetail(id ?? "");
  const item = query.data?.item;
  const { data: topics = [] } = useTopics();
  const playItem = usePlayItem();

  const view = useViewCount(id ?? "");
  useEffect(() => {
    if (item) view.mutate();
    // مرة واحدة لكل فتح — عند توفر العنصر فقط.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item?.id]);

  const isFavorite = useLibraryStore((s) => (item ? s.isFavorite(item.id) : false));
  const toggleFavorite = useLibraryStore((s) => s.toggleFavorite);
  const downloadRecord = useDownloadsStore((s) => s.records[id ?? ""]);
  const articleFontScale = useSettingsStore((s) => s.articleFontScale);
  const setArticleFontScale = useSettingsStore((s) => s.setArticleFontScale);

  /** المواضيع مع slug للتنقل — من قائمة المواضيع (حسب معرف الموضوع). */
  const topicLinks = useMemo(() => {
    return (item?.topics ?? []).map((t) => {
      const full = topics.find((x) => x.id === t.topicId);
      return { id: t.topicId, slug: full?.slug ?? t.topicId, name: full?.name ?? null, episodeOrder: t.episodeOrder };
    });
  }, [item?.topics, topics]);

  const programTopic = topicLinks.find((t) => t.episodeOrder != null);

  return (
    <>
      <Stack.Screen options={{ title: item?.title ?? "المادة" }} />
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        testID="item-detail"
      >
        {!item ? (
          query.isLoading ? (
            <View style={styles.skeletonWrap}>
              {[0, 1].map((i) => (
                <ItemCardSkeleton key={i} />
              ))}
            </View>
          ) : (
            <ErrorState onRetry={() => void query.refetch()} />
          )
        ) : (
          <>
            {item.category === "AUDIO" ? (
              <AudioBody
                item={item}
                isFavorite={isFavorite}
                programEpisodeOrder={programTopic?.episodeOrder ?? null}
                onToggleFavorite={() => toggleFavorite(toItemLike(item))}
                onPlay={() => {
                  void confirm();
                  void playItem(item, programTopic?.id);
                }}
                isDownloaded={downloadRecord?.status === "done"}
                isDownloading={downloadRecord?.status === "downloading"}
                onToggleDownload={() => {
                  void confirm();
                  if (downloadRecord?.status === "done") {
                    void deleteDownload(item.id);
                  } else if (downloadRecord?.status !== "downloading") {
                    void startDownload({
                      id: item.id,
                      title: item.title,
                      driveFileId: item.driveFileId,
                      driveLink: item.driveLink,
                    });
                  }
                }}
                onShare={() => void shareItem(item)}
                isFetchingContent={query.isFetching}
              />
            ) : item.category === "VIDEO" ? (
              <VideoBody
                item={item}
                isFavorite={isFavorite}
                onToggleFavorite={() => toggleFavorite(toItemLike(item))}
                onShare={() => void shareItem(item)}
              />
            ) : (
              <WrittenBody
                item={item}
                isFavorite={isFavorite}
                onToggleFavorite={() => toggleFavorite(toItemLike(item))}
                onShare={() => void shareItem(item)}
                fontScale={articleFontScale}
                onFontScale={(delta) => {
                  const idx = ARTICLE_FONT_SCALES.indexOf(
                    articleFontScale as (typeof ARTICLE_FONT_SCALES)[number],
                  );
                  const next = ARTICLE_FONT_SCALES[
                    Math.min(Math.max(idx + delta, 0), ARTICLE_FONT_SCALES.length - 1)
                  ];
                  setArticleFontScale(next);
                }}
                isFetchingContent={query.isFetching}
              />
            )}

            {/* مواضيع المادة */}
            {topicLinks.length > 0 ? (
              <View style={styles.topicsSection}>
                <SectionHeader title="ضمن" />
                <View style={styles.topicsRow}>
                  {topicLinks.map((t) => (
                    <PressableChip
                      key={t.id}
                      label={t.name ?? `موضوع ${t.id}`}
                      episodeOrder={t.episodeOrder}
                      onPress={() => router.push(`/topic/${t.slug}`)}
                    />
                  ))}
                </View>
              </View>
            ) : null}
          </>
        )}
      </ScrollView>
    </>
  );
}

// ─── الجسم الصوتي ──────────────────────────────────────────────────────────

function AudioBody({
  item,
  isFavorite,
  programEpisodeOrder,
  onToggleFavorite,
  onPlay,
  isDownloaded,
  isDownloading,
  onToggleDownload,
  onShare,
  isFetchingContent,
}: {
  item: NonNullable<ReturnType<typeof useItemDetail>["data"]>["item"];
  isFavorite: boolean;
  programEpisodeOrder: number | null;
  onToggleFavorite: () => void;
  onPlay: () => void;
  isDownloaded: boolean;
  isDownloading: boolean;
  onToggleDownload: () => void;
  onShare: () => void;
  isFetchingContent: boolean;
}) {
  const { colors } = useTheme();

  return (
    <>
      <HeroBlock item={item} programEpisodeOrder={programEpisodeOrder} size={180} />

      {/* الإجراءات */}
      <View style={styles.actionsRow}>
        <ActionPill
          icon={<Play size={18} color={colors.headerText} fill={colors.headerText} />}
          label="تشغيل"
          onPress={onPlay}
          style={{ backgroundColor: colors.header }}
          textColor={colors.headerText}
          testID="item-play"
        />
        <ActionPill
          icon={
            isDownloaded ? (
              <Check size={18} color={colors.accentStrong} />
            ) : (
              <Download size={18} color={colors.textSecondary} />
            )
          }
          label={isDownloaded ? "محمّل" : isDownloading ? "جارٍ…" : "تحميل"}
          onPress={onToggleDownload}
          testID="item-download"
        />
        <ActionPill
          icon={<Share2 size={18} color={colors.textSecondary} />}
          label="مشاركة"
          onPress={onShare}
          testID="item-share"
        />
        <ActionPill
          icon={
            <Heart
              size={18}
              color={isFavorite ? colors.favorite : colors.textSecondary}
              fill={isFavorite ? colors.favorite : "transparent"}
            />
          }
          label={isFavorite ? "محفوظ" : "مفضلة"}
          onPress={() => {
            void tap();
            onToggleFavorite();
          }}
          testID="item-favorite"
        />
      </View>

      {/* نص التفريغ */}
      {item.content ? (
        <View style={styles.transcript}>
          <SectionHeader title="نص المادة" />
          <View style={[styles.transcriptCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <HtmlView html={item.content} />
          </View>
        </View>
      ) : isFetchingContent ? (
        <View style={styles.transcript}>
          <View style={[styles.transcriptCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <ItemCardSkeleton />
          </View>
        </View>
      ) : null}
    </>
  );
}

// ─── الجسم المرئي ──────────────────────────────────────────────────────────

function VideoBody({
  item,
  isFavorite,
  onToggleFavorite,
  onShare,
}: {
  item: NonNullable<ReturnType<typeof useItemDetail>["data"]>["item"];
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onShare: () => void;
}) {
  const { colors } = useTheme();

  return (
    <>
      <VideoViewer
        title={item.title}
        driveLink={item.driveLink}
        driveFileId={item.driveFileId}
        thumbnail={item.thumbnail}
      />
      <View style={styles.videoInfo}>
        <Text style={[styles.title, { color: colors.textPrimary }]} accessibilityRole="header">
          {item.title}
        </Text>
        {item.description ? (
          <Text style={[styles.description, { color: colors.textSecondary }]}>
            {item.description}
          </Text>
        ) : null}
        <MetaRow item={item} />
        <View style={styles.actionsRow}>
          <ActionPill
            icon={<Share2 size={18} color={colors.textSecondary} />}
            label="مشاركة"
            onPress={onShare}
            testID="item-share"
          />
          <ActionPill
            icon={
              <Heart
                size={18}
                color={isFavorite ? colors.favorite : colors.textSecondary}
                fill={isFavorite ? colors.favorite : "transparent"}
              />
            }
            label={isFavorite ? "محفوظ" : "مفضلة"}
            onPress={() => {
              void tap();
              onToggleFavorite();
            }}
            testID="item-favorite"
          />
        </View>
      </View>
    </>
  );
}

// ─── الجسم المكتوب ─────────────────────────────────────────────────────────

function WrittenBody({
  item,
  isFavorite,
  onToggleFavorite,
  onShare,
  fontScale,
  onFontScale,
  isFetchingContent,
}: {
  item: NonNullable<ReturnType<typeof useItemDetail>["data"]>["item"];
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onShare: () => void;
  fontScale: number;
  onFontScale: (delta: 1 | -1) => void;
  isFetchingContent: boolean;
}) {
  const { colors } = useTheme();
  const isPdf = !item.content && !!item.driveLink;

  return (
    <>
      <View style={styles.articleHead}>
        <CategoryBadge category="WRITTEN" />
        <Text style={[styles.title, { color: colors.textPrimary }]} accessibilityRole="header">
          {item.title}
        </Text>
        <MetaRow item={item} />
      </View>

      {/* شريط أدوات القراءة */}
      <View style={styles.actionsRow}>
        <ActionPill
          icon={<Copy size={17} color={colors.textSecondary} />}
          label="نسخ"
          onPress={() => void copyArticle(item)}
          testID="item-copy"
        />
        <ActionPill
          icon={<Share2 size={17} color={colors.textSecondary} />}
          label="مشاركة"
          onPress={onShare}
          testID="item-share"
        />
        <ActionPill
          icon={
            <Heart
              size={17}
              color={isFavorite ? colors.favorite : colors.textSecondary}
              fill={isFavorite ? colors.favorite : "transparent"}
            />
          }
          label="حفظ"
          onPress={() => {
            void tap();
            onToggleFavorite();
          }}
          testID="item-favorite"
        />
        {isPdf ? (
          <ActionPill
            icon={<FileText size={17} color={colors.accentStrong} />}
            label="فتح الملف"
            onPress={() => {
              void confirm();
              void openPdf(
                item.driveFileId ? driveDownloadUrl(item.driveFileId) : item.driveLink,
                item.title,
              );
            }}
            testID="item-open-file"
          />
        ) : null}
      </View>

      {/* حجم الخط */}
      <View style={[styles.fontRow, { borderColor: colors.border }]}>
        <Text style={[styles.fontLabel, { color: colors.textMuted }]}>حجم الخط</Text>
        <PressableChip
          icon={<Minus size={14} color={colors.textSecondary} />}
          label="أصغر"
          onPress={() => onFontScale(-1)}
          testID="article-font-dec"
        />
        <PressableChip
          icon={<Plus size={14} color={colors.textSecondary} />}
          label="أكبر"
          onPress={() => onFontScale(1)}
          testID="article-font-inc"
        />
      </View>

      {item.content ? (
        <View
          style={[styles.articleCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
        >
          <HtmlView html={item.content} fontScale={fontScale} />
        </View>
      ) : isFetchingContent ? (
        <View style={[styles.articleCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <ItemCardSkeleton />
        </View>
      ) : isPdf ? (
        <View style={[styles.articleCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.pdfHint, { color: colors.textSecondary }]}>
            هذه المادة ملف PDF — اضغط «فتح الملف» لعرضه في عارض المستندات.
          </Text>
        </View>
      ) : null}
    </>
  );
}

// ─── أجزاء مشتركة ──────────────────────────────────────────────────────────

function HeroBlock({
  item,
  programEpisodeOrder,
  size,
}: {
  item: NonNullable<ReturnType<typeof useItemDetail>["data"]>["item"];
  programEpisodeOrder: number | null;
  size: number;
}) {
  const { colors } = useTheme();
  return (
    <View style={styles.hero}>
      <View style={styles.heroThumb}>
        <ItemThumb item={item} size={size} radius={radii.xl} />
      </View>
      <CategoryBadge category={item.category} />
      <Text style={[styles.title, { color: colors.textPrimary }]} accessibilityRole="header">
        {item.title}
      </Text>
      {item.description ? (
        <Text style={[styles.description, { color: colors.textSecondary }]}>
          {item.description}
        </Text>
      ) : null}
      <MetaRow item={item} programEpisodeOrder={programEpisodeOrder} />
    </View>
  );
}

function MetaRow({
  item,
  programEpisodeOrder = null,
}: {
  item: { viewCount: number; publishedAt: string };
  programEpisodeOrder?: number | null;
}) {
  const { colors } = useTheme();
  return (
    <View style={styles.metaRow}>
      {programEpisodeOrder ? (
        <Text style={[styles.metaText, { color: colors.accentStrong }]}>
          الحلقة {programEpisodeOrder}
        </Text>
      ) : null}
      <Text style={[styles.metaText, { color: colors.textMuted }]}>
        {formatViews(item.viewCount)}
      </Text>
      <Text style={[styles.metaText, { color: colors.textMuted }]}>
        {formatRelativeDate(item.publishedAt)}
      </Text>
    </View>
  );
}

function ActionPill({
  icon,
  label,
  onPress,
  style,
  textColor,
  testID,
}: {
  icon: React.ReactNode;
  label: string;
  onPress: () => void;
  style?: object;
  textColor?: string;
  testID?: string;
}) {
  const { colors } = useTheme();
  return (
    <PressablePill onPress={onPress} style={style} testID={testID}>
      {icon}
      <Text style={[styles.actionText, { color: textColor ?? colors.textPrimary }]}>{label}</Text>
    </PressablePill>
  );
}

function PressableChip({
  label,
  onPress,
  icon,
  episodeOrder,
  testID,
}: {
  label: string;
  onPress: () => void;
  icon?: React.ReactNode;
  episodeOrder?: number | null;
  testID?: string;
}) {
  const { colors } = useTheme();
  return (
    <PressablePill onPress={onPress} testID={testID}>
      {icon}
      <Text style={[styles.chipText, { color: colors.textSecondary }]}>
        {episodeOrder ? `${label} — الحلقة ${episodeOrder}` : label}
      </Text>
    </PressablePill>
  );
}

function PressablePill({
  children,
  onPress,
  style,
  testID,
}: {
  children: React.ReactNode;
  onPress: () => void;
  style?: object;
  testID?: string;
}) {
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      testID={testID}
      accessibilityRole="button"
      style={({ pressed }) => [
        styles.pill,
        { borderColor: colors.borderStrong, opacity: pressed ? 0.7 : 1 },
        style,
      ]}
      android_ripple={{ color: colors.border }}
    >
      {children}
    </Pressable>
  );
}

async function shareItem(item: { id: string; title: string }) {
  void confirm();
  await Share.share({
    title: item.title,
    message: `${item.title}\n${SITE_URL}/item/${item.id}`,
  });
}

async function copyArticle(item: { content: string | null }) {
  void confirm();
  const text = item.content ? item.content.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim() : "";
  if (text) await Clipboard.setStringAsync(text);
}

const styles = StyleSheet.create({
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.giant,
  },
  skeletonWrap: { gap: spacing.lg, paddingTop: spacing.md },
  hero: {
    alignItems: "center",
    gap: spacing.sm,
    paddingVertical: spacing.md,
  },
  heroThumb: {
    marginBottom: spacing.sm,
    ...elevation.card,
  },
  title: {
    fontFamily: fonts.serifBold,
    fontSize: 21,
    lineHeight: 32,
    textAlign: "center",
    paddingHorizontal: spacing.sm,
  },
  description: {
    fontFamily: fonts.serifRegular,
    fontSize: 14,
    lineHeight: 23,
    textAlign: "center",
    paddingHorizontal: spacing.sm,
  },
  metaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: spacing.md,
    marginTop: spacing.xs,
  },
  metaText: {
    fontFamily: fonts.serifRegular,
    fontSize: 12,
    lineHeight: 17,
  },
  actionsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderWidth: StyleSheet.hairlineWidth * 2,
    borderRadius: radii.full,
    paddingHorizontal: spacing.md,
    minHeight: touch.targetSmall,
    justifyContent: "center",
  },
  actionText: {
    fontFamily: fonts.serifMedium,
    fontSize: 13.5,
    lineHeight: 20,
  },
  chipText: {
    fontFamily: fonts.serifRegular,
    fontSize: 12.5,
    lineHeight: 18,
  },
  transcript: {
    marginTop: spacing.xxl,
  },
  transcriptCard: {
    borderRadius: radii.lg,
    borderWidth: StyleSheet.hairlineWidth * 2,
    padding: spacing.md,
    marginTop: spacing.xs,
  },
  videoInfo: {
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  articleHead: {
    alignItems: "center",
    gap: spacing.sm,
    paddingVertical: spacing.sm,
  },
  fontRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth * 2,
  },
  fontLabel: {
    fontFamily: fonts.serifRegular,
    fontSize: 12.5,
    lineHeight: 18,
    marginInlineEnd: spacing.xs,
  },
  articleCard: {
    borderRadius: radii.lg,
    borderWidth: StyleSheet.hairlineWidth * 2,
    padding: spacing.lg,
    marginTop: spacing.md,
  },
  pdfHint: {
    fontFamily: fonts.serifRegular,
    fontSize: 14,
    lineHeight: 23,
    textAlign: "center",
  },
  topicsSection: {
    marginTop: spacing.xxl,
  },
  topicsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
});
