// Helpers to convert a Google Drive share link into the right URL for
// embedding, streaming, or downloading. Accepts:
//   https://drive.google.com/file/d/FILE_ID/view?usp=sharing
//   https://drive.google.com/open?id=FILE_ID
//   https://drive.google.com/uc?id=FILE_ID&export=download
// or a bare file id.

const FILE_ID_RE = /(?:\/file\/d\/|[?&]id=|\/d\/)([a-zA-Z0-9_-]{20,})/;

export function extractDriveFileId(input?: string | null): string | null {
  if (!input) return null;
  const trimmed = input.trim();
  if (!trimmed) return null;
  if (/^[a-zA-Z0-9_-]{20,}$/.test(trimmed)) return trimmed;
  const match = trimmed.match(FILE_ID_RE);
  return match?.[1] ?? null;
}

/** iFrame embed URL — works reliably for video, audio, PDF and images. */
export function drivePreviewUrl(idOrLink?: string | null): string | null {
  const id = extractDriveFileId(idOrLink);
  if (!id) return null;
  return `https://drive.google.com/file/d/${id}/preview`;
}

/** Direct stream/download URL (HTTP GET). */
export function driveDirectUrl(idOrLink?: string | null): string | null {
  const id = extractDriveFileId(idOrLink);
  if (!id) return null;
  return `https://drive.google.com/uc?export=download&id=${id}`;
}

/**
 * Same as driveDirectUrl but with confirm=1 — this skips Drive's virus-scan
 * interstitial page for files larger than ~100MB and goes straight to the
 * binary, which is what you want for a "Download" button.
 */
export function driveDownloadUrl(idOrLink?: string | null): string | null {
  const id = extractDriveFileId(idOrLink);
  if (!id) return null;
  return `https://drive.usercontent.google.com/download?id=${id}&export=download&authuser=0&confirm=t`;
}

/** Thumbnail URL served by Google for any Drive file. */
export function driveThumbnailUrl(
  idOrLink?: string | null,
  size: number = 640,
): string | null {
  const id = extractDriveFileId(idOrLink);
  if (!id) return null;
  return `https://drive.google.com/thumbnail?id=${id}&sz=w${size}`;
}

/** "View on Drive" URL (opens in a new tab). */
export function driveViewUrl(idOrLink?: string | null): string | null {
  const id = extractDriveFileId(idOrLink);
  if (!id) return null;
  return `https://drive.google.com/file/d/${id}/view`;
}
