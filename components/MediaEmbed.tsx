import { drivePreviewUrl, extractDriveFileId } from "@/lib/drive";
import { isYouTube, youtubeEmbedUrl } from "@/lib/youtube";
import LecturePlayCard from "./LecturePlayCard";
import CustomVideoPlayer from "./CustomVideoPlayer";

type Props = {
  driveLink?: string | null;
  driveFileId?: string | null;
  kind: "AUDIO" | "VIDEO" | "WRITTEN";
  title: string;
};

export default function MediaEmbed({ driveLink, driveFileId, kind, title }: Props) {
  // YouTube videos (stored as a YouTube URL in driveLink) — embed via iframe.
  if (kind === "VIDEO" && isYouTube(driveLink)) {
    return (
      <div className="w-full aspect-video rounded-2xl overflow-hidden bg-ink shadow-card border border-ink/10 dark:border-dark-border">
        <iframe
          src={youtubeEmbedUrl(driveLink) ?? ""}
          title={title}
          className="w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          loading="lazy"
        />
      </div>
    );
  }

  const id = driveFileId ?? extractDriveFileId(driveLink);
  if (!id) return null;

  if (kind === "AUDIO") {
    return <LecturePlayCard driveFileId={id} title={title} />;
  }

  if (kind === "VIDEO") {
    // Native HTML5 player streaming through /api/stream. Native mobile
    // controls behave consistently across devices, no duplicated buttons.
    return <CustomVideoPlayer driveFileId={id} title={title} />;
  }

  // WRITTEN — keep Drive's PDF preview iframe (PDFs need Drive's viewer).
  const preview = drivePreviewUrl(id) ?? "";
  return (
    <div className="w-full rounded-2xl overflow-hidden bg-ink dark:bg-dark-card shadow-card border border-ink/10 dark:border-dark-border">
      <iframe
        src={preview}
        title={title}
        className="w-full h-[70vh] md:h-[80vh] bg-white"
        loading="lazy"
        allow="autoplay"
      />
    </div>
  );
}
