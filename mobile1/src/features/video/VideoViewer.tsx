/**
 * عارض الفيديو — expo-video ببث Range من بروكسي الموقع، تحكم أصلي،
 * PiP حيثما يدعمه الجهاز، وملصق (poster) حتى يبدأ التشغيل.
 * فيديوهات يوتيوب: بطاقة أصلية تفتح تطبيق يوتيوب (متوافقة مع شروط الخدمة).
 */

import { useCallback, useEffect, useState } from "react";
import { Linking, Pressable, StyleSheet, Text, View } from "react-native";
import { VideoView, useVideoPlayer, type VideoSource } from "expo-video";
import { Image } from "expo-image";
import { MonitorPlay, Play } from "lucide-react-native";

import { resolveStreamUrl } from "@/utils/drive";
import { extractYouTubeId, youtubeThumbnailUrl, youtubeWatchUrl } from "@/utils/youtube";
import { useTheme } from "@/theme/ThemeProvider";
import { fonts, radii, spacing } from "@/theme/tokens";
import { ErrorState } from "@/components/ui/States";
import { confirm } from "@/utils/haptics";

interface VideoViewerProps {
  title: string;
  driveLink: string | null;
  driveFileId: string | null;
  thumbnail: string | null;
  /** في وضع PiP يُخفى غلاف الملصق حتى لا يغطي نافذة PiP. */
  onPipChange?: (active: boolean) => void;
}

export function VideoViewer({
  title,
  driveLink,
  driveFileId,
  thumbnail,
}: VideoViewerProps) {
  const { colors } = useTheme();

  // يوتيوب: بطاقة مشاهدة خارجية (deep link).
  const youtubeId = extractYouTubeId(driveLink);
  if (youtubeId) {
    return <YouTubeCard id={youtubeId} title={title} />;
  }

  const streamUrl = resolveStreamUrl(driveFileId, driveLink);
  if (!streamUrl) {
    return (
      <View style={styles.unavailable}>
        <MonitorPlay size={30} color={colors.textMuted} />
        <Text style={[styles.unavailableText, { color: colors.textSecondary }]}>
          لا يوجد مصدر فيديو لهذه المادة.
        </Text>
      </View>
    );
  }

  return <StreamVideo source={{ uri: streamUrl }} title={title} poster={thumbnail} />;
}

function StreamVideo({
  source,
  title,
  poster,
}: {
  source: VideoSource;
  title: string;
  poster: string | null;
}) {
  const player = useVideoPlayer(source, (p) => {
    // لا تشغيل تلقائي — المستخدم يبدأ بنفسه (تحكم أصلي).
    p.loop = false;
  });

  const [started, setStarted] = useState(false);
  const [status, setStatus] = useState(player.status);
  const [playing, setPlaying] = useState(player.playing);

  // expo-video لا يملك onError على VideoView — نستمع للأحداث مباشرة.
  useEffect(() => {
    const subStatus = player.addListener("statusChange", (e) => {
      setStatus(e.status);
    });
    const subPlaying = player.addListener("playingChange", (e) => {
      setPlaying(e.isPlaying);
      if (e.isPlaying) setStarted(true);
    });
    return () => {
      subStatus.remove();
      subPlaying.remove();
    };
  }, [player]);

  const retry = useCallback(() => {
    player.replace(source);
    player.play();
  }, [player, source]);

  if (status === "error") {
    return <ErrorState message="تعذّر تشغيل الفيديو." onRetry={retry} />;
  }

  return (
    <View style={styles.videoWrap} testID="video-player">
      <VideoView
        player={player}
        style={styles.video}
        contentFit="contain"
        nativeControls
        allowsPictureInPicture
        accessibilityLabel={`فيديو: ${title}`}
      />
      {!started && !playing && poster ? (
        <Pressable
          onPress={() => {
            void confirm();
            player.play();
          }}
          accessibilityRole="button"
          accessibilityLabel={`تشغيل فيديو ${title}`}
          style={styles.posterOverlay}
          testID="video-poster"
        >
          <Image
            source={{ uri: poster }}
            style={StyleSheet.absoluteFill}
            contentFit="cover"
            cachePolicy="memory-disk"
          />
          <View style={styles.playCircle}>
            <Play size={30} color="#072C49" fill="#072C49" />
          </View>
        </Pressable>
      ) : null}
    </View>
  );
}

function YouTubeCard({ id, title }: { id: string; title: string }) {
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={() => {
        void confirm();
        void Linking.openURL(youtubeWatchUrl(id));
      }}
      accessibilityRole="button"
      accessibilityLabel={`مشاهدة ${title} على يوتيوب`}
      accessibilityHint="يفتح تطبيق يوتيوب أو المتصفح"
      testID="youtube-card"
      style={styles.ytCard}
      android_ripple={{ color: colors.borderStrong }}
    >
      <View style={styles.ytThumbWrap}>
        <Image
          source={{ uri: youtubeThumbnailUrl(id) }}
          style={styles.ytThumb}
          contentFit="cover"
          transition={200}
          cachePolicy="memory-disk"
        />
        <View style={styles.playCircle}>
          <Play size={30} color="#072C49" fill="#072C49" />
        </View>
      </View>
      <View style={styles.ytInfo}>
        <Text style={[styles.ytTitle, { color: colors.textPrimary }]} numberOfLines={2}>
          {title}
        </Text>
        <Text style={[styles.ytHint, { color: colors.textSecondary }]}>
          المشاهدة تتم عبر تطبيق يوتيوب
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  videoWrap: {
    width: "100%",
    aspectRatio: 16 / 9,
    backgroundColor: "#000",
    borderRadius: radii.lg,
    overflow: "hidden",
  },
  video: { flex: 1 },
  posterOverlay: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  playCircle: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: "rgba(222,164,112,0.95)",
    alignItems: "center",
    justifyContent: "center",
    elevation: 6,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  unavailable: {
    alignItems: "center",
    gap: spacing.md,
    paddingVertical: spacing.xxxl,
  },
  unavailableText: { fontFamily: fonts.serifRegular, fontSize: 14 },
  ytCard: {
    borderWidth: StyleSheet.hairlineWidth * 2,
    borderColor: "rgba(255,0,0,0.0)",
    borderRadius: radii.lg,
    overflow: "hidden",
    backgroundColor: "rgba(7,44,73,0.04)",
  },
  ytThumbWrap: {
    width: "100%",
    aspectRatio: 16 / 9,
    alignItems: "center",
    justifyContent: "center",
  },
  ytThumb: { position: "absolute", top: 0, right: 0, bottom: 0, left: 0 },
  ytInfo: { padding: spacing.lg, gap: 4 },
  ytTitle: { fontFamily: fonts.serifMedium, fontSize: 15, lineHeight: 23 },
  ytHint: { fontFamily: fonts.serifRegular, fontSize: 12.5, lineHeight: 18 },
});
