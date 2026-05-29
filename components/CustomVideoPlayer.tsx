"use client";

import { useState } from "react";
import { driveThumbnailUrl } from "@/lib/drive";

/**
 * HTML5 <video> tag that streams through our /api/stream proxy. Uses the
 * device's NATIVE video controls (Chrome / Safari / Samsung Internet) —
 * those handle fullscreen, picture-in-picture and seeking reliably and
 * avoid the duplicate-button rendering glitches we saw in Drive's iframe
 * player on some Android devices.
 */
export default function CustomVideoPlayer({
  driveFileId,
  title,
}: {
  driveFileId: string;
  title: string;
}) {
  const [errored, setErrored] = useState(false);
  const src = `/api/stream?id=${encodeURIComponent(driveFileId)}`;
  const poster = driveThumbnailUrl(driveFileId, 1280) ?? undefined;

  if (errored) {
    return (
      <div className="w-full rounded-2xl bg-ink dark:bg-dark-card text-sand p-8 text-center border border-ink/10 dark:border-dark-border">
        <p className="mb-2 font-medium">تعذّر تحميل هذا الفيديو</p>
        <p className="text-sm text-sand/70">
          تأكّد من أن ملف Drive مُشارَك «بحيث يمكن لأي شخص لديه الرابط الاطلاع».
        </p>
      </div>
    );
  }

  return (
    <video
      controls
      controlsList="nodownload"
      preload="metadata"
      playsInline
      poster={poster}
      title={title}
      onError={() => setErrored(true)}
      className="w-full rounded-2xl bg-black shadow-card border border-ink/10 dark:border-dark-border max-h-[80vh] object-contain"
    >
      <source src={src} />
      عذراً، لا يمكن تشغيل هذا الفيديو في متصفّحك.
    </video>
  );
}
